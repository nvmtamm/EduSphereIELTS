using EduSphere.Application.Common.Interfaces;
using EduSphere.Application.Common.Models;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace EduSphere.Application.Features.Admin.Commands.ToggleUserStatus;

public record ToggleUserStatusCommand(Guid UserId, bool IsActive) : IRequest<Result<bool>>;

public class ToggleUserStatusCommandHandler : IRequestHandler<ToggleUserStatusCommand, Result<bool>>
{
    private readonly IApplicationDbContext _context;

    public ToggleUserStatusCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<bool>> Handle(ToggleUserStatusCommand request, CancellationToken cancellationToken)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == request.UserId, cancellationToken);
        if (user == null)
        {
            return Result.Failure<bool>(new Error("Admin.UserNotFound", "User not found."));
        }

        user.ToggleActiveStatus(request.IsActive);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
