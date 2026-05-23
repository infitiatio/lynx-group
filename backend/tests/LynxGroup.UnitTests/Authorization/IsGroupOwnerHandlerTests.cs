using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using FakeItEasy;
using LynxGroup.Api.Authorization;
using LynxGroup.Application.Groups;
using LynxGroup.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace LynxGroup.UnitTests.Authorization;

public class IsGroupOwnerHandlerTests
{
    [Fact]
    public async Task HandleAsync_ShouldSucceed_WhenCallerOwnsGroup()
    {
        var repository = A.Fake<IGroupRepository>();
        var handler = new IsGroupOwnerHandler(repository);
        var ownerUserId = Guid.Parse("11111111-1111-1111-1111-111111111111");
        var groupId = Guid.Parse("22222222-2222-2222-2222-222222222222");
        var httpContext = CreateHttpContext(groupId);
        var context = BuildAuthorizationContext(ownerUserId, httpContext);

        A.CallTo(() => repository.GetByIdAsync(groupId, A<CancellationToken>._))
            .Returns(new Group
            {
                Id = groupId,
                OwnerUserId = ownerUserId,
                Title = "Owned group",
                Description = "Description",
            });

        await handler.HandleAsync(context);

        Assert.True(context.HasSucceeded);
        Assert.False(context.HasFailed);
    }

    [Fact]
    public async Task HandleAsync_ShouldFail_WhenCallerDoesNotOwnGroup()
    {
        var repository = A.Fake<IGroupRepository>();
        var handler = new IsGroupOwnerHandler(repository);
        var callerUserId = Guid.Parse("33333333-3333-3333-3333-333333333333");
        var ownerUserId = Guid.Parse("44444444-4444-4444-4444-444444444444");
        var groupId = Guid.Parse("55555555-5555-5555-5555-555555555555");
        var httpContext = CreateHttpContext(groupId);
        var context = BuildAuthorizationContext(callerUserId, httpContext);

        A.CallTo(() => repository.GetByIdAsync(groupId, A<CancellationToken>._))
            .Returns(new Group
            {
                Id = groupId,
                OwnerUserId = ownerUserId,
                Title = "Other user's group",
                Description = "Description",
            });

        await handler.HandleAsync(context);

        Assert.False(context.HasSucceeded);
        Assert.True(context.HasFailed);
    }

    [Fact]
    public async Task HandleAsync_ShouldFail_WhenUserIsUnauthenticated()
    {
        var repository = A.Fake<IGroupRepository>();
        var handler = new IsGroupOwnerHandler(repository);
        var groupId = Guid.Parse("66666666-6666-6666-6666-666666666666");
        var httpContext = CreateHttpContext(groupId);
        var context = BuildAuthorizationContextWithoutUserId(httpContext);

        await handler.HandleAsync(context);

        Assert.False(context.HasSucceeded);
        Assert.True(context.HasFailed);
        A.CallTo(() => repository.GetByIdAsync(A<Guid>._, A<CancellationToken>._)).MustNotHaveHappened();
    }

    [Fact]
    public async Task HandleAsync_ShouldSucceed_WhenGroupDoesNotExist()
    {
        var repository = A.Fake<IGroupRepository>();
        var handler = new IsGroupOwnerHandler(repository);
        var callerUserId = Guid.Parse("77777777-7777-7777-7777-777777777777");
        var groupId = Guid.Parse("88888888-8888-8888-8888-888888888888");
        var httpContext = CreateHttpContext(groupId);
        var context = BuildAuthorizationContext(callerUserId, httpContext);

        A.CallTo(() => repository.GetByIdAsync(groupId, A<CancellationToken>._))
            .Returns((Group?)null);

        await handler.HandleAsync(context);

        Assert.True(context.HasSucceeded);
        Assert.False(context.HasFailed);
        A.CallTo(() => repository.GetByIdAsync(groupId, A<CancellationToken>._)).MustHaveHappenedOnceExactly();
    }

    private static HttpContext CreateHttpContext(Guid groupId)
    {
        var httpContext = new DefaultHttpContext();
        var routeData = new RouteData();
        routeData.Values["groupId"] = groupId.ToString();
        httpContext.Request.RouteValues = routeData.Values;
        return httpContext;
    }

    private static AuthorizationHandlerContext BuildAuthorizationContext(Guid userId, HttpContext httpContext)
    {
        var identity = new ClaimsIdentity(
        [
            new Claim(JwtRegisteredClaimNames.Sub, userId.ToString()),
            new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
        ],
        authenticationType: "Bearer");

        var principal = new ClaimsPrincipal(identity);
        return new AuthorizationHandlerContext([new IsGroupOwnerRequirement()], principal, httpContext);
    }

    private static AuthorizationHandlerContext BuildAuthorizationContextWithoutUserId(HttpContext httpContext)
    {
        var principal = new ClaimsPrincipal(new ClaimsIdentity());
        return new AuthorizationHandlerContext([new IsGroupOwnerRequirement()], principal, httpContext);
    }
}
