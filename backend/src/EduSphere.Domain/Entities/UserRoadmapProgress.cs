using EduSphere.Domain.Common;
using EduSphere.Domain.Enums;

namespace EduSphere.Domain.Entities;

public class UserRoadmapProgress : BaseEntity
{
    public Guid UserId { get; private set; }
    public TargetBandTier BandTier { get; private set; }
    public int CurrentStepNumber { get; private set; } = 1;
    public float MasteryPercentage { get; private set; } = 0.0f;
    public int CompletedPassagesCount { get; private set; } = 0;
    public string? EarnedBadge { get; private set; }

    public User? User { get; private set; }

    private UserRoadmapProgress() { }

    public UserRoadmapProgress(
        Guid userId,
        TargetBandTier bandTier,
        int currentStepNumber = 1,
        float masteryPercentage = 0.0f,
        int completedPassagesCount = 0,
        string? earnedBadge = null)
    {
        UserId = userId;
        BandTier = bandTier;
        CurrentStepNumber = currentStepNumber;
        MasteryPercentage = masteryPercentage;
        CompletedPassagesCount = completedPassagesCount;
        EarnedBadge = earnedBadge;
        CreatedAt = DateTime.UtcNow;
    }

    public void UpdateProgress(int stepNumber, float accuracy, string? badge = null)
    {
        CurrentStepNumber = Math.Max(CurrentStepNumber, stepNumber);
        CompletedPassagesCount++;
        MasteryPercentage = Math.Min(100f, (MasteryPercentage * (CompletedPassagesCount - 1) + accuracy) / CompletedPassagesCount);
        if (!string.IsNullOrEmpty(badge))
        {
            EarnedBadge = badge;
        }
        UpdatedAt = DateTime.UtcNow;
    }
}
