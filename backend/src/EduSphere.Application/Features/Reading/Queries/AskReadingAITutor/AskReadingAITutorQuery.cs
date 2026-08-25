using EduSphere.Application.Common.Interfaces;
using EduSphere.Application.Common.Models;
using EduSphere.Application.Features.Reading.Models;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace EduSphere.Application.Features.Reading.Queries.AskReadingAITutor;

public record AskReadingAITutorQuery(
    Guid PassageId,
    string Question,
    string? ActiveQuestionPrompt = null,
    bool IsPostExamReview = false) : IRequest<Result<AITutorMessageDto>>;

public class AskReadingAITutorQueryHandler : IRequestHandler<AskReadingAITutorQuery, Result<AITutorMessageDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IReadingAITutorService _aiTutorService;

    public AskReadingAITutorQueryHandler(
        IApplicationDbContext context,
        IReadingAITutorService aiTutorService)
    {
        _context = context;
        _aiTutorService = aiTutorService;
    }

    public async Task<Result<AITutorMessageDto>> Handle(AskReadingAITutorQuery request, CancellationToken cancellationToken)
    {
        var passage = await _context.ReadingPassages
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == request.PassageId, cancellationToken);

        if (passage == null)
        {
            return Result.Failure<AITutorMessageDto>(new Error("Reading.PassageNotFound", "Passage was not found."));
        }

        var response = await _aiTutorService.AskTutorAsync(
            request.Question,
            passage.Title,
            passage.Content,
            request.ActiveQuestionPrompt,
            request.IsPostExamReview,
            cancellationToken);

        return Result.Success(response);
    }
}
