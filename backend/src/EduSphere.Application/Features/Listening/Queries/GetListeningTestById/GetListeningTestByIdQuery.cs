using System.Text.Json;
using EduSphere.Application.Common.Interfaces;
using EduSphere.Application.Common.Models;
using EduSphere.Application.Features.Listening.Models;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Logging;

namespace EduSphere.Application.Features.Listening.Queries.GetListeningTestById;

public record GetListeningTestByIdQuery(Guid Id) : IRequest<Result<ListeningTestDetailDto>>;

public class GetListeningTestByIdQueryHandler : IRequestHandler<GetListeningTestByIdQuery, Result<ListeningTestDetailDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IDistributedCache _cache;
    private readonly ILogger<GetListeningTestByIdQueryHandler> _logger;

    public GetListeningTestByIdQueryHandler(
        IApplicationDbContext context,
        IDistributedCache cache,
        ILogger<GetListeningTestByIdQueryHandler> logger)
    {
        _context = context;
        _cache = cache;
        _logger = logger;
    }

    public async Task<Result<ListeningTestDetailDto>> Handle(GetListeningTestByIdQuery request, CancellationToken cancellationToken)
    {
        var cacheKey = $"listening:test:detail:{request.Id}";

        try
        {
            var cachedData = await _cache.GetStringAsync(cacheKey, cancellationToken);
            if (!string.IsNullOrEmpty(cachedData))
            {
                var cachedDetail = JsonSerializer.Deserialize<ListeningTestDetailDto>(cachedData);
                if (cachedDetail != null)
                {
                    _logger.LogInformation("Redis cache hit for listening test {TestId}", request.Id);
                    return Result.Success(cachedDetail);
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to read listening test from Redis cache.");
        }

        var test = await _context.ListeningTests
            .AsNoTracking()
            .Include(t => t.Questions)
            .Include(t => t.Transcripts)
            .FirstOrDefaultAsync(t => t.Id == request.Id, cancellationToken);

        if (test == null)
        {
            return Result.Failure<ListeningTestDetailDto>(new Error("Listening.TestNotFound", $"Listening test with ID {request.Id} was not found."));
        }

        var questionsDto = test.Questions
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

                return new ListeningQuestionDto(
                    q.Id,
                    q.SectionNumber,
                    q.QuestionNumber,
                    q.QuestionType.ToString(),
                    q.Prompt,
                    options,
                    q.DiagramImageUrl,
                    q.TimestampSeconds);
            })
            .ToList();

        var transcriptsDto = test.Transcripts
            .OrderBy(t => t.StartTimeSeconds)
            .Select(t => new ListeningTranscriptDto(
                t.Id,
                t.SectionNumber,
                t.StartTimeSeconds,
                t.EndTimeSeconds,
                t.Speaker,
                t.TextContent,
                t.LinkedQuestionNumber))
            .ToList();

        var detailDto = new ListeningTestDetailDto(
            test.Id,
            test.Title,
            test.Topic,
            test.Difficulty.ToString(),
            test.SectionType.ToString(),
            test.SectionNumber,
            test.AudioUrl,
            test.DurationSeconds,
            test.Accent.ToString(),
            test.SourceType.ToString(),
            test.CollectionName,
            test.TargetBandTier.ToString(),
            test.Instructions,
            test.UploadedByUserId,
            test.IsCommunityShared,
            questionsDto,
            transcriptsDto);

        try
        {
            var cacheOptions = new DistributedCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = TimeSpan.FromHours(2)
            };
            await _cache.SetStringAsync(cacheKey, JsonSerializer.Serialize(detailDto), cacheOptions, cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to cache listening test detail in Redis.");
        }

        return Result.Success(detailDto);
    }
}
