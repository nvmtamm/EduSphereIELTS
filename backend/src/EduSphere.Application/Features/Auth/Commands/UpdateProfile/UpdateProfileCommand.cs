using EduSphere.Application.Common.Models;
using EduSphere.Application.Features.Auth.Models;
using MediatR;

namespace EduSphere.Application.Features.Auth.Commands.UpdateProfile;

public record UpdateProfileCommand(
    Guid UserId,
    string FullName,
    float? TargetBandScore
) : IRequest<Result<UserDto>>;
