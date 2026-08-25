using EduSphere.Domain.Common;
using EduSphere.Domain.Enums;

namespace EduSphere.Domain.Entities;

public class BandVocabulary : BaseEntity
{
    public Guid? BandRoadmapId { get; private set; }
    public TargetBandTier BandTier { get; private set; }
    public string Word { get; private set; } = string.Empty;
    public string Phonetic { get; private set; } = string.Empty;
    public string Meaning { get; private set; } = string.Empty;
    public string PartOfSpeech { get; private set; } = string.Empty;
    public string AcademicLevel { get; private set; } = "B2"; // A1, A2, B1, B2, C1, C2
    public string ExampleSentence { get; private set; } = string.Empty;
    public string CollocationsJson { get; private set; } = "[]";
    public string SynonymsJson { get; private set; } = "[]";

    public BandRoadmap? BandRoadmap { get; private set; }

    private BandVocabulary() { }

    public BandVocabulary(
        TargetBandTier bandTier,
        string word,
        string phonetic,
        string meaning,
        string partOfSpeech,
        string academicLevel = "B2",
        string exampleSentence = "",
        string collocationsJson = "[]",
        string synonymsJson = "[]",
        Guid? bandRoadmapId = null)
    {
        BandTier = bandTier;
        Word = word;
        Phonetic = phonetic;
        Meaning = meaning;
        PartOfSpeech = partOfSpeech;
        AcademicLevel = academicLevel;
        ExampleSentence = exampleSentence;
        CollocationsJson = collocationsJson;
        SynonymsJson = synonymsJson;
        BandRoadmapId = bandRoadmapId;
        CreatedAt = DateTime.UtcNow;
    }
}
