using Google.Apis.Auth;
using LynxGroup.Application.Auth;
using Microsoft.Extensions.Configuration;

namespace LynxGroup.Infrastructure.Auth;

public class GoogleTokenValidator(IConfiguration configuration) : IGoogleTokenValidator
{
    public async Task<GoogleTokenPayload> ValidateAsync(string idToken, CancellationToken ct = default)
    {
        var clientId = configuration["Authentication:Google:ClientId"]?.Trim();

        if (string.IsNullOrWhiteSpace(clientId) || clientId.Contains("CHANGE_ME", StringComparison.OrdinalIgnoreCase))
        {
            throw new InvalidOperationException(
                "Authentication:Google:ClientId is not configured. Set it via .NET user-secrets or environment variables before using Google sign-in.");
        }

        var settings = new GoogleJsonWebSignature.ValidationSettings
        {
            Audience = [clientId],
        };

        GoogleJsonWebSignature.Payload payload;
        try
        {
            payload = await GoogleJsonWebSignature.ValidateAsync(idToken, settings);
        }
        catch (InvalidJwtException ex)
        {
            throw new UnauthorizedAccessException("The provided Google token is invalid.", ex);
        }

        return new GoogleTokenPayload(
            Subject: payload.Subject,
            Email: payload.Email,
            Name: payload.Name);
    }
}
