# EduSphere Database Design & Schema Specifications

- **Database Engine:** Microsoft SQL Server 2022
- **ORM & Migrations:** Entity Framework Core 8 (Code-First with Fluent API)
- **Caching Engine:** Redis 7 (In-memory Distributed Cache)
- **Vector Database:** Qdrant (1536-dimension Dense Vector Collections)

---

## 1. Relational Schema Architecture (SQL Server)

### 1.1 Identity & User Management

#### `Users`
Stores authentication credentials, authorization roles, and high-level learning goals.
```sql
CREATE TABLE [Users] (
    [Id] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    [FullName] NVARCHAR(150) NOT NULL,
    [Email] NVARCHAR(256) NOT NULL,
    [PasswordHash] NVARCHAR(500) NOT NULL,
    [Role] NVARCHAR(50) NOT NULL DEFAULT 'Student',
    [TargetBandScore] FLOAT NULL,
    [RefreshToken] NVARCHAR(500) NULL,
    [RefreshTokenExpiryTime] DATETIME2 NULL,
    [CreatedAt] DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    [UpdatedAt] DATETIME2 NULL,
    [IsDeleted] BIT NOT NULL DEFAULT 0
);
CREATE UNIQUE INDEX [IX_Users_Email] ON [Users]([Email]) WHERE [IsDeleted] = 0;
```

#### `UserProgress`
Maintains aggregate band scores calculated across all 4 skill modules.
```sql
CREATE TABLE [UserProgress] (
    [Id] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    [UserId] UNIQUEIDENTIFIER NOT NULL,
    [ReadingBand] FLOAT NOT NULL DEFAULT 0.0,
    [ListeningBand] FLOAT NOT NULL DEFAULT 0.0,
    [WritingBand] FLOAT NOT NULL DEFAULT 0.0,
    [SpeakingBand] FLOAT NOT NULL DEFAULT 0.0,
    [OverallBand] FLOAT NOT NULL DEFAULT 0.0,
    [TotalPractices] INT NOT NULL DEFAULT 0,
    [TotalStudyMinutes] INT NOT NULL DEFAULT 0,
    [LastCalculatedAt] DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT [FK_UserProgress_Users] FOREIGN KEY ([UserId]) REFERENCES [Users]([Id]) ON DELETE CASCADE
);
CREATE UNIQUE INDEX [IX_UserProgress_UserId] ON [UserProgress]([UserId]);
```

#### `StudyStreaks`
Tracks consecutive active practice days for gamification.
```sql
CREATE TABLE [StudyStreaks] (
    [Id] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    [UserId] UNIQUEIDENTIFIER NOT NULL,
    [CurrentStreak] INT NOT NULL DEFAULT 1,
    [LongestStreak] INT NOT NULL DEFAULT 1,
    [LastActiveDate] DATE NOT NULL,
    CONSTRAINT [FK_StudyStreaks_Users] FOREIGN KEY ([UserId]) REFERENCES [Users]([Id]) ON DELETE CASCADE
);
CREATE UNIQUE INDEX [IX_StudyStreaks_UserId] ON [StudyStreaks]([UserId]);
```

---

### 1.2 Reading Module Tables

#### `ReadingPassages`
```sql
CREATE TABLE [ReadingPassages] (
    [Id] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    [Title] NVARCHAR(250) NOT NULL,
    [Content] NVARCHAR(MAX) NOT NULL,
    [Topic] NVARCHAR(100) NOT NULL,
    [Difficulty] NVARCHAR(50) NOT NULL,
    [EstimatedDurationMinutes] INT NOT NULL DEFAULT 20,
    [CreatedAt] DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    [IsDeleted] BIT NOT NULL DEFAULT 0
);
CREATE INDEX [IX_ReadingPassages_Topic_Difficulty] ON [ReadingPassages]([Topic], [Difficulty]);
```

#### `ReadingQuestions`
```sql
CREATE TABLE [ReadingQuestions] (
    [Id] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    [PassageId] UNIQUEIDENTIFIER NOT NULL,
    [OrderIndex] INT NOT NULL,
    [QuestionType] NVARCHAR(50) NOT NULL,
    [Prompt] NVARCHAR(MAX) NOT NULL,
    [OptionsJson] NVARCHAR(MAX) NULL,
    [CorrectAnswer] NVARCHAR(500) NOT NULL,
    [Explanation] NVARCHAR(MAX) NULL,
    CONSTRAINT [FK_ReadingQuestions_ReadingPassages] FOREIGN KEY ([PassageId]) REFERENCES [ReadingPassages]([Id]) ON DELETE CASCADE
);
CREATE INDEX [IX_ReadingQuestions_PassageId_Order] ON [ReadingQuestions]([PassageId], [OrderIndex]);
```

#### `ReadingAttempts`
```sql
CREATE TABLE [ReadingAttempts] (
    [Id] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    [UserId] UNIQUEIDENTIFIER NOT NULL,
    [PassageId] UNIQUEIDENTIFIER NOT NULL,
    [AnswersJson] NVARCHAR(MAX) NOT NULL,
    [RawScore] INT NOT NULL,
    [TotalQuestions] INT NOT NULL,
    [BandScore] FLOAT NOT NULL,
    [DurationSeconds] INT NOT NULL,
    [CompletedAt] DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT [FK_ReadingAttempts_Users] FOREIGN KEY ([UserId]) REFERENCES [Users]([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_ReadingAttempts_ReadingPassages] FOREIGN KEY ([PassageId]) REFERENCES [ReadingPassages]([Id])
);
CREATE INDEX [IX_ReadingAttempts_UserId_CompletedAt] ON [ReadingAttempts]([UserId], [CompletedAt] DESC);
```

---

### 1.3 Writing Module Tables (AI Grading Engine)

#### `WritingPrompts`
```sql
CREATE TABLE [WritingPrompts] (
    [Id] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    [TaskType] NVARCHAR(20) NOT NULL, -- 'Task1' | 'Task2'
    [Category] NVARCHAR(100) NOT NULL,
    [PromptText] NVARCHAR(MAX) NOT NULL,
    [ImageUrl] NVARCHAR(1000) NULL,
    [Instructions] NVARCHAR(MAX) NULL,
    [ModelEssay] NVARCHAR(MAX) NULL,
    [ModelBandScore] FLOAT NOT NULL DEFAULT 8.5,
    [CreatedAt] DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
```

#### `WritingSubmissions`
```sql
CREATE TABLE [WritingSubmissions] (
    [Id] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    [UserId] UNIQUEIDENTIFIER NOT NULL,
    [PromptId] UNIQUEIDENTIFIER NOT NULL,
    [Content] NVARCHAR(MAX) NOT NULL,
    [WordCount] INT NOT NULL,
    [TimeSpentSeconds] INT NOT NULL,
    [SubmittedAt] DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT [FK_WritingSubmissions_Users] FOREIGN KEY ([UserId]) REFERENCES [Users]([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_WritingSubmissions_WritingPrompts] FOREIGN KEY ([PromptId]) REFERENCES [WritingPrompts]([Id])
);
```

#### `WritingFeedback`
```sql
CREATE TABLE [WritingFeedback] (
    [Id] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    [SubmissionId] UNIQUEIDENTIFIER NOT NULL,
    [OverallBand] FLOAT NOT NULL,
    [TaskAchievementBand] FLOAT NOT NULL,
    [CoherenceBand] FLOAT NOT NULL,
    [LexicalBand] FLOAT NOT NULL,
    [GrammarBand] FLOAT NOT NULL,
    [TaskAchievementFeedback] NVARCHAR(MAX) NOT NULL,
    [CoherenceFeedback] NVARCHAR(MAX) NOT NULL,
    [LexicalFeedback] NVARCHAR(MAX) NOT NULL,
    [GrammarFeedback] NVARCHAR(MAX) NOT NULL,
    [KeyImprovementsJson] NVARCHAR(MAX) NOT NULL,
    [SuggestedVocabularyJson] NVARCHAR(MAX) NOT NULL,
    [EvaluatedAt] DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT [FK_WritingFeedback_WritingSubmissions] FOREIGN KEY ([SubmissionId]) REFERENCES [WritingSubmissions]([Id]) ON DELETE CASCADE
);
CREATE UNIQUE INDEX [IX_WritingFeedback_SubmissionId] ON [WritingFeedback]([SubmissionId]);
```

---

### 1.4 Vocabulary & Spaced Repetition (SM-2)

#### `VocabularyWords`
```sql
CREATE TABLE [VocabularyWords] (
    [Id] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    [Word] NVARCHAR(100) NOT NULL,
    [PhoneticIPA] NVARCHAR(100) NULL,
    [PartOfSpeech] NVARCHAR(50) NOT NULL,
    [Definition] NVARCHAR(MAX) NOT NULL,
    [ExampleSentence] NVARCHAR(MAX) NOT NULL,
    [Topic] NVARCHAR(100) NOT NULL,
    [AcademicWordListLevel] INT NOT NULL DEFAULT 1
);
CREATE UNIQUE INDEX [IX_VocabularyWords_Word] ON [VocabularyWords]([Word]);
```

#### `UserVocabulary` (SM-2 Algorithm Tracking)
```sql
CREATE TABLE [UserVocabulary] (
    [Id] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    [UserId] UNIQUEIDENTIFIER NOT NULL,
    [WordId] UNIQUEIDENTIFIER NOT NULL,
    [EaseFactor] FLOAT NOT NULL DEFAULT 2.5,
    [IntervalDays] INT NOT NULL DEFAULT 0,
    [RepetitionCount] INT NOT NULL DEFAULT 0,
    [NextReviewDate] DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    [State] NVARCHAR(50) NOT NULL DEFAULT 'Learning',
    CONSTRAINT [FK_UserVocabulary_Users] FOREIGN KEY ([UserId]) REFERENCES [Users]([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_UserVocabulary_VocabularyWords] FOREIGN KEY ([WordId]) REFERENCES [VocabularyWords]([Id]) ON DELETE CASCADE
);
CREATE INDEX [IX_UserVocabulary_UserId_NextReviewDate] ON [UserVocabulary]([UserId], [NextReviewDate]);
```

---

## 2. Vector Database Collections (Qdrant)

| Collection Name | Dimension | Metric | Purpose |
| :--- | :--- | :--- | :--- |
| `ielts-writing-rubrics` | 1536 (OpenAI small) | Cosine | Band descriptors for Task 1 and Task 2 grading |
| `ielts-speaking-rubrics` | 1536 (OpenAI small) | Cosine | Fluency, Lexical, Grammar descriptors for Speaking |
| `ielts-knowledge-base` | 1536 (OpenAI small) | Cosine | General IELTS academic knowledge base for AI Tutor Q&A |
