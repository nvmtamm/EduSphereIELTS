using EduSphere.Application.Common.Models;
using EduSphere.Application.Features.Auth.Models;
using MediatR;

namespace EduSphere.Application.Features.Auth.Commands.RefreshToken;

public record RefreshTokenCommand(string RefreshToken) : IRequest<Result<AuthResponse>>;
