# EduSphere Architecture Documentation

- **System:** EduSphere — AI-Powered IELTS Preparation Platform
- **Style:** Clean Architecture (Onion Architecture), CQRS, Event-Driven Primitives, RAG Vector Search
- **Framework:** .NET 8 (ASP.NET Core Web API) & React 18 (TypeScript)

---

## 1. Architectural Style & Principles

EduSphere follows the **Clean Architecture** paradigm, establishing strict boundaries between enterprise domain logic and external infrastructure/delivery mechanisms.

```mermaid
graph TD
    subgraph Presentation ["Presentation Layer"]
        Client["React 18 + TypeScript Client"]
        API["EduSphere.API (Controllers, Hubs, Middlewares)"]
    end

    subgraph Core ["Core Layers (Pure C# Business Logic)"]
        Application["EduSphere.Application (CQRS Commands, Queries, Behaviors)"]
        Domain["EduSphere.Domain (Entities, Value Objects, Domain Events)"]
    end

    subgraph Infrastructure ["Infrastructure Layer"]
        Infra["EduSphere.Infrastructure (EF Core 8, Redis, Qdrant, Semantic Kernel)"]
    end

    subgraph External ["External Services & Data Stores"]
        SQL[("SQL Server 2022")]
        Redis[("Redis 7 (Distributed Cache)")]
        Qdrant[("Qdrant (Vector Database)")]
        OpenAI["OpenAI GPT-4o (LLM & Embeddings)"]
    end

    Client -->|HTTPS REST / SSE / WSS| API
    API --> Application
    Application --> Domain
    Infra -->|Implements Interfaces| Application
    Infra --> SQL
    Infra --> Redis
    Infra --> Qdrant
    Infra --> OpenAI
    API --> Infra
```

### Core Dependency Rules
1. **Domain Layer:** Outermost independence; contains zero external NuGet dependencies. All business entities, value objects, and domain events live here.
2. **Application Layer:** Depends exclusively on Domain. Houses use-case orchestration (CQRS), domain interfaces, pipeline behaviors, and business validation.
3. **Infrastructure Layer:** Implements interfaces defined in the Application layer (e.g., `IApplicationDbContext`, `ICacheService`, `IVectorStoreService`, `IAiGradingService`).
4. **API Layer:** Entry point for HTTP requests and WebSocket connections; configures Dependency Injection, middleware, and authentication.

---

## 2. Key Design Patterns & Technical Workflows

### 2.1 CQRS (Command Query Responsibility Segregation) & MediatR Pipeline

All business operations are separated into **Commands** (state modifications) and **Queries** (read-only operations):

```mermaid
sequenceDiagram
    autonumber
    actor Client as React Client
    participant API as API Controller
    participant Pipe as MediatR Pipeline
    participant Val as ValidationBehavior
    participant Log as LoggingBehavior
    participant Handler as Command/Query Handler
    participant Infra as Infrastructure (EF Core / Redis)

    Client->>API: HTTP Request (e.g., SubmitWritingCommand)
    API->>Pipe: Send(command)
    Pipe->>Val: Intercept & Validate (FluentValidation)
    alt Validation Failed
        Val-->>API: Throw ValidationException (RFC 7807 400 Bad Request)
    else Validation Succeeded
        Val->>Log: Intercept & Start Stopwatch
        Log->>Handler: Handle(command, cancellationToken)
        Handler->>Infra: Execute Business Logic
        Infra-->>Handler: Return Entity / DTO
        Handler-->>Log: Return Result<T>
        Log-->>Pipe: Log execution time (ms)
        Pipe-->>API: Return Result<T>
        API-->>Client: HTTP 200 OK / 201 Created
    end
```

---

### 2.2 Retrieval-Augmented Generation (RAG) AI Evaluation Engine

The Writing and Speaking evaluation pipeline utilizes **Semantic Kernel** combined with **Qdrant Vector Database** to ground LLM grading in official British Council / IDP IELTS Band Descriptors:

```mermaid
flowchart LR
    subgraph OfflineIndex ["1. Rubric Ingestion Pipeline"]
        Rubrics["IELTS Band Descriptors (Task 1, Task 2, Speaking)"] --> Chunker["Text Chunker (500 tokens)"]
        Chunker --> Embedder["OpenAI text-embedding-3-small"]
        Embedder --> VectorDB[("Qdrant Vector Store: ielts-writing-rubrics")]
    end

    subgraph OnlineEval ["2. Real-Time AI Grading Pipeline"]
        StudentEssay["Student Essay Submission"] --> QdrantQuery["Semantic Similarity Search"]
        VectorDB -->|Retrieve Top-K Rubrics| QdrantQuery
        QdrantQuery --> PromptBuilder["Build Structured Examiner Prompt"]
        StudentEssay --> PromptBuilder
        PromptBuilder --> LLM["OpenAI GPT-4o via Semantic Kernel"]
        LLM --> JSONParser["JSON Schema Validator"]
        JSONParser --> FeedbackDTO["Structured WritingFeedback DTO (4 Criteria)"]
    end
```

---

### 2.3 Cache-Aside Pattern with Redis

High-frequency read queries (e.g., Reading passage catalogs, vocabulary decks, user dashboard metrics) implement the **Cache-Aside pattern**:

```mermaid
flowchart TD
    Req["GetReadingPassagesQuery"] --> CheckCache{"Exists in Redis Cache?"}
    CheckCache -- Yes (Cache Hit) --> ReturnCached["Deserialize & Return Cached DTO (< 20ms)"]
    CheckCache -- No (Cache Miss) --> QueryDB["Query SQL Server via EF Core (.AsNoTracking)"]
    QueryDB --> SetCache["Store in Redis (TTL = 10 mins)"]
    SetCache --> ReturnData["Return Fresh DTO"]
```

---

### 2.4 Spaced Repetition Engine (SuperMemo SM-2)

The vocabulary module implements the algorithmic formula:
$$EF' = EF + (0.1 - (5 - q) \times (0.08 + (5 - q) \times 0.02))$$
where:
- $EF$ (Ease Factor) has a floor of $1.3$.
- $q$ is the user recall quality grade ($0$ to $5$).
- Interval progression: $I(1) = 1\text{ day}$, $I(2) = 6\text{ days}$, $I(n) = I(n-1) \times EF'$.

---

## 3. Technology Stack Reference

| Tier | Technology | Purpose |
| :--- | :--- | :--- |
| **Presentation (Web)** | React 18, TypeScript, Vite, Tailwind CSS v4, shadcn/ui | Modern, responsive, type-safe user interface |
| **API Framework** | ASP.NET Core 8 Web API | High-throughput, asynchronous REST endpoints |
| **Architecture / Mediator** | MediatR 12 | In-process messaging for CQRS decoupling |
| **Validation** | FluentValidation 11 | Strongly typed declarative validation rules |
| **ORM** | Entity Framework Core 8 | Object-relational mapping, migrations, LINQ |
| **Relational Database** | Microsoft SQL Server 2022 | ACID-compliant persistent relational storage |
| **Distributed Cache** | Redis 7 (StackExchange.Redis) | Sub-millisecond distributed in-memory cache |
| **Vector Database** | Qdrant | Dense vector index for semantic similarity search |
| **AI Orchestration** | Microsoft Semantic Kernel | AI prompt management, connectors, function calling |
| **Logging & Diagnostics** | Serilog, OpenTelemetry Health Checks | Structured logging and real-time health monitoring |
| **Testing** | xUnit, Moq, FluentAssertions, Respawn | Unit and integration test automation suites |
