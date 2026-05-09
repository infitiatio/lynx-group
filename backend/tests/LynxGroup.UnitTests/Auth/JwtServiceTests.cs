using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using LynxGroup.Application.Auth;
using LynxGroup.Infrastructure.Auth;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace LynxGroup.UnitTests.Auth;

public class JwtServiceTests
{
    private const string Issuer = "lynxgroup-tests";
    private const string Audience = "lynxgroup-tests";
    private const string SigningKey = "lynxgroup-tests-signing-key-1234567890";

    [Fact]
    public void IssueToken_ShouldRoundTripExpectedClaims()
    {
        var service = CreateSut(expiryMinutes: 30);
        var claims = new JwtClaims(
            UserId: Guid.Parse("11111111-1111-1111-1111-111111111111"),
            Email: "user@example.com",
            DisplayName: "Test User");

        var token = service.IssueToken(claims);

        var jwt = new JwtSecurityTokenHandler().ReadJwtToken(token);
        var principal = new JwtSecurityTokenHandler().ValidateToken(token, CreateValidationParameters(), out _);

        Assert.Equal(Issuer, jwt.Issuer);
        Assert.Contains(Audience, jwt.Audiences);
        Assert.Equal(claims.UserId.ToString(), jwt.Claims.Single(claim => claim.Type == JwtRegisteredClaimNames.Sub).Value);
        Assert.Equal(claims.Email, jwt.Claims.Single(claim => claim.Type == JwtRegisteredClaimNames.Email).Value);
        Assert.Equal(claims.DisplayName, jwt.Claims.Single(claim => claim.Type == JwtRegisteredClaimNames.Name).Value);
        Assert.Equal(claims.UserId.ToString(), principal.FindFirstValue(ClaimTypes.NameIdentifier));
    }

    [Fact]
    public void IssueToken_ShouldSetExpiryFromConfiguration()
    {
        const int expiryMinutes = 45;
        var service = CreateSut(expiryMinutes);
        var beforeIssue = DateTimeOffset.UtcNow;

        var token = service.IssueToken(new JwtClaims(
            UserId: Guid.NewGuid(),
            Email: "expiry@example.com",
            DisplayName: "Expiry Test"));

        var afterIssue = DateTimeOffset.UtcNow;
        var validTo = new DateTimeOffset(new JwtSecurityTokenHandler().ReadJwtToken(token).ValidTo, TimeSpan.Zero);
        var lowerBound = beforeIssue.AddMinutes(expiryMinutes).AddSeconds(-2);
        var upperBound = afterIssue.AddMinutes(expiryMinutes).AddSeconds(2);

        Assert.True(validTo >= lowerBound, $"Expected expiry >= {lowerBound:o}, but was {validTo:o}.");
        Assert.True(validTo <= upperBound, $"Expected expiry <= {upperBound:o}, but was {validTo:o}.");
    }

    private static JwtService CreateSut(int expiryMinutes)
    {
        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Jwt:Issuer"] = Issuer,
                ["Jwt:Audience"] = Audience,
                ["Jwt:SigningKey"] = SigningKey,
                ["Jwt:ExpiryMinutes"] = expiryMinutes.ToString(),
            })
            .Build();

        return new JwtService(configuration);
    }

    private static TokenValidationParameters CreateValidationParameters()
    {
        return new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = Issuer,
            ValidateAudience = true,
            ValidAudience = Audience,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(SigningKey)),
            ClockSkew = TimeSpan.Zero,
            NameClaimType = JwtRegisteredClaimNames.Name,
            RoleClaimType = ClaimTypes.Role,
        };
    }
}