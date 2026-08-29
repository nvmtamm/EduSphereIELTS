using EduSphere.Domain.Common;

namespace EduSphere.Domain.Entities;

public class ListeningSubmission : BaseEntity
{
    public Guid UserId { get; private set; }
    public Guid TestId { get; private set; }
    public int RawScore { get; private set; }
    public int TotalQuestions { get; private set; }
    public double BandScore { get; private set; }
    public int DurationSeconds { get; private set; }
    public string BreakdownJson { get; private set; } = "{}"; // Section accuracy & diagnostic breakdown

    public User User { get; private set; } = null!;
    public ListeningTest Test { get; private set; } = null!;

    private readonly List<ListeningSubmissionAnswer> _answers = new();
    public IReadOnlyCollection<ListeningSubmissionAnswer> Answers => _answers.AsReadOnly();

    private ListeningSubmission() { } // EF Core

    public ListeningSubmission(
        Guid userId,
        Guid testId,
        int rawScore,
        int totalQuestions,
        double bandScore,
        int durationSeconds,
        string breakdownJson = "{}")
    {
        UserId = userId;
        TestId = testId;
        RawScore = rawScore;
        TotalQuestions = totalQuestions;
        BandScore = bandScore;
        DurationSeconds = durationSeconds;
        BreakdownJson = string.IsNullOrWhiteSpace(breakdownJson) ? "{}" : breakdownJson.Trim();
        CreatedAt = DateTime.UtcNow;
    }

    public void AddAnswer(ListeningSubmissionAnswer answer)
    {
        ArgumentNullException.ThrowIfNull(answer);
        _answers.Add(answer);
    }
}
