namespace LynxGroup.Application.Groups;

public record GetMyGroupsQuery(Guid CallerUserId);

public class GetMyGroupsHandler(IGroupRepository repository)
{
    public async Task<List<GroupDto>> HandleAsync(GetMyGroupsQuery query, CancellationToken ct = default)
    {
        var groups = await repository.GetByOwnerAsync(query.CallerUserId, ct);

        return groups
            .Select(group => GetGroupHandler.MapToDto(group, query.CallerUserId))
            .ToList();
    }
}
