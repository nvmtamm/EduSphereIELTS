using EduSphere.Domain.Common;

namespace EduSphere.Domain.Entities;

public class ReadingSubmission : BaseEntity
{
    public Guid UserId { get; private set; }
    public Guid PassageId { get; private set; }
    public int RawScore { get; private set; }
    public int TotalQuestions { get; private set; }
    public double BandScore { get; private set; }
    public int DurationSeconds { get; private set; }

    public User User { get; private set; } = null!;
    public ReadingPassage Passage { get; private set; } = null!;

    private readonly List<ReadingSubmissionAnswer> _answers = new();
    public IReadOnlyCollection<ReadingSubmissionAnswer> Answers => _answers.AsReadOnly();

    private ReadingSubmission() { } // EF Core

    public ReadingSubmission(
        Guid userId,
        Guid passageId,
        int rawScore,
        int totalQuestions,
        double bandScore,
        int durationSeconds)
    {
        UserId = userId;
        PassageId = passageId;
        RawScore = rawScore;
        TotalQuestions = totalQuestions;
        BandScore = bandScore;
        DurationSeconds = durationSeconds;
    }

    public void AddAnswer(ReadingSubmissionAnswer answer)
    {
        ArgumentNullException.ThrowIfNull(answer);
        _answers.Add(answer);
    }
}
