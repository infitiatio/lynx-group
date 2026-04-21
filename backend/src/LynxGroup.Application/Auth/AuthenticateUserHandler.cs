namespace LynxGroup.Application.Auth;

public class AuthenticateUserHandler(
    IGoogleTokenValidator googleTokenValidator,
    IUserRepository userRepository,
    IJwtService jwtService)
{
    public async Task<AuthenticateUserResult> HandleAsync(AuthenticateUserCommand command, CancellationToken ct = default)
    {
        var googlePayload = await googleTokenValidator.ValidateAsync(command.IdToken, ct);

        var user = await userRepository.UpsertAsync(
            googlePayload.Subject,
            googlePayload.Email,
            googlePayload.Name,
            ct);

        var token = jwtService.IssueToken(new JwtClaims(
            UserId: user.Id,
            Email: user.Email,
            DisplayName: user.DisplayName));

        return new AuthenticateUserResult(
            Token: token,
            UserId: user.Id,
            Email: user.Email,
            DisplayName: user.DisplayName);
    }
}
