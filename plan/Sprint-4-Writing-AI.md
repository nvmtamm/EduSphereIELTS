# Sprint 4: Writing Practice & AI Evaluation Engine (Star Feature)

- **Duration:** 1.5 weeks
- **Objective:** Engineer the core showcase feature of the platform: an automated IELTS Writing evaluation system using Microsoft Semantic Kernel, OpenAI GPT-4o, and Retrieval-Augmented Generation (RAG) mapped against official IELTS Band Descriptors.

---

## 1. Scope & Deliverables

### Backend
- [ ] **Domain Layer:**
  - `WritingPrompt` (Id, TaskType [Task1/Task2], Category, PromptText, ImageUrl, Instructions, ModelEssay, ModelBandScore).
  - `WritingSubmission` (Id, UserId, PromptId, Content, WordCount, TimeSpentSeconds, SubmittedAt).
  - `WritingFeedback` (Id, SubmissionId, OverallBand, TaskAchievementBand, CoherenceBand, LexicalBand, GrammarBand, TaskAchievementFeedback, CoherenceFeedback, LexicalFeedback, GrammarFeedback, KeyImprovementsJson, SuggestedVocabularyJson).
- [ ] **Infrastructure Layer (AI & RAG Engine):**
  - Integrate `Microsoft.SemanticKernel` and OpenAI connector.
  - Setup Qdrant collection `ielts-writing-rubrics` containing indexed official British Council / IDP Band Descriptors for Task 1 and Task 2.
  - Implement `AiGradingService`:
    - RAG retrieval of relevant band criteria descriptors based on task type.
    - System prompt enforcing strict, objective examiner evaluation.
    - JSON Schema enforcement guaranteeing strongly typed structured feedback.
- [ ] **Application Layer (CQRS):**
  - `GetWritingPromptsQuery` + Handler.
  - `SubmitWritingEssayCommand` + Handler:
    - Verifies word count (Task 1 >= 150 words, Task 2 >= 250 words).
    - Persists submission.
    - Triggers asynchronous `AiGradingService`.
    - Saves parsed `WritingFeedback` and updates overall user writing statistics.
  - `GetWritingSubmissionFeedbackQuery` + Handler.
  - `GetWritingHistoryQuery` + Handler.
- [ ] **Infrastructure Layer (Seeding):**
  - `WritingPromptSeeder`: 20+ authentic prompts (Task 1 charts/maps/diagrams + Task 2 opinion/discussion/problem-solution essays) with model answers.
- [ ] **API Layer:**
  - `WritingController`:
    - `GET /api/writing/prompts`
    - `POST /api/writing/submit` [Authorize]
    - `GET /api/writing/submissions/{id}/feedback` [Authorize]
    - `GET /api/writing/history` [Authorize]

### Frontend
- [ ] **Writing Prompt Catalog:** Filter by Task 1 / Task 2, topic tags, difficulty.
- [ ] **Interactive Essay Editor:**
  - Split view: Prompt & Chart image (left) | Rich essay text editor (right).
  - Real-time word counter with color warning if below minimum threshold (150 / 250 words).
  - Practice timer (20 mins for Task 1, 40 mins for Task 2).
  - Full-screen distraction-free mode.
- [ ] **Comprehensive AI Feedback Dashboard:**
  - Animated Band Score Hero Card (Overall Band + 4 Criteria breakdown with visual progress bars).
  - Criteria Tabs:
    - **Task Achievement / Response:** Evaluation against prompt requirements.
    - **Coherence & Cohesion:** Paragraph structure, discourse markers, logical progression.
    - **Lexical Resource:** Word choice analysis + Interactive vocabulary replacement cards (Original word -> Higher band academic collocations).
    - **Grammatical Range & Accuracy:** Syntactic variety analysis + Inline error highlights and suggested corrections.
  - Actionable "Top 3 Priorities for Improvement" summary.
  - Side-by-side comparison with the Seeded Model Essay (Band 8.0+).

---

## 2. Structured AI Feedback Contract

```json
{
  "overallBand": 6.5,
  "criteria": {
    "taskResponse": {
      "band": 6.5,
      "feedback": "Addresses all parts of the prompt, though some main ideas could be more fully developed."
    },
    "coherenceCohesion": {
      "band": 7.0,
      "feedback": "Clear paragraphing and logical progression throughout. Effective use of cohesive devices."
    },
    "lexicalResource": {
      "band": 6.0,
      "feedback": "Adequate range of vocabulary with some minor inaccuracies in word choice and collocation.",
      "suggestions": [
        { "original": "a big problem", "suggestion": "a pressing issue / significant challenge", "context": "Paragraph 1" },
        { "original": "people think", "suggestion": "it is widely contended that", "context": "Paragraph 2" }
      ]
    },
    "grammaticalRange": {
      "band": 6.5,
      "feedback": "Mix of simple and complex sentence forms. Good grammatical control with occasional errors.",
      "corrections": [
        { "original": "If governments will invest", "corrected": "If governments invest", "rule": "First conditional subordinate clause" }
      ]
    }
  },
  "keyImprovements": [
    "Develop body paragraph 2 with more concrete real-world evidence.",
    "Eliminate repetitive basic conjunctions in favor of varied adverbial linkers."
  ]
}
```

---

## 3. Acceptance Criteria

- [ ] Essay submission executes Semantic Kernel prompt with RAG band descriptors and returns valid JSON matching the contract schema.
- [ ] Word counter updates in real time without lag during continuous typing.
- [ ] Feedback UI renders all 4 criterion band scores, explanations, grammar corrections, and lexical upgrade suggestions.
- [ ] Historical submissions are stored and accessible via user profile.
