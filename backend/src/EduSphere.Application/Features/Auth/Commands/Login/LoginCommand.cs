using EduSphere.Application.Common.Models;
using EduSphere.Application.Features.Auth.Models;
using MediatR;

namespace EduSphere.Application.Features.Auth.Commands.Login;

public record LoginCommand(
    string Email,
    string Password) : IRequest<Result<AuthResponse>>;
