using System.Text.Json;
using EduSphere.Application.Common.Interfaces;
using EduSphere.Application.Common.Models;
using EduSphere.Application.Features.Writing.Models;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace EduSphere.Application.Features.Writing.Queries.GetWritingSubmissionById;

public record GetWritingSubmissionByIdQuery(Guid SubmissionId, Guid? RequestingUserId = null) : IRequest<Result<WritingSubmissionDetailDto>>;

public class GetWritingSubmissionByIdQueryHandler : IRequestHandler<GetWritingSubmissionByIdQuery, Result<WritingSubmissionDetailDto>>
{
    private readonly IApplicationDbContext _context;

    public GetWritingSubmissionByIdQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<WritingSubmissionDetailDto>> Handle(GetWritingSubmissionByIdQuery request, CancellationToken cancellationToken)
    {
        var submission = await _context.WritingSubmissions
            .Include(s => s.Prompt)
            .AsNoTracking()
            .FirstOrDefaultAsync(s => s.Id == request.SubmissionId, cancellationToken);

        if (submission == null)
        {
            return Result.Failure<WritingSubmissionDetailDto>(new Error("Writing.SubmissionNotFound", "Writing submission not found."));
        }

        var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
        WritingEvaluationResult? evalResult = null;

        try
        {
            evalResult = new WritingEvaluationResult
            {
                OverallBand = submission.OverallBandScore,
                GeneralSummary = submission.GeneralFeedback,
                TaskAchievement = JsonSerializer.Deserialize<CriteriaScoreDto>(submission.CriteriaBreakdownJson, options)
                    ?? new CriteriaScoreDto { Score = submission.TaskAchievementScore },
                CoherenceCohesion = new CriteriaScoreDto { Score = submission.CoherenceCohesionScore },
                LexicalResource = new CriteriaScoreDto { Score = submission.LexicalResourceScore },
                GrammaticalRange = new CriteriaScoreDto { Score = submission.GrammaticalRangeScore },
                GrammarErrors = JsonSerializer.Deserialize<List<GrammarErrorDto>>(submission.GrammarErrorsJson, options) ?? new(),
                VocabularySuggestions = JsonSerializer.Deserialize<List<VocabularySuggestionDto>>(submission.VocabularySuggestionsJson, options) ?? new()
            };
        }
        catch
        {
            evalResult = new WritingEvaluationResult
            {
                OverallBand = submission.OverallBandScore,
                GeneralSummary = submission.GeneralFeedback
            };
        }

        var dto = new WritingSubmissionDetailDto(
            submission.Id,
            submission.PromptId,
            submission.Prompt?.Title ?? "Writing Task",
            submission.Prompt?.TaskType.ToString() ?? "Task2",
            submission.Prompt?.PromptText ?? string.Empty,
            submission.Content,
            submission.WordCount,
            submission.TimeSpentSeconds,
            submission.TaskAchievementScore,
            submission.CoherenceCohesionScore,
            submission.LexicalResourceScore,
            submission.GrammaticalRangeScore,
            submission.OverallBandScore,
            evalResult,
            submission.GeneralFeedback,
            submission.Status.ToString(),
            submission.CreatedAt);

        return Result<WritingSubmissionDetailDto>.Success(dto);
    }
}
