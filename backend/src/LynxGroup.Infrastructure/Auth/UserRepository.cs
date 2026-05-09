using LynxGroup.Application.Auth;
using LynxGroup.Domain.Entities;
using LynxGroup.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace LynxGroup.Infrastructure.Auth;

public class UserRepository(AppDbContext dbContext) : IUserRepository
{
    public async Task<User> UpsertAsync(string googleSubject, string email, string displayName, CancellationToken ct = default)
    {
        var user = await dbContext.Users
            .FirstOrDefaultAsync(u => u.GoogleSubject == googleSubject, ct);

        if (user is null)
        {
            user = new User
            {
                Id = Guid.NewGuid(),
                GoogleSubject = googleSubject,
                Email = email,
                DisplayName = displayName,
                CreatedAt = DateTimeOffset.UtcNow,
                UpdatedAt = DateTimeOffset.UtcNow,
            };
            dbContext.Users.Add(user);
        }
        else
        {
            user.Email = email;
            user.DisplayName = displayName;
            user.UpdatedAt = DateTimeOffset.UtcNow;
        }

        await dbContext.SaveChangesAsync(ct);
        return user;
    }
}
