# Sprint 3: Listening Module & Audio Synchronized Transcript Engine

- **Duration:** 1 tuần
- **Objective:** Xây dựng module luyện thi **IELTS Listening** với giao diện phát âm thanh dạng sóng (Audio Waveform), đồng bộ hóa Transcript theo mốc thời gian (Timestamp Sync), hỗ trợ 4 Parts chuẩn Cambridge IELTS.

---

## 1. Công Nghệ & Thư Viện Chuyên Biệt Áp Dụng (Specialized Tech Stack)

| Thư Viện | Mục Đích Sử Dụng Trong Sprint 3 |
| :--- | :--- |
| **`wavesurfer.js`** | **Audio Waveform Player & Controls:** Hiển thị dạng sóng âm thanh chuyên nghiệp, điều khiển tốc độ phát (0.8x, 1.0x, 1.2x), tua 5s/10s, và hiển thị vùng timeline phát rõ ràng. |
| **`@tanstack/react-table`** *(từ `shadcn-admin`)* | **Listening Test Explorer:** Bảng danh sách bài thi Listening 4 Parts (Section 1 -> 4), lọc theo chất giọng (British, American, Australian accent) và chủ đề. |
| **`framer-motion`** | Đồng bộ dòng chữ trong Transcript: highlight phát sáng dòng audio đang chạy theo thời gian thực (Real-time Transcript Highlighting). |

---

## 2. Scope & Deliverables

### Backend (.NET 8 Clean Architecture)
- [ ] **Domain Layer:**
  - `ListeningTest` entity (Id, Title, SectionNumber, AudioUrl, DurationSeconds).
  - `ListeningQuestion` entity (TestId, QuestionNumber, QuestionType, Prompt, CorrectAnswer, TimestampSeconds).
  - `ListeningTranscript` entity (TestId, StartTimeSeconds, EndTimeSeconds, Speaker, TextContent).
  - `ListeningSubmission` entity.
- [ ] **Infrastructure Layer:**
  - `ListeningTestConfiguration`, `ListeningQuestionConfiguration`, `ListeningTranscriptConfiguration`.
  - Migration EF Core `Add_Listening_Entities`.
  - Redis Cache-Aside cho audio metadata và transcripts.
- [ ] **Application Layer (CQRS):**
  - `GetListeningTestsQuery` + Redis Cache.
  - `GetListeningTestDetailQuery` (kèm audio url, transcript timestamps và câu hỏi).
  - `SubmitListeningExamCommand` + Handler (Chấm điểm tự động và quy đổi Band Score).
- [ ] **API Layer:**
  - `ListeningController`:
    - `GET /api/listening/tests`
    - `GET /api/listening/tests/{id}`
    - `POST /api/listening/submissions`

### Frontend (React 18 + TypeScript + wavesurfer.js)
- [ ] **Waveform Audio Player Component (`AudioWaveformPlayer.tsx`):**
  - Khởi tạo Wavesurfer.js với visual waveform hiện đại, thanh volume, speed switcher và progress timeline.
- [ ] **Synchronized Interactive Transcript:**
  - Transcript cuộn tự động theo audio đang phát; cho phép click vào câu bất kỳ để audio tua đến đúng thời điểm đó.
- [ ] **Listening Question Renderers:**
  - Form điền từ vào chỗ trống (Form/Note Completion, Table Completion).
  - Map Labelling & Diagram Marking.
- [ ] **Instant Band Score Diagnostic:**
  - Hiển thị kết quả điểm Listening, phân tích số câu đúng theo từng Part (Part 1 -> Part 4).

---

## 3. Acceptance Criteria
- [ ] `wavesurfer.js` tải và phát audio mượt mà không bị delay; hiển thị sóng âm đẹp mắt trên Dark/Light mode.
- [ ] Transcript tự động highlight đúng câu đang đọc theo sai số dưới 200ms.
- [ ] Chấm điểm chính xác câu trả lời (xử lý không phân biệt hoa thường, khoảng trắng thừa và số nhiều/số ít hợp lệ).
