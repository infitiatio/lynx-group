using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using LynxGroup.Application.Auth;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace LynxGroup.Infrastructure.Auth;

public class JwtService(IConfiguration configuration) : IJwtService
{
    public string IssueToken(JwtClaims claims)
    {
        var signingKey = configuration["Jwt:SigningKey"]
            ?? throw new InvalidOperationException("JWT SigningKey is not configured.");
        var issuer = configuration["Jwt:Issuer"]
            ?? throw new InvalidOperationException("JWT Issuer is not configured.");
        var audience = configuration["Jwt:Audience"]
            ?? throw new InvalidOperationException("JWT Audience is not configured.");
        var expiryMinutes = int.TryParse(configuration["Jwt:ExpiryMinutes"], out var parsed) ? parsed : 480;

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(signingKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var tokenClaims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, claims.UserId.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, claims.Email),
            new Claim(JwtRegisteredClaimNames.Name, claims.DisplayName),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
        };

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: tokenClaims,
            expires: DateTime.UtcNow.AddMinutes(expiryMinutes),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
