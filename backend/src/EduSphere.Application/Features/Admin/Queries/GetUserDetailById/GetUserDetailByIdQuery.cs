using EduSphere.Application.Common.Interfaces;
using EduSphere.Application.Common.Models;
using EduSphere.Application.Features.Admin.Models;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace EduSphere.Application.Features.Admin.Queries.GetUserDetailById;

public record GetUserDetailByIdQuery(Guid UserId) : IRequest<Result<AdminUserDetailDto>>;

public class GetUserDetailByIdQueryHandler : IRequestHandler<GetUserDetailByIdQuery, Result<AdminUserDetailDto>>
{
    private readonly IApplicationDbContext _context;

    public GetUserDetailByIdQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<AdminUserDetailDto>> Handle(GetUserDetailByIdQuery request, CancellationToken cancellationToken)
    {
        var user = await _context.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == request.UserId, cancellationToken);

        if (user == null)
        {
            return Result.Failure<AdminUserDetailDto>(new Error("Admin.UserNotFound", "User not found."));
        }

        var writing = await _context.WritingSubmissions
            .Include(s => s.Prompt)
            .Where(s => s.UserId == user.Id)
            .OrderByDescending(s => s.CreatedAt)
            .Take(5)
            .Select(s => new AdminRecentActivityDto(
                s.Id,
                user.FullName,
                user.Email,
                "Writing",
                s.Prompt != null ? s.Prompt.Title : "Writing Task",
                s.OverallBandScore,
                s.CreatedAt))
            .ToListAsync(cancellationToken);

        var reading = await _context.ReadingSubmissions
            .Include(s => s.Passage)
            .Where(s => s.UserId == user.Id)
            .OrderByDescending(s => s.CreatedAt)
            .Take(5)
            .Select(s => new AdminRecentActivityDto(
                s.Id,
                user.FullName,
                user.Email,
                "Reading",
                s.Passage != null ? s.Passage.Title : "Reading Passage",
                (float)s.BandScore,
                s.CreatedAt))
            .ToListAsync(cancellationToken);

        var activities = writing.Concat(reading).OrderByDescending(a => a.SubmittedAt).ToList();

        var detail = new AdminUserDetailDto(
            user.Id,
            user.FullName,
            user.Email,
            user.Role.ToString(),
            user.IsActive,
            user.TargetBandScore,
            user.CreatedAt,
            activities);

        return Result<AdminUserDetailDto>.Success(detail);
    }
}
