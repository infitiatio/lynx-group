using LynxGroup.Domain.Entities;

namespace LynxGroup.Application.Groups;

public record GetGroupQuery(Guid GroupId);

public class GetGroupHandler(IGroupRepository repository)
{
    public async Task<GroupDto?> HandleAsync(GetGroupQuery query, Guid callerUserId, CancellationToken ct = default)
    {
        var group = await repository.GetByIdAsync(query.GroupId, ct);
        return group is null ? null : MapToDto(group, callerUserId);
    }

    public static GroupDto MapToDto(Group group, Guid callerUserId)
    {
        return new GroupDto(
            Id: group.Id,
            OwnerUserId: group.OwnerUserId,
            Title: group.Title,
            Description: group.Description,
            IsPublished: group.IsPublished,
            ShareToken: group.ShareToken,
            CreatedAt: group.CreatedAt,
            UpdatedAt: group.UpdatedAt,
            IsOwner: group.OwnerUserId == callerUserId);
    }
}
