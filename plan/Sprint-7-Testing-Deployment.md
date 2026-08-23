# Sprint 7: Automated Testing, Production Hardening & Deployment

- **Duration:** 4 days
- **Objective:** Establish rigorous automated test coverage across critical application pipelines, finalize Docker production packaging, execute live cloud deployment, and produce polished demonstration media.

---

## 1. Scope & Deliverables

### Automated Testing Suite (xUnit + Moq + FluentAssertions)
- [ ] **Unit Test Coverage (Target: >= 80% on Core Business Logic):**
  - `SpacedRepetitionServiceTests`: Validate exact calculation of intervals, repetition counts, and EaseFactor bounds across all 0–5 quality grades.
  - `IeltsScoringTests`: Validate raw score to band conversion for Reading and Listening across boundary thresholds.
  - `WritingEvaluationParserTests`: Validate JSON Schema parsing, criteria breakdown extraction, and resilience against malformed LLM responses.
  - `AuthHandlerTests`: Test registration uniqueness, password hashing, and refresh token rotation mechanics.
- [ ] **Integration Test Suite (WebApplicationFactory + Respawn):**
  - `AuthControllerTests`: Verify end-to-end register -> login -> refresh token lifecycle.
  - `ReadingControllerTests`: Verify passage retrieval with Redis cache hit verification and submit flow.
  - `WritingControllerTests`: Verify submission workflow with mocked AI completion service.

---

### Production Hardening & Optimization
- [ ] Optimize backend multi-stage `Dockerfile` (distroless/chiseled ASP.NET runtime image for minimal attack surface and image size).
- [ ] Optimize frontend production build with Vite bundle analyzer (split heavy vendor chunks: Recharts, Lucide, Radix primitives).
- [ ] Configure response compression (Gzip/Brotli) and security headers (CSP, HSTS, X-Content-Type-Options) in `Program.cs`.
- [ ] Audit and optimize database queries using EF Core compiled queries and `.AsNoTracking()` projections where appropriate.

---

### Deployment & Showcase Assets
- [ ] Setup production deployment pipeline on target hosting (Azure Container Apps / Render / Railway).
- [ ] Verify live endpoints, database migrations, and Redis connectivity in staging/production environment.
- [ ] Record high-resolution GIF / WebP walkthroughs demonstrating:
  - Interactive Writing Editor + Instant AI Grading.
  - Split-screen Reading session with auto-scoring.
  - Flashcard 3D Spaced Repetition session.
  - Interactive Dashboard with Radar Chart & Study Streak.
- [ ] Finalize `README.md` with live demo badge, architecture badges, and video links.

---

## 2. Verification Commands

```bash
# Execute entire test suite with detailed output
dotnet test tests/EduSphere.UnitTests/ --verbosity normal

# Run integration tests
dotnet test tests/EduSphere.IntegrationTests/ --verbosity normal

# Validate production Docker Compose build
docker compose -f docker-compose.yml build --no-cache
```

---

## 3. Acceptance Criteria

- [ ] All automated unit and integration tests pass with 100% success rate.
- [ ] Production Docker image builds cleanly without warnings.
- [ ] Live deployed application URL is publicly accessible and fully functional.
- [ ] Repository documentation reflects complete features with visual proof of implementation.
