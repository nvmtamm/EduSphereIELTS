# Kế Hoạch Triển Khai Toàn Diện Sprint 3: IELTS Listening Module & Audio Synchronized Transcript Engine

> **Phiên bản:** 3.0 (Tích hợp Audio Waveform Wavesurfer.js, Real-time Transcript Highlighting & Auto-Grading Chuẩn Cambridge)  
> **Thời gian dự kiến:** 1 tuần  
> **Phân hệ:** IELTS Listening Examination Engine + Audio Waveform Player + Synchronized Interactive Transcript + Multi-Section Diagnostics

---

## 🎯 1. Tầm Nhìn & Các Trụ Cột Đột Phá

### 1.1. 🎧 Trụ Cột 1: Trình Phát Âm Thanh Dạng Sóng Hiện Đại (`wavesurfer.js`)
- Hiển thị trực quan dạng sóng âm thanh (Audio Waveform) với màu sắc thích ứng Dark/Light Mode.
- Bộ điều khiển đầy đủ: Play/Pause, tua lùi/tiến 5s, điều chỉnh âm lượng, thanh tốc độ phát (`0.75x`, `0.8x`, `1.0x`, `1.2x`, `1.5x`).
- Thiết kế thanh phát nổi (Floating Player) hoặc cố định trên đầu bài thi (Sticky Top Bar) đảm bảo học viên thao tác thuận tiện trong suốt thời gian làm bài.

### 1.2. ⏱️ Trụ Cột 2: Đồng Bộ Transcript Thời Gian Thực (Timestamp Sync Engine)
- Đồng bộ theo thời gian thực dòng âm thanh đang phát với nội dung Transcript (`framer-motion` active highlight).
- Cho phép nhấp trực tiếp vào bất kỳ câu nào trong Transcript để tua trình phát âm thanh đến chính xác mốc thời gian đó (Interactive Click-to-Seek).
- Gắn thẻ người nói (Speaker) và giọng đọc (Accent: British 🇬🇧, American 🇺🇸, Australian 🇦🇺, Canadian 🇨🇦).

### 1.3. 📝 Trụ Cột 3: Đầy Đủ 4 Sections & Các Dạng Câu Hỏi Chuẩn Cambridge IELTS
- **Section 1:** Hội thoại ngữ cảnh giao tiếp xã hội hàng ngày (Social Dialogue).
- **Section 2:** Độc thoại ngữ cảnh xã hội (Social Monologue).
- **Section 3:** Thảo luận học thuật giữa 2–4 người (Academic Discussion).
- **Section 4:** Bài giảng học thuật độc thoại (Academic Lecture).
- **Bộ Renderers chuyên biệt:**
  - *Form / Note / Table Completion* (Điền từ vào chỗ trống / biểu mẫu / bảng).
  - *Multiple Choice* (Trắc nghiệm đơn & đa lựa chọn).
  - *Matching Information / Features* (Nối thông tin).
  - *Map / Diagram / Plan Labelling* (Gán nhãn sơ đồ / bản đồ trực quan).

### 1.4. 📊 Trụ Cột 4: Chấm Điểm Tự Động & Chẩn Đoán Chi Tiết (Band Score Diagnostic)
- Thuật toán so khớp thông minh: không phân biệt hoa thường, chuẩn hóa khoảng trắng thừa, hỗ trợ chuyển đổi số chữ $\leftrightarrow$ số đếm ("three" $\leftrightarrow$ "3"), xử lý các đáp án tương đương có dấu gạch chéo (`photo / photograph`).
- Quy đổi Band điểm chính xác theo thang chuẩn Cambridge IELTS Academic Listening (0–40 câu $\rightarrow$ Band 1.0 – 9.0).
- Báo cáo phân tích chi tiết độ chính xác theo từng Section (Part 1 $\rightarrow$ Part 4) và liên kết từng câu sai trực tiếp đến đoạn audio chứa đáp án.

---

## 🏗️ 2. Cấu Trúc Mã Nguồn

### 2.1. Backend (.NET 8 Clean Architecture)

```
backend/src/
├── EduSphere.Domain/
│   ├── Entities/
│   │   ├── ListeningTest.cs              # Đề thi Listening, Audio URL, thời lượng, Section, Accent
│   │   ├── ListeningQuestion.cs          # Câu hỏi, loại câu hỏi, đáp án, audio timestamp
│   │   ├── ListeningTranscript.cs        # Dòng transcript, mốc thời gian Start/End, người nói
│   │   ├── ListeningSubmission.cs        # Kết quả nộp bài, điểm raw, band score, breakdown JSON
│   │   └── ListeningSubmissionAnswer.cs  # Chi tiết từng câu trả lời của thí sinh
│   └── Enums/
│       ├── ListeningAccent.cs            # British, American, Australian, Canadian, Mixed
│       └── ListeningSectionType.cs       # Section 1..4, Full Test
│
├── EduSphere.Infrastructure/
│   ├── Data/
│   │   ├── Configurations/
│   │   │   └── ListeningConfigurations.cs # EF Core Fluent API mapping
│   │   └── Seeders/
│   │       └── ListeningDataSeeder.cs    # Đề mẫu Cambridge IELTS Listening 18/19 kèm audio & transcript
│
├── EduSphere.Application/
│   └── Features/Listening/
│       ├── Models/                       # DTOs cho Test, Detail, Question, Transcript, Submission
│       ├── Queries/
│       │   ├── GetListeningTests/        # Lấy danh sách đề kèm bộ lọc Section, Accent, Topic, Redis Cache
│       │   ├── GetListeningTestById/     # Chi tiết đề thi, câu hỏi và transcripts
│       │   ├── GetListeningSubmissionById/ # Chi tiết bài làm và chẩn đoán
│       │   └── GetListeningHistory/      # Lịch sử làm bài của học viên
│       └── Commands/
│           └── SubmitListeningExam/      # Thuật toán chấm điểm tự động & tính Band Score 9.0
│
└── EduSphere.API/
    └── Controllers/
        └── ListeningController.cs        # REST API endpoints cho phân hệ Listening
```

### 2.2. Frontend (React 19 + TypeScript + wavesurfer.js + Tailwind CSS v4)

```
frontend/src/features/listening/
├── api/
│   └── listeningApi.ts                   # Gọi API backend qua Axios Client
├── types/
│   └── listening.ts                      # Định nghĩa TypeScript interfaces & types
├── components/
│   ├── AudioWaveformPlayer.tsx           # Trình phát wavesurfer.js kèm visual wave & controls
│   ├── SynchronizedTranscript.tsx        # Transcript đồng bộ highlight theo audio timestamp
│   ├── ListeningNotepad.tsx              # Khung ghi chú nhanh tự động lưu LocalStorage
│   ├── ListeningQuestionPalette.tsx      # Bảng 40 câu hỏi điều hướng nhanh
│   ├── ListeningExamTimer.tsx            # Đồng hồ đếm giờ làm bài thi
│   ├── ListeningExplorerTable.tsx        # Bảng danh sách đề thi @tanstack/react-table
│   └── renderers/
│       ├── FormCompletionRenderer.tsx    # Điền từ vào form / ghi chú
│       ├── TableCompletionRenderer.tsx   # Điền từ vào bảng
│       ├── ListeningMultipleChoiceRenderer.tsx # Trắc nghiệm A, B, C, D
│       ├── ListeningMatchingRenderer.tsx # Nối thông tin
│       └── MapDiagramLabellingRenderer.tsx # Gán nhãn bản đồ / sơ đồ
└── pages/
    ├── ListeningListPage.tsx             # Trang danh sách & khám phá đề thi Listening
    ├── ListeningExamPage.tsx             # Màn hình phòng thi Listening toàn màn hình
    └── ListeningResultPage.tsx           # Trang kết quả, chẩn đoán Band & đối chiếu audio
```

---

## 📋 3. Kế Hoạch Triển Khai Chi Tiết (Task Checklist)

- [ ] **Giai đoạn 1: Backend Domain & Database Schema**
  - Tạo Enums (`ListeningAccent`, `ListeningSectionType`) và Entities (`ListeningTest`, `ListeningQuestion`, `ListeningTranscript`, `ListeningSubmission`, `ListeningSubmissionAnswer`).
  - Cấu hình EF Core Fluent API và cập nhật `IApplicationDbContext`, `ApplicationDbContext`.
  - Viết `ListeningDataSeeder` với đề thi chuẩn Cambridge IELTS 18/19 kèm audio stream và transcript mốc giây.
- [ ] **Giai đoạn 2: Backend Application CQRS & API Layer**
  - Xây dựng DTOs và Mapster mappings.
  - Viết `GetListeningTestsQuery` hỗ trợ lọc Section, Accent, Topic, Độ khó và tích hợp Redis Cache.
  - Viết `GetListeningTestByIdQuery` trả về đầy đủ audio URL, câu hỏi và transcripts.
  - Viết `SubmitListeningExamCommand` với bộ so khớp đáp án thông minh và bảng quy đổi Band IELTS Listening Academic.
  - Viết `ListeningController` kế thừa `ApiControllerBase`.
- [ ] **Giai đoạn 3: Frontend Audio Waveform & Interactive Transcript Components**
  - Tích hợp `wavesurfer.js` trong `AudioWaveformPlayer.tsx` với giao diện hiện đại, thanh volume, speed control và tua âm thanh.
  - Xây dựng `SynchronizedTranscript.tsx` tự động cuộn và highlight câu đang phát với `framer-motion`, cho phép click câu để tua audio.
  - Xây dựng các question renderers: `FormCompletionRenderer`, `TableCompletionRenderer`, `ListeningMultipleChoiceRenderer`, `ListeningMatchingRenderer`, `MapDiagramLabellingRenderer`.
- [ ] **Giai đoạn 4: Frontend Pages & Routing Integration**
  - Xây dựng `ListeningListPage.tsx` với bảng khám phá đề thi, huy hiệu giọng đọc (UK/US/AUS) và thống kê.
  - Xây dựng `ListeningExamPage.tsx` phòng thi toàn màn hình với thanh phát sóng âm thanh cố định, ghi chú Notepad và lưu tạm thời.
  - Xây dựng `ListeningResultPage.tsx` hiển thị cúp/điểm Band, phân tích 4 Part và đối chiếu mốc audio.
  - Cập nhật định tuyến `Router.tsx`.
- [ ] **Giai đoạn 5: Kiểm Thử & Tối Ưu Hóa**
  - `dotnet build` và chạy unit tests Backend.
  - `npm run build` kiểm tra TypeScript và bundle build Frontend.
  - Đảm bảo 100% tiếng Anh cho toàn bộ giao diện theo chuẩn Cambridge Academic.
