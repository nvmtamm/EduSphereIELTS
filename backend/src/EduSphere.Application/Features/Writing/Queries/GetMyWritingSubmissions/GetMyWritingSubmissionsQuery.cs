using EduSphere.Application.Common.Interfaces;
using EduSphere.Application.Common.Models;
using EduSphere.Application.Features.Writing.Models;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace EduSphere.Application.Features.Writing.Queries.GetMyWritingSubmissions;

public record GetMyWritingSubmissionsQuery(Guid UserId, int PageNumber = 1, int PageSize = 10) : IRequest<Result<PagedList<WritingSubmissionSummaryDto>>>;

public class GetMyWritingSubmissionsQueryHandler : IRequestHandler<GetMyWritingSubmissionsQuery, Result<PagedList<WritingSubmissionSummaryDto>>>
{
    private readonly IApplicationDbContext _context;

    public GetMyWritingSubmissionsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<PagedList<WritingSubmissionSummaryDto>>> Handle(GetMyWritingSubmissionsQuery request, CancellationToken cancellationToken)
    {
        var query = _context.WritingSubmissions
            .Include(s => s.Prompt)
            .AsNoTracking()
            .Where(s => s.UserId == request.UserId);

        var totalCount = await query.CountAsync(cancellationToken);

        var submissions = await query
            .OrderByDescending(s => s.CreatedAt)
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(s => new WritingSubmissionSummaryDto(
                s.Id,
                s.PromptId,
                s.Prompt != null ? s.Prompt.Title : "Writing Task",
                s.Prompt != null ? s.Prompt.TaskType.ToString() : "Task2",
                s.WordCount,
                s.TimeSpentSeconds,
                s.OverallBandScore,
                s.Status.ToString(),
                s.CreatedAt))
            .ToListAsync(cancellationToken);

        var pagedList = new PagedList<WritingSubmissionSummaryDto>(submissions, totalCount, request.PageNumber, request.PageSize);
        return Result<PagedList<WritingSubmissionSummaryDto>>.Success(pagedList);
    }
}
