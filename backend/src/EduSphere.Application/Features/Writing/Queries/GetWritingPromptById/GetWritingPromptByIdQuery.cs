using EduSphere.Application.Common.Interfaces;
using EduSphere.Application.Common.Models;
using EduSphere.Application.Features.Writing.Models;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace EduSphere.Application.Features.Writing.Queries.GetWritingPromptById;

public record GetWritingPromptByIdQuery(Guid Id) : IRequest<Result<WritingPromptDto>>;

public class GetWritingPromptByIdQueryHandler : IRequestHandler<GetWritingPromptByIdQuery, Result<WritingPromptDto>>
{
    private readonly IApplicationDbContext _context;

    public GetWritingPromptByIdQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<WritingPromptDto>> Handle(GetWritingPromptByIdQuery request, CancellationToken cancellationToken)
    {
        var prompt = await _context.WritingPrompts
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == request.Id && p.IsActive, cancellationToken);

        if (prompt == null)
        {
            return Result.Failure<WritingPromptDto>(new Error("Writing.NotFound", "Writing prompt not found."));
        }

        var dto = new WritingPromptDto(
            prompt.Id,
            prompt.TaskType.ToString(),
            prompt.Title,
            prompt.Topic,
            prompt.PromptText,
            prompt.ImageUrl,
            prompt.Difficulty.ToString(),
            prompt.RecommendedTimeMinutes,
            prompt.MinWordCount,
            prompt.SampleBand8Answer,
            prompt.IsActive,
            prompt.CreatedAt);

        return Result<WritingPromptDto>.Success(dto);
    }
}
