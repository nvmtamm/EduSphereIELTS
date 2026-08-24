using EduSphere.Application.Common.Models;
using EduSphere.Application.Features.Auth.Models;
using MediatR;

namespace EduSphere.Application.Features.Auth.Commands.GoogleLogin;

public record GoogleLoginCommand(string IdToken) : IRequest<Result<AuthResponse>>;
