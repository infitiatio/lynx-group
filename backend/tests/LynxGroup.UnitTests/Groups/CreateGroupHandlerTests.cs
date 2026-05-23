using FakeItEasy;
using LynxGroup.Application.Groups;
using LynxGroup.Domain.Entities;

namespace LynxGroup.UnitTests.Groups;

public class CreateGroupHandlerTests
{
    [Theory]
    [InlineData("")]
    [InlineData(" ")]
    public async Task HandleAsync_ShouldThrowArgumentException_WhenTitleIsMissing(string title)
    {
        var repository = A.Fake<IGroupRepository>();
        var handler = new CreateGroupHandler(repository);
        var command = new CreateGroupCommand(
            OwnerUserId: Guid.NewGuid(),
            Title: title,
            Description: "Valid description");

        var exception = await Assert.ThrowsAsync<ArgumentException>(() => handler.HandleAsync(command));

        Assert.Equal("Title", exception.ParamName);
        A.CallTo(() => repository.CreateAsync(A<Group>._, A<CancellationToken>._)).MustNotHaveHappened();
    }

    [Theory]
    [InlineData("")]
    [InlineData(" ")]
    public async Task HandleAsync_ShouldThrowArgumentException_WhenDescriptionIsMissing(string description)
    {
        var repository = A.Fake<IGroupRepository>();
        var handler = new CreateGroupHandler(repository);
        var command = new CreateGroupCommand(
            OwnerUserId: Guid.NewGuid(),
            Title: "Valid title",
            Description: description);

        var exception = await Assert.ThrowsAsync<ArgumentException>(() => handler.HandleAsync(command));

        Assert.Equal("Description", exception.ParamName);
        A.CallTo(() => repository.CreateAsync(A<Group>._, A<CancellationToken>._)).MustNotHaveHappened();
    }

    [Fact]
    public async Task HandleAsync_ShouldCreateGroupWithTrimmedValues_WhenInputIsValid()
    {
        var repository = A.Fake<IGroupRepository>();
        var handler = new CreateGroupHandler(repository);
        var ownerUserId = Guid.Parse("11111111-1111-1111-1111-111111111111");
        Group? persistedGroup = null;

        A.CallTo(() => repository.CreateAsync(A<Group>._, A<CancellationToken>._))
            .Invokes((Group group, CancellationToken _) => persistedGroup = group)
            .ReturnsLazily((Group group, CancellationToken _) => Task.FromResult(group));

        var beforeCall = DateTimeOffset.UtcNow;
        var result = await handler.HandleAsync(new CreateGroupCommand(
            OwnerUserId: ownerUserId,
            Title: "  Team Alpha  ",
            Description: "  Group description  "));
        var afterCall = DateTimeOffset.UtcNow;

        Assert.NotNull(persistedGroup);
        Assert.NotEqual(Guid.Empty, persistedGroup!.Id);
        Assert.Equal(ownerUserId, persistedGroup.OwnerUserId);
        Assert.Equal("Team Alpha", persistedGroup.Title);
        Assert.Equal("Group description", persistedGroup.Description);
        Assert.False(persistedGroup.IsPublished);
        Assert.Null(persistedGroup.ShareToken);
        Assert.Equal(persistedGroup.CreatedAt, persistedGroup.UpdatedAt);
        Assert.InRange(persistedGroup.CreatedAt, beforeCall.AddSeconds(-1), afterCall.AddSeconds(1));

        Assert.Equal(persistedGroup.Id, result.Id);
        Assert.Equal(ownerUserId, result.OwnerUserId);
        Assert.Equal("Team Alpha", result.Title);
        Assert.Equal("Group description", result.Description);
        Assert.False(result.IsPublished);
        Assert.Null(result.ShareToken);
        Assert.Equal(persistedGroup.CreatedAt, result.CreatedAt);
        Assert.Equal(persistedGroup.UpdatedAt, result.UpdatedAt);

        A.CallTo(() => repository.CreateAsync(A<Group>._, A<CancellationToken>._)).MustHaveHappenedOnceExactly();
    }
}
