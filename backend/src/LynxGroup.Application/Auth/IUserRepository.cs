using LynxGroup.Domain.Entities;

namespace LynxGroup.Application.Auth;

public interface IUserRepository
{
    Task<User> UpsertAsync(string googleSubject, string email, string displayName, CancellationToken ct = default);
}
