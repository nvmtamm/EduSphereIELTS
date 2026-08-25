using EduSphere.Application.Features.Reading.Models;

namespace EduSphere.Application.Common.Interfaces;

public interface IReadingAITutorService
{
    Task<AITutorMessageDto> AskTutorAsync(
        string question,
        string passageTitle,
        string passageContent,
        string? activeQuestionPrompt = null,
        bool isPostExamReview = false,
        CancellationToken cancellationToken = default);
}
