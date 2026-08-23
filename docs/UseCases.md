# EduSphere Use Cases & Behavioral Specifications

This document outlines the core operational scenarios for users interacting with the **EduSphere** platform.

---

## 1. Actors

| Actor | Description |
| :--- | :--- |
| **Student (Learner)** | Primary end-user practicing IELTS skills, submitting essays, reviewing vocabulary, and querying the AI Tutor. |
| **Administrator** | System operator managing user privileges, monitoring health metrics, and maintaining test content catalogs. |
| **AI Evaluation Engine** | Autonomous system worker (Semantic Kernel + Qdrant RAG + OpenAI) that grades writing/speaking and generates structured feedback. |

---

## 2. Core Use Cases

### UC-01: User Registration & Target Band Setting
- **Primary Actor:** Student
- **Preconditions:** User is on the `/register` page.
- **Main Success Scenario:**
  1. Student inputs Full Name, valid Email, strong Password, and selects Target IELTS Band Score (e.g., `7.5`).
  2. System validates email uniqueness and password complexity via FluentValidation.
  3. System hashes password with BCrypt, persists `User` record, and initializes associated `UserProgress` and `StudyStreaks` records.
  4. System generates JWT Access Token and Refresh Token, returning user profile.
  5. Student is redirected to the personalized Dashboard.
- **Alternate Flows:**
  - *2a. Duplicate Email:* System returns RFC 7807 `409 Conflict` / `400 Bad Request` with message "Email already in use".

---

### UC-02: Interactive Reading Practice with Split-Screen & Instant Grading
- **Primary Actor:** Student
- **Preconditions:** Student is logged in and selects a Reading passage from the catalog.
- **Main Success Scenario:**
  1. System retrieves passage text and associated questions from Redis cache (or SQL Server on cache miss).
  2. Frontend loads Split-Screen view (Passage on left, Questions on right) and starts the 20-minute countdown timer.
  3. Student completes answers across multiple question types (TFNG, MCQ, Headings, Completion).
  4. Student clicks "Submit Test" (or timer expires, triggering auto-submit).
  5. System computes raw score, maps to official 9.0 IELTS Band scale, records `ReadingAttempt`, and updates `UserProgress.ReadingBand`.
  6. Frontend transitions to Review screen showing:
     - Band score summary card.
     - Question-by-question breakdown with green/red status indicators.
     - Detailed explanation popup highlighting the exact passage source text.
- **Alternate Flows:**
  - *3a. Vocabulary Encounter:* Student highlights an unfamiliar word in the passage and clicks "Add to Flashcards". System creates a new `UserVocabulary` card initialized for SM-2 review.

---

### UC-03: Timed Listening Simulation with Audio Streaming
- **Primary Actor:** Student
- **Preconditions:** Student is logged in and opens a Listening test.
- **Main Success Scenario:**
  1. System streams audio stream and displays Section 1 questions.
  2. Student answers questions sequentially while listening to audio. Local state auto-saves inputs every 10 seconds.
  3. Upon reaching audio conclusion, Student submits test.
  4. System grades answers, calculates Band Score, and updates user profile.
  5. Student reviews results with access to full audio transcript linked to timestamps.

---

### UC-04: Automated AI Writing Evaluation with 4 IELTS Criteria (Star Feature)
- **Primary Actor:** Student
- **Supporting Actor:** AI Evaluation Engine (Semantic Kernel + Qdrant)
- **Preconditions:** Student selects a Writing prompt (Task 1 or Task 2).
- **Main Success Scenario:**
  1. Student enters essay editor. Live word counter increments in real time, displaying threshold warnings if `< 150` (Task 1) or `< 250` words (Task 2).
  2. Student finishes essay and clicks "Submit for AI Evaluation".
  3. Backend verifies word count threshold and dispatches `SubmitWritingEssayCommand`.
  4. System executes Qdrant vector similarity search to retrieve relevant IELTS Band Descriptors for Task Type.
  5. Semantic Kernel executes OpenAI GPT-4o with grounded prompt and strict JSON schema.
  6. AI returns structured evaluation across:
     - Task Achievement / Response (Band + Feedback).
     - Coherence and Cohesion (Band + Feedback).
     - Lexical Resource (Band + Feedback + Academic vocabulary suggestions).
     - Grammatical Range & Accuracy (Band + Feedback + Syntax corrections).
  7. System saves `WritingFeedback` and updates `UserProgress.WritingBand`.
  8. Frontend presents animated 4-criteria feedback cards, actionable improvement priorities, and side-by-side comparison with the Band 8.5 Model Essay.

---

### UC-05: Daily Vocabulary Acquisition via SuperMemo SM-2 Spaced Repetition
- **Primary Actor:** Student
- **Preconditions:** Student opens the Vocabulary module.
- **Main Success Scenario:**
  1. System queries `UserVocabulary` where `NextReviewDate <= DateTime.UtcNow` (Due cards).
  2. Student reviews 3D interactive Flashcard (Front: Word + IPA + Audio -> Click to Flip -> Back: Definition + Collocations + IELTS Example).
  3. Student self-evaluates recall quality: `Again (0)`, `Hard (3)`, `Good (4)`, or `Easy (5)`.
  4. System calculates new `EaseFactor`, `IntervalDays`, and `NextReviewDate` via SM-2 algorithm:
     - `Again` resets repetition count to 0 and interval to 1 day.
     - `Good` / `Easy` expands interval based on Ease Factor.
  5. Session continues until all due cards for the day are graduated.

---

### UC-06: Context-Aware Academic Inquiry via AI Tutor (RAG)
- **Primary Actor:** Student
- **Supporting Actor:** AI Evaluation Engine
- **Preconditions:** Student opens the AI Tutor chat view.
- **Main Success Scenario:**
  1. Student types an inquiry (e.g., *"How do I effectively structure an 'Agree or Disagree' Task 2 essay?"*).
  2. Backend embeds inquiry and searches `ielts-knowledge-base` in Qdrant for top-5 relevant instructional chunks.
  3. Semantic Kernel streams response tokens back to client using Server-Sent Events (SSE).
  4. Frontend renders Markdown, structured outline templates, and follow-up recommendations with low latency (< 2.0s).
