# Kế Hoạch Thực Hiện Sprint 0: Solution Foundation, Infrastructure & CI/CD

Thiết lập nền tảng giải pháp **Clean Architecture (.NET 8)** chuẩn Enterprise, cấu hình hạ tầng containerized (**SQL Server 2022, Redis 7, Qdrant Vector DB**), cài đặt pipeline xử lý trung gian (**MediatR, FluentValidation, Serilog, RFC 7807 Middleware**) và tự động hóa quy trình tích hợp liên tục (**GitHub Actions CI**).

---

## User Review Required

> [!IMPORTANT]
> **Các quyết định kỹ thuật cốt lõi trong Sprint 0:**
> 1. **Framework & SDK:** Sử dụng `.NET 8 SDK` LTS, C# 12 với `Nullable Reference Types` và `File-scoped namespaces`.
> 2. **Clean Architecture Rules:** Phân định rõ 5 projects `src/` và 2 projects `tests/`. Tầng `Domain` hoàn toàn độc lập không chứa dependency bên ngoài.
> 3. **Error Handling Strategy:** Sử dụng **Result Pattern (`Result<T>`)** cho các logic nghiệp vụ dự đoán được; sử dụng **`ExceptionHandlingMiddleware`** chuyển đổi toàn bộ unhandled exceptions thành chuẩn **RFC 7807 Problem Details**.
> 4. **Hạ tầng Local:** Toàn bộ 3 dịch vụ phụ thuộc (SQL Server, Redis, Qdrant) được khởi tạo qua Docker Compose với Healthcheck probes tích hợp.

---

## Proposed Changes

### 1. Solution & Clean Architecture Projects

Khởi tạo cấu trúc solution và thiết lập dependency references một chiều chuẩn Clean Architecture.

#### [NEW] [EduSphere.sln](file:///Users/nguyenvanminhtam/EduSphere/EduSphere.sln)
- Solution container chứa tất cả 7 projects.

#### [NEW] [EduSphere.Domain.csproj](file:///Users/nguyenvanminhtam/EduSphere/src/EduSphere.Domain/EduSphere.Domain.csproj)
- Class Library (.NET 8) - Chứa Base types, Entities, Enums, Value Objects (Zero dependencies).

#### [NEW] [EduSphere.Application.csproj](file:///Users/nguyenvanminhtam/EduSphere/src/EduSphere.Application/EduSphere.Application.csproj)
- Class Library (.NET 8) - Chứa CQRS use cases, interfaces, behaviors.
- Dependencies: `MediatR` (12.4), `FluentValidation.DependencyInjectionExtensions` (11.9), `Microsoft.Extensions.Logging.Abstractions`. Reference: `EduSphere.Domain`, `EduSphere.Shared`.

#### [NEW] [EduSphere.Infrastructure.csproj](file:///Users/nguyenvanminhtam/EduSphere/src/EduSphere.Infrastructure/EduSphere.Infrastructure.csproj)
- Class Library (.NET 8) - Chứa Data Access, Caching, External integrations.
- Dependencies: `Microsoft.EntityFrameworkCore.SqlServer` (8.0), `Microsoft.Extensions.Caching.StackExchangeRedis` (8.0), `Microsoft.SemanticKernel` (1.x), `BCrypt.Net-Next` (4.0). Reference: `EduSphere.Application`.

#### [NEW] [EduSphere.API.csproj](file:///Users/nguyenvanminhtam/EduSphere/src/EduSphere.API/EduSphere.API.csproj)
- Web API (.NET 8) - Presentation layer, Controllers, Middleware, Swagger, Composition root.
- Dependencies: `Serilog.AspNetCore` (8.0), `Swashbuckle.AspNetCore` (6.6), `Microsoft.AspNetCore.Authentication.JwtBearer` (8.0), `AspNetCore.HealthChecks.SqlServer` (8.0), `AspNetCore.HealthChecks.Redis` (8.0). Reference: `EduSphere.Infrastructure`, `EduSphere.Application`.

#### [NEW] [EduSphere.Shared.csproj](file:///Users/nguyenvanminhtam/EduSphere/src/EduSphere.Shared/EduSphere.Shared.csproj)
- Class Library (.NET 8) - Shared DTOs, constants, common contracts.

#### [NEW] [EduSphere.UnitTests.csproj](file:///Users/nguyenvanminhtam/EduSphere/tests/EduSphere.UnitTests/EduSphere.UnitTests.csproj)
- xUnit Test Project (.NET 8) - Dependencies: `xunit`, `Moq`, `FluentAssertions`. Reference: `EduSphere.Application`, `EduSphere.Domain`.

#### [NEW] [EduSphere.IntegrationTests.csproj](file:///Users/nguyenvanminhtam/EduSphere/tests/EduSphere.IntegrationTests/EduSphere.IntegrationTests.csproj)
- xUnit Test Project (.NET 8) - Dependencies: `Microsoft.AspNetCore.Mvc.Testing`, `Respawn`. Reference: `EduSphere.API`.

---

### 2. Domain & Application Core Primitives

#### [NEW] [BaseEntity.cs](file:///Users/nguyenvanminhtam/EduSphere/src/EduSphere.Domain/Common/BaseEntity.cs)
- Lớp trừu tượng cơ sở: `Id` (Guid), `CreatedAt` (DateTime UTC), `UpdatedAt` (DateTime? UTC), `IsDeleted` (bool).

#### [NEW] [Result.cs & Error.cs](file:///Users/nguyenvanminhtam/EduSphere/src/EduSphere.Application/Common/Models/Result.cs)
- Pattern `Result<T>` và `Error` record định dạng kết quả thực thi nghiệp vụ rõ ràng (Success / Failure).

#### [NEW] [PagedList.cs](file:///Users/nguyenvanminhtam/EduSphere/src/EduSphere.Application/Common/Models/PagedList.cs)
- Generic model cho dữ liệu phân trang: `Items`, `PageNumber`, `PageSize`, `TotalCount`, `TotalPages`, `HasNextPage`, `HasPreviousPage`.

#### [NEW] [ValidationBehavior.cs](file:///Users/nguyenvanminhtam/EduSphere/src/EduSphere.Application/Common/Behaviors/ValidationBehavior.cs)
- MediatR Pipeline Behavior tự động bắt và thực thi tất cả `IValidator<TRequest>` trước khi chuyển vào Handler.

#### [NEW] [LoggingBehavior.cs](file:///Users/nguyenvanminhtam/EduSphere/src/EduSphere.Application/Common/Behaviors/LoggingBehavior.cs)
- MediatR Pipeline Behavior ghi log Request name, đo thời gian thực thi (ms) và cảnh báo khi request vượt quá 500ms.

#### [NEW] [Application DependencyInjection.cs](file:///Users/nguyenvanminhtam/EduSphere/src/EduSphere.Application/DependencyInjection.cs)
- Extension method `AddApplication(this IServiceCollection services)` đăng ký MediatR, Behaviors và FluentValidation.

---

### 3. API Layer, Middleware & Configuration

#### [NEW] [ExceptionHandlingMiddleware.cs](file:///Users/nguyenvanminhtam/EduSphere/src/EduSphere.API/Middleware/ExceptionHandlingMiddleware.cs)
- Global exception middleware bắt toàn bộ unhandled exceptions, format theo chuẩn RFC 7807 Problem Details:
  - `ValidationException` -> `400 Bad Request`
  - `UnauthorizedAccessException` -> `401 Unauthorized`
  - `KeyNotFoundException` -> `404 Not Found`
  - Generic Exceptions -> `500 Internal Server Error`

#### [NEW] [SwaggerExtensions.cs](file:///Users/nguyenvanminhtam/EduSphere/src/EduSphere.API/Extensions/SwaggerExtensions.cs)
- Cấu hình Swagger/OpenAPI tích hợp `Bearer JWT SecurityDefinition` cho phép nhập token test API trên Swagger UI.

#### [NEW] [Infrastructure DependencyInjection.cs](file:///Users/nguyenvanminhtam/EduSphere/src/EduSphere.Infrastructure/DependencyInjection.cs)
- Extension method `AddInfrastructure(this IServiceCollection services, IConfiguration config)`.

#### [NEW] [Program.cs](file:///Users/nguyenvanminhtam/EduSphere/src/EduSphere.API/Program.cs)
- Composition Root: Cấu hình Serilog, CORS, HealthChecks endpoint (`/health`), Middlewares pipeline theo đúng thứ tự.

#### [NEW] [appsettings.json & appsettings.Development.json](file:///Users/nguyenvanminhtam/EduSphere/src/EduSphere.API/appsettings.json)
- Cấu hình Connection Strings (SQL Server, Redis), Qdrant URL, JWT settings và Serilog logging levels.

---

### 4. Containerization & CI/CD Pipeline

#### [NEW] [docker-compose.yml](file:///Users/nguyenvanminhtam/EduSphere/docker-compose.yml)
- Cấu hình các dịch vụ local:
  - `sqlserver` (MSSQL 2022) - Port 1433 + Healthcheck probe + Volume
  - `redis` (Redis 7 Alpine) - Port 6379 + Healthcheck probe + Volume
  - `qdrant` (Qdrant Vector DB) - Ports 6333/6334 + Healthcheck probe + Volume

#### [NEW] [Dockerfile](file:///Users/nguyenvanminhtam/EduSphere/src/EduSphere.API/Dockerfile)
- Multi-stage build Dockerfile cho `EduSphere.API` (Build stage với .NET SDK 8.0 -> Runtime stage với ASP.NET 8.0 non-root).

#### [NEW] [.env.example](file:///Users/nguyenvanminhtam/EduSphere/.env.example) & [.dockerignore](file:///Users/nguyenvanminhtam/EduSphere/.dockerignore)
- Template cấu hình môi trường và loại trừ file rác khi build Docker.

#### [NEW] [.editorconfig](file:///Users/nguyenvanminhtam/EduSphere/.editorconfig)
- Quy chuẩn định dạng code C# 12 / .NET 8 (file-scoped namespaces, nullable reference types, tab size 4).

#### [NEW] [.github/workflows/ci.yml](file:///Users/nguyenvanminhtam/EduSphere/.github/workflows/ci.yml)
- GitHub Actions CI pipeline: Trigger khi push/PR -> Checkout -> Setup .NET 8 -> Restore -> Build Release -> Run Unit Tests -> Validate Docker config.

---

### 5. Verification Unit Tests

#### [NEW] [ResultTests.cs](file:///Users/nguyenvanminhtam/EduSphere/tests/EduSphere.UnitTests/Common/ResultTests.cs)
- Kiểm thử các trạng thái của `Result<T>`: Success, Failure, Error mapping.

#### [NEW] [ValidationBehaviorTests.cs](file:///Users/nguyenvanminhtam/EduSphere/tests/EduSphere.UnitTests/Behaviors/ValidationBehaviorTests.cs)
- Kiểm thử `ValidationBehavior` ném ra `ValidationException` khi request không hợp lệ và cho qua khi hợp lệ.

---

## Verification Plan

### Automated Tests
```bash
# 1. Restore & Build Solution
dotnet restore EduSphere.sln
dotnet build EduSphere.sln --no-restore --configuration Release

# 2. Chạy toàn bộ Unit Tests
dotnet test tests/EduSphere.UnitTests/EduSphere.UnitTests.csproj --verbosity normal

# 3. Kiểm tra định dạng code
dotnet format --verify-no-changes EduSphere.sln
```

### Manual Verification
1. **Kiểm tra Docker Infrastructure:**
   ```bash
   docker compose up -d
   docker compose ps
   ```
   *Xác nhận cả 3 containers (`sqlserver`, `redis`, `qdrant`) đều có trạng thái `healthy`.*
2. **Kiểm tra Swagger UI:**
   - Chạy `dotnet run --project src/EduSphere.API`
   - Mở `http://localhost:5000/swagger` $\rightarrow$ Xác nhận Swagger UI hiển thị đầy đủ và có nút "Authorize" cho Bearer token.
3. **Kiểm tra Health Checks:**
   - Mở `http://localhost:5000/health` $\rightarrow$ Xác nhận trả về `200 OK` với trạng thái `Healthy` cho SQL Server và Redis.
