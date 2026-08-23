# EduSphere Engineering & Coding Conventions

This document establishes the code quality, architectural constraints, and naming conventions for the **EduSphere** codebase.

---

## 1. C# & .NET 8 Guidelines

### 1.1 Language Features
- **File-Scoped Namespaces:** Always use file-scoped namespaces to reduce indentation.
  ```csharp
  namespace EduSphere.Application.Features.Reading.Queries;
  ```
- **Nullable Reference Types:** Enabled project-wide (`<Nullable>enable</Nullable>`). Explicitly handle nullability; avoid unchecked dereferencing (`!`).
- **Pattern Matching & Switch Expressions:** Preferred for clear condition branching.
- **Records:** Use `record` or `readonly record struct` for immutable DTOs, Commands, Queries, and Value Objects.

### 1.2 Naming Conventions
- **Classes, Records, Interfaces, Methods, Properties:** `PascalCase` (e.g., `SubmitWritingCommandHandler`, `IApplicationDbContext`, `BandScore`).
- **Parameters, Local Variables, Private Fields:** `camelCase` (e.g., `cancellationToken`, `wordCount`).
- **Private Readonly Injected Fields:** Prefixed with underscore `_camelCase` (e.g., `_context`, `_cacheService`).
- **Constants:** `UPPER_SNAKE_CASE` or `PascalCase` within static classes.

### 1.3 Clean Architecture & CQRS Rules
- **No Domain Logic in Controllers:** Controllers must be thin, merely dispatching commands/queries to MediatR:
  ```csharp
  [HttpPost("submit")]
  public async Task<IActionResult> Submit([FromBody] SubmitWritingCommand command, CancellationToken ct)
      => Ok(await Mediator.Send(command, ct));
  ```
- **Return `Result<T>` for Business Flow:** Do not throw exceptions for predicted validation or business rule violations. Use `Result.Success(value)` or `Result.Failure(error)`.
- **Validation Pipeline:** All request validation must reside in dedicated FluentValidation classes (`AbstractValidator<TCommand>`).

---

## 2. TypeScript & React Guidelines

### 2.1 Code Organization
- **Feature-Based Architecture:** Group components, hooks, API calls, and types by business domain (`features/reading`, `features/writing`, `features/vocabulary`).
- **Type Safety (Strict Mode):** Never use `any`. Always declare explicit TypeScript interfaces/types for props, API responses, and form states.
- **Components:** Functional components with typed props interfaces:
  ```tsx
  interface BandScoreCardProps {
    overallBand: number;
    criteria: WritingCriteria;
  }

  export const BandScoreCard: React.FC<BandScoreCardProps> = ({ overallBand, criteria }) => {
    // ...
  };
  ```
- **UI Primitives:** Use `@/components/ui/` (`shadcn/ui`) primitives. Avoid writing raw ad-hoc CSS for standard buttons, modals, or inputs.

---

## 3. Git & Commit Conventions (Conventional Commits)

Commit messages must follow the **Conventional Commits** specification:

```
<type>(<scope>): <short description>
```

### Commit Types
- `feat`: A new user-facing feature (e.g., `feat(writing): add Semantic Kernel RAG grading pipeline`).
- `fix`: A bug fix (e.g., `fix(reading): resolve off-by-one error in band score calculation`).
- `refactor`: Code restructuring without functional changes (e.g., `refactor(auth): extract token generator to JwtService`).
- `test`: Adding or updating test suites (e.g., `test(vocab): add unit tests for SM-2 interval progression`).
- `docs`: Documentation updates (e.g., `docs(api): update OpenAPI spec for listening endpoints`).
- `chore`: Build scripts, dependencies, configuration (e.g., `chore(docker): update SQL Server image to 2022-latest`).

---

## 4. Branching Strategy

- `main`: Production-ready, deployable codebase.
- `develop`: Integration branch for active sprint development.
- `feat/<sprint-number>-<feature-name>`: Feature branches (e.g., `feat/sprint-4-writing-ai-grading`).
- `fix/<issue-name>`: Bug fix branches.
- Pull Requests require CI pipeline pass and at least 1 code review approval before merging into `develop`.
