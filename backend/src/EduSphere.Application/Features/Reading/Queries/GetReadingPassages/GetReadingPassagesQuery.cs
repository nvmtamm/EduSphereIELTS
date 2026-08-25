using System.Text.Json;
using EduSphere.Application.Common.Interfaces;
using EduSphere.Application.Common.Models;
using EduSphere.Application.Features.Reading.Models;
using EduSphere.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Logging;

namespace EduSphere.Application.Features.Reading.Queries.GetReadingPassages;

public record GetReadingPassagesQuery(
    int Page = 1,
    int PageSize = 12,
    string? Topic = null,
    string? Difficulty = null,
    string? SourceType = null,
    string? TargetBandTier = null,
    string? CollectionName = null,
    string? Search = null,
    Guid? UserId = null,
    bool? IsPersonalOnly = null) : IRequest<Result<PagedList<ReadingPassageDto>>>;

public class GetReadingPassagesQueryHandler : IRequestHandler<GetReadingPassagesQuery, Result<PagedList<ReadingPassageDto>>>
{
    private readonly IApplicationDbContext _context;
    private readonly IDistributedCache _cache;
    private readonly ILogger<GetReadingPassagesQueryHandler> _logger;

    public GetReadingPassagesQueryHandler(
        IApplicationDbContext context,
        IDistributedCache cache,
        ILogger<GetReadingPassagesQueryHandler> logger)
    {
        _context = context;
        _cache = cache;
        _logger = logger;
    }

    public async Task<Result<PagedList<ReadingPassageDto>>> Handle(GetReadingPassagesQuery request, CancellationToken cancellationToken)
    {
        var query = _context.ReadingPassages
            .AsNoTracking()
            .Include(p => p.Questions)
            .AsQueryable();

        // 1. Filter by Personal Vault vs System Vault
        if (request.IsPersonalOnly == true && request.UserId.HasValue)
        {
            query = query.Where(p => p.UploadedByUserId == request.UserId.Value);
        }
        else if (request.IsPersonalOnly == false)
        {
            query = query.Where(p => p.UploadedByUserId == null || p.IsCommunityShared);
        }

        // 2. Filter by Topic
        if (!string.IsNullOrWhiteSpace(request.Topic) && request.Topic.ToLower() != "all")
        {
            query = query.Where(p => p.Topic.ToLower() == request.Topic.Trim().ToLower());
        }

        // 3. Filter by Difficulty
        if (!string.IsNullOrWhiteSpace(request.Difficulty) && request.Difficulty.ToLower() != "all" && Enum.TryParse<DifficultyLevel>(request.Difficulty, true, out var diff))
        {
            query = query.Where(p => p.Difficulty == diff);
        }

        // 4. Filter by SourceType
        if (!string.IsNullOrWhiteSpace(request.SourceType) && request.SourceType.ToLower() != "all" && Enum.TryParse<PassageSourceType>(request.SourceType, true, out var source))
        {
            query = query.Where(p => p.SourceType == source);
        }

        // 5. Filter by TargetBandTier
        if (!string.IsNullOrWhiteSpace(request.TargetBandTier) && request.TargetBandTier.ToLower() != "all" && Enum.TryParse<TargetBandTier>(request.TargetBandTier, true, out var band))
        {
            query = query.Where(p => p.TargetBandTier == band);
        }

        // 6. Filter by CollectionName
        if (!string.IsNullOrWhiteSpace(request.CollectionName) && request.CollectionName.ToLower() != "all")
        {
            query = query.Where(p => p.CollectionName.ToLower().Contains(request.CollectionName.Trim().ToLower()));
        }

        // 7. Search text
        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var searchLower = request.Search.Trim().ToLower();
            query = query.Where(p => p.Title.ToLower().Contains(searchLower) || p.Topic.ToLower().Contains(searchLower) || p.CollectionName.ToLower().Contains(searchLower));
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderByDescending(p => p.CreatedAt)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(p => new ReadingPassageDto(
                p.Id,
                p.Title,
                p.Topic,
                p.Difficulty.ToString(),
                p.EstimatedTimeMinutes,
                p.Questions.Count,
                p.Questions.Select(q => q.QuestionType.ToString()).Distinct().ToList(),
                p.SourceType.ToString(),
                p.CollectionName,
                p.TargetBandTier.ToString(),
                p.UploadedByUserId,
                p.IsCommunityShared,
                p.CreatedAt))
            .ToListAsync(cancellationToken);

        var pagedList = new PagedList<ReadingPassageDto>(items, totalCount, request.Page, request.PageSize);
        return Result.Success(pagedList);
    }
}
