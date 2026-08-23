# Sprint 6: AI Tutor (RAG), Dashboard Analytics & Mock Test

- **Duration:** 1.5 weeks
- **Objective:** Deploy the full-context RAG AI Tutor chatbot, assemble comprehensive progress analytics (Radar charts, longitudinal trends, study streak), and integrate the timed Mock Test examination flow.

---

## 1. Scope & Deliverables

### AI Tutor (Retrieval-Augmented Generation)
- [ ] **Infrastructure & Knowledge Base:**
  - Ingest and index official IELTS reference documents into Qdrant collection `ielts-knowledge-base`:
    - Band descriptors & scoring rubrics.
    - Common grammatical & lexical pitfalls by band level.
    - Task 1 report structuring techniques & Task 2 essay templates.
    - Speaking strategies & Idiomatic expressions bank.
- [ ] **Application & API Layer:**
  - `AskAiTutorCommand` + Handler:
    - Generates semantic embeddings for student inquiry.
    - Performs similarity search in Qdrant (top-k = 5 chunks).
    - Streams response tokens back to client via Server-Sent Events (SSE) / SignalR.
  - `GetAiChatHistoryQuery` + Handler.
- [ ] **Frontend:**
  - Real-time streaming Chat Interface with typing simulation.
  - Markdown renderer with syntax highlighting for academic structures.
  - Suggested contextual prompts (e.g., *"How do I structure a Task 1 process diagram?"*, *"Give me 5 synonyms for 'increase' with band 7+ collocations"*).

---

### Dashboard Analytics & Gamification
- [ ] **Domain & Backend:**
  - `UserProgress` entity aggregating current band estimates across all 4 modules.
  - `StudyStreak` entity tracking consecutive days active.
  - `GetDashboardAnalyticsQuery` + Handler (Redis cached with 2-minute TTL):
    - Computes overall rounded IELTS Band Score (e.g., average of 6.5, 7.0, 6.0, 6.5 -> 6.5).
    - Longitudinal score progression history over past 30 days.
    - Skill distribution data for Radar Chart.
- [ ] **Frontend:**
  - Hero Metrics Strip: Target Band Score vs Current Estimated Band Score, Total Practice Sessions, Study Hours, Active Streak (🔥).
  - **Skill Radar Chart (Recharts):** Multi-axis balance across Listening, Reading, Writing, Speaking.
  - **Progression Line Chart:** Historical trend lines per skill module.
  - Recent Activity Stream & Actionable Recommended Next Steps.

---

### Mock Test Simulation Engine
- [ ] **Backend:**
  - `MockTest` entity combining paired Reading & Writing tests.
  - `MockTestAttempt` entity storing cumulative performance metrics.
  - `StartMockTestCommand` & `SubmitMockTestCommand`.
- [ ] **Frontend:**
  - Unified strict-mode exam cockpit:
    - 60-minute Reading session -> 5-minute break -> 60-minute Writing session.
    - Auto-save state every 30 seconds.
    - Comprehensive final Diagnostic Score Report card.

---

## 2. Acceptance Criteria

- [ ] AI Tutor responds within < 2 seconds with grounded context retrieved from Qdrant vector database.
- [ ] Dashboard accurately calculates overall band score using official IELTS rounding convention:
  - If average ends in `.25`, round up to `.5`.
  - If average ends in `.75`, round up to whole band.
- [ ] Study streak increments for daily active logins and resets appropriately upon missed days.
- [ ] Mock test executes uninterrupted through sequential timed sections.
