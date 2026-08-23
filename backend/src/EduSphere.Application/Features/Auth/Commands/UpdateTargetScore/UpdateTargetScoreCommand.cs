using EduSphere.Application.Common.Interfaces;
using EduSphere.Application.Common.Models;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace EduSphere.Application.Features.Auth.Commands.UpdateTargetScore;

public record UpdateTargetScoreCommand(Guid UserId, float TargetBandScore) : IRequest<Result<float>>;

public class UpdateTargetScoreCommandValidator : AbstractValidator<UpdateTargetScoreCommand>
{
    public UpdateTargetScoreCommandValidator()
    {
        RuleFor(x => x.TargetBandScore)
            .InclusiveBetween(0.0f, 9.0f)
            .WithMessage("Target Band Score must be between 0.0 and 9.0.");
    }
}

public class UpdateTargetScoreCommandHandler : IRequestHandler<UpdateTargetScoreCommand, Result<float>>
{
    private readonly IApplicationDbContext _context;

    public UpdateTargetScoreCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<float>> Handle(UpdateTargetScoreCommand request, CancellationToken cancellationToken)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == request.UserId && !u.IsDeleted, cancellationToken);

        if (user is null)
        {
            return Result.Failure<float>(new Error("User.NotFound", "User not found."));
        }

        user.UpdateTargetBandScore(request.TargetBandScore);
        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success(request.TargetBandScore);
    }
}
