namespace EduSphere.Application.Features.Auth.Models;

public record UserDto(
    Guid Id,
    string FullName,
    string Email,
    string Role,
    float? TargetBandScore,
    DateTime CreatedAt);
