namespace LynxGroup.Application.Auth;

public interface IGoogleTokenValidator
{
    Task<GoogleTokenPayload> ValidateAsync(string idToken, CancellationToken ct = default);
}

public record GoogleTokenPayload(
    string Subject,
    string Email,
    string Name);
