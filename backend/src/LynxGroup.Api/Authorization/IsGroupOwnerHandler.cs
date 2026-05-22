using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using LynxGroup.Application.Groups;
using Microsoft.AspNetCore.Authorization;

namespace LynxGroup.Api.Authorization;

public class IsGroupOwnerRequirement : IAuthorizationRequirement
{
}

public class IsGroupOwnerHandler(IGroupRepository repository) : AuthorizationHandler<IsGroupOwnerRequirement>
{
    protected override async Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        IsGroupOwnerRequirement requirement)
    {
        var userIdValue = context.User.FindFirstValue(JwtRegisteredClaimNames.Sub)
            ?? context.User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (!Guid.TryParse(userIdValue, out var userId))
        {
            context.Fail();
            return;
        }

        if (context.Resource is not HttpContext httpContext)
        {
            context.Fail();
            return;
        }

        var groupIdRaw = httpContext.GetRouteValue("groupId")?.ToString();
        if (!Guid.TryParse(groupIdRaw, out var groupId))
        {
            context.Fail();
            return;
        }

        var group = await repository.GetByIdAsync(groupId, httpContext.RequestAborted);
        if (group is null || group.OwnerUserId == userId)
        {
            // Allow controller to return 404 when group does not exist.
            context.Succeed(requirement);
            return;
        }

        context.Fail();
    }
}
