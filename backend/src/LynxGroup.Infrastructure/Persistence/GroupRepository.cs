using LynxGroup.Application.Groups;
using LynxGroup.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace LynxGroup.Infrastructure.Persistence;

public class GroupRepository(AppDbContext dbContext) : IGroupRepository
{
    public async Task<Group> CreateAsync(Group group, CancellationToken ct = default)
    {
        dbContext.Groups.Add(group);
        await dbContext.SaveChangesAsync(ct);
        return group;
    }

    public async Task<Group?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        return await dbContext.Groups
            .FirstOrDefaultAsync(group => group.Id == id, ct);
    }

    public async Task<List<Group>> GetByOwnerAsync(Guid ownerUserId, CancellationToken ct = default)
    {
        return await dbContext.Groups
            .Where(group => group.OwnerUserId == ownerUserId)
            .OrderByDescending(group => group.CreatedAt)
            .ToListAsync(ct);
    }

    public async Task<Group> UpdateAsync(Group group, CancellationToken ct = default)
    {
        dbContext.Groups.Update(group);
        await dbContext.SaveChangesAsync(ct);
        return group;
    }
}
