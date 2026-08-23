# Sprint 4: Writing AI Evaluator & Semantic Kernel RAG Engine

- **Duration:** 1 tuần
- **Objective:** Xây dựng module luyện viết **IELTS Writing (Task 1 & Task 2)** với trình soạn thảo Rich-text đếm từ thời gian thực, tích hợp bộ chấm điểm AI chuẩn **4 Tiêu chí IELTS Band Descriptors** sử dụng **Microsoft Semantic Kernel + Qdrant Vector Search (RAG)** và luồng hội thoại phân tích tương tác qua **`assistant-ui`**.

---

## 1. Công Nghệ & Thư Viện Chuyên Biệt Áp Dụng (Specialized Tech Stack)

| Thư Viện | Mục Đích Sử Dụng Trong Sprint 4 |
| :--- | :--- |
| **`@tiptap/react`** | **IELTS Writing Rich Editor:** Trình soạn thảo văn bản chuyên nghiệp với Live Word Count (đếm số từ thời gian thực; thanh tiến độ đạt 150 từ cho Task 1 và 250 từ cho Task 2), spellchecker, inline highlight câu lỗi. |
| **`@assistant-ui/react`** *(từ `assistant-ui`)* | **Interactive AI Writing Grader Chat:** Luồng hội thoại tương tác sâu sau khi chấm bài (học viên hỏi: *"Tại sao câu này bị trừ điểm Lexical Resource?", "Viết lại đoạn Body 2 thành Band 8.0"* -> AI trả lời dạng streaming kèm Generative UI Diff Card). |
| **`react-resizable-panels`** | **Split-Screen Writing Layout:** Bên trái hiển thị đề bài, biểu đồ Task 1 / câu hỏi Task 2; Bên phải là trình soạn thảo Tiptap. |

---

## 2. Scope & Deliverables

### Backend (.NET 8 + Microsoft Semantic Kernel + Qdrant Vector DB)
- [ ] **Vector Database & RAG Pipeline:**
  - Nạp và nhúng (Embeddings) toàn bộ **IELTS Band Descriptors chính thức** (Task 1 & Task 2) vào **Qdrant Vector DB**.
  - Xây dựng Semantic Kernel Plugin tìm kiếm và trích xuất đúng tiêu chuẩn đánh giá cho từng bài nộp.
- [ ] **AI Scoring Engine:**
  - Chấm điểm chi tiết theo 4 tiêu chí cốt lõi:
    1. **Task Achievement / Task Response** (0.0 - 9.0)
    2. **Coherence and Cohesion** (0.0 - 9.0)
    3. **Lexical Resource** (0.0 - 9.0)
    4. **Grammatical Range and Accuracy** (0.0 - 9.0)
  - Tính Overall Band Score trung bình theo quy tắc làm tròn 0.25 / 0.75 của IELTS.
  - Phân tích câu sai ngữ pháp + Đề xuất phiên bản viết lại (Paraphrase) nâng cao Band 8.0.
- [ ] **Domain & CQRS Handlers:**
  - `WritingPrompt` entity (TaskType: Task1/Task2, Topic, PromptText, ImageUrl).
  - `WritingSubmission` entity (Content, WordCount, OverallBand, CriteriaScoresJson, FeedbackJson).
  - `SubmitWritingForAiEvaluationCommand` + Handler.
  - `ChatWithWritingAiTutorCommand` (Hỗ trợ SSE streaming câu hỏi tương tác).

### Frontend (React 18 + Tiptap + assistant-ui + Resizable Panels)
- [ ] **Split-Screen Exam Layout (`WritingWorkspace.tsx`):**
  - Sử dụng `react-resizable-panels` co giãn mượt mà.
- [ ] **Tiptap Rich-Text Editor:**
  - Đếm từ thời gian thực (`@tiptap/extension-character-count`) hiển thị màu sắc cảnh báo (Đỏ: chưa đủ 150/250 từ, Xanh: đã đủ tiêu chuẩn nộp).
- [ ] **AI Comprehensive Scorecard & Radar Chart:**
  - Bảng điểm 4 tiêu chí với thanh điểm chi tiết và nhận xét điểm mạnh/điểm yếu.
- [ ] **Interactive Assistant-UI Chat Thread:**
  - Hộp thoại hỏi đáp trực tiếp với AI Examiner về bài viết, hỗ trợ xem phiên bản viết lại (Diff View Before/After).

---

## 3. Acceptance Criteria
- [ ] Tiptap editor phản hồi gõ chữ tức thì, đếm số từ chuẩn xác 100%.
- [ ] AI trả về kết quả chấm điểm đầy đủ 4 tiêu chí trong thời gian dưới 5 giây.
- [ ] Tích hợp `@assistant-ui/react` hỗ trợ học viên chat hỏi sâu về bài viết với hiệu ứng streaming mượt mà.
