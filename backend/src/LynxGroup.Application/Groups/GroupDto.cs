namespace LynxGroup.Application.Groups;

public record GroupDto(
    Guid Id,
    Guid OwnerUserId,
    string Title,
    string Description,
    bool IsPublished,
    string? ShareToken,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt,
    bool IsOwner);
