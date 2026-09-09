using EduSphere.Application.Common.Interfaces;
using EduSphere.Application.Common.Models;
using EduSphere.Application.Features.Writing.Models;
using EduSphere.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace EduSphere.Application.Features.Writing.Queries.GetWritingPrompts;

public record GetWritingPromptsQuery(
    WritingTaskType? TaskType = null,
    string? Topic = null,
    string? Search = null,
    int PageNumber = 1,
    int PageSize = 10) : IRequest<Result<PagedList<WritingPromptDto>>>;

public class GetWritingPromptsQueryHandler : IRequestHandler<GetWritingPromptsQuery, Result<PagedList<WritingPromptDto>>>
{
    private readonly IApplicationDbContext _context;

    public GetWritingPromptsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<PagedList<WritingPromptDto>>> Handle(GetWritingPromptsQuery request, CancellationToken cancellationToken)
    {
        var query = _context.WritingPrompts
            .AsNoTracking()
            .Where(p => p.IsActive);

        if (request.TaskType.HasValue)
        {
            query = query.Where(p => p.TaskType == request.TaskType.Value);
        }

        if (!string.IsNullOrWhiteSpace(request.Topic))
        {
            query = query.Where(p => p.Topic == request.Topic.Trim());
        }

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.Trim().ToLower();
            query = query.Where(p => p.Title.ToLower().Contains(search) || p.Topic.ToLower().Contains(search));
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var prompts = await query
            .OrderByDescending(p => p.CreatedAt)
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(p => new WritingPromptDto(
                p.Id,
                p.TaskType.ToString(),
                p.Title,
                p.Topic,
                p.PromptText,
                p.ImageUrl,
                p.Difficulty.ToString(),
                p.RecommendedTimeMinutes,
                p.MinWordCount,
                p.SampleBand8Answer,
                p.IsActive,
                p.CreatedAt))
            .ToListAsync(cancellationToken);

        var pagedList = new PagedList<WritingPromptDto>(prompts, totalCount, request.PageNumber, request.PageSize);
        return Result<PagedList<WritingPromptDto>>.Success(pagedList);
    }
}
