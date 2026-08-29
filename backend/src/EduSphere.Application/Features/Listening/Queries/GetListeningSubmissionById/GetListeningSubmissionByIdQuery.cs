using System.Text.Json;
using EduSphere.Application.Common.Interfaces;
using EduSphere.Application.Common.Models;
using EduSphere.Application.Features.Listening.Models;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace EduSphere.Application.Features.Listening.Queries.GetListeningSubmissionById;

public record GetListeningSubmissionByIdQuery(Guid SubmissionId, Guid UserId) : IRequest<Result<ListeningResultDto>>;

public class GetListeningSubmissionByIdQueryHandler : IRequestHandler<GetListeningSubmissionByIdQuery, Result<ListeningResultDto>>
{
    private readonly IApplicationDbContext _context;

    public GetListeningSubmissionByIdQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<ListeningResultDto>> Handle(GetListeningSubmissionByIdQuery request, CancellationToken cancellationToken)
    {
        var submission = await _context.ListeningSubmissions
            .AsNoTracking()
            .Include(s => s.Test)
                .ThenInclude(t => t.Transcripts)
            .Include(s => s.Answers)
                .ThenInclude(a => a.Question)
            .FirstOrDefaultAsync(s => s.Id == request.SubmissionId && s.UserId == request.UserId, cancellationToken);

        if (submission == null)
        {
            return Result.Failure<ListeningResultDto>(new Error("Listening.SubmissionNotFound", $"Listening submission with ID {request.SubmissionId} was not found."));
        }

        var answers = submission.Answers
            .OrderBy(a => a.Question.QuestionNumber)
            .Select(a => new ListeningAnswerResultDto(
                a.QuestionId,
                a.Question.SectionNumber,
                a.Question.QuestionNumber,
                a.Question.QuestionType.ToString(),
                a.Question.Prompt,
                a.UserAnswer,
                a.Question.CorrectAnswer,
                a.IsCorrect,
                a.Question.Explanation,
                a.Question.TimestampSeconds,
                a.Question.AudioTimestampEndSeconds))
            .ToList();

        var transcripts = submission.Test.Transcripts
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

        List<ListeningSectionBreakdownDto> sectionBreakdowns = new();
        try
        {
            if (!string.IsNullOrWhiteSpace(submission.BreakdownJson))
            {
                sectionBreakdowns = JsonSerializer.Deserialize<List<ListeningSectionBreakdownDto>>(submission.BreakdownJson) ?? new();
            }
        }
        catch
        {
            sectionBreakdowns = new();
        }

        double accuracy = submission.TotalQuestions > 0
            ? Math.Round(((double)submission.RawScore / submission.TotalQuestions) * 100, 1)
            : 0;

        var resultDto = new ListeningResultDto(
            submission.Id,
            submission.TestId,
            submission.Test.Title,
            submission.RawScore,
            submission.TotalQuestions,
            accuracy,
            submission.BandScore,
            submission.DurationSeconds,
            submission.CreatedAt,
            sectionBreakdowns,
            answers,
            transcripts);

        return Result.Success(resultDto);
    }
}
