using EduSphere.Application.Common.Interfaces;
using EduSphere.Application.Common.Models;
using EduSphere.Application.Features.Auth.Models;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace EduSphere.Application.Features.Auth.Queries.GetProfile;

public record GetProfileQuery(Guid UserId) : IRequest<Result<UserDto>>;

public class GetProfileQueryHandler : IRequestHandler<GetProfileQuery, Result<UserDto>>
{
    private readonly IApplicationDbContext _context;

    public GetProfileQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<UserDto>> Handle(GetProfileQuery request, CancellationToken cancellationToken)
    {
        var user = await _context.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == request.UserId && !u.IsDeleted, cancellationToken);

        if (user is null)
        {
            return Result.Failure<UserDto>(new Error("User.NotFound", "User profile not found."));
        }

        var userDto = new UserDto(
            user.Id,
            user.FullName,
            user.Email,
            user.Role.ToString(),
            user.TargetBandScore,
            user.CreatedAt);

        return Result.Success(userDto);
    }
}
