# Sprint 4: Writing AI Evaluator & Role Admin Backoffice Suite

- **Duration:** 1 tuần
- **Objective:** Xây dựng module luyện viết **IELTS Writing (Task 1 & Task 2)** với trình soạn thảo Rich-text đếm từ thời gian thực, tích hợp bộ chấm điểm AI chuẩn **4 Tiêu chí IELTS Band Descriptors** sử dụng **Microsoft Semantic Kernel + Qdrant Vector Search (RAG)** kết hợp luồng hội thoại phân tích tương tác qua **`@assistant-ui/react`**; Đồng thời triển khai toàn diện phân hệ **Role Admin** (`[Authorize(Roles = "Admin")]`) quản trị người dùng, ngân hàng đề thi 3 kỹ năng và giám sát hệ thống với **`@tanstack/react-table`** & **`recharts`**.

> 📄 **Tài liệu kiến trúc chi tiết:** Xem chi tiết tại [`plan/Sprint-4/Plan-Sprint-4.md`](file:///c:/Users/khach/EduSphere/plan/Sprint-4/Plan-Sprint-4.md)  
> 📋 **Bảng checklist & deliverables:** Xem tại [`plan/Sprint-4/Sprint-4-Writing-AI-Admin.md`](file:///c:/Users/khach/EduSphere/plan/Sprint-4/Sprint-4-Writing-AI-Admin.md)

---

## 1. Công Nghệ & Thư Viện Chuyên Biệt Áp Dụng (Specialized Tech Stack)

| Thư Viện | Phân Hệ | Mục Đích Sử Dụng Trong Sprint 4 |
| :--- | :--- | :--- |
| **`@tiptap/react`** | Writing AI | **IELTS Writing Rich Editor:** Trình soạn thảo văn bản chuyên nghiệp với Live Word Count (đếm số từ thời gian thực; thanh tiến độ đạt 150 từ cho Task 1 và 250 từ cho Task 2), spellchecker, inline highlight câu lỗi. |
| **`@assistant-ui/react`** | Writing AI | **Interactive AI Writing Grader Chat:** Luồng hội thoại tương tác sâu sau khi chấm bài (học viên hỏi: *"Tại sao câu này bị trừ điểm Lexical Resource?", "Viết lại đoạn Body 2 thành Band 8.0"* -> AI trả lời dạng streaming kèm Generative UI Diff Card). |
| **`react-resizable-panels`** | Writing AI | **Split-Screen Writing Layout:** Bên trái hiển thị đề bài, biểu đồ Task 1 / câu hỏi Task 2; Bên phải là trình soạn thảo Tiptap. |
| **`@tanstack/react-table`** | Role Admin | **Admin Data Table:** Bảng dữ liệu quản trị học viên & ngân hàng đề thi phân trang, lọc vai trò, tìm kiếm nhanh và tùy chỉnh cột hiển thị. |
| **`recharts`** | Writing AI & Admin | **Radar & KPI Analytics:** Biểu đồ Radar 4 tiêu chí chấm điểm bài viết và biểu đồ phân bổ điểm số học viên trên Admin Dashboard. |

---

## 2. Scope & Deliverables

### A. Phân Hệ IELTS Writing AI Evaluator
- [ ] **Vector Database & RAG Pipeline:**
  - Nạp và nhúng (Embeddings) toàn bộ **IELTS Band Descriptors chính thức** (Task 1 & Task 2) vào **Qdrant Vector DB**.
  - Xây dựng Semantic Kernel Plugin tìm kiếm và trích xuất đúng tiêu chuẩn đánh giá cho từng bài nộp.
- [ ] **AI Scoring Engine:**
  - Chấm điểm chi tiết theo 4 tiêu chí cốt lõi:
    1. **Task Achievement / Task Response** (0.0 - 9.0)
    2. **Coherence and Cohesion** (0.0 - 9.0)
    3. **Lexical Resource** (0.0 - 9.0)
    4. **Grammatical Range and Accuracy** (0.0 - 9.0)
  - Tính Overall Band Score trung bình theo quy tắc làm tròn 0.25 / 0.75 của Cambridge IELTS.
  - Phân tích câu sai ngữ pháp + Đề xuất phiên bản viết lại (Paraphrase) nâng cao Band 8.0+.
- [ ] **Domain & CQRS Handlers:**
  - `WritingPrompt` entity (TaskType: Task1/Task2, Topic, PromptText, ImageUrl, SampleBand8Answer).
  - `WritingSubmission` entity (Content, WordCount, OverallBand, CriteriaScoresJson, FeedbackJson).
  - `SubmitWritingForAiEvaluationCommand` + Handler.
  - `ChatWithWritingAiTutorCommand` (Hỗ trợ SSE streaming câu hỏi tương tác).
- [ ] **Frontend Writing UI:**
  - Môi trường làm bài thi chia đôi màn hình `WritingWorkspace.tsx` (`react-resizable-panels`).
  - Trình soạn thảo Tiptap với bộ đếm từ thời gian thực, thanh tiến độ 150/250 từ.
  - Scorecard 4 tiêu chí, biểu đồ Radar và Before/After Grammar Diff view.
  - Luồng chat tương tác với AI Examiner qua `@assistant-ui/react`.

---

### B. Phân Hệ Role Admin & Backoffice Suite
- [ ] **RBAC Security & Protection:**
  - Áp dụng thuộc tính `[Authorize(Roles = "Admin")]` bảo vệ các controller/endpoint quản trị backend.
  - Xây dựng `AdminRoute.tsx` chặn truy cập trái phép trên frontend.
  - Mở rộng `Sidebar.tsx` hiển thị nhóm menu "Administration" động khi đăng nhập bằng tài khoản Admin.
- [ ] **User Management Module:**
  - Query phân trang `GetUsersPagedQuery` cho danh sách người dùng.
  - Bảng dữ liệu `@tanstack/react-table` hỗ trợ sắp xếp, tìm kiếm tức thì theo tên/email, lọc theo role (`Student`/`Admin`).
  - Chức năng cập nhật vai trò (Promote to Admin / Demote to Student) và khóa/mở khóa tài khoản học viên.
- [ ] **Exam Bank & Content Management Module:**
  - Tổng quan ngân hàng đề thi 3 kỹ năng (Reading, Listening, Writing).
  - Thêm, sửa, xóa đề thi Writing Task 1 & Task 2 kèm hình ảnh biểu đồ và bài mẫu Band 8+.
- [ ] **System & AI Observability Dashboard:**
  - Thẻ KPI thống kê: Tổng học viên, Tổng bài nộp, Band điểm trung bình, Lượng token AI tiêu thụ.
  - Biểu đồ xu hướng làm bài thi trong 30 ngày qua Recharts.

---

## 3. Acceptance Criteria
- [ ] Tiptap editor phản hồi gõ chữ tức thì, đếm số từ chuẩn xác 100%.
- [ ] AI trả về kết quả chấm điểm đầy đủ 4 tiêu chí trong thời gian dưới 5 giây.
- [ ] Tích hợp `@assistant-ui/react` hỗ trợ học viên chat hỏi sâu về bài viết với hiệu ứng streaming mượt mà.
- [ ] Phân quyền bảo mật Role Admin hoạt động chuẩn xác: học viên thường bị chặn 100% khi truy cập trang hoặc gọi API Admin.
- [ ] Admin quản lý danh sách học viên và đề thi hiệu quả qua bảng dữ liệu TanStack Table.
- [ ] 100% ngôn ngữ giao diện là tiếng Anh chuẩn học thuật Cambridge (100% English Academic Standard).
