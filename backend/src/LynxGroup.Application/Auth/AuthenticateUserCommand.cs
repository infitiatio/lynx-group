namespace LynxGroup.Application.Auth;

public record AuthenticateUserCommand(string IdToken);

public record AuthenticateUserResult(
    string Token,
    Guid UserId,
    string Email,
    string DisplayName);
