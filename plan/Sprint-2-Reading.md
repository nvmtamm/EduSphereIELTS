# Sprint 2: Reading Examination Engine

- **Duration:** 1.5 weeks
- **Objective:** Build the complete IELTS Reading practice module, featuring split-screen document viewer, multi-type question parser, timed session manager, automated evaluation, Redis caching, and rich database seeding.

---

## 1. Scope & Deliverables

### Backend
- [ ] **Domain Layer:**
  - `ReadingPassage` (Id, Title, Content, Topic, Difficulty, EstimatedDuration).
  - `ReadingQuestion` (Id, PassageId, OrderIndex, QuestionType, Prompt, OptionsJson, CorrectAnswer, Explanation).
  - `ReadingAttempt` (Id, UserId, PassageId, AnswersJson, Score, TotalQuestions, BandScore, DurationSeconds, CompletedAt).
  - `QuestionType` enum (`TrueFalseNotGiven`, `YesNoNotGiven`, `MultipleChoice`, `MatchingHeadings`, `SentenceCompletion`, `SummaryCompletion`).
  - `DifficultyLevel` enum (`Band5_6`, `Band6_7`, `Band7_8`, `Band8_9`).
- [ ] **Application Layer (CQRS):**
  - `GetReadingPassagesQuery` + Handler (Pagination, search, filter by topic/difficulty, Redis Cache-Aside).
  - `GetReadingPassageDetailQuery` + Handler (Full passage text + questions, Redis cached).
  - `SubmitReadingAttemptCommand` + Handler + Validator:
    - Calculates raw score out of total questions.
    - Maps raw score to official IELTS 9-band scale.
    - Persists attempt and updates `UserProgress`.
  - `GetReadingHistoryQuery` + Handler (User's historical scores and time metrics).
- [ ] **Infrastructure Layer:**
  - EF Core configurations & migrations for Reading entities.
  - `ReadingSeeder`: Seed 10–15 complete, authentic IELTS Reading passages covering diverse topics (Environment, Technology, Science, History, Sociology) and question types.
- [ ] **API Layer:**
  - `ReadingController`:
    - `GET /api/reading/passages`
    - `GET /api/reading/passages/{id}`
    - `POST /api/reading/passages/{id}/submit` [Authorize]
    - `GET /api/reading/history` [Authorize]

### Frontend
- [ ] **Reading Catalog Page:**
  - Search input, Topic dropdown, Difficulty badges, status indicator (Not Started / Completed).
  - Passage cards with estimated time and question count.
- [ ] **Interactive Split-Screen Practice Interface:**
  - Left pane: Reading passage text with resizable pane and adjustable font size.
  - Right pane: Question navigator & dynamic question renderers:
    - TFNG / YNNG (Radio groups).
    - Multiple Choice (Single/Multi-select checkboxes).
    - Matching Headings (Drag-and-drop or select dropdowns).
    - Text Completion (Inline fill-in inputs).
  - Top bar: Countdown timer (20-minute default), Question status palette, Submit button with confirmation dialog.
- [ ] **Results & Solution Analysis View:**
  - Band score summary card with percentage accuracy.
  - Question-by-question breakdown showing User Answer vs Correct Answer.
  - Explanation box for each question with passage excerpt highlight.
  - "Add to Vocabulary" action on text selection.

---

## 2. Technical Specifications & Scoring Logic

### Raw Score to IELTS Band Conversion Table (Academic Reading)
| Raw Score (out of 40) | IELTS Band Score |
| :---: | :---: |
| 39–40 | 9.0 |
| 37–38 | 8.5 |
| 35–36 | 8.0 |
| 33–34 | 7.5 |
| 30–32 | 7.0 |
| 27–29 | 6.5 |
| 23–26 | 6.0 |
| 19–22 | 5.5 |
| 15–18 | 5.0 |

---

## 3. Acceptance Criteria

- [ ] Reading catalog lists seeded passages; queries are served from Redis after first load.
- [ ] Split-screen view maintains independent scrolling on both desktop and tablet screens.
- [ ] Submitting answers accurately calculates raw score and mapped IELTS band score.
- [ ] Detailed explanations correctly highlight justification points from the passage.
