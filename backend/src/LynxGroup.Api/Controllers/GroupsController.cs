using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using LynxGroup.Application.Groups;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LynxGroup.Api.Controllers;

[ApiController]
[Route("api/groups")]
public class GroupsController(
    CreateGroupHandler createGroupHandler,
    GetGroupHandler getGroupHandler,
    GetMyGroupsHandler getMyGroupsHandler,
    UpdateGroupHandler updateGroupHandler) : ControllerBase
{
    public record CreateGroupRequest(
        string Title,
        string Description);

    [HttpPost]
    [ProducesResponseType(typeof(GroupDto), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateAsync([FromBody] CreateGroupRequest request, CancellationToken ct)
    {
        try
        {
            var userId = GetCurrentUserId();
            var result = await createGroupHandler.HandleAsync(
                new CreateGroupCommand(userId, request.Title, request.Description),
                ct);

            var response = new GroupDto(
                Id: result.Id,
                OwnerUserId: result.OwnerUserId,
                Title: result.Title,
                Description: result.Description,
                IsPublished: result.IsPublished,
                ShareToken: result.ShareToken,
                CreatedAt: result.CreatedAt,
                UpdatedAt: result.UpdatedAt,
                IsOwner: true);

            return CreatedAtRoute("GetGroupById", new { groupId = result.Id }, response);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new ProblemDetails
            {
                Title = "Validation failed",
                Detail = ex.Message,
                Status = StatusCodes.Status400BadRequest,
            });
        }
    }

    [HttpGet]
    [ProducesResponseType(typeof(List<GroupDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> ListAsync(CancellationToken ct)
    {
        var userId = GetCurrentUserId();
        var groups = await getMyGroupsHandler.HandleAsync(new GetMyGroupsQuery(userId), ct);
        return Ok(groups);
    }

    [HttpGet("{groupId:guid}", Name = "GetGroupById")]
    [ProducesResponseType(typeof(GroupDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetAsync([FromRoute] Guid groupId, CancellationToken ct)
    {
        var userId = GetCurrentUserId();
        var group = await getGroupHandler.HandleAsync(new GetGroupQuery(groupId), userId, ct);

        return group is null ? NotFound() : Ok(group);
    }

    [HttpPut("{groupId:guid}")]
    [Authorize(Policy = "IsGroupOwner")]
    [ProducesResponseType(typeof(GroupDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateAsync([FromRoute] Guid groupId, [FromBody] GroupDto request, CancellationToken ct)
    {
        try
        {
            var userId = GetCurrentUserId();
            var result = await updateGroupHandler.HandleAsync(
                new UpdateGroupCommand(groupId, userId, request.Title, request.Description),
                ct);

            var response = new GroupDto(
                Id: result.Id,
                OwnerUserId: result.OwnerUserId,
                Title: result.Title,
                Description: result.Description,
                IsPublished: result.IsPublished,
                ShareToken: result.ShareToken,
                CreatedAt: result.CreatedAt,
                UpdatedAt: result.UpdatedAt,
                IsOwner: true);

            return Ok(response);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new ProblemDetails
            {
                Title = "Validation failed",
                Detail = ex.Message,
                Status = StatusCodes.Status400BadRequest,
            });
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
    }

    private Guid GetCurrentUserId()
    {
        var userIdValue = User.FindFirstValue(JwtRegisteredClaimNames.Sub)
            ?? User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (!Guid.TryParse(userIdValue, out var userId))
        {
            throw new UnauthorizedAccessException("User ID not found in token.");
        }

        return userId;
    }
}
