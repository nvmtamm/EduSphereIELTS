using EduSphere.Domain.Common;

namespace EduSphere.Domain.Entities;

public class ListeningTranscript : BaseEntity
{
    public Guid TestId { get; private set; }
    public int SectionNumber { get; private set; } = 1;
    public double StartTimeSeconds { get; private set; }
    public double EndTimeSeconds { get; private set; }
    public string Speaker { get; private set; } = string.Empty;
    public string TextContent { get; private set; } = string.Empty;
    public int? LinkedQuestionNumber { get; private set; }

    public ListeningTest Test { get; private set; } = null!;

    private ListeningTranscript() { } // EF Core

    public ListeningTranscript(
        Guid testId,
        int sectionNumber,
        double startTimeSeconds,
        double endTimeSeconds,
        string speaker,
        string textContent,
        int? linkedQuestionNumber = null)
    {
        TestId = testId;
        SectionNumber = sectionNumber;
        StartTimeSeconds = startTimeSeconds >= 0 ? startTimeSeconds : 0;
        EndTimeSeconds = endTimeSeconds >= startTimeSeconds ? endTimeSeconds : startTimeSeconds;
        Speaker = string.IsNullOrWhiteSpace(speaker) ? "Narrator" : speaker.Trim();
        TextContent = string.IsNullOrWhiteSpace(textContent) ? throw new ArgumentException("Transcript text cannot be empty.", nameof(textContent)) : textContent.Trim();
        LinkedQuestionNumber = linkedQuestionNumber;
        CreatedAt = DateTime.UtcNow;
    }
}
