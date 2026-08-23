# Plan Sprint 2: Reading Module & Split-View Dynamic Quiz Engine

- **Trạng thái:** Chờ phê duyệt (Awaiting Approval)
- **Thời lượng dự kiến:** 1 tuần
- **Mục tiêu:** Xây dựng hoàn chỉnh phân hệ **IELTS Reading** với giao diện làm bài thi **Split-Screen** co giãn (`react-resizable-panels`), bảng ngân hàng đề thi lọc nâng cao (`@tanstack/react-table`), bộ chấm điểm chuẩn **IELTS Band Score 1.0 - 9.0**, bộ nhớ đệm **Redis Cache-Aside**, và trang phân tích kết quả thi chi tiết.

---

## 1. Hạng Mục Công Việc Chi Tiết

### 🛠️ Backend (.NET 8 Clean Architecture)
1. **Domain Layer:**
   - Tạo Enums: `QuestionType` (TrueFalseNotGiven, MultipleChoice, MatchingHeadings, SummaryCompletion), `DifficultyLevel`.
   - Tạo Entities: `ReadingPassage`, `ReadingQuestion`, `ReadingSubmission`, `ReadingSubmissionAnswer`.
2. **Infrastructure Layer:**
   - Cấu hình EF Core Fluent API cho các bảng Reading.
   - Tạo và chạy Migration EF Core: `Add_Reading_Module`.
   - Tạo `ReadingDataSeeder` nạp 2 đề thi Reading chuẩn Cambridge kèm giải thích.
   - Cài đặt `ReadingScoringService` (tính điểm & quy đổi Band Score chuẩn Cambridge).
3. **Application Layer (CQRS):**
   - Query: `GetReadingPassagesQuery` (phân trang, lọc topic/độ khó, cache Redis 10 phút).
   - Query: `GetReadingPassageByIdQuery` (lấy đề thi & danh sách câu hỏi).
   - Command: `SubmitReadingExamCommand` (chấm bài tự động, tính Band Score, lưu submission).
   - Query: `GetReadingSubmissionByIdQuery` (xem lại kết quả bài nộp & lời giải).
4. **API Layer:**
   - Tạo `ReadingController` với các endpoints RESTful chuẩn.
5. **Unit Tests:**
   - Viết test cho `ReadingScoringService` (test dải điểm 0-40 sang Band 1.0-9.0) và CQRS Handlers.

---

### 💻 Frontend (React 18 + TypeScript + Resizable Panels + TanStack Table)
1. **API & Types:**
   - Xây dựng `readingApi.ts` và `reading.types.ts`.
2. **Reading Explorer (`ReadingListPage.tsx`):**
   - Bảng danh sách đề thi sử dụng `@tanstack/react-table` (từ `shadcn-admin`), lọc theo Topic, Difficulty, Search và phân trang.
3. **Split-Screen Exam Workspace (`ReadingExamPage.tsx`):**
   - Sử dụng `react-resizable-panels` chia đôi màn hình (Panel trái: Đoạn văn đọc; Panel phải: Bảng câu hỏi).
   - Thanh công cụ Passage: Đánh dấu đoạn `[A]`, `[B]`, `[C]`, chỉnh cỡ chữ (A- / A+).
   - Đồng hồ đếm ngược 60 phút (`ExamTimer.tsx`) & Bảng câu hỏi 1-40 (`QuestionPalette.tsx`) có trạng thái cắm cờ xem lại.
4. **Dynamic Question Renderers:**
   - `TrueFalseNotGivenRenderer.tsx`
   - `MatchingHeadingsRenderer.tsx`
   - `MultipleChoiceRenderer.tsx`
   - `SummaryCompletionRenderer.tsx`
5. **Exam Results & Diagnostics (`ReadingResultPage.tsx`):**
   - Bảng điểm Band Score, Accuracy %, thời gian làm bài.
   - Lời giải chi tiết trích dẫn trực tiếp từ bài đọc (`ExplanationModal.tsx`).

---

## 2. Tiêu Chí Nghiệm Thu (Acceptance Criteria)
- [ ] Giao diện Split-Screen kéo co giãn mượt mà trên desktop & tablet.
- [ ] So khớp đáp án chính xác theo quy tắc IELTS và quy đổi ra Band Score (1.0 - 9.0) chuẩn Cambridge.
- [ ] Question Palette đổi màu trực quan khi làm bài.
- [ ] Toàn bộ Unit Tests trên Backend pass 100% và Frontend build không lỗi.
