# EduSphere Entity Relationship Diagram (ERD)

This document illustrates the logical data model and relational schema for the **EduSphere** platform.

---

## 1. Visual Entity Relationship Diagram

```mermaid
erDiagram
    Users ||--|| UserProgress : "maintains"
    Users ||--|| StudyStreaks : "tracks"
    Users ||--o{ ReadingAttempts : "submits"
    Users ||--o{ ListeningAttempts : "submits"
    Users ||--o{ WritingSubmissions : "authors"
    Users ||--o{ SpeakingAttempts : "records"
    Users ||--o{ UserVocabulary : "acquires"
    Users ||--o{ MockTestAttempts : "completes"
    Users ||--o{ AiChatHistory : "queries"

    ReadingPassages ||--|{ ReadingQuestions : "contains"
    ReadingPassages ||--o{ ReadingAttempts : "attempted_in"

    ListeningTests ||--|{ ListeningQuestions : "contains"
    ListeningTests ||--o{ ListeningAttempts : "attempted_in"

    WritingPrompts ||--o{ WritingSubmissions : "responds_to"
    WritingSubmissions ||--|| WritingFeedback : "generates"

    SpeakingTopics ||--o{ SpeakingAttempts : "responds_to"
    SpeakingAttempts ||--|| SpeakingFeedback : "generates"

    VocabularyWords ||--o{ UserVocabulary : "tracked_via"

    MockTests ||--o{ MockTestAttempts : "executed_in"

    Users {
        guid Id PK
        string FullName
        string Email UK
        string PasswordHash
        string Role
        float TargetBandScore
        string RefreshToken
        datetime RefreshTokenExpiryTime
        datetime CreatedAt
        bool IsDeleted
    }

    UserProgress {
        guid Id PK
        guid UserId FK, UK
        float ReadingBand
        float ListeningBand
        float WritingBand
        float SpeakingBand
        float OverallBand
        int TotalPractices
        int TotalStudyMinutes
    }

    StudyStreaks {
        guid Id PK
        guid UserId FK, UK
        int CurrentStreak
        int LongestStreak
        date LastActiveDate
    }

    ReadingPassages {
        guid Id PK
        string Title
        string Content
        string Topic
        string Difficulty
        int EstimatedDurationMinutes
    }

    ReadingQuestions {
        guid Id PK
        guid PassageId FK
        int OrderIndex
        string QuestionType
        string Prompt
        string OptionsJson
        string CorrectAnswer
        string Explanation
    }

    ReadingAttempts {
        guid Id PK
        guid UserId FK
        guid PassageId FK
        string AnswersJson
        int RawScore
        int TotalQuestions
        float BandScore
        int DurationSeconds
        datetime CompletedAt
    }

    WritingPrompts {
        guid Id PK
        string TaskType
        string Category
        string PromptText
        string ImageUrl
        string Instructions
        string ModelEssay
        float ModelBandScore
    }

    WritingSubmissions {
        guid Id PK
        guid UserId FK
        guid PromptId FK
        string Content
        int WordCount
        int TimeSpentSeconds
        datetime SubmittedAt
    }

    WritingFeedback {
        guid Id PK
        guid SubmissionId FK, UK
        float OverallBand
        float TaskAchievementBand
        float CoherenceBand
        float LexicalBand
        float GrammarBand
        string TaskAchievementFeedback
        string CoherenceFeedback
        string LexicalFeedback
        string GrammarFeedback
        string KeyImprovementsJson
        string SuggestedVocabularyJson
    }

    VocabularyWords {
        guid Id PK
        string Word UK
        string PhoneticIPA
        string PartOfSpeech
        string Definition
        string ExampleSentence
        string Topic
        int AcademicWordListLevel
    }

    UserVocabulary {
        guid Id PK
        guid UserId FK
        guid WordId FK
        float EaseFactor
        int IntervalDays
        int RepetitionCount
        datetime NextReviewDate
        string State
    }
```

---

## 2. Cardinality & Key Relationships

| Parent Entity | Child Entity | Cardinality | Cascade Action | Business Rule |
| :--- | :--- | :---: | :---: | :--- |
| `Users` | `UserProgress` | 1 : 1 | `CASCADE` | Each user has exactly one aggregate performance record. |
| `Users` | `StudyStreaks` | 1 : 1 | `CASCADE` | Each user has one streak tracker created upon registration. |
| `Users` | `ReadingAttempts` | 1 : N | `CASCADE` | User deletion clears historical reading attempts. |
| `ReadingPassages` | `ReadingQuestions` | 1 : N | `CASCADE` | Deleting a passage removes all associated questions. |
| `WritingSubmissions` | `WritingFeedback` | 1 : 1 | `CASCADE` | Each submission has exactly one official AI feedback record. |
| `Users` | `UserVocabulary` | 1 : N | `CASCADE` | Tracks individual SM-2 flashcard parameters per user. |
| `VocabularyWords` | `UserVocabulary` | 1 : N | `CASCADE` | Deleting a global word removes it from all personal decks. |
