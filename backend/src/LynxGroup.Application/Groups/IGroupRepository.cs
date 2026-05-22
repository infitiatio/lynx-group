using LynxGroup.Domain.Entities;

namespace LynxGroup.Application.Groups;

public interface IGroupRepository
{
    Task<Group> CreateAsync(Group group, CancellationToken ct = default);
    Task<Group?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<List<Group>> GetByOwnerAsync(Guid ownerUserId, CancellationToken ct = default);
    Task<Group> UpdateAsync(Group group, CancellationToken ct = default);
}
