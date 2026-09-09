using System.Text.Json;
using EduSphere.Application.Common.Interfaces;
using EduSphere.Application.Common.Models;
using EduSphere.Application.Features.Writing.Models;
using EduSphere.Domain.Common;
using EduSphere.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace EduSphere.Application.Features.Writing.Commands.SubmitWritingForEvaluation;

public record SubmitWritingForEvaluationCommand(
    Guid UserId,
    Guid PromptId,
    string Content,
    int TimeSpentSeconds) : IRequest<Result<WritingSubmissionDetailDto>>;

public class SubmitWritingForEvaluationCommandHandler : IRequestHandler<SubmitWritingForEvaluationCommand, Result<WritingSubmissionDetailDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IWritingScorerService _scorerService;
    private readonly ILogger<SubmitWritingForEvaluationCommandHandler> _logger;

    public SubmitWritingForEvaluationCommandHandler(
        IApplicationDbContext context,
        IWritingScorerService scorerService,
        ILogger<SubmitWritingForEvaluationCommandHandler> logger)
    {
        _context = context;
        _scorerService = scorerService;
        _logger = logger;
    }

    public async Task<Result<WritingSubmissionDetailDto>> Handle(SubmitWritingForEvaluationCommand request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Content))
        {
            return Result.Failure<WritingSubmissionDetailDto>(new Error("Writing.EmptyContent", "Essay content cannot be empty."));
        }

        var prompt = await _context.WritingPrompts
            .FirstOrDefaultAsync(p => p.Id == request.PromptId && p.IsActive, cancellationToken);

        if (prompt == null)
        {
            return Result.Failure<WritingSubmissionDetailDto>(new Error("Writing.PromptNotFound", "Writing prompt not found."));
        }

        int wordCount = IeltsWritingScoringHelper.CountWords(request.Content);

        // 1. Create Initial Submission record in DB
        var submission = new WritingSubmission(
            request.UserId,
            request.PromptId,
            request.Content,
            wordCount,
            request.TimeSpentSeconds);

        submission.MarkEvaluating();
        await _context.WritingSubmissions.AddAsync(submission, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        // 2. Perform AI Evaluation
        WritingEvaluationResult evaluation;
        try
        {
            evaluation = await _scorerService.EvaluateEssayAsync(
                prompt.TaskType,
                prompt.Title,
                prompt.PromptText,
                request.Content,
                cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to evaluate essay with AI for submission {SubmissionId}", submission.Id);
            submission.MarkFailed(ex.Message);
            await _context.SaveChangesAsync(cancellationToken);
            return Result.Failure<WritingSubmissionDetailDto>(new Error("Writing.EvaluationFailed", "Failed to complete AI evaluation. Please try again."));
        }

        // 3. Persist Evaluation Results
        var options = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
        string criteriaJson = JsonSerializer.Serialize(evaluation.TaskAchievement, options);
        string grammarErrorsJson = JsonSerializer.Serialize(evaluation.GrammarErrors, options);
        string vocabSuggestionsJson = JsonSerializer.Serialize(evaluation.VocabularySuggestions, options);

        submission.CompleteEvaluation(
            evaluation.TaskAchievement.Score,
            evaluation.CoherenceCohesion.Score,
            evaluation.LexicalResource.Score,
            evaluation.GrammaticalRange.Score,
            evaluation.OverallBand,
            criteriaJson,
            grammarErrorsJson,
            vocabSuggestionsJson,
            evaluation.GeneralSummary);

        await _context.SaveChangesAsync(cancellationToken);

        var dto = new WritingSubmissionDetailDto(
            submission.Id,
            submission.PromptId,
            prompt.Title,
            prompt.TaskType.ToString(),
            prompt.PromptText,
            submission.Content,
            submission.WordCount,
            submission.TimeSpentSeconds,
            submission.TaskAchievementScore,
            submission.CoherenceCohesionScore,
            submission.LexicalResourceScore,
            submission.GrammaticalRangeScore,
            submission.OverallBandScore,
            evaluation,
            submission.GeneralFeedback,
            submission.Status.ToString(),
            submission.CreatedAt);

        return Result<WritingSubmissionDetailDto>.Success(dto);
    }
}
