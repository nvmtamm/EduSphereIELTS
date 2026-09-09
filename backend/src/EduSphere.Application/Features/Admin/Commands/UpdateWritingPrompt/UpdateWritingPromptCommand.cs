using EduSphere.Application.Common.Interfaces;
using EduSphere.Application.Common.Models;
using EduSphere.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace EduSphere.Application.Features.Admin.Commands.UpdateWritingPrompt;

public record UpdateWritingPromptCommand(
    Guid Id,
    string Title,
    string Topic,
    string PromptText,
    string? ImageUrl,
    DifficultyLevel Difficulty,
    int RecommendedTimeMinutes,
    int MinWordCount,
    string? SampleBand8Answer) : IRequest<Result<bool>>;

public class UpdateWritingPromptCommandHandler : IRequestHandler<UpdateWritingPromptCommand, Result<bool>>
{
    private readonly IApplicationDbContext _context;

    public UpdateWritingPromptCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<bool>> Handle(UpdateWritingPromptCommand request, CancellationToken cancellationToken)
    {
        var prompt = await _context.WritingPrompts.FirstOrDefaultAsync(p => p.Id == request.Id, cancellationToken);
        if (prompt == null)
        {
            return Result.Failure<bool>(new Error("Admin.PromptNotFound", "Writing prompt not found."));
        }

        prompt.Update(
            request.Title,
            request.Topic,
            request.PromptText,
            request.ImageUrl,
            request.Difficulty,
            request.RecommendedTimeMinutes,
            request.MinWordCount,
            request.SampleBand8Answer);

        await _context.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
