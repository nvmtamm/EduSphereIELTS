using EduSphere.Application.Common.Interfaces;
using EduSphere.Application.Common.Models;
using EduSphere.Application.Features.Listening.Models;
using EduSphere.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Logging;

namespace EduSphere.Application.Features.Listening.Queries.GetListeningTests;

public record GetListeningTestsQuery(
    int Page = 1,
    int PageSize = 12,
    int? SectionNumber = null,
    string? Accent = null,
    string? Topic = null,
    string? Difficulty = null,
    string? SourceType = null,
    string? TargetBandTier = null,
    string? CollectionName = null,
    string? Search = null,
    Guid? UserId = null,
    bool? IsPersonalOnly = null) : IRequest<Result<PagedList<ListeningTestDto>>>;

public class GetListeningTestsQueryHandler : IRequestHandler<GetListeningTestsQuery, Result<PagedList<ListeningTestDto>>>
{
    private readonly IApplicationDbContext _context;
    private readonly IDistributedCache _cache;
    private readonly ILogger<GetListeningTestsQueryHandler> _logger;

    public GetListeningTestsQueryHandler(
        IApplicationDbContext context,
        IDistributedCache cache,
        ILogger<GetListeningTestsQueryHandler> logger)
    {
        _context = context;
        _cache = cache;
        _logger = logger;
    }

    public async Task<Result<PagedList<ListeningTestDto>>> Handle(GetListeningTestsQuery request, CancellationToken cancellationToken)
    {
        var query = _context.ListeningTests
            .AsNoTracking()
            .Include(t => t.Questions)
            .AsQueryable();

        // 1. Personal vs System
        if (request.IsPersonalOnly == true && request.UserId.HasValue)
        {
            query = query.Where(t => t.UploadedByUserId == request.UserId.Value);
        }
        else if (request.IsPersonalOnly == false)
        {
            query = query.Where(t => t.UploadedByUserId == null || t.IsCommunityShared);
        }

        // 2. Section Number
        if (request.SectionNumber.HasValue && request.SectionNumber.Value > 0)
        {
            query = query.Where(t => t.SectionNumber == request.SectionNumber.Value || t.SectionType == ListeningSectionType.FullTest_4Sections);
        }

        // 3. Accent
        if (!string.IsNullOrWhiteSpace(request.Accent) && request.Accent.ToLower() != "all" && Enum.TryParse<ListeningAccent>(request.Accent, true, out var accent))
        {
            query = query.Where(t => t.Accent == accent);
        }

        // 4. Topic
        if (!string.IsNullOrWhiteSpace(request.Topic) && request.Topic.ToLower() != "all")
        {
            query = query.Where(t => t.Topic.ToLower().Contains(request.Topic.Trim().ToLower()));
        }

        // 5. Difficulty
        if (!string.IsNullOrWhiteSpace(request.Difficulty) && request.Difficulty.ToLower() != "all" && Enum.TryParse<DifficultyLevel>(request.Difficulty, true, out var diff))
        {
            query = query.Where(t => t.Difficulty == diff);
        }

        // 6. SourceType
        if (!string.IsNullOrWhiteSpace(request.SourceType) && request.SourceType.ToLower() != "all" && Enum.TryParse<PassageSourceType>(request.SourceType, true, out var source))
        {
            query = query.Where(t => t.SourceType == source);
        }

        // 7. TargetBandTier
        if (!string.IsNullOrWhiteSpace(request.TargetBandTier) && request.TargetBandTier.ToLower() != "all" && Enum.TryParse<TargetBandTier>(request.TargetBandTier, true, out var band))
        {
            query = query.Where(t => t.TargetBandTier == band);
        }

        // 8. CollectionName
        if (!string.IsNullOrWhiteSpace(request.CollectionName) && request.CollectionName.ToLower() != "all")
        {
            query = query.Where(t => t.CollectionName.ToLower().Contains(request.CollectionName.Trim().ToLower()));
        }

        // 9. Search
        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var searchLower = request.Search.Trim().ToLower();
            query = query.Where(t => t.Title.ToLower().Contains(searchLower) || t.Topic.ToLower().Contains(searchLower) || t.CollectionName.ToLower().Contains(searchLower));
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderByDescending(t => t.CreatedAt)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(t => new ListeningTestDto(
                t.Id,
                t.Title,
                t.Topic,
                t.Difficulty.ToString(),
                t.SectionType.ToString(),
                t.SectionNumber,
                t.DurationSeconds,
                t.AudioUrl,
                t.Accent.ToString(),
                t.Questions.Count,
                t.Questions.Select(q => q.QuestionType.ToString()).Distinct().ToList(),
                t.SourceType.ToString(),
                t.CollectionName,
                t.TargetBandTier.ToString(),
                t.UploadedByUserId,
                t.IsCommunityShared,
                t.CreatedAt
            ))
            .ToListAsync(cancellationToken);

        var pagedList = new PagedList<ListeningTestDto>(items, totalCount, request.Page, request.PageSize);
        return Result.Success(pagedList);
    }
}
