# Walkthrough — Sprint 2: Reading Module & Split-View Dynamic Quiz Engine

Chúng ta đã hoàn thành **100% các hạng mục của Sprint 2**, xây dựng một hệ thống luyện thi **IELTS Reading** mô phỏng chuẩn kỳ thi quốc tế **Computer-delivered IELTS** với đầy đủ Backend, Frontend, Caching, Scoring Service, Seed Data và Unit Tests.

---

## 🎯 Các Tính Năng Đã Hoàn Thành

### 1. 🛠️ Backend (.NET 8 Clean Architecture & Cambridge Scoring)
- **Domain Entities & Enums:**
  - `ReadingPassage`, `ReadingQuestion`, `ReadingSubmission`, `ReadingSubmissionAnswer`.
  - Enums: `QuestionType` (`TrueFalseNotGiven`, `YesNoNotGiven`, `MultipleChoice`, `MatchingHeadings`, `SummaryCompletion`, `SentenceCompletion`), `DifficultyLevel`.
- **Thuật Toán Chấm Điểm Chuẩn Cambridge IELTS:**
  - `ReadingScoringService.cs`: Chuẩn hóa câu trả lời (loại bỏ khoảng trắng thừa, dấu câu, viết hoa/thường), so khớp đa đáp án cách nhau bằng dấu `/`, quy đổi Raw Score sang IELTS Band Score $1.0 - 9.0$.
- **EF Core 8 Database & Migration:**
  - Đã chạy migration `Add_Reading_Module` tạo các bảng `ReadingPassages`, `ReadingQuestions`, `ReadingSubmissions`, `ReadingSubmissionAnswers` và các indexes liên quan.
- **Seeder 2 Đề Thi Chuẩn Cambridge:**
  - `ReadingDataSeeder.cs`: Tự động nạp 2 đề thi thực tế:
    1. *The Secret History of the Antikythera Mechanism* (13 câu hỏi: Matching Headings, True/False/Not Given, Summary Completion).
    2. *Urban Agriculture and the Future of Food Supply* (13 câu hỏi: Multiple Choice, True/False/Not Given, Sentence Completion).
- **CQRS Handlers & REST Endpoints:**
  - `ReadingController.cs`:
    - `GET /api/reading/passages` (kết hợp **Redis Cache-Aside**).
    - `GET /api/reading/passages/{id}`.
    - `POST /api/reading/submissions` (Chấm điểm tự động và lưu kết quả).
    - `GET /api/reading/submissions/{id}` (Xem lại chi tiết bài làm).

---

### 2. 💻 Frontend (React 18 + TypeScript + Resizable Panels + TanStack Table)
- **Bảng Ngân Hàng Đề Thi:**
  - `ExamTable.tsx`: Tìm kiếm thời gian thực, lọc theo độ khó (*Easy, Medium, Hard*), sắp xếp theo tiêu đề/thời gian, phân trang mượt mà.
- **Môi Trường Thi Split-Screen Toàn Màn Hình:**
  - `ReadingWorkspace.tsx` & `PassagePanel.tsx`: Kéo thả thanh trượt co giãn tỷ lệ giữa bài đọc và bảng câu hỏi (`react-resizable-panels`), bộ chỉnh cỡ chữ $13\text{px} - 20\text{px}$, đánh dấu đoạn văn `[A]`, `[B]`, `[C]`.
- **Đồng Hồ Đếm Ngược & Bảng Câu Hỏi:**
  - `ExamTimer.tsx`: Đếm ngược 60 phút, cảnh báo khi còn 5 phút và tự động nộp bài khi hết giờ.
  - `QuestionPalette.tsx`: Bảng câu hỏi $1 - 13/40$ trực quan với 3 trạng thái (Đã làm, Chưa làm, Cắm cờ xem lại).
- **Bộ Renderers Từng Dạng Câu Hỏi:**
  - `TrueFalseNotGivenRenderer.tsx`
  - `MatchingHeadingsRenderer.tsx`
  - `MultipleChoiceRenderer.tsx`
  - `SummaryCompletionRenderer.tsx`
- **Trang Báo Cáo Kết Quả & Lời Giải:**
  - `ReadingResultPage.tsx`: Emblem Band Score, tỷ lệ Accuracy %, thời gian làm bài, danh sách câu đúng/sai.
  - `ExplanationModal.tsx`: Trích dẫn bằng chứng từ bài đọc giải thích cho từng câu hỏi.

---

## 🧪 Kết Quả Kiểm Thử (Verification Results)

### 1. Backend Automated Unit Tests (46/46 Passed - 100%)
```bash
Total tests: 46
     Passed: 46
 Total time: 1.0961 Seconds
```

### 2. Frontend Production Bundle Build
```bash
✓ 1941 modules transformed.
dist/index.html                   0.45 kB │ gzip:   0.29 kB
dist/assets/index-DJV9cqkX.css   72.63 kB │ gzip:  11.15 kB
dist/assets/index-0_2HM7OF.js   479.29 kB │ gzip: 144.97 kB
✓ built in 371ms
```

### 3. End-to-End API Test
- `GET /api/reading/passages` $\rightarrow$ 200 OK (2 bài đọc từ database/Redis).
- `GET /api/reading/passages/{id}` $\rightarrow$ 200 OK (Bài đọc kèm 13 câu hỏi).
- `POST /api/reading/submissions` $\rightarrow$ 200 OK (`RawScore: 13/13`, `BandScore: 9.0`, `Accuracy: 100%`).
- `GET /api/reading/submissions/{id}` $\rightarrow$ 200 OK (Chi tiết bài nộp).
