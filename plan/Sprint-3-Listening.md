# Sprint 3: Listening Examination Engine

- **Duration:** 1 week
- **Objective:** Develop the IELTS Listening module supporting audio streaming, section-based question progression, playback controls, real-time response persistence, and automated scoring.

---

## 1. Scope & Deliverables

### Backend
- [ ] **Domain Layer:**
  - `ListeningTest` (Id, Title, AudioUrl, Transcript, Difficulty, SectionCount, DurationMinutes).
  - `ListeningQuestion` (Id, TestId, SectionIndex [1–4], QuestionType, Prompt, OptionsJson, CorrectAnswer, AudioTimestampSeconds).
  - `ListeningAttempt` (Id, UserId, TestId, AnswersJson, Score, TotalQuestions, BandScore, CompletedAt).
- [ ] **Application Layer (CQRS):**
  - `GetListeningTestsQuery` + Handler (Pagination, search, Redis caching).
  - `GetListeningTestDetailQuery` + Handler (Includes question metadata and audio streaming URL).
  - `SubmitListeningAttemptCommand` + Handler (Auto-grades answers, maps to 9-band scale, logs attempt).
  - `GetListeningHistoryQuery` + Handler.
- [ ] **Infrastructure Layer:**
  - EF Core configurations & migrations.
  - Audio file storage handler (Local storage / cloud CDN compatibility).
  - `ListeningSeeder`: Seed 5–8 complete IELTS Listening tests with audio links, questions, transcripts, and timestamp markers across all 4 Sections.
- [ ] **API Layer:**
  - `ListeningController`:
    - `GET /api/listening/tests`
    - `GET /api/listening/tests/{id}`
    - `POST /api/listening/tests/{id}/submit` [Authorize]
    - `GET /api/listening/history` [Authorize]

### Frontend
- [ ] **Listening Catalog Page:**
  - Test cards with duration, sections list, difficulty indicators.
- [ ] **Test Simulation Interface:**
  - Custom Sticky Audio Player Component:
    - Play / Pause, Progress bar, Elapsed / Remaining time.
    - Playback speed switcher (0.75x, 1.0x, 1.25x).
    - Strict mode option (single-play enforcement replicating exam rules).
  - Section-based Question View:
    - Form filling & Table completion renderers.
    - Map / Diagram labeling renderers.
    - Multiple choice renderers.
  - Interactive Scratchpad / Notes panel for taking quick notes while listening.
- [ ] **Review & Analysis View:**
  - Band score and section accuracy breakdown.
  - Full transcript modal with interactive timestamps linked to playback.

---

## 2. Acceptance Criteria

- [ ] Audio plays smoothly across major browsers without latency or stutter.
- [ ] Answers persist automatically to local state during playback to prevent accidental data loss.
- [ ] Submitting evaluates answers according to IELTS Listening scoring table.
- [ ] Review screen allows jumping to exact audio timestamps where answers are mentioned in the transcript.
