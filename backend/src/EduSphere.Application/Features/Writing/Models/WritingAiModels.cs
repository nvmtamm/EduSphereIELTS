namespace EduSphere.Application.Features.Writing.Models;

public class CriteriaScoreDto
{
    public float Score { get; set; }
    public string BandDescriptor { get; set; } = string.Empty;
    public List<string> Strengths { get; set; } = new();
    public List<string> AreasForImprovement { get; set; } = new();
    public string Feedback { get; set; } = string.Empty;
}

public class GrammarErrorDto
{
    public string OriginalSentence { get; set; } = string.Empty;
    public string ErrorExplanation { get; set; } = string.Empty;
    public string SuggestedCorrection { get; set; } = string.Empty;
    public string Band8Paraphrase { get; set; } = string.Empty;
}

public class VocabularySuggestionDto
{
    public string OriginalWordOrPhrase { get; set; } = string.Empty;
    public List<string> AcademicAlternatives { get; set; } = new();
    public string ContextualExample { get; set; } = string.Empty;
}

public class WritingEvaluationResult
{
    public CriteriaScoreDto TaskAchievement { get; set; } = new();
    public CriteriaScoreDto CoherenceCohesion { get; set; } = new();
    public CriteriaScoreDto LexicalResource { get; set; } = new();
    public CriteriaScoreDto GrammaticalRange { get; set; } = new();
    public float OverallBand { get; set; }
    public string GeneralSummary { get; set; } = string.Empty;
    public List<GrammarErrorDto> GrammarErrors { get; set; } = new();
    public List<VocabularySuggestionDto> VocabularySuggestions { get; set; } = new();
}
