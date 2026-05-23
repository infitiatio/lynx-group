using FakeItEasy;
using LynxGroup.Application.Groups;
using LynxGroup.Domain.Entities;

namespace LynxGroup.UnitTests.Groups;

public class UpdateGroupHandlerTests
{
    [Theory]
    [InlineData("")]
    [InlineData(" ")]
    public async Task HandleAsync_ShouldThrowArgumentException_WhenTitleIsMissing(string title)
    {
        var repository = A.Fake<IGroupRepository>();
        var handler = new UpdateGroupHandler(repository);
        var command = new UpdateGroupCommand(
            GroupId: Guid.NewGuid(),
            CallerUserId: Guid.NewGuid(),
            Title: title,
            Description: "Valid description");

        var exception = await Assert.ThrowsAsync<ArgumentException>(() => handler.HandleAsync(command));

        Assert.Equal("Title", exception.ParamName);
        A.CallTo(() => repository.GetByIdAsync(A<Guid>._, A<CancellationToken>._)).MustNotHaveHappened();
        A.CallTo(() => repository.UpdateAsync(A<Group>._, A<CancellationToken>._)).MustNotHaveHappened();
    }

    [Theory]
    [InlineData("")]
    [InlineData(" ")]
    public async Task HandleAsync_ShouldThrowArgumentException_WhenDescriptionIsMissing(string description)
    {
        var repository = A.Fake<IGroupRepository>();
        var handler = new UpdateGroupHandler(repository);
        var command = new UpdateGroupCommand(
            GroupId: Guid.NewGuid(),
            CallerUserId: Guid.NewGuid(),
            Title: "Valid title",
            Description: description);

        var exception = await Assert.ThrowsAsync<ArgumentException>(() => handler.HandleAsync(command));

        Assert.Equal("Description", exception.ParamName);
        A.CallTo(() => repository.GetByIdAsync(A<Guid>._, A<CancellationToken>._)).MustNotHaveHappened();
        A.CallTo(() => repository.UpdateAsync(A<Group>._, A<CancellationToken>._)).MustNotHaveHappened();
    }

    [Fact]
    public async Task HandleAsync_ShouldThrowKeyNotFoundException_WhenGroupDoesNotExist()
    {
        var repository = A.Fake<IGroupRepository>();
        var handler = new UpdateGroupHandler(repository);
        var groupId = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
        var callerUserId = Guid.Parse("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb");

        A.CallTo(() => repository.GetByIdAsync(groupId, A<CancellationToken>._))
            .Returns((Group?)null);

        var exception = await Assert.ThrowsAsync<KeyNotFoundException>(() => handler.HandleAsync(new UpdateGroupCommand(
            GroupId: groupId,
            CallerUserId: callerUserId,
            Title: "New title",
            Description: "New description")));

        Assert.Contains(groupId.ToString(), exception.Message, StringComparison.Ordinal);
        A.CallTo(() => repository.UpdateAsync(A<Group>._, A<CancellationToken>._)).MustNotHaveHappened();
    }

    [Fact]
    public async Task HandleAsync_ShouldThrowUnauthorizedAccessException_WhenCallerIsNotOwner()
    {
        var repository = A.Fake<IGroupRepository>();
        var handler = new UpdateGroupHandler(repository);
        var groupId = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
        var ownerUserId = Guid.Parse("cccccccc-cccc-cccc-cccc-cccccccccccc");
        var callerUserId = Guid.Parse("dddddddd-dddd-dddd-dddd-dddddddddddd");

        A.CallTo(() => repository.GetByIdAsync(groupId, A<CancellationToken>._))
            .Returns(new Group
            {
                Id = groupId,
                OwnerUserId = ownerUserId,
                Title = "Original",
                Description = "Original description",
                CreatedAt = DateTimeOffset.UtcNow.AddDays(-1),
                UpdatedAt = DateTimeOffset.UtcNow.AddDays(-1),
            });

        var exception = await Assert.ThrowsAsync<UnauthorizedAccessException>(() => handler.HandleAsync(new UpdateGroupCommand(
            GroupId: groupId,
            CallerUserId: callerUserId,
            Title: "New title",
            Description: "New description")));

        Assert.Equal("Only the group owner can update this group.", exception.Message);
        A.CallTo(() => repository.UpdateAsync(A<Group>._, A<CancellationToken>._)).MustNotHaveHappened();
    }

    [Fact]
    public async Task HandleAsync_ShouldUpdateTrimmedValues_WhenCallerIsOwner()
    {
        var repository = A.Fake<IGroupRepository>();
        var handler = new UpdateGroupHandler(repository);
        var groupId = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
        var ownerUserId = Guid.Parse("eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee");
        var createdAt = DateTimeOffset.UtcNow.AddDays(-7);
        var originalUpdatedAt = DateTimeOffset.UtcNow.AddHours(-2);
        var existingGroup = new Group
        {
            Id = groupId,
            OwnerUserId = ownerUserId,
            Title = "Old title",
            Description = "Old description",
            IsPublished = true,
            ShareToken = "share-token",
            CreatedAt = createdAt,
            UpdatedAt = originalUpdatedAt,
        };
        Group? updatedGroup = null;

        A.CallTo(() => repository.GetByIdAsync(groupId, A<CancellationToken>._))
            .Returns(existingGroup);
        A.CallTo(() => repository.UpdateAsync(A<Group>._, A<CancellationToken>._))
            .Invokes((Group group, CancellationToken _) => updatedGroup = group)
            .ReturnsLazily((Group group, CancellationToken _) => Task.FromResult(group));

        var beforeCall = DateTimeOffset.UtcNow;
        var result = await handler.HandleAsync(new UpdateGroupCommand(
            GroupId: groupId,
            CallerUserId: ownerUserId,
            Title: "  Updated title  ",
            Description: "  Updated description  "));
        var afterCall = DateTimeOffset.UtcNow;

        Assert.NotNull(updatedGroup);
        Assert.Same(existingGroup, updatedGroup);
        Assert.Equal("Updated title", updatedGroup!.Title);
        Assert.Equal("Updated description", updatedGroup.Description);
        Assert.True(updatedGroup.UpdatedAt > originalUpdatedAt);
        Assert.InRange(updatedGroup.UpdatedAt, beforeCall.AddSeconds(-1), afterCall.AddSeconds(1));

        Assert.Equal(groupId, result.Id);
        Assert.Equal(ownerUserId, result.OwnerUserId);
        Assert.Equal("Updated title", result.Title);
        Assert.Equal("Updated description", result.Description);
        Assert.True(result.IsPublished);
        Assert.Equal("share-token", result.ShareToken);
        Assert.Equal(createdAt, result.CreatedAt);
        Assert.Equal(updatedGroup.UpdatedAt, result.UpdatedAt);

        A.CallTo(() => repository.GetByIdAsync(groupId, A<CancellationToken>._)).MustHaveHappenedOnceExactly();
        A.CallTo(() => repository.UpdateAsync(existingGroup, A<CancellationToken>._)).MustHaveHappenedOnceExactly();
    }
}
