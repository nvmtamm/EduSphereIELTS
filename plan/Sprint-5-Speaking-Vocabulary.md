# Sprint 5: Speaking Practice & Vocabulary Builder (SM-2 Algorithm)

- **Duration:** 1.5 weeks
- **Objective:** Implement the IELTS Speaking simulator and a high-efficiency Vocabulary acquisition system powered by the SuperMemo SM-2 Spaced Repetition algorithm.

---

## 1. Scope & Deliverables

### Speaking Engine
- [ ] **Domain Layer:**
  - `SpeakingTopic` (Id, Part [Part1/Part2/Part3], TopicTitle, Category, CueCardPointsJson, FollowUpQuestionsJson, SampleAnswerAudioUrl, SampleAnswerTranscript).
  - `SpeakingAttempt` (Id, UserId, TopicId, TranscriptText, AudioRecordingUrl, DurationSeconds, CreatedAt).
  - `SpeakingFeedback` (Id, AttemptId, OverallBand, FluencyBand, LexicalBand, GrammarBand, PronunciationBand, FeedbackDetailsJson).
- [ ] **Application & AI Layer:**
  - `GetSpeakingTopicsQuery` + Handler (Filtered by Part 1, 2, 3).
  - `SubmitSpeakingAttemptCommand` + Handler:
    - Analyzes response transcript using Semantic Kernel for Fluency, Lexical Diversity, and Grammar accuracy.
  - `GetSpeakingHistoryQuery` + Handler.
- [ ] **Frontend:**
  - Topic Explorer by Category (Work & Study, Travel, Technology, Art, Environment).
  - Part 2 Cue Card simulator with 1-minute countdown preparation timer followed by 2-minute response timer.
  - Multi-modal response input: Text submission or browser voice recording via Web Audio / MediaRecorder API.
  - AI Speaking Evaluation Card highlighting lexical variety and syntactic complexity.

---

### Vocabulary System (SuperMemo SM-2 Engine)
- [ ] **Domain Layer:**
  - `VocabularyWord` (Id, Word, Definition, ExampleSentence, PhoneticIPA, PartOfSpeech, Topic, AcademicWordListLevel).
  - `UserVocabulary` (Id, UserId, WordId, EaseFactor, IntervalDays, RepetitionCount, NextReviewDate, State [New/Learning/Review/Graduated]).
- [ ] **Infrastructure & Application Layer (Algorithm):**
  - Implement `SpacedRepetitionService` implementing exact SuperMemo SM-2 logic:
    ```
    EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
    where EF >= 1.3, q = quality score (0 to 5)
    ```
  - `GetDueVocabularyQuery` + Handler (Fetches cards where `NextReviewDate <= DateTime.UtcNow`).
  - `ReviewVocabularyCardCommand` + Handler (Updates EF, interval, and next review date based on user recall grade).
  - `AddWordToCollectionCommand` + Handler (Manual add or quick-add from Reading passage).
  - `VocabularySeeder`: Seed 500+ essential academic IELTS words categorized by topic.
- [ ] **Frontend:**
  - Interactive 3D CSS Flip Flashcard Component (Front: Word + IPA + Audio pronunciation; Back: Definition + Collocations + IELTS Example).
  - Review Session Interface with standard SM-2 rating buttons:
    - `Again` (Grade 0 - Reset)
    - `Hard` (Grade 3 - Short interval)
    - `Good` (Grade 4 - Standard interval)
    - `Easy` (Grade 5 - Increased interval)
  - Word Collection Explorer with search, topic filters, and mastery progress meters.

---

## 2. Acceptance Criteria

- [ ] Speaking Cue Card triggers sequential 1-minute prep timer and 2-minute recording alert.
- [ ] SM-2 algorithm recalculates intervals accurately; repeated 'Good' or 'Easy' ratings progressively expand the review interval in days.
- [ ] Due vocabulary query correctly isolates words scheduled for review today.
- [ ] Flashcard flip animation is fluid and responsive across desktop and mobile devices.
