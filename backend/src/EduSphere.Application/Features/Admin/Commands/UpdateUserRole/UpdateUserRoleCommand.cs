using EduSphere.Application.Common.Interfaces;
using EduSphere.Application.Common.Models;
using EduSphere.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace EduSphere.Application.Features.Admin.Commands.UpdateUserRole;

public record UpdateUserRoleCommand(Guid UserId, UserRole NewRole) : IRequest<Result<bool>>;

public class UpdateUserRoleCommandHandler : IRequestHandler<UpdateUserRoleCommand, Result<bool>>
{
    private readonly IApplicationDbContext _context;

    public UpdateUserRoleCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<bool>> Handle(UpdateUserRoleCommand request, CancellationToken cancellationToken)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == request.UserId, cancellationToken);
        if (user == null)
        {
            return Result.Failure<bool>(new Error("Admin.UserNotFound", "User not found."));
        }

        user.UpdateRole(request.NewRole);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
