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
    int PageSize = 10,
    string? Topic = null,
    string? Difficulty = null,
    string? Search = null) : IRequest<Result<PagedList<ReadingPassageDto>>>;

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
        var cacheKey = $"reading:passages:p_{request.Page}_s_{request.PageSize}_t_{request.Topic}_d_{request.Difficulty}_q_{request.Search}";

        try
        {
            var cachedData = await _cache.GetStringAsync(cacheKey, cancellationToken);
            if (!string.IsNullOrEmpty(cachedData))
            {
                var cachedResult = JsonSerializer.Deserialize<PagedList<ReadingPassageDto>>(cachedData);
                if (cachedResult != null)
                {
                    _logger.LogInformation("Redis cache hit for reading passages with key {CacheKey}", cacheKey);
                    return Result.Success(cachedResult);
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to read reading passages from Redis cache.");
        }

        var query = _context.ReadingPassages
            .AsNoTracking()
            .Include(p => p.Questions)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.Topic))
        {
            query = query.Where(p => p.Topic.ToLower() == request.Topic.Trim().ToLower());
        }

        if (!string.IsNullOrWhiteSpace(request.Difficulty) && Enum.TryParse<DifficultyLevel>(request.Difficulty, true, out var diff))
        {
            query = query.Where(p => p.Difficulty == diff);
        }

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var searchLower = request.Search.Trim().ToLower();
            query = query.Where(p => p.Title.ToLower().Contains(searchLower) || p.Topic.ToLower().Contains(searchLower));
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
                p.CreatedAt))
            .ToListAsync(cancellationToken);

        var pagedList = new PagedList<ReadingPassageDto>(items, totalCount, request.Page, request.PageSize);

        try
        {
            var cacheOptions = new DistributedCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(10)
            };
            await _cache.SetStringAsync(cacheKey, JsonSerializer.Serialize(pagedList), cacheOptions, cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to write reading passages to Redis cache.");
        }

        return Result.Success(pagedList);
    }
}
