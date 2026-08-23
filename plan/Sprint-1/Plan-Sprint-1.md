# Kế Hoạch Thực Hiện Sprint 1: Authentication, Authorization & Frontend Foundation

Xây dựng hệ thống định danh bảo mật toàn diện (**JWT 15 phút + Refresh Token 7 ngày Rotation, BCrypt, RBAC, EF Core 8**) phía Backend và khởi tạo nền tảng giao diện người dùng hiện đại (**React 18 + TypeScript + Vite + Tailwind CSS v4 + shadcn/ui**) phía Frontend với **Axios 401 Silent Token Refresh**, **AuthContext**, **Application Shell** (Collapsible Sidebar, Header, Dark/Light Mode) và các màn hình **Login / Register**.

---

## User Review Required

> [!IMPORTANT]
> **Các quyết định kỹ thuật cốt lõi trong Sprint 1:**
> 1. **Cơ chế Token Lifecycle:** Cấp phát cặp **Access Token (15 phút)** mang Claims (`UserId`, `Email`, `FullName`, `Role`) và **Refresh Token (7 ngày)** được sinh ngẫu nhiên an toàn mã hóa qua `RandomNumberGenerator` và xoay vòng (Rotation) mỗi lần cấp phát mới để chống tấn công replay.
> 2. **Axios Silent Token Refresh (Frontend):** Thiết lập Interceptors chặn lỗi `401 Unauthorized`, đưa các request song song vào hàng đợi `failedQueue`, gọi endpoint `/api/auth/refresh-token` làm mới token trong suốt (silent refresh) và retry lại toàn bộ request mà không ngắt quãng phiên người dùng.
> 3. **Cấu trúc Thư mục Frontend:** Ứng dụng React 18 đặt hoàn toàn trong `frontend/` theo cấu trúc Module/Feature-based (`features/auth`, `features/dashboard`, `shared/components`, `shared/context`, `shared/lib`).
> 4. **Database Migration:** Tạo `ApplicationDbContext` với EF Core 8 Fluent API ánh xạ Entity `User` (Index Unique Email) và thực thi migration `InitialCreate_Users`.

---

## Proposed Changes

### 1. Backend: Domain Layer

#### [NEW] [UserRole.cs](file:///Users/nguyenvanminhtam/EduSphere/backend/src/EduSphere.Domain/Enums/UserRole.cs)
- Enum phân quyền người dùng: `Student` (mặc định), `Admin`.

#### [NEW] [Email.cs](file:///Users/nguyenvanminhtam/EduSphere/backend/src/EduSphere.Domain/ValueObjects/Email.cs)
- Value Object đóng gói logic kiểm tra định dạng email và so sánh bất biến.

#### [NEW] [User.cs](file:///Users/nguyenvanminhtam/EduSphere/backend/src/EduSphere.Domain/Entities/User.cs)
- Entity người dùng kế thừa `BaseEntity`:
  - `FullName` (string), `Email` (string), `PasswordHash` (string)
  - `Role` (UserRole), `TargetBandScore` (float?)
  - `RefreshToken` (string?), `RefreshTokenExpiryTime` (DateTime?)
  - Phương thức nghiệp vụ: `SetRefreshToken()`, `RevokeRefreshToken()`, `UpdateTargetBandScore()`.

---

### 2. Backend: Application Layer (CQRS & Contracts)

#### [NEW] [IApplicationDbContext.cs](file:///Users/nguyenvanminhtam/EduSphere/backend/src/EduSphere.Application/Common/Interfaces/IApplicationDbContext.cs)
- Interface trừu tượng hóa `DbSet<User>` và `SaveChangesAsync(CancellationToken)`.

#### [NEW] [IJwtService.cs](file:///Users/nguyenvanminhtam/EduSphere/backend/src/EduSphere.Application/Common/Interfaces/IJwtService.cs)
- Interface tạo Access Token, Refresh Token và giải mã Claims từ expired token.

#### [NEW] [Auth Models & DTOs](file:///Users/nguyenvanminhtam/EduSphere/backend/src/EduSphere.Application/Features/Auth/Models/AuthResponse.cs)
- `AuthResponse.cs`: `AccessToken`, `RefreshToken`, `ExpiresAt`, `UserDto`.
- `UserDto.cs`: `Id`, `FullName`, `Email`, `Role`, `TargetBandScore`.

#### [NEW] [Register Flow](file:///Users/nguyenvanminhtam/EduSphere/backend/src/EduSphere.Application/Features/Auth/Commands/Register/RegisterCommand.cs)
- `RegisterCommand.cs`: `FullName`, `Email`, `Password`, `TargetBandScore`.
- `RegisterCommandValidator.cs`: Kiểm tra Email hợp lệ, độ mạnh mật khẩu (ít nhất 8 ký tự, chữ hoa, chữ số, ký tự đặc biệt), TargetBandScore (0.0 đến 9.0).
- `RegisterCommandHandler.cs`: Kiểm tra email trùng lặp, băm mật khẩu qua BCrypt, tạo User, sinh Token và trả về `Result<AuthResponse>`.

#### [NEW] [Login Flow](file:///Users/nguyenvanminhtam/EduSphere/backend/src/EduSphere.Application/Features/Auth/Commands/Login/LoginCommand.cs)
- `LoginCommand.cs`: `Email`, `Password`.
- `LoginCommandValidator.cs`: Bắt buộc Email và Password.
- `LoginCommandHandler.cs`: Xác thực mật khẩu qua BCrypt, sinh cặp Token mới, lưu Refresh Token vào database.

#### [NEW] [RefreshToken Flow](file:///Users/nguyenvanminhtam/EduSphere/backend/src/EduSphere.Application/Features/Auth/Commands/RefreshToken/RefreshTokenCommand.cs)
- `RefreshTokenCommand.cs`: `RefreshToken`.
- `RefreshTokenCommandHandler.cs`: Kiểm tra tính hợp lệ và thời hạn Refresh Token, xoay vòng tạo Refresh Token mới và cập nhật database.

#### [NEW] [GetProfile & UpdateTargetScore](file:///Users/nguyenvanminhtam/EduSphere/backend/src/EduSphere.Application/Features/Auth/Queries/GetProfile/GetProfileQuery.cs)
- `GetProfileQuery.cs` & `GetProfileQueryHandler.cs`: Lấy thông tin User theo UserId từ Claims.
- `UpdateTargetScoreCommand.cs` & `UpdateTargetScoreCommandHandler.cs`: Cập nhật mục tiêu điểm.

---

### 3. Backend: Infrastructure Layer (EF Core & Security Services)

#### [NEW] [UserConfiguration.cs](file:///Users/nguyenvanminhtam/EduSphere/backend/src/EduSphere.Infrastructure/Data/Configurations/UserConfiguration.cs)
- Fluent API: Ánh xạ bảng `Users`, khóa chính `Id`, trường bắt buộc, chỉ mục duy nhất `IX_Users_Email` có lọc `IsDeleted = 0`.

#### [NEW] [ApplicationDbContext.cs](file:///Users/nguyenvanminhtam/EduSphere/backend/src/EduSphere.Infrastructure/Data/ApplicationDbContext.cs)
- EF Core DbContext triển khai `IApplicationDbContext`, đăng ký `DbSet<User>`, áp dụng `IEntityTypeConfiguration` từ assembly.

#### [NEW] [PasswordHasher.cs & IPasswordHasher.cs](file:///Users/nguyenvanminhtam/EduSphere/backend/src/EduSphere.Infrastructure/Services/PasswordHasher.cs)
- Triển khai thuật toán băm an toàn qua `BCrypt.Net-Next`.

#### [NEW] [JwtService.cs](file:///Users/nguyenvanminhtam/EduSphere/backend/src/EduSphere.Infrastructure/Services/JwtService.cs)
- Sinh JWT ký bằng thuật toán `HmacSha256` với khóa bí mật từ `appsettings.json`. Sinh Refresh Token bằng `RandomNumberGenerator`.

#### [MODIFY] [Infrastructure DependencyInjection.cs](file:///Users/nguyenvanminhtam/EduSphere/backend/src/EduSphere.Infrastructure/DependencyInjection.cs)
- Đăng ký `ApplicationDbContext` (SQL Server), `IPasswordHasher`, `IJwtService`.

---

### 4. Backend: API Layer

#### [NEW] [AuthController.cs](file:///Users/nguyenvanminhtam/EduSphere/backend/src/EduSphere.API/Controllers/AuthController.cs)
- Controller kế thừa `ApiControllerBase` xử lý các endpoint:
  - `POST /api/auth/register` (Public) -> 201 Created
  - `POST /api/auth/login` (Public) -> 200 OK
  - `POST /api/auth/refresh-token` (Public) -> 200 OK
  - `GET /api/auth/me` [Authorize] -> 200 OK
  - `PUT /api/auth/target-score` [Authorize] -> 200 OK

#### [MODIFY] [Program.cs](file:///Users/nguyenvanminhtam/EduSphere/backend/src/EduSphere.API/Program.cs)
- Cấu hình `JwtBearerAuthentication` với `TokenValidationParameters` (ValidateIssuer, ValidateAudience, ValidateLifetime, ValidateIssuerSigningKey, ClockSkew = TimeSpan.Zero).

---

### 5. Frontend: React 18, TypeScript, Tailwind v4 & shadcn/ui

#### [NEW] [frontend/ Architecture & Config](file:///Users/nguyenvanminhtam/EduSphere/frontend/package.json)
- Khởi tạo React + Vite + TypeScript.
- Cấu hình Tailwind CSS v4, path aliases `@/*` trong `vite.config.ts` và `tsconfig.json`.
- Cài đặt shadcn/ui components (`button`, `card`, `input`, `label`, `dropdown-menu`, `avatar`, `badge`, `skeleton`, `toast`).

#### [NEW] [Axios Client with 401 Queue](file:///Users/nguyenvanminhtam/EduSphere/frontend/src/shared/lib/axios.ts)
- `axiosInstance` tự động inject `Bearer <token>` vào request header.
- Response interceptor bắt lỗi 401, quản lý hàng đợi `failedQueue` để refresh token tự động và gửi lại request.

#### [NEW] [AuthContext & ThemeContext](file:///Users/nguyenvanminhtam/EduSphere/frontend/src/shared/context/AuthContext.tsx)
- `AuthContext.tsx` & `useAuth.ts`: Quản lý `user`, `isAuthenticated`, `login()`, `register()`, `logout()`.
- `ThemeContext.tsx` & `useTheme.ts`: Quản lý `dark` / `light` mode class trên `document.documentElement`.

#### [NEW] [Application Shell](file:///Users/nguyenvanminhtam/EduSphere/frontend/src/shared/components/Layout.tsx)
- `Sidebar.tsx`: Thanh điều hướng bên trái có nút thu gọn/mở rộng, 8 mục điều hướng (Dashboard, Reading, Listening, Writing, Speaking, Vocabulary, Mock Test, AI Tutor).
- `Header.tsx`: Thanh tiêu đề trên cùng với breadcrumbs, huy hiệu Target Band Score, `ThemeToggle.tsx` và User Avatar Dropdown.
- `ProtectedRoute.tsx`: Route guard tự động chuyển hướng về `/login` nếu chưa xác thực.

#### [NEW] [Auth Pages & Forms](file:///Users/nguyenvanminhtam/EduSphere/frontend/src/features/auth/pages/LoginPage.tsx)
- `LoginPage.tsx` & `LoginForm.tsx`: Đăng nhập với email/mật khẩu, xử lý validation và hiển thị lỗi API.
- `RegisterPage.tsx` & `RegisterForm.tsx`: Đăng ký với chọn mục tiêu Band Score (5.0 - 9.0).
- `DashboardPage.tsx`: Trang Dashboard tạm thời xác nhận đăng nhập thành công.

---

### 6. Automated Unit Tests

#### [NEW] [RegisterCommandHandlerTests.cs](file:///Users/nguyenvanminhtam/EduSphere/backend/tests/EduSphere.UnitTests/Features/Auth/RegisterCommandHandlerTests.cs)
- Kiểm thử đăng ký thành công, kiểm thử từ chối khi email đã tồn tại.

#### [NEW] [LoginCommandHandlerTests.cs](file:///Users/nguyenvanminhtam/EduSphere/backend/tests/EduSphere.UnitTests/Features/Auth/LoginCommandHandlerTests.cs)
- Kiểm thử đăng nhập thành công, kiểm thử sai mật khẩu, kiểm thử tài khoản không tồn tại.

#### [NEW] [JwtServiceTests.cs](file:///Users/nguyenvanminhtam/EduSphere/backend/tests/EduSphere.UnitTests/Services/JwtServiceTests.cs)
- Kiểm thử sinh token chứa đúng Claims và Refresh Token có định dạng Base64 hợp lệ.

---

## Verification Plan

### Automated Tests
```bash
# 1. Backend Build & Test Suite
export PATH="$HOME/.dotnet:$PATH"
cd /Users/nguyenvanminhtam/EduSphere/backend
dotnet build EduSphere.sln --configuration Release
dotnet test EduSphere.sln --verbosity normal

# 2. Frontend Type Check & Build
cd /Users/nguyenvanminhtam/EduSphere/frontend
npm run build
```

### Manual Verification
1. **Kiểm tra API Swagger:**
   - Chạy Backend API `dotnet run --project backend/src/EduSphere.API`.
   - Test đăng ký tài khoản mới qua `POST /api/auth/register` $\rightarrow$ Nhận được Access Token và Refresh Token.
   - Test đăng nhập qua `POST /api/auth/login`.
   - Nhập token vào Swagger Authorize $\rightarrow$ Gọi `GET /api/auth/me` thành công.
2. **Kiểm tra Frontend UI:**
   - Chạy `npm run dev` trong `frontend/`.
   - Mở `http://localhost:5173/login` $\rightarrow$ Thử đăng nhập tài khoản vừa tạo.
   - Kiểm tra chuyển hướng vào Dashboard, thanh Sidebar thu gọn/mở rộng, nút Dark/Light mode hoạt động.
   - Thử reload trang $\rightarrow$ Xác nhận trạng thái đăng nhập được duy trì.
   - Bấm Logout $\rightarrow$ Xác nhận chuyển hướng về màn hình Login.
