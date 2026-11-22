namespace EduSphere.Domain.Enums;

public enum QuestionType
{
    // Reading Types
    TrueFalseNotGiven,
    YesNoNotGiven,
    MultipleChoice,
    MatchingHeadings,
    SummaryCompletion,
    SentenceCompletion,

    // Listening Types
    FormCompletion,
    NoteCompletion,
    TableCompletion,
    Matching,
    MapLabelling,
    DiagramLabelling,
    MultipleChoiceMulti,

    // Reading Types added in Sprint 3.9 (stored as strings, safe to append)
    MatchingInformation,
    ShortAnswer
}
