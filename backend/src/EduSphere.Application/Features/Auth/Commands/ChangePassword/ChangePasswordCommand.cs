using EduSphere.Application.Common.Models;
using MediatR;

namespace EduSphere.Application.Features.Auth.Commands.ChangePassword;

public record ChangePasswordCommand(
    Guid UserId,
    string CurrentPassword,
    string NewPassword
) : IRequest<Result<string>>;
