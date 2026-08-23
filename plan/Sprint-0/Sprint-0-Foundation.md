# Sprint 0: Solution Foundation, Infrastructure & CI/CD Pipeline
## Chi Tiết Kế Hoạch Triển Khai Kỹ Thuật (Technical Execution Blueprint)

- **Thời gian thực hiện:** 3 ngày
- **Mục tiêu cốt lõi:** Thiết lập nền tảng giải pháp **Clean Architecture (.NET 8)** chuẩn Enterprise, cấu hình hạ tầng containerized (**SQL Server 2022, Redis 7, Qdrant Vector DB**), cài đặt pipeline xử lý trung gian (**MediatR, FluentValidation, Serilog, RFC 7807 Middleware**) và tự động hóa quy trình tích hợp liên tục (**GitHub Actions CI**).
- **Trạng thái:** Ready for Execution (Sẵn sàng triển khai)

---

## 1. Cấu Trúc Solution & Phân Tách Projects

### 1.1 Danh sách Projects và Vai trò

```
EduSphere.sln
│
├── src/
│   ├── EduSphere.Domain/               (Class Library - .NET 8)
│   │   └── 🎯 Trọng tâm: Core Entities, Value Objects, Enums, Domain Events, Base Types
│   │   └── ⚠️ Ràng buộc: Không phụ thuộc vào bất kỳ framework hoặc external library nào.
│   │
│   ├── EduSphere.Application/          (Class Library - .NET 8)
│   │   └── 🎯 Trọng tâm: Use Cases (CQRS Commands/Queries), Interfaces, Behaviors, Models (Result<T>)
│   │   └── 📦 Dependencies: EduSphere.Domain, MediatR, FluentValidation
│   │
│   ├── EduSphere.Infrastructure/       (Class Library - .NET 8)
│   │   └── 🎯 Trọng tâm: Data Access (EF Core 8), Redis Caching, Qdrant Vector Store, AI Services
│   │   └── 📦 Dependencies: EduSphere.Application, EF Core SqlServer, StackExchange.Redis, SemanticKernel
│   │
│   ├── EduSphere.API/                  (ASP.NET Core Web API - .NET 8)
│   │   └── 🎯 Trọng tâm: Controllers, Middleware, Hubs, Swagger Configuration, Composition Root
│   │   └── 📦 Dependencies: EduSphere.Infrastructure, EduSphere.Application, Serilog
│   │
│   └── EduSphere.Shared/               (Class Library - .NET 8)
│       └── 🎯 Trọng tâm: Shared DTOs, Constants, Common Utility Helpers
│
└── tests/
    ├── EduSphere.UnitTests/            (xUnit Test Project - .NET 8)
    │   └── 🎯 Trọng tâm: Unit tests cho Domain logic, Validation, CQRS Handlers, SM-2 Algorithm
    │
    └── EduSphere.IntegrationTests/     (xUnit Test Project - .NET 8)
        └── 🎯 Trọng tâm: WebApplicationFactory integration tests cho API endpoints & Database
```

### 1.2 Lệnh CLI Khởi tạo Solution & References

```bash
# 1. Tạo Solution
dotnet new sln -n EduSphere

# 2. Tạo các Projects trong thư mục src/
dotnet new classlib -n EduSphere.Domain -o src/EduSphere.Domain
dotnet new classlib -n EduSphere.Application -o src/EduSphere.Application
dotnet new classlib -n EduSphere.Infrastructure -o src/EduSphere.Infrastructure
dotnet new webapi -n EduSphere.API -o src/EduSphere.API --no-openapi
dotnet new classlib -n EduSphere.Shared -o src/EduSphere.Shared

# 3. Tạo các Test Projects trong thư mục tests/
dotnet new xunit -n EduSphere.UnitTests -o tests/EduSphere.UnitTests
dotnet new xunit -n EduSphere.IntegrationTests -o tests/EduSphere.IntegrationTests

# 4. Thêm tất cả Projects vào Solution
dotnet sln add src/EduSphere.Domain/EduSphere.Domain.csproj
dotnet sln add src/EduSphere.Application/EduSphere.Application.csproj
dotnet sln add src/EduSphere.Infrastructure/EduSphere.Infrastructure.csproj
dotnet sln add src/EduSphere.API/EduSphere.API.csproj
dotnet sln add src/EduSphere.Shared/EduSphere.Shared.csproj
dotnet sln add tests/EduSphere.UnitTests/EduSphere.UnitTests.csproj
dotnet sln add tests/EduSphere.IntegrationTests/EduSphere.IntegrationTests.csproj

# 5. Cấu hình Project References tuân thủ Clean Architecture
dotnet add src/EduSphere.Application reference src/EduSphere.Domain
dotnet add src/EduSphere.Application reference src/EduSphere.Shared

dotnet add src/EduSphere.Infrastructure reference src/EduSphere.Application

dotnet add src/EduSphere.API reference src/EduSphere.Infrastructure
dotnet add src/EduSphere.API reference src/EduSphere.Application

dotnet add tests/EduSphere.UnitTests reference src/EduSphere.Application
dotnet add tests/EduSphere.UnitTests reference src/EduSphere.Domain

dotnet add tests/EduSphere.IntegrationTests reference src/EduSphere.API
```

---

## 2. Quản Lý Package Dependencies (NuGet Packages)

| Project | Package Name | Version | Mục đích sử dụng |
| :--- | :--- | :--- | :--- |
| **EduSphere.Application** | `MediatR` | `12.4.x` | CQRS Command / Query Dispatcher |
| | `FluentValidation.DependencyInjectionExtensions` | `11.9.x` | Tự động quét và thực thi validation rules |
| | `Microsoft.Extensions.Logging.Abstractions` | `8.0.x` | Trừu tượng hóa logging trong Application pipeline |
| **EduSphere.Infrastructure** | `Microsoft.EntityFrameworkCore.SqlServer` | `8.0.x` | ORM kết nối cơ sở dữ liệu SQL Server |
| | `Microsoft.EntityFrameworkCore.Tools` | `8.0.x` | Công cụ CLI cho EF Core Migrations |
| | `Microsoft.Extensions.Caching.StackExchangeRedis` | `8.0.x` | Triển khai `IDistributedCache` qua Redis |
| | `Microsoft.SemanticKernel` | `1.x` | Framework điều phối AI (OpenAI LLM & Prompts) |
| | `Microsoft.SemanticKernel.Connectors.Qdrant` | `1.x` | Connector kết nối Vector Database Qdrant |
| | `BCrypt.Net-Next` | `4.0.x` | Mã hóa băm mật khẩu một chiều an toàn |
| | `System.IdentityModel.Tokens.Jwt` | `8.0.x` | Tạo và giải mã JWT Access/Refresh tokens |
| **EduSphere.API** | `Serilog.AspNetCore` | `8.0.x` | Structured Logging (Console + File sinks) |
| | `Serilog.Sinks.File` | `5.0.x` | Ghi log ra file có xoay vòng (rolling logs) |
| | `Swashbuckle.AspNetCore` | `6.6.x` | Tự động sinh Swagger/OpenAPI documentation |
| | `Microsoft.AspNetCore.Authentication.JwtBearer`| `8.0.x` | Middleware xác thực JWT Bearer token |
| | `AspNetCore.HealthChecks.SqlServer` | `8.0.x` | Health check probe cho SQL Server |
| | `AspNetCore.HealthChecks.Redis` | `8.0.x` | Health check probe cho Redis cache |
| | `AspNetCore.HealthChecks.UI.Client` | `8.0.x` | Format JSON phản hồi chi tiết cho `/health` |
| **EduSphere.UnitTests** | `Moq` | `4.20.x` | Mocking framework cho interfaces |
| | `FluentAssertions` | `6.12.x` | Bổ trợ assert kiểm thử dễ đọc, tường minh |
| **EduSphere.IntegrationTests**| `Microsoft.AspNetCore.Mvc.Testing` | `8.0.x` | Khởi chạy In-Memory Web Server kiểm thử API |
| | `Respawn` | `6.2.x` | Reset trạng thái database nhanh chóng giữa các tests |

---

## 3. Chi Tiết Các Thành Phần Cốt Lõi Cần Code Trong Sprint 0

### 3.1 Domain Base Classes (`EduSphere.Domain/Common/`)

- **`BaseEntity.cs`**:
  ```csharp
  namespace EduSphere.Domain.Common;

  public abstract class BaseEntity
  {
      public Guid Id { get; protected set; } = Guid.NewGuid();
      public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
      public DateTime? UpdatedAt { get; set; }
      public bool IsDeleted { get; set; } = false;
  }
  ```

- **`IDomainEvent.cs` & `BaseAuditableEntity.cs`**: Chuẩn bị sẵn abstraction cho Domain Events.

---

### 3.2 Application Core Primitives (`EduSphere.Application/Common/`)

- **`Result<T>.cs` Pattern** (Xử lý kết quả nghiệp vụ tường minh, loại bỏ throw Exception vô tội vạ):
  ```csharp
  namespace EduSphere.Application.Common.Models;

  public class Result<T>
  {
      public bool IsSuccess { get; }
      public T? Value { get; }
      public Error? Error { get; }

      protected Result(T value)
      {
          IsSuccess = true;
          Value = value;
          Error = null;
      }

      protected Result(Error error)
      {
          IsSuccess = false;
          Value = default;
          Error = error;
      }

      public static Result<T> Success(T value) => new(value);
      public static Result<T> Failure(Error error) => new(error);
  }

  public record Error(string Code, string Message);
  ```

- **`PagedList<T>.cs`**:
  ```csharp
  namespace EduSphere.Application.Common.Models;

  public class PagedList<T>
  {
      public IReadOnlyCollection<T> Items { get; }
      public int PageNumber { get; }
      public int PageSize { get; }
      public int TotalCount { get; }
      public int TotalPages => (int)Math.Ceiling(TotalCount / (double)PageSize);
      public bool HasPreviousPage => PageNumber > 1;
      public bool HasNextPage => PageNumber < TotalPages;

      public PagedList(IReadOnlyCollection<T> items, int count, int pageNumber, int pageSize)
      {
          Items = items;
          TotalCount = count;
          PageNumber = pageNumber;
          PageSize = pageSize;
      }
  }
  ```

---

### 3.3 MediatR Pipeline Behaviors (`EduSphere.Application/Common/Behaviors/`)

- **`ValidationBehavior<TRequest, TResponse>`**:
  - Tự động bắt mọi `IValidator<TRequest>` trước khi Request vào đến Handler.
  - Nếu có lỗi, ném ra `ValidationException` chứa danh sách chi tiết các trường bị lỗi.

- **`LoggingBehavior<TRequest, TResponse>`**:
  - Ghi log tên Request, UserId (nếu có), payload và đo đếm chính xác thời gian thực thi (Stopwatch).
  - Tự động cảnh báo `LogWarning` nếu thời gian xử lý của Request vượt quá ngưỡng `500ms`.

---

### 3.4 API Middleware & Error Handling (`EduSphere.API/Middleware/`)

- **`ExceptionHandlingMiddleware.cs`**:
  - Bắt toàn bộ unhandled exceptions trong toàn bộ request pipeline.
  - Phân loại lỗi:
    - `ValidationException` -> Trả về `400 Bad Request` với danh sách lỗi chi tiết theo trường.
    - `UnauthorizedAccessException` -> Trả về `401 Unauthorized`.
    - `KeyNotFoundException` -> Trả về `404 Not Found`.
    - Unhandled Exception khác -> Ghi log lỗi `LogError` kèm StackTrace và trả về `500 Internal Server Error` chuẩn **RFC 7807 Problem Details** (ẩn thông tin nhạy cảm ở Production).

---

### 3.5 Swagger / OpenAPI Configuration (`EduSphere.API/Extensions/`)

- Cấu hình Swagger Security Definition cho **JWT Bearer**:
  - Cho phép lập trình viên paste chuỗi `Bearer {token}` vào Swagger UI để test trực tiếp tất cả các API có gắn attribute `[Authorize]`.
  - Thiết lập API metadata: Title, Version (`v1`), Description, Contact info.

---

### 3.6 Dependency Injection Extensions

- **`EduSphere.Application/DependencyInjection.cs`**:
  ```csharp
  public static class DependencyInjection
  {
      public static IServiceCollection AddApplication(this IServiceCollection services)
      {
          var assembly = typeof(DependencyInjection).Assembly;
          services.AddMediatR(cfg => {
              cfg.RegisterServicesFromAssembly(assembly);
              cfg.AddBehavior(typeof(IPipelineBehavior<,>), typeof(ValidationBehavior<,>));
              cfg.AddBehavior(typeof(IPipelineBehavior<,>), typeof(LoggingBehavior<,>));
          });
          services.AddValidatorsFromAssembly(assembly);
          return services;
      }
  }
  ```

- **`EduSphere.Infrastructure/DependencyInjection.cs`**: Đăng ký EF Core DbContext, Redis Cache, Qdrant Client, JWT Token generator.

- **`EduSphere.API/Program.cs`**: Kết nối toàn bộ cấu hình, cấu hình Serilog, CORS chính sách (`AllowSpecificOrigins`), HealthCheck endpoints, và Middleware pipeline theo thứ tự chuẩn xác.

---

## 4. Cấu Hình Hạ Tầng Docker & Containerization

### 4.1 File `docker-compose.yml` (Local Environment)

```yaml
version: '3.8'

services:
  # 1. SQL Server 2022
  sqlserver:
    image: mcr.microsoft.com/mssql/server:2022-latest
    container_name: edusphere_sqlserver
    restart: always
    environment:
      ACCEPT_EULA: "Y"
      SA_PASSWORD: "EduSphere@2026StrongPass!"
      MSSQL_PID: "Developer"
    ports:
      - "1433:1433"
    volumes:
      - edusphere_sql_data:/var/opt/mssql
    healthcheck:
      test: ["CMD-SHELL", "/opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P EduSphere@2026StrongPass! -Q 'SELECT 1' || exit 1"]
      interval: 10s
      timeout: 5s
      retries: 5

  # 2. Redis 7
  redis:
    image: redis:7-alpine
    container_name: edusphere_redis
    restart: always
    ports:
      - "6379:6379"
    volumes:
      - edusphere_redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  # 3. Qdrant Vector Database
  qdrant:
    image: qdrant/qdrant:latest
    container_name: edusphere_qdrant
    restart: always
    ports:
      - "6333:6333" # HTTP REST API
      - "6334:6334" # gRPC API
    volumes:
      - edusphere_qdrant_data:/qdrant/storage
    healthcheck:
      test: ["CMD-SHELL", "timeout 5 bash -c 'cat < /dev/null > /dev/tcp/localhost/6333' || exit 1"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  edusphere_sql_data:
  edusphere_redis_data:
  edusphere_qdrant_data:
```

### 4.2 File `src/EduSphere.API/Dockerfile` (Multi-stage Production Build)

```dockerfile
# Stage 1: Build & Publish
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app

# Copy csproj files and restore dependencies
COPY ["src/EduSphere.Domain/EduSphere.Domain.csproj", "src/EduSphere.Domain/"]
COPY ["src/EduSphere.Application/EduSphere.Application.csproj", "src/EduSphere.Application/"]
COPY ["src/EduSphere.Infrastructure/EduSphere.Infrastructure.csproj", "src/EduSphere.Infrastructure/"]
COPY ["src/EduSphere.Shared/EduSphere.Shared.csproj", "src/EduSphere.Shared/"]
COPY ["src/EduSphere.API/EduSphere.API.csproj", "src/EduSphere.API/"]

RUN dotnet restore "src/EduSphere.API/EduSphere.API.csproj"

# Copy source code and build release
COPY . .
WORKDIR "/app/src/EduSphere.API"
RUN dotnet publish "EduSphere.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Stage 2: Runtime Image (Optimized & Non-root user)
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
EXPOSE 8080
EXPOSE 8081

COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "EduSphere.API.dll"]
```

---

## 5. Cấu Hình CI/CD Pipeline (`.github/workflows/ci.yml`)

```yaml
name: Continuous Integration (CI)

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  build-and-test:
    name: Build & Run Automated Tests
    runs-on: ubuntu-latest

    services:
      sqlserver:
        image: mcr.microsoft.com/mssql/server:2022-latest
        env:
          ACCEPT_EULA: "Y"
          SA_PASSWORD: "EduSphere@2026StrongPass!"
        ports:
          - 1433:1433

      redis:
        image: redis:7-alpine
        ports:
          - 6379:6379

    steps:
      - name: Checkout Source Code
        uses: actions/checkout@v4

      - name: Setup .NET 8 SDK
        uses: actions/setup-dotnet@v4
        with:
          dotnet-version: '8.0.x'

      - name: Restore NuGet Dependencies
        run: dotnet restore EduSphere.sln

      - name: Build Solution
        run: dotnet build EduSphere.sln --no-restore --configuration Release

      - name: Run Unit Tests
        run: dotnet test tests/EduSphere.UnitTests/EduSphere.UnitTests.csproj --no-build --configuration Release --verbosity normal

      - name: Verify Docker Compose Configuration
        run: docker compose config
```

---

## 6. Danh Mục Công Việc Chi Tiết & Checklists (Task Breakdown)

### Ngày 1: Khởi tạo Solution, Project References & Domain/Application Core
- [ ] Khởi tạo file Solution và 5 Projects (`Domain`, `Application`, `Infrastructure`, `API`, `Shared`).
- [ ] Cấu hình Project References chuẩn Clean Architecture.
- [ ] Cài đặt toàn bộ NuGet packages cho các project.
- [ ] Thiết lập `BaseEntity`, `IDomainEvent` trong tầng `Domain`.
- [ ] Thiết lập `Result<T>`, `Error`, `PagedList<T>` trong tầng `Application`.
- [ ] Cài đặt MediatR Pipeline Behaviors: `ValidationBehavior` và `LoggingBehavior`.

### Ngày 2: Hạ Tầng Infrastructure, Middleware, Serilog & Swagger
- [ ] Cấu hình Serilog (Console sink với định dạng màu sắc, File sink xoay vòng ngày).
- [ ] Viết `ExceptionHandlingMiddleware` chuẩn RFC 7807 Problem Details.
- [ ] Cấu hình Swagger UI kèm Bearer Authentication.
- [ ] Cấu hình Dependency Injection cho tầng Application và Infrastructure.
- [ ] Cấu hình `HealthChecks` cho SQL Server, Redis và endpoint `/health`.
- [ ] Cấu hình `appsettings.json` và `appsettings.Development.json`.

### Ngày 3: Docker Compose, Multi-stage Dockerfile & CI Pipeline
- [ ] Viết `docker-compose.yml` gồm SQL Server 2022, Redis 7, Qdrant Vector DB có Healthcheck probes.
- [ ] Viết multi-stage `Dockerfile` cho `EduSphere.API`.
- [ ] Chạy thử `docker compose up -d` và kiểm tra kết nối giữa API với các dịch vụ.
- [ ] Tạo file workflow `.github/workflows/ci.yml`.
- [ ] Tạo file `.editorconfig` chuẩn hóa code style (.NET 8 file-scoped namespaces, nullable reference types).
- [ ] Tạo Unit Test mẫu xác nhận `ValidationBehavior` và `Result<T>` hoạt động chính xác.

---

## 7. Tiêu Chí Nghiệm Thu Sprint 0 (Acceptance Criteria)

1. **Build & Compiling:** Lệnh `dotnet build EduSphere.sln` chạy thành công với `0 Errors` và `0 Warnings`.
2. **Infrastructure Verification:** Lệnh `docker compose up -d` khởi chạy thành công cả 3 containers (`sqlserver`, `redis`, `qdrant`) với trạng thái `healthy`.
3. **Swagger Interface:** Truy cập `http://localhost:5000/swagger` hiển thị Swagger UI đầy đủ metadata và nút "Authorize" hỗ trợ nhập JWT Token.
4. **Health Check Probe:** Truy cập `http://localhost:5000/health` trả về mã `200 OK` với thông tin trạng thái chi tiết của SQL Server và Redis.
5. **Error Handling:** Gửi request không hợp lệ vào API kích hoạt đúng `ValidationBehavior` và trả về mã `400 Bad Request` dạng RFC 7807 Problem Details.
6. **CI Pipeline Pass:** GitHub Actions build và test thành công trên cả nhánh `develop` và `main`.
