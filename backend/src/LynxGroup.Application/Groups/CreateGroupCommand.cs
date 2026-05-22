using LynxGroup.Domain.Entities;

namespace LynxGroup.Application.Groups;

public record CreateGroupCommand(
    Guid OwnerUserId,
    string Title,
    string Description);

public record CreateGroupResult(
    Guid Id,
    Guid OwnerUserId,
    string Title,
    string Description,
    bool IsPublished,
    string? ShareToken,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt);

public class CreateGroupHandler(IGroupRepository repository)
{
    public async Task<CreateGroupResult> HandleAsync(CreateGroupCommand command, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(command.Title))
        {
            throw new ArgumentException("Title is required.", nameof(command.Title));
        }

        if (string.IsNullOrWhiteSpace(command.Description))
        {
            throw new ArgumentException("Description is required.", nameof(command.Description));
        }

        var now = DateTimeOffset.UtcNow;
        var group = new Group
        {
            Id = Guid.NewGuid(),
            OwnerUserId = command.OwnerUserId,
            Title = command.Title.Trim(),
            Description = command.Description.Trim(),
            IsPublished = false,
            ShareToken = null,
            CreatedAt = now,
            UpdatedAt = now,
        };

        var created = await repository.CreateAsync(group, ct);

        return new CreateGroupResult(
            Id: created.Id,
            OwnerUserId: created.OwnerUserId,
            Title: created.Title,
            Description: created.Description,
            IsPublished: created.IsPublished,
            ShareToken: created.ShareToken,
            CreatedAt: created.CreatedAt,
            UpdatedAt: created.UpdatedAt);
    }
}
