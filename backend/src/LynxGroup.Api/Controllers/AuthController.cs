using LynxGroup.Application.Auth;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LynxGroup.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(AuthenticateUserHandler handler) : ControllerBase
{
    public record GoogleCallbackRequest(string IdToken);

    public record GoogleCallbackResponse(
        string Token,
        UserDto User);

    public record UserDto(
        Guid Id,
        string Email,
        string DisplayName);

    [AllowAnonymous]
    [HttpPost("google-callback")]
    public async Task<IActionResult> GoogleCallbackAsync(
        [FromBody] GoogleCallbackRequest request,
        CancellationToken ct)
    {
        var result = await handler.HandleAsync(new AuthenticateUserCommand(request.IdToken), ct);

        return Ok(new GoogleCallbackResponse(
            Token: result.Token,
            User: new UserDto(result.UserId, result.Email, result.DisplayName)));
    }
}
