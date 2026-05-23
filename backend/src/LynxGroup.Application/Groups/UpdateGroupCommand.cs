namespace LynxGroup.Application.Groups;

public record UpdateGroupCommand(
    Guid GroupId,
    Guid CallerUserId,
    string Title,
    string Description);

public record UpdateGroupResult(
    Guid Id,
    Guid OwnerUserId,
    string Title,
    string Description,
    bool IsPublished,
    string? ShareToken,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt);

public class UpdateGroupHandler(IGroupRepository repository)
{
    public async Task<UpdateGroupResult> HandleAsync(UpdateGroupCommand command, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(command.Title))
        {
            throw new ArgumentException("Title is required.", nameof(command.Title));
        }

        if (string.IsNullOrWhiteSpace(command.Description))
        {
            throw new ArgumentException("Description is required.", nameof(command.Description));
        }

        var group = await repository.GetByIdAsync(command.GroupId, ct);
        if (group is null)
        {
            throw new KeyNotFoundException($"Group {command.GroupId} was not found.");
        }

        if (group.OwnerUserId != command.CallerUserId)
        {
            throw new UnauthorizedAccessException("Only the group owner can update this group.");
        }

        group.Title = command.Title.Trim();
        group.Description = command.Description.Trim();
        group.UpdatedAt = DateTimeOffset.UtcNow;

        var updated = await repository.UpdateAsync(group, ct);

        return new UpdateGroupResult(
            Id: updated.Id,
            OwnerUserId: updated.OwnerUserId,
            Title: updated.Title,
            Description: updated.Description,
            IsPublished: updated.IsPublished,
            ShareToken: updated.ShareToken,
            CreatedAt: updated.CreatedAt,
            UpdatedAt: updated.UpdatedAt);
    }
}
