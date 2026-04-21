using Google.Apis.Auth;
using LynxGroup.Application.Auth;
using Microsoft.Extensions.Configuration;

namespace LynxGroup.Infrastructure.Auth;

public class GoogleTokenValidator(IConfiguration configuration) : IGoogleTokenValidator
{
    public async Task<GoogleTokenPayload> ValidateAsync(string idToken, CancellationToken ct = default)
    {
        var clientId = configuration["Authentication:Google:ClientId"]
            ?? throw new InvalidOperationException("Google ClientId is not configured.");

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
