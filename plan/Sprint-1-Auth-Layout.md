# Sprint 1: Authentication, Authorization & Frontend Foundation

- **Duration:** 1 week
- **Objective:** Implement secure identity management (JWT + Refresh Token rotation, RBAC) and construct the modern React + TypeScript + shadcn/ui frontend foundation with responsive shell and theme controls.

---

## 1. Scope & Deliverables

### Backend
- [ ] **Domain Layer:**
  - `User` entity (Id, FullName, Email, PasswordHash, Role, RefreshToken, RefreshTokenExpiryTime, TargetBandScore).
  - `UserRole` enum (`Student`, `Admin`).
  - `Email` value object with regex format validation.
- [ ] **Infrastructure Layer:**
  - `ApplicationDbContext` with EF Core Fluent API mapping for `User`.
  - Initial EF Core Migration (`InitialCreate_Users`).
  - `JwtService` implementing `IJwtService` (Access Token generation, Refresh Token rotation).
  - Password hashing service using `BCrypt.Net-Next`.
- [ ] **Application Layer (CQRS):**
  - `RegisterCommand` + Handler + Validator (check email uniqueness, enforce password complexity).
  - `LoginCommand` + Handler + Validator (validate credentials, return tokens).
  - `RefreshTokenCommand` + Handler (validate and rotate tokens).
  - `GetProfileQuery` + Handler.
  - `UpdateTargetScoreCommand` + Handler.
- [ ] **API Layer:**
  - `AuthController` with endpoints:
    - `POST /api/auth/register`
    - `POST /api/auth/login`
    - `POST /api/auth/refresh-token`
    - `GET /api/auth/me` [Authorize]
    - `PUT /api/auth/target-score` [Authorize]
  - JWT Authentication & Role-based Authorization middleware.

### Frontend
- [ ] Initialize React 18 application with Vite and TypeScript (Strict Mode).
- [ ] Configure Tailwind CSS v4 and initialize `shadcn/ui`.
- [ ] Install and configure core packages: `lucide-react`, `react-router-dom`, `@tanstack/react-query`, `axios`.
- [ ] Setup Axios instance with Request/Response interceptors (auto-attach JWT, handle 401 token refresh queue).
- [ ] Implement `AuthContext` and custom hooks `useAuth()`.
- [ ] Build Application Shell:
  - Collapsible Sidebar with links (Dashboard, Reading, Listening, Writing, Speaking, Vocabulary, Mock Test, AI Tutor).
  - Header with User Profile dropdown and Dark/Light Mode toggle.
  - `ProtectedRoute` and `AdminRoute` wrappers.
- [ ] Build Authentication Pages:
  - Login Page (shadcn Card, Form, Input, Button, loading states).
  - Register Page (Role selection, Target Band Score picker).

---

## 2. API Contracts

### `POST /api/auth/login`
```json
// Request
{
  "email": "student@edusphere.io",
  "password": "StrongPassword123!"
}

// Response: 200 OK
{
  "accessToken": "eyJhbGciOi...",
  "refreshToken": "d8f92a34...",
  "expiresAt": "2026-08-24T00:15:00Z",
  "user": {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "fullName": "Tam Nguyen",
    "email": "student@edusphere.io",
    "role": "Student",
    "targetBandScore": 7.5
  }
}
```

---

## 3. Acceptance Criteria

- [ ] New users can successfully register and login; credentials are safely hashed.
- [ ] Access token expiration triggers silent refresh via `/api/auth/refresh-token` without interrupting user session.
- [ ] Protected routes redirect unauthenticated users to `/login`.
- [ ] Responsive navigation shell renders cleanly on desktop, tablet, and mobile breakpoints.
