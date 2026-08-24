using FluentValidation;

namespace EduSphere.Application.Features.Auth.Commands.UpdateProfile;

public class UpdateProfileCommandValidator : AbstractValidator<UpdateProfileCommand>
{
    public UpdateProfileCommandValidator()
    {
        RuleFor(x => x.UserId)
            .NotEmpty().WithMessage("User ID is required.");

        RuleFor(x => x.FullName)
            .NotEmpty().WithMessage("Full name is required.")
            .MaximumLength(150).WithMessage("Full name must not exceed 150 characters.");

        RuleFor(x => x.TargetBandScore)
            .InclusiveBetween(4.0f, 9.0f)
            .When(x => x.TargetBandScore.HasValue)
            .WithMessage("Target Band Score must be between 4.0 and 9.0.");
    }
}
