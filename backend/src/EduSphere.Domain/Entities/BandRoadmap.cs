using EduSphere.Domain.Common;
using EduSphere.Domain.Enums;

namespace EduSphere.Domain.Entities;

public class BandRoadmap : BaseEntity
{
    public TargetBandTier BandTier { get; private set; }
    public string Title { get; private set; } = string.Empty;
    public string Description { get; private set; } = string.Empty;
    public string TargetSkillsSummary { get; private set; } = string.Empty;
    public int TotalMilestones { get; private set; }
    public int VocabularyCount { get; private set; }

    private readonly List<BandMilestone> _milestones = new();
    public IReadOnlyCollection<BandMilestone> Milestones => _milestones.AsReadOnly();

    private readonly List<BandVocabulary> _vocabularies = new();
    public IReadOnlyCollection<BandVocabulary> Vocabularies => _vocabularies.AsReadOnly();

    private BandRoadmap() { }

    public BandRoadmap(
        TargetBandTier bandTier,
        string title,
        string description,
        string targetSkillsSummary,
        int totalMilestones = 5,
        int vocabularyCount = 500)
    {
        BandTier = bandTier;
        Title = title;
        Description = description;
        TargetSkillsSummary = targetSkillsSummary;
        TotalMilestones = totalMilestones;
        VocabularyCount = vocabularyCount;
        CreatedAt = DateTime.UtcNow;
    }

    public void AddMilestone(BandMilestone milestone)
    {
        ArgumentNullException.ThrowIfNull(milestone);
        _milestones.Add(milestone);
        TotalMilestones = _milestones.Count;
        UpdatedAt = DateTime.UtcNow;
    }

    public void AddVocabulary(BandVocabulary vocabulary)
    {
        ArgumentNullException.ThrowIfNull(vocabulary);
        _vocabularies.Add(vocabulary);
        VocabularyCount = _vocabularies.Count;
        UpdatedAt = DateTime.UtcNow;
    }
}
