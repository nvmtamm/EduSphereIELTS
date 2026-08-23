# Sprint 2: Reading Module & Split-View Dynamic Quiz Engine

- **Duration:** 1 tuần
- **Objective:** Xây dựng module luyện thi **IELTS Reading** với giao diện chia đôi màn hình co giãn chuyên nghiệp giống kỳ thi thật (IDP/BC Computer-delivered IELTS), bảng ngân hàng đề thi lọc nâng cao, và công cụ chấm điểm tự động.

---

## 1. Công Nghệ & Thư Viện Chuyên Biệt Áp Dụng (Specialized Tech Stack)

| Thư Viện | Mục Đích Sử Dụng Trong Sprint 2 |
| :--- | :--- |
| **`react-resizable-panels`** | **Giao diện Split-Screen (Passage & Question Pane):** Cho phép học viên kéo thả thanh trượt ngăn cách giữa đoạn văn đọc và bảng câu hỏi mượt mà, hỗ trợ ghim/mở rộng từng phần. |
| **`@tanstack/react-table`** *(từ `shadcn-admin`)* | **Reading Passage Explorer (`ExamTable.tsx`):** Bảng danh sách đề thi phân trang server-side (`PagedList<T>`), lọc theo dạng câu hỏi (*True/False/Not Given, Heading Matching, Multiple Choice*), độ khó (*Band 5.5 - 6.5, 7.0 - 8.0*) và trạng thái đã làm. |
| **`framer-motion`** | Hiệu ứng chuyển động mượt mà khi click chọn đáp án, thanh đếm ngược thời gian 60 phút và chuyển trang câu hỏi. |
| **`cmdk`** *(từ `shadcn-admin`)* | Tìm kiếm nhanh bài đọc theo từ khóa chủ đề (Science, History, Environment) qua `Cmd + K`. |

---

## 2. Scope & Deliverables

### Backend (.NET 8 Clean Architecture)
- [ ] **Domain Layer:**
  - `ReadingPassage` entity (Id, Title, Content, Topic, Difficulty, EstimatedTimeMinutes).
  - `ReadingQuestion` entity (PassageId, QuestionNumber, QuestionType, Prompt, OptionsJson, CorrectAnswer, Explanation).
  - `ReadingSubmission` & `ReadingSubmissionAnswer` entities.
  - `QuestionType` enum (`TrueFalseNotGiven`, `MultipleChoice`, `MatchingHeadings`, `SummaryCompletion`).
- [ ] **Infrastructure Layer:**
  - `ReadingPassageConfiguration`, `ReadingQuestionConfiguration`, `ReadingSubmissionConfiguration`.
  - Migration EF Core `Add_Reading_Entities`.
  - Redis Cache-Aside cho danh sách bài đọc (`GetReadingPassagesQuery`).
- [ ] **Application Layer (CQRS):**
  - `GetReadingPassagesQuery` (PagedList + Filter by Type/Difficulty) + Redis Cache.
  - `GetReadingPassageByIdQuery` (Passage kèm danh sách Questions).
  - `SubmitReadingExamCommand` + Handler (Chấm điểm tự động, tính raw score -> IELTS Band Score 1.0 - 9.0).
  - `GetReadingSubmissionResultQuery`.
- [ ] **API Layer:**
  - `ReadingController`:
    - `GET /api/reading/passages`
    - `GET /api/reading/passages/{id}`
    - `POST /api/reading/submissions`
    - `GET /api/reading/submissions/{id}`

### Frontend (React 18 + TypeScript + shadcn/ui)
- [ ] **`react-resizable-panels` Exam Shell:**
  - Màn hình thi chuẩn Computer-delivered IELTS: Panel bên trái chứa văn bản đọc (có highlight từ ngữ, note), Panel bên phải chứa câu hỏi tương ứng.
- [ ] **Dynamic Question Renderers:**
  - `TrueFalseNotGiven.tsx` (Radio buttons True/False/Not Given).
  - `MatchingHeadings.tsx` (Kéo thả hoặc dropdown chọn tiêu đề cho Paragraph A, B, C).
  - `MultipleChoice.tsx` & `SummaryCompletion.tsx`.
- [ ] **Timer & Exam Progress Palette:**
  - Đồng hồ đếm ngược 60 phút có cảnh báo khi còn 5 phút cuối.
  - Bảng câu hỏi (Question Palette 1-40) hiển thị trạng thái đã trả lời / chưa trả lời / đã gắn cờ xem lại.
- [ ] **Result & Diagnostic Modal:**
  - Hiển thị Band Score đạt được, số câu đúng/sai và lời giải thích chi tiết cho từng câu hỏi.

---

## 3. Acceptance Criteria
- [ ] Màn hình Split-Screen co giãn mượt mà trên desktop/tablet bằng `react-resizable-panels`.
- [ ] Nộp bài và nhận kết quả chấm điểm tức thì (dưới 500ms) kèm chuyển đổi Raw Score sang IELTS Band chuẩn xác (ví dụ: 30/40 = Band 7.0).
- [ ] Dữ liệu danh sách đề thi được cache trên Redis và hiển thị qua TanStack Table phân trang mượt mà.
