# Sprint 5: Speaking AI Examiner & SuperMemo SM-2 Vocabulary

- **Duration:** 1 tuần
- **Objective:** Xây dựng module **IELTS Speaking AI Examiner** với ghi âm giọng nói hiển thị sóng âm `wavesurfer.js`, phân tích phát âm/độ trôi chảy, cùng hệ thống học từ vựng **SuperMemo SM-2 Spaced Repetition** với hiệu ứng Flashcard 3D và pháo hoa chúc mừng.

---

## 1. Công Nghệ & Thư Viện Chuyên Biệt Áp Dụng (Specialized Tech Stack)

| Thư Viện | Mục Đích Sử Dụng Trong Sprint 5 |
| :--- | :--- |
| **`wavesurfer.js`** | **Speaking Voice Recording Waveform:** Hiển thị sóng âm thời gian thực khi học viên nói, cho phép nghe lại bản ghi âm với scrubber tương tác. |
| **`framer-motion`** | **3D Flip Flashcards & Streak Animations:** Hiệu ứng lật thẻ từ vựng 3D chân thực (Mặt trước: Từ vựng, Loại từ, Phiên âm IPA; Mặt sau: Định nghĩa Anh-Việt, Câu ví dụ, Collocations). |
| **`canvas-confetti`** | **Streak & Level-up Celebration:** Hiệu ứng bắn pháo hoa khi hoàn thành phiên học từ vựng ngày hoặc đạt chuỗi học liên tục (Streak 7 days). |
| **`@assistant-ui/react`** | **AI Examiner Interactive Voice/Text Interface:** Giao diện hội thoại tương tác cho các câu hỏi Speaking Part 1, Part 2, Part 3. |

---

## 2. Scope & Deliverables

### Backend (.NET 8 Clean Architecture)
- [ ] **Speaking Module:**
  - `SpeakingTopic` entity (Part 1, Part 2 Cue Card, Part 3 Follow-up questions).
  - `SpeakingSubmission` entity (AudioUrl, Transcript, FluencyScore, PronunciationScore, LexicalScore, GrammarScore, Feedback).
  - Tích hợp AI Audio Speech Recognition & Scoring Service.
- [ ] **SuperMemo SM-2 Spaced Repetition Algorithm:**
  - Triển khai công thức chuẩn SM-2:
    $$EF' = EF + (0.1 - (5 - q) \times (0.08 + (5 - q) \times 0.02))$$
    $$I(1) = 1 \text{ ngày}, \quad I(2) = 6 \text{ ngày}, \quad I(n) = I(n-1) \times EF'$$
  - `VocabularyWord` entity (Word, Phonetic, MeaningEn, MeaningVi, ExampleSentence, Collocations, BandLevel).
  - `UserVocabularyProgress` entity (UserId, WordId, RepetitionNumber, EasinessFactor, IntervalDays, NextReviewDate).
  - `GetDueReviewWordsQuery` (Lấy danh sách từ cần ôn tập hôm nay) + `SubmitWordReviewCommand` (Đánh giá mức độ nhớ $q \in [0, 5]$).

### Frontend (React 18 + wavesurfer.js + framer-motion + confetti)
- [ ] **Speaking Simulation Room (`SpeakingRoom.tsx`):**
  - Đồng hồ đếm ngược 1 phút chuẩn bị cho Part 2 (Cue Card) và 2 phút ghi âm bài nói.
  - Sóng âm ghi âm trực quan với `wavesurfer.js`.
  - Bảng điểm chi tiết 4 tiêu chí Speaking (Fluency & Coherence, Lexical Resource, Grammatical Range, Pronunciation).
- [ ] **SM-2 3D Flashcard Learning Interface (`FlashcardDeck.tsx`):**
  - Hiệu ứng lật thẻ 3D qua `framer-motion`.
  - 4 nút đánh giá độ nhớ chuẩn SM-2: *Again (0), Hard (3), Good (4), Easy (5)*.
  - Nút phát âm âm thanh chuẩn UK/US.
- [ ] **Celebration Screen:**
  - Hiệu ứng pháo hoa `canvas-confetti` khi hoàn thành bài học từ vựng.

---

## 3. Acceptance Criteria
- [ ] Ghi âm âm thanh rõ ràng, hiển thị sóng âm `wavesurfer.js` chuẩn xác.
- [ ] Thuật toán SM-2 tính đúng ngày ôn tập tiếp theo dựa trên đánh giá của người dùng.
- [ ] Hiệu ứng lật thẻ 3D mượt mà 60fps không bị giật lag.
