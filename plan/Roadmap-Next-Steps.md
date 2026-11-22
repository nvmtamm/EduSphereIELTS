# Kế Hoạch Triển Khai Tiếp Theo — EduSphere IELTS

> Cập nhật 2026-11-22. Thay thế phần "Sprint 4–7" cũ trong `Sumary.md` (đã lỗi thời: GPT-4o → **Gemini**). Xem hiện trạng ở `Project-Status-Report.md`.
> Quy ước giữ nguyên `AGENTS.md`: UI 100% tiếng Anh, 80/20 brand (đỏ/đen/trắng), Clean Architecture + CQRS.

## Nguyên tắc ưu tiên
1. Hoàn tất **4 kỹ năng** trước (Writing → Speaking), vì đó là lõi sản phẩm.
2. Dùng chung hạ tầng AI: một `IAiGradingService` + `IAiTutorService` (Gemini, structured JSON, retry, cache), tái dùng pattern Reading/Listening tutor.
3. Mọi đề có metadata kiểu DOL: `Source`, `Quarter`, `QuestionTypeTag`, `AttemptCount`.
4. Mỗi sprint kết thúc bằng: unit test, build FE sạch, cập nhật README + `walkthrough.md`.

---

## Sprint 3.9 — TIẾN ĐỘ (nhánh `sprint/sprint-3.9-learning-path`, chưa commit)
| Hạng mục | Trạng thái |
|---|---|
| Màn chọn **Practice / Real exam** (Reading + Listening, `?mode=`) | ✅ code xong, build OK; chưa kiểm thử trên trình duyệt |
| Practice: không đếm ngược (Reading dùng đồng hồ đếm lên; Listening `isTimed=false`, nghe lại tự do); Exam: đếm ngược, Listening nghe 1 lần, ẩn AI Tutor/hint | ✅ |
| **Hint ladder 4 bước** (`GET /api/reading/passages/{id}/questions/{qid}/hint?step=1..4`, panel trong Practice) | ✅ BE + FE; bước 3 dùng Gemini/fallback tutor, bước 4 hiện đáp án + explanation |
| Dạng câu hỏi Reading mới: `MatchingInformation`, `MultipleChoiceMulti`, `ShortAnswer` (enum, chấm điểm, renderer) | ✅ code + 12 unit test mới; **chưa có đề seed dùng các dạng này** |
| Highlight/Note/Tra nghĩa, chip chân trang, trang giải thích 4 bước, tiến độ danh sách, Learning Path, lesson viewer | ⏳ chưa làm |
| Kiểm thử: `dotnet test` 100/100 pass; `npm run build` pass | ✅ |

## Sprint 3.9 — Dọn nợ & chuẩn hóa (2–3 ngày)
| # | Việc | Done khi |
|---|---|---|
| 1 | Merge `develop` → `main`, tạo nhánh sprint-4 từ `develop` | Nhánh sạch |
| 2 | Cập nhật `Sumary.md`/README: Gemini, số test thật, đường dẫn mới | Tài liệu khớp code |
| 3 | Dashboard thật: gọi API lịch sử Reading/Listening, Recharts radar + trend (F-06) | Biểu đồ dữ liệu thật |
| 4 | Listening còn lại: F-05 autosave từng câu, F-07 section nav, F-10 speed preference, F-11 flagged review | Tick trong extension plan |
| 5 | Thêm `AttemptCount`, `Source`, `Quarter` + filter/tag cho Reading & Listening list | List giống kho đề DOL |
| 6 | Qdrant thật thay `InMemoryVectorStore` (docker compose đã có) | RAG persist qua restart |
| 7 | Gom `ReadingAITutorService`/`ListeningAITutorService` → `IAiTutorService` chung | 1 service, 2 skill dùng chung |

## Sprint 4 — Writing AI ⭐ (1.5 tuần) — ƯU TIÊN SỐ 1
**Backend**
- Entity: `WritingPrompt` (Task1 Academic/General, Task2; `EssayType`: Opinion, Discussion, Adv/Disadv, Two-part, Problem-Solution; `Topic`, `ImageUrl`/`ChartData`, `Quarter`, `ModelEssay`, `ModelBand`, `Outline`), `WritingSubmission`, `WritingFeedback` (4 tiêu chí, overall làm tròn chuẩn IELTS, `ErrorsJson`, `VocabSuggestionsJson`).
- Rubric RAG: nạp official band descriptors Task 1/Task 2 vào Qdrant (`rag/rubrics/writing_*.json`).
- `SubmitWritingCommand` → `GradeWritingHandler`: prompt Gemini yêu cầu JSON schema cố định; parser chịu lỗi (retry 1 lần, validate band bội 0.5); kiểm tra word count (<150/<250 trừ Task Response).
- Endpoints: `GET /api/writing/prompts`, `GET /prompts/{id}`, `POST /submit`, `GET /submissions/{id}`, `GET /history`, `POST /submissions/{id}/chat` (SSE).
- Seed: ≥ 20 prompt (10 Task 2 đủ dạng, 6 Task 1 Academic có biểu đồ, 4 General), kèm bài mẫu + dàn ý + vocab.
**Frontend** (`features/writing/`)
- Hub: lọc theo Task/dạng/chủ đề/quý (giống kho bài mẫu DOL) + lịch sử band.
- `WritingWorkspace`: `react-resizable-panels` (đề | editor), Tiptap + `character-count` (đỏ/xanh theo 150/250), timer 20/40 phút, autosave.
- `WritingResultPage`: radar 4 tiêu chí, nhận xét theo tiêu chí, highlight lỗi inline, so sánh với model essay, rewrite band 8, nút **thêm từ vào Flashcard**.
- Chat hỏi AI về bài viết bằng `@assistant-ui/react` (streaming).
**Test**: parser chấm điểm, làm tròn band, word-count rule, handler với AI mock. **Accept**: bài nộp → điểm đủ 4 tiêu chí < 10 s.

## Sprint 5 — Speaking + Vocabulary SM-2 (1.5 tuần)
**Speaking**
- Entity `SpeakingTopic` (Part 1/2/3, cue card, follow-ups, `Quarter`, sample 8.0+, dàn ý, vocab), `SpeakingAttempt`, `SpeakingFeedback` (Fluency, Lexical, Grammar, Pronunciation).
- Pipeline: ghi âm (MediaRecorder) → upload S3 (đã có presigned) → Gemini audio/STT transcript + chấm. Pronunciation: dùng độ tin cậy STT + nhận xét AI, nói rõ là ước lượng.
- UI `SpeakingRoom`: Part 1 hỏi đáp tuần tự, Part 2 cue card (1 phút chuẩn bị + 2 phút nói), Part 3 hội thoại; waveform wavesurfer; kết quả + sample answer so sánh. MVP có chế độ **text** nếu không có mic.
**Vocabulary**
- `VocabularyWord`, `UserVocabularyProgress`, `SpacedRepetitionService` (SM-2, unit test 0–5), `GetDueCards`, `ReviewCard`, `AddFromSource` (Reading/Listening/Writing/Speaking, tái dùng `BandVocabulary` đã seed).
- UI: flashcard 3D framer-motion, nút Again/Hard/Good/Easy, bộ từ theo topic/band, quiz, confetti, streak.
**Accept**: SM-2 đúng lịch; flip 60fps; ghi âm → feedback hoàn chỉnh.

## Sprint 6 — Mock Test + Dashboard + AI Tutor chung (1.5 tuần)
- **Mock Test**: Full (L 30’+10’ → R 60’ → W 60’ → S) hoặc Mini 1 kỹ năng; lock & auto chuyển phần khi hết giờ; lưu tạm để reload không mất (tái dùng `useListeningSessionPersist`); Overall band + score report; lịch sử. Bộ đề tổ chức theo "bộ sách/Real Test/Forecast" như DOL.
- **Dashboard**: radar 4 kỹ năng, trend band, streak, target vs current, dự đoán ngày đạt target, điểm yếu theo question type, activity feed.
- **AI Tutor 24/7**: `/api/aitutor/chat-stream` (SSE), RAG Qdrant, citations, quick prompts, đổi nhãn sidebar thành "AI Tutor".
- **Study Plan**: gợi ý bài hôm nay từ điểm yếu + SM-2 due cards (nối Band Roadmap sẵn có).
- Redis cache: lists, dashboard (TTL 2’), invalidate khi submit.

## Cập nhật sau khảo sát có đăng nhập (superLMS + tuhoc)
Bổ sung vào các sprint (chi tiết nghiệp vụ ở `Project-Status-Report.md` mục 4b):

| Phát hiện | Đưa vào | Việc cụ thể |
|---|---|---|
| Cổng **Luyện tập vs Thi thật** | **Sprint 3.9** | Màn chọn chế độ trước khi vào Reading/Listening: Practice (không giờ, có hỗ trợ), Exam (tính giờ, không hỗ trợ); lối tắt "Xem đề / Xem giải thích"; thêm `Mode` vào submission |
| **Hint ladder 4 bước** | **Sprint 3.9** | Panel hỗ trợ từng câu: Hiểu câu hỏi → Định vị dẫn chứng → Đọc dẫn chứng → Chọn đáp án, nút "Thêm gợi ý" (gợi ý tăng dần), sinh bằng Gemini + cache theo `questionId` (tận dụng `ReadingAITutorService`) |
| Phòng thi: Aa cỡ chữ, dark mode, thanh kéo panel, báo lỗi/góp ý, palette theo Passage | **Sprint 3.9** | Thêm font-size, dark toggle, `FeedbackReport` entity + nút "Report issue" trong phòng thi |
| **Review theo lượt** (Attempt 1, 2…) + Làm lại + popup đáp án/giải thích | **Sprint 3.9** | `GET /submissions?testId` chọn lượt; nút Retake; modal giải thích |
| Roadmap game (Mốc → Day → Practices), % tiến độ | **Sprint 6** | Mở rộng `BandRoadmap/BandMilestone` thành `Roadmap → Milestone → Day → Practice` cho cả 4 kỹ năng; UI bản đồ hành trình; streak |
| Vocabulary set theo bài + Linear Model + Flashcard + "khu vườn" | **Sprint 5** | `VocabSet` gắn với passage/test; trạng thái new/learning/review/wrong; "Garden" = tổng hợp số từ khỏe / cần ôn từ SM-2; phím tắt ←/→/Space/X |
| **Entrance test / Final test / CEFR** | **Sprint 6** | Placement test đầu vào (Vocab, Grammar, Reading, Writing, Speaking %) → gán band khởi điểm + roadmap; biểu đồ CEFR A1–C2 song song band |
| Test history + **kết quả IELTS thực tế** tự nhập | **Sprint 6** | Màn "Test history": mock/final/entrance + form nhập band thật (4 kỹ năng, ngày thi, ảnh điểm qua S3) để hiệu chỉnh dự đoán |
| Certificates, Memory capsule, Referral | Backlog | Chứng chỉ khi hoàn thành roadmap (PDF); các tính năng cộng đồng làm sau |

## ✅ QUYẾT ĐỊNH (2026-11-22): EduSphere giữ **tự học thuần** — KHÔNG làm LMS-lite
Không có Teacher/Class/Assignment-giao-cho-lớp, điểm danh, Zoom, bảo lưu. Thay vào đó **học từ giáo trình & UI của superLMS và gộp vào tự học** (chi tiết `Project-Status-Report.md` mục 4c):

### Gói "Learning Path" (thay cho LMS) — chèn vào Sprint 3.9 / 4 / 5 / 6
| # | Việc | Sprint |
|---|---|---|
| 1 | **Learning Path theo giáo trình Linearthinking**: 3 chặng *Listening+Speaking → Writing → Reading* × 9 bài (SL1–9, W1–9, R1–9), mỗi bài = *Lesson summary* + *Exercises* + *Vocabulary set* + *Online test* (+ Samples/Speaking room cho chặng nói). Entity `LearningPath → Stage → Lesson → LessonItem`; tiến độ % từng bài/chặng | 3.9 (khung) → 6 (hoàn thiện) |
| 2 | **Lesson viewer** (slide/PDF có mục lục, zoom, prev/next) cho "summary mỗi bài"; nội dung tự viết (không sao chép của DOL): 4 bước TFNG, gap fill, … | 3.9 |
| 3 | **Exercises Grammar/Structure** (MCQ chức năng cấu trúc, điền từ) + màn **Review attempt** (chọn lượt, Retake, popup đáp án+giải thích) | 3.9 |
| 4 | **Samples** cho Speaking Part 1/3 & Writing Task 1/2: mục lục (Câu hỏi → Sample từng câu có audio → Vocabulary → Bài tập điền từ), đánh dấu đã đọc | 4–5 |
| 5 | **Writing review** kiểu inline: gạch phần sai, thêm từ đúng, thẻ `[IMPROVE LANGUAGE/COHERENCE]`, tab *Sample | Info | Evaluation*, điểm lớn | 4 |
| 6 | **Speaking review**: waveform, transcript gạch xanh/đỏ từng từ, "AI pronunciation fix", 3 gợi ý nâng cấp từ vựng | 5 |
| 7 | **Speaking Simulation Room**: Mic check (ghi thử, đổi micro) → vào hội thoại, Real mode, AI mock test theo từng bài | 5 |
| 8 | Bài **Build a sentence/paragraph** + **Collocation** (Writing nền tảng, chấm tự động/AI) | 4 |
| 9 | **Chấm lại chất lượng phản hồi AI** (👍/👎 + 0–10 + góp ý) sau mỗi bài chấm | 4–5 |
| 10 | Streak + "bắt đầu streak hôm nay" trên Dashboard; chặng kết thúc có **Final test 3 kỹ năng + CEFR** | 6 |

### Bổ sung từ Gap Analysis (`DOL-Reference-Gap-Analysis.md`)
| # | Việc | Sprint |
|---|---|---|
| 11 | Dạng câu hỏi Reading mới: **Matching Information (lưới A–F)**, **Multi-select**, **Short answer** (+ renderer, scoring, seed) | 3.9 |
| 12 | Bộ công cụ **Highlight 5 màu / Note / Eraser / Tra nghĩa / Quản lý** dùng chung Reading & Listening (script) | 3.9 |
| 13 | Chân trang phòng thi: chip số câu theo Passage/Section, nút nhảy nhóm, "Nộp bài" ở cuối; hộp thoại *Tiếp tục làm bài* cho Reading | 3.9 |
| 14 | **Trang giải thích sau thi**: tab Giải thích/Từ vựng, toggle *Định vị đáp án*, template 4 bước Linear (prompt Gemini + cache), "N từ cần học" theo passage | 3.9 → 5 |
| 15 | Dictation: kho riêng + bộ lọc, EASY/HARD, nhập giọng nói, shadowing & phát âm từng từ | 5 |
| 16 | Build-a-sentence/Collocation: đề từ khóa gợi ý + panel *Sửa bài làm* theo nhóm WORD PATTERN / IMPROVE MEANING / IMPROVE LANGUAGE | 4 |
| 17 | Danh sách bài: tiến độ tổng + trạng thái Chưa/Đang/Đã làm, lọc Kỹ năng/Phân loại | 3.9 |
| 18 | Leaderboard Top 5 theo bài (ẩn danh, tùy chọn) | Backlog |

### Ghi chú trạng thái gói cũ "Sprint 6.5 LMS-lite"
Đã **hủy**; phần dưới giữ lại chỉ để tham khảo.

## (Đã hủy) Sprint 6.5 — LMS-lite
superLMS xác nhận mô hình lớp học thật: Course → 3 stage → Session (R1…R9, có slide summary), điểm danh, giao Exercise/Vocab/Online test/Roadmap theo tuần, giáo viên chấm Final test (Reading/Writing/Speaking), bảo lưu, buổi bù. Vì EduSphere là nền tảng **tự học**, đề xuất **không sao chép LMS**, chỉ làm bản tối thiểu nếu có nhu cầu lớp/giáo viên:
- Vai trò `Teacher`; entity `Class`, `Enrollment`, `Assignment` (giao Test/Exercise/VocabSet/Roadmap cho cả lớp, hạn nộp).
- Teacher dashboard: tiến độ & band lớp, xem/nhận xét bài Writing/Speaking đã được AI chấm.
- Bỏ qua: Zoom/lịch học, điểm danh, bảo lưu, kỷ yếu.
→ Chỉ làm sau Sprint 6 và khi bạn chốt nhu cầu (câu hỏi 1 bên dưới).

## Sprint 7 — Kiểm thử, hardening, deploy (1 tuần)
- Unit ≥ 80% lõi (SM-2, scoring, writing parser, auth); integration (WebApplicationFactory + Respawn) cho Auth/Reading/Writing; Playwright E2E luồng chính.
- Dockerfile multi-stage, nén Gzip/Brotli, security headers, `AsNoTracking`, bundle analyzer (chunk 1.35 MB hiện tại cần cắt: lazy-load route).
- **Kiểm tra bản quyền nội dung/audio** trước khi public; chuyển bucket S3 sang CloudFront/signed URL nếu cần.
- Deploy (Azure Container Apps/Render/Railway), quản lý secrets, health checks, giám sát chi phí Gemini (rate limit/user).
- README: live demo, GIF 4 kỹ năng.

## Mốc thời gian đề xuất (từ 2026-11-23)
| Sprint | Thời lượng | Dự kiến xong |
|---|---|---|
| 3.9 Dọn nợ | 3 ngày | 11-26 |
| 4 Writing AI | 1.5 tuần | 12-07 |
| 5 Speaking + Vocab | 1.5 tuần | 12-18 |
| 6 Mock/Dashboard/Tutor | 1.5 tuần | 12-30 |
| 6.5 LMS-lite (nếu làm) | 1 tuần | 01-06 |
| 7 Test + Deploy | 1 tuần | 01-13 |

## Câu hỏi cần bạn chốt
1. ~~LMS-lite~~ → Đã chốt: tự học thuần. Câu hỏi mới: nội dung giáo trình (lesson summary, exercises) bạn tự viết hay dùng AI soạn rồi tự duyệt? (Không sao chép nội dung DOL vì bản quyền.)
2. Chấm Speaking dùng audio trực tiếp với Gemini hay chỉ STT + chấm text?
3. Deploy ở đâu và có công khai audio Cambridge không (rủi ro bản quyền)?
