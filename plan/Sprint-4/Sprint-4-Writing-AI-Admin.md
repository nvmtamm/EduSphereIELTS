# Sprint 4: Writing AI Evaluator & Role Admin Backoffice Suite

- **Duration:** 1 week
- **Objectives:** 
  1. **IELTS Writing AI Evaluator:** Module luyện viết IELTS Writing (Task 1 & Task 2) với trình soạn thảo Tiptap đếm số từ thời gian thực, tích hợp bộ chấm điểm AI chuẩn 4 tiêu chí IELTS Band Descriptors sử dụng **Microsoft Semantic Kernel + Qdrant Vector Search (RAG)** và AI Tutor chat tương tác qua **`@assistant-ui/react`**.
  2. **Role Admin & Backoffice Management Suite:** Xây dựng phân hệ quản trị dành riêng cho Role **Admin** (`[Authorize(Roles = "Admin")]`), bao gồm Quản trị học viên (User Management), Quản trị ngân hàng đề thi 3 kỹ năng (Exam Bank Manager), và Bảng giám sát chỉ số hệ thống & AI (System & AI Observability Dashboard) bằng **`@tanstack/react-table`** và **`recharts`**.

---

## 1. Công Nghệ & Thư Viện Chuyên Biệt Áp Dụng (Specialized Tech Stack)

| Thư Viện / Công Nghệ | Phân Hệ Áp Dụng | Mục Đích Sử Dụng Trong Sprint 4 |
| :--- | :--- | :--- |
| **`@tiptap/react`** | Writing AI | **IELTS Writing Rich Editor:** Trình soạn thảo văn bản học thuật với Live Word Count (đếm từ thời gian thực; thanh tiến độ đạt 150 từ cho Task 1 và 250 từ cho Task 2), spellchecker, inline highlight câu lỗi. |
| **`@assistant-ui/react`** | Writing AI | **Interactive AI Writing Grader Chat:** Luồng hội thoại tương tác sâu sau khi chấm bài (học viên trao đổi trực tiếp với AI Examiner, đề xuất viết lại câu nâng band dạng streaming). |
| **`react-resizable-panels`** | Writing AI | **Split-Screen Exam Layout:** Màn hình chia đôi co giãn mượt mà: Bên trái hiển thị đề bài/biểu đồ Task 1 hoặc câu hỏi Task 2; Bên phải là trình soạn thảo Tiptap. |
| **`@tanstack/react-table`** | Role Admin | **Admin Data Tables:** Bảng quản trị học viên & ngân hàng đề thi với phân trang server-side, lọc nâng cao theo vai trò/trạng thái, tìm kiếm tức thì và tùy biến cột hiển thị. |
| **`Microsoft.SemanticKernel`** | Writing AI | **AI Orchestration:** Điều phối luồng chấm điểm 4 tiêu chí, prompt engineering cấu trúc hóa JSON và kết nối Vector Store. |
| **`Qdrant Vector DB`** | Writing AI & Admin | **RAG Knowledge Base:** Lưu trữ và truy xuất theo độ tương đồng ngữ nghĩa toàn bộ Band Descriptors IELTS chính thức và ngân hàng bài văn mẫu Band 8.5+. |
| **`recharts`** | Writing AI & Admin | **Analytics & Radar Visualization:** Biểu đồ Radar 4 tiêu chí chấm điểm Writing và biểu đồ phân bổ điểm số, thống kê hoạt động người dùng trong Admin Portal. |

---

## 2. Scope & Deliverables

### Phân Hệ 1: IELTS Writing AI Evaluator & Semantic Kernel RAG Engine

#### Backend (.NET 8 Clean Architecture)
- [ ] **Vector Database & RAG Knowledge Base:**
  - Nhúng (Embeddings) toàn bộ **IELTS Band Descriptors chính thức** (Task 1 Academic & Task 2) vào **Qdrant Vector DB**.
  - Xây dựng Semantic Kernel RAG Plugin trích xuất chính xác tiêu chuẩn chấm theo từng Task và Topic.
- [ ] **AI Scoring Engine:**
  - Đánh giá tự động theo chuẩn Cambridge IELTS 4 tiêu chí:
    1. **Task Achievement / Task Response** (0.0 - 9.0)
    2. **Coherence and Cohesion** (0.0 - 9.0)
    3. **Lexical Resource** (0.0 - 9.0)
    4. **Grammatical Range and Accuracy** (0.0 - 9.0)
  - Tính Overall Band Score theo quy tắc làm tròn chính thức (0.25 / 0.75).
  - Phân tích chi tiết câu sai ngữ pháp + Đề xuất phiên bản viết lại (Paraphrase) nâng cao Band 8.0+.
- [ ] **Domain & CQRS Handlers:**
  - Entity `WritingPrompt` (TaskType: Task1/Task2, Topic, PromptText, ImageUrl, SampleBand8Answer).
  - Entity `WritingSubmission` (UserId, PromptId, Content, WordCount, OverallBand, CriteriaScoresJson, FeedbackJson).
  - `GetWritingPromptsQuery`, `GetWritingPromptByIdQuery`.
  - `SubmitWritingForAiEvaluationCommand` + Handler.
  - `ChatWithWritingAiTutorCommand` (Server-Sent Events streaming).
- [ ] **REST Endpoints (`WritingController`):**
  - `GET /api/writing/prompts`
  - `GET /api/writing/prompts/{id}`
  - `POST /api/writing/submissions`
  - `POST /api/writing/submissions/{id}/chat`

#### Frontend (React 19 + Tiptap + Assistant-UI + Resizable Panels)
- [ ] **Split-Screen Exam Workspace (`WritingWorkspace.tsx`):**
  - Sử dụng `react-resizable-panels` phân chia đề bài & editor mượt mà.
- [ ] **Tiptap Rich-Text Editor (`WritingEditor.tsx`):**
  - Live Word Count (`@tiptap/extension-character-count`) với progress bar động (Cảnh báo đỏ < 150/250 từ, xanh lá khi đủ chỉ tiêu).
- [ ] **AI Scorecard & Radar Chart:**
  - Bảng điểm 4 tiêu chí với thanh điểm chi tiết, nhận xét điểm mạnh/điểm yếu và biểu đồ Radar trực quan.
- [ ] **Interactive Assistant-UI Chat Thread:**
  - Hộp thoại hỏi đáp trực tiếp với AI Examiner về bài viết, hỗ trợ xem phiên bản viết lại (Before/After Diff View).

---

### Phân Hệ 2: Role Admin & Backoffice Management Suite

#### Backend (.NET 8 Clean Architecture)
- [ ] **Role-Based Access Control (RBAC):**
  - Kích hoạt chính sách `[Authorize(Roles = "Admin")]` trên toàn bộ controller/endpoint quản trị.
  - Đảm bảo JWT Token mang Claim `Role = "Admin"`.
- [ ] **User & Learner Management (CQRS):**
  - `GetUsersPagedQuery`: Truy vấn danh sách người dùng phân trang, tìm kiếm theo tên/email, lọc theo role (`Student`/`Admin`).
  - `GetUserDetailByIdQuery`: Xem hồ sơ chi tiết, lịch sử làm bài thi (Reading, Listening, Writing) và biểu đồ tiến độ của học viên.
  - `UpdateUserRoleCommand`: Thay đổi quyền hạn giữa `Student` và `Admin`.
  - `ToggleUserStatusCommand`: Khóa/Mở khóa tài khoản học viên.
- [ ] **Exam Bank & Content Management (CQRS):**
  - `GetAdminExamBankOverviewQuery`: Thống kê tổng số bài thi theo từng kỹ năng.
  - `CreateWritingPromptCommand`, `UpdateWritingPromptCommand`, `DeleteWritingPromptCommand`: Quản lý kho đề Writing Task 1 & Task 2.
  - Tích hợp endpoint quản lý ngân hàng bài thi Reading & Listening.
- [ ] **System & AI Observability Dashboard (CQRS):**
  - `GetAdminDashboardStatsQuery`: Thống kê tổng số học viên, tổng lượt nộp bài, phân bổ Band Score trung bình, chi phí/token tiêu thụ của AI scoring engine.
- [ ] **REST Endpoints (`AdminControllers`):**
  - `GET /api/admin/dashboard/stats`
  - `GET /api/admin/users` (Paged)
  - `GET /api/admin/users/{id}`
  - `PUT /api/admin/users/{id}/role`
  - `PATCH /api/admin/users/{id}/status`
  - `POST /api/admin/writing/prompts` (CRUD đề thi Writing)

#### Frontend (React 19 + TanStack Table + Lucide + Recharts)
- [ ] **Admin Route Guard & Navigation:**
  - `AdminRoute.tsx`: Chặn truy cập nếu người dùng không có role `Admin`.
  - Cập nhật `Sidebar.tsx`: Tự động hiển thị nhóm menu "Administration" riêng biệt khi đăng nhập bằng tài khoản Admin.
- [ ] **Admin Dashboard View (`AdminDashboardPage.tsx`):**
  - 4 Thẻ KPI chủ đạo (Total Learners, Total Submissions, Avg IELTS Band, AI Evaluator Token Usage).
  - Biểu đồ thống kê lượt thi và phân bổ Band điểm qua `recharts`.
- [ ] **User Management Page (`UserManagementPage.tsx`):**
  - Bảng dữ liệu chuẩn Enterprise sử dụng `@tanstack/react-table` (Pagination, Column sorting, Quick search, Role filter).
  - Action Dropdown Menu: Đổi quyền hạn (Promote to Admin / Demote to Student), Khóa tài khoản, Xem chi tiết bài làm.
  - Modal xác nhận đổi quyền hạn an toàn.
- [ ] **Exam Bank Manager Page (`ExamBankManagerPage.tsx`):**
  - Giao diện Tab quản lý 3 kỹ năng: Reading Passages, Listening Tests, Writing Prompts.
  - Modal tạo mới đề thi Writing (Hỗ trợ upload ảnh biểu đồ Task 1, soạn bài văn mẫu Band 8+).

---

## 3. Tiêu Chí Nghiệm Thu (Acceptance Criteria)

1. **Writing AI Module:**
   - Trình soạn thảo Tiptap phản hồi gõ chữ tức thì, bộ đếm số từ chuẩn xác 100%.
   - AI trả về kết quả chấm điểm đầy đủ 4 tiêu chí chuẩn Cambridge trong thời gian dưới 5 giây.
   - Luồng chat với AI Tutor qua `@assistant-ui/react` phản hồi streaming mượt mà, phân tích sâu từng lỗi câu.
2. **Admin Role Module:**
   - Người dùng thường (`Student`) bị chặn hoàn toàn khi cố truy cập các route `/admin/*` và các endpoint API quản trị (Trả về HTTP 403 Forbidden).
   - Admin có thể xem, tìm kiếm, phân trang và thay đổi vai trò người dùng mượt mà qua bảng dữ liệu `@tanstack/react-table`.
   - Admin có thể tạo, chỉnh sửa và xóa đề bài Writing Task 1/Task 2 trong ngân hàng đề thi.
   - Giao diện tuân thủ 100% tiếng Anh chuẩn Cambridge IELTS Academic và phong cách thiết kế hiện đại 80/20 EdTech.
