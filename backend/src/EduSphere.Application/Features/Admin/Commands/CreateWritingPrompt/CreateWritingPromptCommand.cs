using EduSphere.Application.Common.Interfaces;
using EduSphere.Application.Common.Models;
using EduSphere.Domain.Entities;
using EduSphere.Domain.Enums;
using MediatR;

namespace EduSphere.Application.Features.Admin.Commands.CreateWritingPrompt;

public record CreateWritingPromptCommand(
    WritingTaskType TaskType,
    string Title,
    string Topic,
    string PromptText,
    string? ImageUrl = null,
    DifficultyLevel Difficulty = DifficultyLevel.Medium,
    int? RecommendedTimeMinutes = null,
    int? MinWordCount = null,
    string? SampleBand8Answer = null,
    Guid? UploadedByUserId = null) : IRequest<Result<Guid>>;

public class CreateWritingPromptCommandHandler : IRequestHandler<CreateWritingPromptCommand, Result<Guid>>
{
    private readonly IApplicationDbContext _context;

    public CreateWritingPromptCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<Guid>> Handle(CreateWritingPromptCommand request, CancellationToken cancellationToken)
    {
        var prompt = new WritingPrompt(
            request.TaskType,
            request.Title,
            request.Topic,
            request.PromptText,
            request.ImageUrl,
            request.Difficulty,
            request.RecommendedTimeMinutes,
            request.MinWordCount,
            request.SampleBand8Answer,
            request.UploadedByUserId);

        await _context.WritingPrompts.AddAsync(prompt, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<Guid>.Success(prompt.Id);
    }
}
