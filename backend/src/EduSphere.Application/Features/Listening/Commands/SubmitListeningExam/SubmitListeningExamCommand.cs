using System.Text.Json;
using EduSphere.Application.Common.Interfaces;
using EduSphere.Application.Common.Models;
using EduSphere.Application.Features.Listening.Models;
using EduSphere.Domain.Entities;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace EduSphere.Application.Features.Listening.Commands.SubmitListeningExam;

public record SubmitListeningExamCommand(
    Guid UserId,
    Guid TestId,
    int DurationSeconds,
    List<UserListeningAnswerSubmissionDto> Answers) : IRequest<Result<ListeningResultDto>>;

public class SubmitListeningExamCommandValidator : AbstractValidator<SubmitListeningExamCommand>
{
    public SubmitListeningExamCommandValidator()
    {
        RuleFor(x => x.UserId)
            .NotEmpty().WithMessage("User ID is required.");

        RuleFor(x => x.TestId)
            .NotEmpty().WithMessage("Test ID is required.");

        RuleFor(x => x.DurationSeconds)
            .GreaterThanOrEqualTo(0).WithMessage("Duration must be non-negative.");

        RuleFor(x => x.Answers)
            .NotNull().WithMessage("Answers list cannot be null.");
    }
}

public class SubmitListeningExamCommandHandler : IRequestHandler<SubmitListeningExamCommand, Result<ListeningResultDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IListeningScoringService _scoringService;
    private readonly ILogger<SubmitListeningExamCommandHandler> _logger;

    public SubmitListeningExamCommandHandler(
        IApplicationDbContext context,
        IListeningScoringService scoringService,
        ILogger<SubmitListeningExamCommandHandler> logger)
    {
        _context = context;
        _scoringService = scoringService;
        _logger = logger;
    }

    public async Task<Result<ListeningResultDto>> Handle(SubmitListeningExamCommand request, CancellationToken cancellationToken)
    {
        var test = await _context.ListeningTests
            .Include(t => t.Questions)
            .Include(t => t.Transcripts)
            .FirstOrDefaultAsync(t => t.Id == request.TestId, cancellationToken);

        if (test == null)
        {
            return Result.Failure<ListeningResultDto>(new Error("Listening.TestNotFound", $"Listening test with ID {request.TestId} was not found."));
        }

        var userAnswersDict = request.Answers.ToDictionary(a => a.QuestionId, a => a.UserAnswer);

        int rawScore = 0;
        int totalQuestions = test.Questions.Count;
        var answerResults = new List<ListeningAnswerResultDto>();

        // Dictionary to track per-section stats (SectionNumber -> (Correct, Total))
        var sectionStats = new Dictionary<int, (int Correct, int Total)>();

        var submission = new ListeningSubmission(
            request.UserId,
            test.Id,
            0,
            totalQuestions,
            0.0,
            request.DurationSeconds);

        foreach (var question in test.Questions.OrderBy(q => q.QuestionNumber))
        {
            userAnswersDict.TryGetValue(question.Id, out var userAnswer);
            userAnswer ??= string.Empty;

            bool isCorrect = _scoringService.IsAnswerCorrect(userAnswer, question.CorrectAnswer, question.QuestionType);
            if (isCorrect)
            {
                rawScore++;
            }

            if (!sectionStats.ContainsKey(question.SectionNumber))
            {
                sectionStats[question.SectionNumber] = (0, 0);
            }
            var current = sectionStats[question.SectionNumber];
            sectionStats[question.SectionNumber] = (current.Correct + (isCorrect ? 1 : 0), current.Total + 1);

            var submissionAnswer = new ListeningSubmissionAnswer(
                submission.Id,
                question.Id,
                userAnswer,
                isCorrect,
                question.CorrectAnswer);

            submission.AddAnswer(submissionAnswer);

            answerResults.Add(new ListeningAnswerResultDto(
                question.Id,
                question.SectionNumber,
                question.QuestionNumber,
                question.QuestionType.ToString(),
                question.Prompt,
                userAnswer,
                question.CorrectAnswer,
                isCorrect,
                question.Explanation,
                question.TimestampSeconds,
                question.AudioTimestampEndSeconds));
        }

        double bandScore = _scoringService.CalculateBandScore(rawScore, totalQuestions);
        double accuracyPercentage = totalQuestions > 0 ? Math.Round(((double)rawScore / totalQuestions) * 100, 1) : 0;

        var sectionBreakdowns = sectionStats.OrderBy(k => k.Key).Select(k =>
        {
            var secNum = k.Key;
            var (correct, total) = k.Value;
            var secAcc = total > 0 ? Math.Round(((double)correct / total) * 100, 1) : 0;
            string secTitle = secNum switch
            {
                1 => "Part 1: Everyday Social Dialogue",
                2 => "Part 2: Local Community Monologue",
                3 => "Part 3: Academic Study Discussion",
                4 => "Part 4: University Lecture",
                _ => $"Section {secNum}"
            };

            return new ListeningSectionBreakdownDto(secNum, secTitle, correct, total, secAcc);
        }).ToList();

        // Update submission with calculated score and breakdown JSON
        var updatedSubmission = new ListeningSubmission(
            request.UserId,
            test.Id,
            rawScore,
            totalQuestions,
            bandScore,
            request.DurationSeconds,
            JsonSerializer.Serialize(sectionBreakdowns));

        foreach (var ans in submission.Answers)
        {
            updatedSubmission.AddAnswer(ans);
        }

        _context.ListeningSubmissions.Add(updatedSubmission);
        await _context.SaveChangesAsync(cancellationToken);

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

        var resultDto = new ListeningResultDto(
            updatedSubmission.Id,
            test.Id,
            test.Title,
            rawScore,
            totalQuestions,
            accuracyPercentage,
            bandScore,
            request.DurationSeconds,
            updatedSubmission.CreatedAt,
            sectionBreakdowns,
            answerResults,
            transcriptsDto);

        _logger.LogInformation("Listening test {TestId} submitted by user {UserId}. Score: {Raw}/{Total} -> Band {Band}",
            test.Id, request.UserId, rawScore, totalQuestions, bandScore);

        return Result.Success(resultDto);
    }
}
