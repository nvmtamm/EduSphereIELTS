using EduSphere.Application.Common.Interfaces;
using EduSphere.Application.Common.Models;
using EduSphere.Application.Features.Listening.Models;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace EduSphere.Application.Features.Listening.Commands.ExplainListeningQuestion;

public record ExplainListeningQuestionCommand(
    Guid QuestionId,
    string? UserAnswer = null) : IRequest<Result<ListeningAIExplanationDto>>;

public class ExplainListeningQuestionCommandValidator : AbstractValidator<ExplainListeningQuestionCommand>
{
    public ExplainListeningQuestionCommandValidator()
    {
        RuleFor(x => x.QuestionId)
            .NotEmpty().WithMessage("Question ID is required.");
    }
}

public class ExplainListeningQuestionCommandHandler : IRequestHandler<ExplainListeningQuestionCommand, Result<ListeningAIExplanationDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IListeningAITutorService _aiTutorService;
    private readonly ILogger<ExplainListeningQuestionCommandHandler> _logger;

    public ExplainListeningQuestionCommandHandler(
        IApplicationDbContext context,
        IListeningAITutorService aiTutorService,
        ILogger<ExplainListeningQuestionCommandHandler> logger)
    {
        _context = context;
        _aiTutorService = aiTutorService;
        _logger = logger;
    }

    public async Task<Result<ListeningAIExplanationDto>> Handle(ExplainListeningQuestionCommand request, CancellationToken cancellationToken)
    {
        var question = await _context.ListeningQuestions
            .Include(q => q.Test)
                .ThenInclude(t => t.Transcripts)
            .FirstOrDefaultAsync(q => q.Id == request.QuestionId, cancellationToken);

        if (question == null)
        {
            return Result.Failure<ListeningAIExplanationDto>(
                new Error("Listening.QuestionNotFound", $"Listening question '{request.QuestionId}' was not found."));
        }

        var test = question.Test;
        var transcripts = test.Transcripts
            .Where(tr => tr.SectionNumber == question.SectionNumber)
            .OrderBy(tr => tr.StartTimeSeconds)
            .ToList();

        // Find relevant transcript segments around the question's timestamp or linked question number
        var relevantSegments = transcripts
            .Where(tr => 
                (tr.LinkedQuestionNumber.HasValue && tr.LinkedQuestionNumber.Value == question.QuestionNumber) ||
                (Math.Abs(tr.StartTimeSeconds - question.TimestampSeconds) <= 45))
            .ToList();

        if (relevantSegments.Count == 0 && transcripts.Count > 0)
        {
            relevantSegments = transcripts.Take(5).ToList();
        }

        var transcriptExcerpt = string.Join("\n", relevantSegments.Select(s => 
            $"[{s.Speaker}]: {s.TextContent}"));

        var accentName = test.Accent.ToString();

        var aiAnalysis = await _aiTutorService.ExplainQuestionAsync(
            questionPrompt: question.Prompt,
            questionType: question.QuestionType.ToString(),
            userAnswer: request.UserAnswer,
            correctAnswer: question.CorrectAnswer,
            transcriptExcerpt: transcriptExcerpt,
            accent: accentName,
            preExistingExplanation: question.Explanation,
            cancellationToken: cancellationToken);

        var dto = new ListeningAIExplanationDto(
            QuestionId: question.Id,
            QuestionNumber: question.QuestionNumber,
            QuestionPrompt: question.Prompt,
            UserAnswer: request.UserAnswer,
            CorrectAnswer: question.CorrectAnswer,
            AccentNuance: aiAnalysis.AccentNuance,
            SignpostingAnalysis: aiAnalysis.SignpostingAnalysis,
            SocraticAdvice: aiAnalysis.SocraticAdvice,
            PhoneticTrap: aiAnalysis.PhoneticTrap,
            TranscriptExcerpt: transcriptExcerpt,
            TimestampSeconds: question.TimestampSeconds
        );

        return Result<ListeningAIExplanationDto>.Success(dto);
    }
}
