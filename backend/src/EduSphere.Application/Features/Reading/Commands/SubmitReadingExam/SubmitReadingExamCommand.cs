using EduSphere.Application.Common.Interfaces;
using EduSphere.Application.Common.Models;
using EduSphere.Application.Features.Reading.Models;
using EduSphere.Domain.Entities;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace EduSphere.Application.Features.Reading.Commands.SubmitReadingExam;

public record SubmitReadingExamCommand(
    Guid UserId,
    Guid PassageId,
    int DurationSeconds,
    List<UserAnswerSubmissionDto> Answers) : IRequest<Result<ReadingResultDto>>;

public class SubmitReadingExamCommandValidator : AbstractValidator<SubmitReadingExamCommand>
{
    public SubmitReadingExamCommandValidator()
    {
        RuleFor(x => x.UserId)
            .NotEmpty().WithMessage("User ID is required.");

        RuleFor(x => x.PassageId)
            .NotEmpty().WithMessage("Passage ID is required.");

        RuleFor(x => x.DurationSeconds)
            .GreaterThanOrEqualTo(0).WithMessage("Duration must be non-negative.");

        RuleFor(x => x.Answers)
            .NotNull().WithMessage("Answers list cannot be null.");
    }
}

public class SubmitReadingExamCommandHandler : IRequestHandler<SubmitReadingExamCommand, Result<ReadingResultDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IReadingScoringService _scoringService;
    private readonly ILogger<SubmitReadingExamCommandHandler> _logger;

    public SubmitReadingExamCommandHandler(
        IApplicationDbContext context,
        IReadingScoringService scoringService,
        ILogger<SubmitReadingExamCommandHandler> logger)
    {
        _context = context;
        _scoringService = scoringService;
        _logger = logger;
    }

    public async Task<Result<ReadingResultDto>> Handle(SubmitReadingExamCommand request, CancellationToken cancellationToken)
    {
        var passage = await _context.ReadingPassages
            .Include(p => p.Questions)
            .FirstOrDefaultAsync(p => p.Id == request.PassageId, cancellationToken);

        if (passage == null)
        {
            return Result.Failure<ReadingResultDto>(new Error("Reading.PassageNotFound", $"Reading passage with ID {request.PassageId} was not found."));
        }

        var userAnswersDict = request.Answers.ToDictionary(a => a.QuestionId, a => a.UserAnswer);

        int rawScore = 0;
        int totalQuestions = passage.Questions.Count;
        var answerResults = new List<ReadingAnswerResultDto>();

        var submission = new ReadingSubmission(
            request.UserId,
            passage.Id,
            0,
            totalQuestions,
            0.0,
            request.DurationSeconds);

        foreach (var question in passage.Questions.OrderBy(q => q.QuestionNumber))
        {
            userAnswersDict.TryGetValue(question.Id, out var userAnswer);
            userAnswer ??= string.Empty;

            bool isCorrect = _scoringService.IsAnswerCorrect(userAnswer, question.CorrectAnswer, question.QuestionType);
            if (isCorrect)
            {
                rawScore++;
            }

            var submissionAnswer = new ReadingSubmissionAnswer(
                submission.Id,
                question.Id,
                userAnswer,
                isCorrect);

            submission.AddAnswer(submissionAnswer);

            answerResults.Add(new ReadingAnswerResultDto(
                question.Id,
                question.QuestionNumber,
                question.QuestionType.ToString(),
                question.Prompt,
                userAnswer,
                question.CorrectAnswer,
                isCorrect,
                question.Explanation));
        }

        double bandScore = _scoringService.CalculateBandScore(rawScore, totalQuestions);
        double accuracyPercentage = totalQuestions > 0 ? Math.Round(((double)rawScore / totalQuestions) * 100, 1) : 0;

        // Cập nhật điểm chính thức cho submission
        var finalSubmission = new ReadingSubmission(
            request.UserId,
            passage.Id,
            rawScore,
            totalQuestions,
            bandScore,
            request.DurationSeconds);

        foreach (var ans in submission.Answers)
        {
            finalSubmission.AddAnswer(ans);
        }

        _context.ReadingSubmissions.Add(finalSubmission);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("User {UserId} submitted reading exam for passage {PassageId}. Raw Score: {RawScore}/{Total}, Band: {BandScore}",
            request.UserId, passage.Id, rawScore, totalQuestions, bandScore);

        var resultDto = new ReadingResultDto(
            finalSubmission.Id,
            passage.Id,
            passage.Title,
            rawScore,
            totalQuestions,
            accuracyPercentage,
            bandScore,
            request.DurationSeconds,
            finalSubmission.CreatedAt,
            answerResults);

        return Result.Success(resultDto);
    }
}
