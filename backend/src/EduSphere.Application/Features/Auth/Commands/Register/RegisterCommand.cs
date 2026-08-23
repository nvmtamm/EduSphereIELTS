using EduSphere.Application.Common.Models;
using EduSphere.Application.Features.Auth.Models;
using MediatR;

namespace EduSphere.Application.Features.Auth.Commands.Register;

public record RegisterCommand(
    string FullName,
    string Email,
    string Password,
    float? TargetBandScore) : IRequest<Result<AuthResponse>>;
