using FakeItEasy;
using LynxGroup.Application.Auth;
using LynxGroup.Domain.Entities;

namespace LynxGroup.UnitTests.Auth;

public class AuthenticateUserHandlerTests
{
    [Fact]
    public async Task HandleAsync_ShouldReturnTokenAndUserDetails_WhenNewUserIsCreated()
    {
        var googleTokenValidator = A.Fake<IGoogleTokenValidator>();
        var userRepository = A.Fake<IUserRepository>();
        var jwtService = A.Fake<IJwtService>();
        var handler = new AuthenticateUserHandler(googleTokenValidator, userRepository, jwtService);
        var payload = new GoogleTokenPayload("google-subject-1", "new.user@example.com", "New User");
        var user = new User
        {
            Id = Guid.Parse("22222222-2222-2222-2222-222222222222"),
            GoogleSubject = payload.Subject,
            Email = payload.Email,
            DisplayName = payload.Name,
        };

        A.CallTo(() => googleTokenValidator.ValidateAsync("valid-id-token", A<CancellationToken>._))
            .Returns(payload);
        A.CallTo(() => userRepository.UpsertAsync(payload.Subject, payload.Email, payload.Name, A<CancellationToken>._))
            .Returns(user);
        A.CallTo(() => jwtService.IssueToken(A<JwtClaims>.That.Matches(claims =>
            claims.UserId == user.Id &&
            claims.Email == user.Email &&
            claims.DisplayName == user.DisplayName)))
            .Returns("issued-jwt-token");

        var result = await handler.HandleAsync(new AuthenticateUserCommand("valid-id-token"));

        Assert.Equal("issued-jwt-token", result.Token);
        Assert.Equal(user.Id, result.UserId);
        Assert.Equal(user.Email, result.Email);
        Assert.Equal(user.DisplayName, result.DisplayName);
        A.CallTo(() => googleTokenValidator.ValidateAsync("valid-id-token", A<CancellationToken>._)).MustHaveHappenedOnceExactly();
        A.CallTo(() => userRepository.UpsertAsync(payload.Subject, payload.Email, payload.Name, A<CancellationToken>._)).MustHaveHappenedOnceExactly();
        A.CallTo(() => jwtService.IssueToken(A<JwtClaims>._)).MustHaveHappenedOnceExactly();
    }

    [Fact]
    public async Task HandleAsync_ShouldUseUpdatedEmailAndDisplayName_WhenExistingUserIsUpdated()
    {
        var googleTokenValidator = A.Fake<IGoogleTokenValidator>();
        var userRepository = A.Fake<IUserRepository>();
        var jwtService = A.Fake<IJwtService>();
        var handler = new AuthenticateUserHandler(googleTokenValidator, userRepository, jwtService);
        var payload = new GoogleTokenPayload("google-subject-2", "updated.user@example.com", "Updated User");
        var updatedUser = new User
        {
            Id = Guid.Parse("33333333-3333-3333-3333-333333333333"),
            GoogleSubject = payload.Subject,
            Email = payload.Email,
            DisplayName = payload.Name,
        };

        A.CallTo(() => googleTokenValidator.ValidateAsync("existing-user-token", A<CancellationToken>._))
            .Returns(payload);
        A.CallTo(() => userRepository.UpsertAsync(payload.Subject, payload.Email, payload.Name, A<CancellationToken>._))
            .Returns(updatedUser);
        A.CallTo(() => jwtService.IssueToken(A<JwtClaims>.That.Matches(claims =>
            claims.UserId == updatedUser.Id &&
            claims.Email == updatedUser.Email &&
            claims.DisplayName == updatedUser.DisplayName)))
            .Returns("updated-user-jwt");

        var result = await handler.HandleAsync(new AuthenticateUserCommand("existing-user-token"));

        Assert.Equal("updated-user-jwt", result.Token);
        Assert.Equal(updatedUser.Id, result.UserId);
        Assert.Equal(updatedUser.Email, result.Email);
        Assert.Equal(updatedUser.DisplayName, result.DisplayName);
        A.CallTo(() => jwtService.IssueToken(A<JwtClaims>.That.Matches(claims =>
            claims.Email == payload.Email && claims.DisplayName == payload.Name))).MustHaveHappenedOnceExactly();
    }

    [Fact]
    public async Task HandleAsync_ShouldRejectInvalidGoogleToken()
    {
        var googleTokenValidator = A.Fake<IGoogleTokenValidator>();
        var userRepository = A.Fake<IUserRepository>();
        var jwtService = A.Fake<IJwtService>();
        var handler = new AuthenticateUserHandler(googleTokenValidator, userRepository, jwtService);

        A.CallTo(() => googleTokenValidator.ValidateAsync("invalid-id-token", A<CancellationToken>._))
            .ThrowsAsync(new UnauthorizedAccessException("The provided Google token is invalid."));

        await Assert.ThrowsAsync<UnauthorizedAccessException>(() =>
            handler.HandleAsync(new AuthenticateUserCommand("invalid-id-token")));

        A.CallTo(() => userRepository.UpsertAsync(A<string>._, A<string>._, A<string>._, A<CancellationToken>._)).MustNotHaveHappened();
        A.CallTo(() => jwtService.IssueToken(A<JwtClaims>._)).MustNotHaveHappened();
    }
}