using EduSphere.Application.Common.Interfaces;
using EduSphere.Application.Common.Models;
using EduSphere.Application.Features.Admin.Models;
using EduSphere.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace EduSphere.Application.Features.Admin.Queries.GetUsersPaged;

public record GetUsersPagedQuery(
    string? Search = null,
    UserRole? Role = null,
    bool? IsActive = null,
    int PageNumber = 1,
    int PageSize = 10) : IRequest<Result<PagedList<AdminUserListItemDto>>>;

public class GetUsersPagedQueryHandler : IRequestHandler<GetUsersPagedQuery, Result<PagedList<AdminUserListItemDto>>>
{
    private readonly IApplicationDbContext _context;

    public GetUsersPagedQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<PagedList<AdminUserListItemDto>>> Handle(GetUsersPagedQuery request, CancellationToken cancellationToken)
    {
        var query = _context.Users.AsNoTracking();

        if (request.Role.HasValue)
        {
            query = query.Where(u => u.Role == request.Role.Value);
        }

        if (request.IsActive.HasValue)
        {
            query = query.Where(u => u.IsActive == request.IsActive.Value);
        }

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.Trim().ToLower();
            query = query.Where(u => u.FullName.ToLower().Contains(search) || u.Email.ToLower().Contains(search));
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var users = await query
            .OrderByDescending(u => u.CreatedAt)
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(u => new AdminUserListItemDto(
                u.Id,
                u.FullName,
                u.Email,
                u.Role.ToString(),
                u.IsActive,
                u.TargetBandScore,
                _context.ReadingSubmissions.Count(s => s.UserId == u.Id) +
                _context.ListeningSubmissions.Count(s => s.UserId == u.Id) +
                _context.WritingSubmissions.Count(s => s.UserId == u.Id),
                u.CreatedAt))
            .ToListAsync(cancellationToken);

        var pagedList = new PagedList<AdminUserListItemDto>(users, totalCount, request.PageNumber, request.PageSize);
        return Result<PagedList<AdminUserListItemDto>>.Success(pagedList);
    }
}
