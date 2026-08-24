using EduSphere.Application.Common.Models;
using MediatR;

namespace EduSphere.Application.Features.Auth.Commands.ForgotPassword;

public record ForgotPasswordCommand(string Email) : IRequest<Result<string>>;
