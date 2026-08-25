using EduSphere.Domain.Common;

namespace EduSphere.Domain.Entities;

public class BandMilestone : BaseEntity
{
    public Guid BandRoadmapId { get; private set; }
    public int StepNumber { get; private set; }
    public string Title { get; private set; } = string.Empty;
    public string TargetSkill { get; private set; } = string.Empty;
    public string Description { get; private set; } = string.Empty;
    public Guid? ReadingPassageId { get; private set; }
    public float MinAccuracyToUnlockNext { get; private set; } = 75.0f;

    public BandRoadmap? BandRoadmap { get; private set; }
    public ReadingPassage? ReadingPassage { get; private set; }

    private BandMilestone() { }

    public BandMilestone(
        Guid bandRoadmapId,
        int stepNumber,
        string title,
        string targetSkill,
        string description = "",
        Guid? readingPassageId = null,
        float minAccuracyToUnlockNext = 75.0f)
    {
        BandRoadmapId = bandRoadmapId;
        StepNumber = stepNumber;
        Title = title;
        TargetSkill = targetSkill;
        Description = description;
        ReadingPassageId = readingPassageId;
        MinAccuracyToUnlockNext = minAccuracyToUnlockNext;
        CreatedAt = DateTime.UtcNow;
    }

    public void SetPassage(Guid passageId)
    {
        ReadingPassageId = passageId;
        UpdatedAt = DateTime.UtcNow;
    }
}
