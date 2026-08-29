using EduSphere.Domain.Common;
using EduSphere.Domain.Enums;

namespace EduSphere.Domain.Entities;

public class ListeningTest : BaseEntity
{
    public string Title { get; private set; } = string.Empty;
    public string Topic { get; private set; } = string.Empty;
    public DifficultyLevel Difficulty { get; private set; } = DifficultyLevel.Medium;
    public ListeningSectionType SectionType { get; private set; } = ListeningSectionType.Section1_SocialDialogue;
    public int SectionNumber { get; private set; } = 1; // 1, 2, 3, 4 (or 0 for FullTest)
    public string AudioUrl { get; private set; } = string.Empty;
    public int DurationSeconds { get; private set; } = 1800; // default 30 mins
    public long AudioFileSize { get; private set; } = 0;
    public ListeningAccent Accent { get; private set; } = ListeningAccent.British;
    public PassageSourceType SourceType { get; private set; } = PassageSourceType.OfficialCambridge;
    public string CollectionName { get; private set; } = "Official Cambridge";
    public TargetBandTier TargetBandTier { get; private set; } = TargetBandTier.Band6_0_6_5;
    public string Instructions { get; private set; } = string.Empty;
    public Guid? UploadedByUserId { get; private set; }
    public bool IsCommunityShared { get; private set; } = false;

    private readonly List<ListeningQuestion> _questions = new();
    public IReadOnlyCollection<ListeningQuestion> Questions => _questions.AsReadOnly();

    private readonly List<ListeningTranscript> _transcripts = new();
    public IReadOnlyCollection<ListeningTranscript> Transcripts => _transcripts.AsReadOnly();

    private readonly List<ListeningSubmission> _submissions = new();
    public IReadOnlyCollection<ListeningSubmission> Submissions => _submissions.AsReadOnly();

    private ListeningTest() { } // EF Core

    public ListeningTest(
        string title,
        string topic,
        DifficultyLevel difficulty,
        ListeningSectionType sectionType,
        int sectionNumber,
        string audioUrl,
        int durationSeconds,
        ListeningAccent accent = ListeningAccent.British,
        PassageSourceType sourceType = PassageSourceType.OfficialCambridge,
        string collectionName = "Official Cambridge",
        TargetBandTier targetBandTier = TargetBandTier.Band6_0_6_5,
        string instructions = "",
        long audioFileSize = 0,
        Guid? uploadedByUserId = null,
        bool isCommunityShared = false)
    {
        Title = string.IsNullOrWhiteSpace(title) ? throw new ArgumentException("Title cannot be empty.", nameof(title)) : title.Trim();
        Topic = string.IsNullOrWhiteSpace(topic) ? throw new ArgumentException("Topic cannot be empty.", nameof(topic)) : topic.Trim();
        Difficulty = difficulty;
        SectionType = sectionType;
        SectionNumber = sectionNumber;
        AudioUrl = string.IsNullOrWhiteSpace(audioUrl) ? throw new ArgumentException("Audio URL cannot be empty.", nameof(audioUrl)) : audioUrl.Trim();
        DurationSeconds = durationSeconds > 0 ? durationSeconds : 1800;
        AudioFileSize = audioFileSize;
        Accent = accent;
        SourceType = sourceType;
        CollectionName = string.IsNullOrWhiteSpace(collectionName) ? "Official Cambridge" : collectionName.Trim();
        TargetBandTier = targetBandTier;
        Instructions = instructions?.Trim() ?? string.Empty;
        UploadedByUserId = uploadedByUserId;
        IsCommunityShared = isCommunityShared;
        CreatedAt = DateTime.UtcNow;
    }

    public void AddQuestion(ListeningQuestion question)
    {
        ArgumentNullException.ThrowIfNull(question);
        _questions.Add(question);
        UpdatedAt = DateTime.UtcNow;
    }

    public void AddTranscript(ListeningTranscript transcript)
    {
        ArgumentNullException.ThrowIfNull(transcript);
        _transcripts.Add(transcript);
        UpdatedAt = DateTime.UtcNow;
    }
}
