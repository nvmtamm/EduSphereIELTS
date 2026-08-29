using EduSphere.Application.Common.Interfaces;
using EduSphere.Application.Common.Models;
using EduSphere.Application.Features.Listening.Models;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace EduSphere.Application.Features.Listening.Queries.GetListeningHistory;

public record GetListeningHistoryQuery(Guid UserId) : IRequest<Result<List<ListeningHistoryDto>>>;

public class GetListeningHistoryQueryHandler : IRequestHandler<GetListeningHistoryQuery, Result<List<ListeningHistoryDto>>>
{
    private readonly IApplicationDbContext _context;

    public GetListeningHistoryQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<List<ListeningHistoryDto>>> Handle(GetListeningHistoryQuery request, CancellationToken cancellationToken)
    {
        var submissions = await _context.ListeningSubmissions
            .AsNoTracking()
            .Where(s => s.UserId == request.UserId)
            .Include(s => s.Test)
            .OrderByDescending(s => s.CreatedAt)
            .Take(50)
            .Select(s => new ListeningHistoryDto(
                s.Id,
                s.TestId,
                s.Test.Title,
                s.RawScore,
                s.TotalQuestions,
                s.TotalQuestions > 0 ? Math.Round(((double)s.RawScore / s.TotalQuestions) * 100, 1) : 0,
                s.BandScore,
                s.DurationSeconds,
                s.CreatedAt,
                s.Test.Accent.ToString(),
                s.Test.SectionType.ToString()))
            .ToListAsync(cancellationToken);

        return Result<List<ListeningHistoryDto>>.Success(submissions);
    }
}
