# EduSphere REST API Documentation

- **Base URL:** `https://api.edusphere.io/api` (Production) / `http://localhost:5000/api` (Local Dev)
- **Specification:** OpenAPI 3.0 / Swagger UI at `/swagger`
- **Authentication:** Bearer JWT Token (`Authorization: Bearer <token>`)
- **Content-Type:** `application/json`

---

## 1. Global Response Standards & Error Handling

### 1.1 Success Response Wrapper
Successful queries and commands return standard JSON payloads with appropriate HTTP status codes (`200 OK`, `201 Created`, `204 No Content`).

### 1.2 RFC 7807 Problem Details (Error Format)
All validation errors and unhandled exceptions are converted to standardized RFC 7807 Problem Details:

```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.1",
  "title": "Validation Error",
  "status": 400,
  "detail": "One or more validation errors occurred.",
  "instance": "/api/auth/register",
  "errors": {
    "Email": ["The email address is already in use."],
    "Password": ["Password must contain at least one uppercase letter and one digit."]
  }
}
```

---

## 2. API Endpoints Catalog

### 2.1 Authentication & Profile (`/api/auth`)

| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register a new user account |
| `POST` | `/api/auth/login` | Public | Authenticate credentials, return JWT & Refresh tokens |
| `POST` | `/api/auth/refresh-token` | Public | Rotate refresh token and issue new access token |
| `GET` | `/api/auth/me` | Bearer | Get current authenticated user profile |
| `PUT` | `/api/auth/target-score` | Bearer | Update user's target IELTS band score |

#### Sample: `POST /api/auth/login`
```json
// Request
{
  "email": "student@edusphere.io",
  "password": "SecurePassword123!"
}

// Response: 200 OK
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
  "expiresAt": "2026-08-24T00:30:00Z",
  "user": {
    "id": "c1a2b3c4-d5e6-7f8a-9b0c-1d2e3f4a5b6c",
    "fullName": "Nguyen Van A",
    "email": "student@edusphere.io",
    "role": "Student",
    "targetBandScore": 7.5
  }
}
```

---

### 2.2 Reading Practice (`/api/reading`)

| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/reading/passages` | Bearer | Get paginated list of passages (filters: topic, difficulty) |
| `GET` | `/api/reading/passages/{id}` | Bearer | Get full passage content, questions, and duration |
| `POST` | `/api/reading/passages/{id}/submit` | Bearer | Submit answers, calculate raw score & IELTS band score |
| `GET` | `/api/reading/history` | Bearer | Get past reading attempts and longitudinal performance |

#### Sample: `POST /api/reading/passages/{id}/submit`
```json
// Request
{
  "durationSeconds": 1140,
  "answers": [
    { "questionId": "q1-guid", "userAnswer": "TRUE" },
    { "questionId": "q2-guid", "userAnswer": "NOT GIVEN" },
    { "questionId": "q3-guid", "userAnswer": "B" },
    { "questionId": "q4-guid", "userAnswer": "solar radiation" }
  ]
}

// Response: 200 OK
{
  "attemptId": "att-guid",
  "rawScore": 32,
  "totalQuestions": 40,
  "bandScore": 7.0,
  "completedAt": "2026-08-24T01:15:00Z",
  "breakdown": [
    {
      "questionId": "q1-guid",
      "orderIndex": 1,
      "userAnswer": "TRUE",
      "correctAnswer": "TRUE",
      "isCorrect": true,
      "explanation": "Paragraph 2 explicitly states that temperature fluctuations increased."
    }
  ]
}
```

---

### 2.3 Listening Practice (`/api/listening`)

| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/listening/tests` | Bearer | Get list of listening tests with section counts and audio metadata |
| `GET` | `/api/listening/tests/{id}` | Bearer | Get test details, questions, and secure audio stream URL |
| `POST` | `/api/listening/tests/{id}/submit` | Bearer | Submit answers, auto-grade, return score & transcript |
| `GET` | `/api/listening/history` | Bearer | Get user's listening attempt history |

---

### 2.4 Writing Practice & AI Evaluation (`/api/writing`)

| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/writing/prompts` | Bearer | Get catalog of writing prompts (filters: Task1/Task2, topic) |
| `GET` | `/api/writing/prompts/{id}` | Bearer | Get prompt instructions, chart image URL, and model answer |
| `POST` | `/api/writing/submit` | Bearer | Submit essay text; triggers Semantic Kernel RAG grading |
| `GET` | `/api/writing/submissions/{id}/feedback` | Bearer | Get detailed 4-criteria AI evaluation and corrections |
| `GET` | `/api/writing/history` | Bearer | Get past writing submissions and band score progression |

#### Sample: `POST /api/writing/submit`
```json
// Request
{
  "promptId": "prompt-guid",
  "content": "In recent years, the consumption of renewable energy has increased significantly across urban areas...",
  "timeSpentSeconds": 2340
}

// Response: 200 OK
{
  "submissionId": "sub-guid",
  "wordCount": 285,
  "overallBand": 7.0,
  "criteria": {
    "taskResponse": {
      "band": 7.0,
      "feedback": "Covers all parts of the prompt with a clear position throughout. Main ideas are supported with relevant explanations."
    },
    "coherenceCohesion": {
      "band": 7.5,
      "feedback": "Logical sequencing of paragraphs with well-chosen transitional expressions (Furthermore, Conversely)."
    },
    "lexicalResource": {
      "band": 6.5,
      "feedback": "Good vocabulary range. Occasional lack of natural collocation.",
      "suggestions": [
        { "original": "a big increase", "suggestion": "a substantial surge / dramatic escalation", "context": "Paragraph 1" },
        { "original": "good effect", "suggestion": "favorable outcome / profound impact", "context": "Paragraph 3" }
      ]
    },
    "grammaticalRange": {
      "band": 7.0,
      "feedback": "Frequent error-free complex sentences (conditionals, relative clauses).",
      "corrections": []
    }
  },
  "keyImprovements": [
    "Refine precision in academic noun collocations to elevate Lexical Resource to Band 8.0.",
    "Elaborate counter-arguments in paragraph 3 more extensively."
  ]
}
```

---

### 2.5 Speaking Practice (`/api/speaking`)

| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/speaking/topics` | Bearer | Get list of topics grouped by Part (1, 2, 3) |
| `GET` | `/api/speaking/topics/{id}` | Bearer | Get cue card details, bullet points, follow-ups |
| `POST` | `/api/speaking/submit` | Bearer | Submit speech transcript/audio; receive AI fluency & lexical rating |
| `GET` | `/api/speaking/history` | Bearer | Get user's speaking practice records |

---

### 2.6 Vocabulary & Spaced Repetition (`/api/vocabulary`)

| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/vocabulary/due` | Bearer | Get list of cards scheduled for review today (`NextReview <= Now`) |
| `POST` | `/api/vocabulary/review` | Bearer | Submit SM-2 review rating (`0–5`), update interval and EaseFactor |
| `POST` | `/api/vocabulary/add` | Bearer | Add a new word to personal deck (from reading or manual) |
| `GET` | `/api/vocabulary/collections` | Bearer | Browse curated topic collections (Academic Word List) |

#### Sample: `POST /api/vocabulary/review`
```json
// Request
{
  "userVocabularyId": "uv-guid",
  "quality": 4 // 0=Again, 3=Hard, 4=Good, 5=Easy
}

// Response: 200 OK
{
  "userVocabularyId": "uv-guid",
  "easeFactor": 2.5,
  "intervalDays": 6,
  "repetitionCount": 2,
  "nextReviewDate": "2026-08-30T00:00:00Z"
}
```

---

### 2.7 AI Tutor & RAG (`/api/ai-tutor`)

| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/ai-tutor/ask` | Bearer | Submit academic inquiry; returns SSE streaming token response |
| `GET` | `/api/ai-tutor/history` | Bearer | Get past conversation turns and study recommendations |

---

### 2.8 Dashboard Analytics & Mock Test (`/api/dashboard`, `/api/mock-test`)

| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/dashboard` | Bearer | Aggregate metrics: Overall Band, Streak, Radar balance, activity |
| `POST` | `/api/mock-test/start` | Bearer | Initialize a timed mock test session (Reading + Writing) |
| `POST` | `/api/mock-test/submit` | Bearer | Submit mock test; generate comprehensive Diagnostic Score Report |
| `GET` | `/api/mock-test/history`| Bearer | Get historical full mock test attempts |
