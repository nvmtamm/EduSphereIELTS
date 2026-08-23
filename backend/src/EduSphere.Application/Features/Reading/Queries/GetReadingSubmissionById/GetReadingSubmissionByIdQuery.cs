using EduSphere.Application.Common.Interfaces;
using EduSphere.Application.Common.Models;
using EduSphere.Application.Features.Reading.Models;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace EduSphere.Application.Features.Reading.Queries.GetReadingSubmissionById;

public record GetReadingSubmissionByIdQuery(Guid SubmissionId, Guid UserId) : IRequest<Result<ReadingResultDto>>;

public class GetReadingSubmissionByIdQueryHandler : IRequestHandler<GetReadingSubmissionByIdQuery, Result<ReadingResultDto>>
{
    private readonly IApplicationDbContext _context;

    public GetReadingSubmissionByIdQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<ReadingResultDto>> Handle(GetReadingSubmissionByIdQuery request, CancellationToken cancellationToken)
    {
        var submission = await _context.ReadingSubmissions
            .AsNoTracking()
            .Include(s => s.Passage)
            .Include(s => s.Answers)
                .ThenInclude(a => a.Question)
            .FirstOrDefaultAsync(s => s.Id == request.SubmissionId && s.UserId == request.UserId, cancellationToken);

        if (submission == null)
        {
            return Result.Failure<ReadingResultDto>(new Error("Reading.SubmissionNotFound", $"Reading submission with ID {request.SubmissionId} was not found."));
        }

        var answers = submission.Answers
            .OrderBy(a => a.Question.QuestionNumber)
            .Select(a => new ReadingAnswerResultDto(
                a.QuestionId,
                a.Question.QuestionNumber,
                a.Question.QuestionType.ToString(),
                a.Question.Prompt,
                a.UserAnswer,
                a.Question.CorrectAnswer,
                a.IsCorrect,
                a.Question.Explanation))
            .ToList();

        double accuracy = submission.TotalQuestions > 0
            ? Math.Round(((double)submission.RawScore / submission.TotalQuestions) * 100, 1)
            : 0;

        var resultDto = new ReadingResultDto(
            submission.Id,
            submission.PassageId,
            submission.Passage.Title,
            submission.RawScore,
            submission.TotalQuestions,
            accuracy,
            submission.BandScore,
            submission.DurationSeconds,
            submission.CreatedAt,
            answers);

        return Result.Success(resultDto);
    }
}
