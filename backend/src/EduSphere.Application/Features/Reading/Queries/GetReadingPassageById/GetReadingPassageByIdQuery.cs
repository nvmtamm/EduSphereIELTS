using System.Text.Json;
using EduSphere.Application.Common.Interfaces;
using EduSphere.Application.Common.Models;
using EduSphere.Application.Features.Reading.Models;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Logging;

namespace EduSphere.Application.Features.Reading.Queries.GetReadingPassageById;

public record GetReadingPassageByIdQuery(Guid Id) : IRequest<Result<ReadingPassageDetailDto>>;

public class GetReadingPassageByIdQueryHandler : IRequestHandler<GetReadingPassageByIdQuery, Result<ReadingPassageDetailDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IDistributedCache _cache;
    private readonly ILogger<GetReadingPassageByIdQueryHandler> _logger;

    public GetReadingPassageByIdQueryHandler(
        IApplicationDbContext context,
        IDistributedCache cache,
        ILogger<GetReadingPassageByIdQueryHandler> logger)
    {
        _context = context;
        _cache = cache;
        _logger = logger;
    }

    public async Task<Result<ReadingPassageDetailDto>> Handle(GetReadingPassageByIdQuery request, CancellationToken cancellationToken)
    {
        var cacheKey = $"reading:passage:detail:{request.Id}";

        try
        {
            var cachedData = await _cache.GetStringAsync(cacheKey, cancellationToken);
            if (!string.IsNullOrEmpty(cachedData))
            {
                var cachedDetail = JsonSerializer.Deserialize<ReadingPassageDetailDto>(cachedData);
                if (cachedDetail != null)
                {
                    _logger.LogInformation("Redis cache hit for passage {PassageId}", request.Id);
                    return Result.Success(cachedDetail);
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to read passage detail from Redis cache.");
        }

        var passage = await _context.ReadingPassages
            .AsNoTracking()
            .Include(p => p.Questions)
            .FirstOrDefaultAsync(p => p.Id == request.Id, cancellationToken);

        if (passage == null)
        {
            return Result.Failure<ReadingPassageDetailDto>(new Error("Reading.PassageNotFound", $"Reading passage with ID {request.Id} was not found."));
        }

        var questionsDto = passage.Questions
            .OrderBy(q => q.QuestionNumber)
            .Select(q =>
            {
                List<string> options = new();
                try
                {
                    if (!string.IsNullOrWhiteSpace(q.OptionsJson))
                    {
                        options = JsonSerializer.Deserialize<List<string>>(q.OptionsJson) ?? new List<string>();
                    }
                }
                catch
                {
                    options = new List<string>();
                }

                return new ReadingQuestionDto(
                    q.Id,
                    q.QuestionNumber,
                    q.QuestionType.ToString(),
                    q.Prompt,
                    options);
            })
            .ToList();

        var detailDto = new ReadingPassageDetailDto(
            passage.Id,
            passage.Title,
            passage.Topic,
            passage.Difficulty.ToString(),
            passage.EstimatedTimeMinutes,
            passage.Content,
            passage.SourceType.ToString(),
            passage.CollectionName,
            passage.TargetBandTier.ToString(),
            passage.UploadedByUserId,
            passage.IsCommunityShared,
            questionsDto);

        try
        {
            var cacheOptions = new DistributedCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(15)
            };
            await _cache.SetStringAsync(cacheKey, JsonSerializer.Serialize(detailDto), cacheOptions, cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to write passage detail to Redis cache.");
        }

        return Result.Success(detailDto);
    }
}
