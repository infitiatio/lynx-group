namespace LynxGroup.Application.Auth;

public interface IJwtService
{
    string IssueToken(JwtClaims claims);
}

public record JwtClaims(
    Guid UserId,
    string Email,
    string DisplayName);
