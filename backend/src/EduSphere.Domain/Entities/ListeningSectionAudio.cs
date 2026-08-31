using EduSphere.Domain.Common;

namespace EduSphere.Domain.Entities;

public class ListeningSectionAudio : BaseEntity
{
    public Guid ListeningTestId { get; private set; }
    public int SectionNumber { get; private set; } // 1, 2, 3, 4
    public string AudioUrl { get; private set; } = string.Empty;
    public int DurationSeconds { get; private set; }
    public string SectionTitle { get; private set; } = string.Empty;

    public ListeningTest Test { get; private set; } = null!;

    private ListeningSectionAudio() { } // EF Core

    public ListeningSectionAudio(
        Guid listeningTestId,
        int sectionNumber,
        string audioUrl,
        int durationSeconds,
        string sectionTitle = "")
    {
        ListeningTestId = listeningTestId;
        SectionNumber = sectionNumber >= 1 && sectionNumber <= 4 ? sectionNumber : 1;
        AudioUrl = string.IsNullOrWhiteSpace(audioUrl) ? throw new ArgumentException("Audio URL cannot be empty.", nameof(audioUrl)) : audioUrl.Trim();
        DurationSeconds = durationSeconds > 0 ? durationSeconds : 0;
        SectionTitle = sectionTitle?.Trim() ?? string.Empty;
        CreatedAt = DateTime.UtcNow;
    }
}
