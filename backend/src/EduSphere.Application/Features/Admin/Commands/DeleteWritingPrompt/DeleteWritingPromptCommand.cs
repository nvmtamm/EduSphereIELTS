using EduSphere.Application.Common.Interfaces;
using EduSphere.Application.Common.Models;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace EduSphere.Application.Features.Admin.Commands.DeleteWritingPrompt;

public record DeleteWritingPromptCommand(Guid Id) : IRequest<Result<bool>>;

public class DeleteWritingPromptCommandHandler : IRequestHandler<DeleteWritingPromptCommand, Result<bool>>
{
    private readonly IApplicationDbContext _context;

    public DeleteWritingPromptCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<bool>> Handle(DeleteWritingPromptCommand request, CancellationToken cancellationToken)
    {
        var prompt = await _context.WritingPrompts.FirstOrDefaultAsync(p => p.Id == request.Id, cancellationToken);
        if (prompt == null)
        {
            return Result.Failure<bool>(new Error("Admin.PromptNotFound", "Writing prompt not found."));
        }

        prompt.ToggleActiveStatus(false);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
