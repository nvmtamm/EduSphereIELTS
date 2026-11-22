# Báo Cáo Tổng Quan Dự Án EduSphere IELTS

> Ngày lập: 2026-11-22 · Nguồn: đọc code repo, `plan/`, `README.md`, lịch sử git (~75 commit, nhánh `main`/`develop`/`sprint/*`) và khảo sát công khai `tuhoc.dolenglish.vn`.
> Khảo sát cả `superlms.dolenglish.vn` và `tuhoc.dolenglish.vn` (đã đăng nhập) — xem mục 4 và 4b.

---

## 1. Tóm tắt điều hành

EduSphere là nền tảng luyện IELTS (React 19 + .NET 8 Clean Architecture + AI Gemini). **Sprint 0–3 hoàn tất** (Foundation, Auth, Reading, Listening), cộng thêm một đợt mở rộng Listening (Sprint 3.5). **Writing, Speaking, Vocabulary, Mock Test, AI Tutor, Dashboard thực chất chưa làm**: sidebar và route đã có nhưng `/writing`, `/speaking`, `/vocabulary`, `/mock-test`, `/ai-tutor` hiện chỉ là placeholder (`Router.tsx`), Dashboard mới 166 dòng.

Tiến độ theo 4 kỹ năng: **Reading ✅ · Listening ✅ · Writing ❌ · Speaking ❌**. Tức khoảng 50% giá trị cốt lõi; và Writing (tính năng "ngôi sao" theo kế hoạch ban đầu) chưa bắt đầu.

## 2. Những gì đã làm (theo git)

| Giai đoạn | Nội dung chính | Commit tiêu biểu |
|---|---|---|
| Docs ban đầu | Requirements, SRS, Architecture, API, ERD, Database, Testing, Deployment, Roadmap 8 sprint | `d48ab8b` … `328a33b` |
| Sprint 0 | Solution Clean Architecture, MediatR pipeline, RFC 7807, Serilog, Swagger JWT, Docker Compose (SQL Server/Redis/Qdrant), CI | `6615b2d` … `8b00b84` |
| Sprint 1 | Domain Auth, JWT + refresh, BCrypt, Google OAuth2, OTP reset qua Gmail SMTP, UI auth, Profile modal (target band) | `b03e65e` … `3d241f9` |
| Sprint 2 | Reading: entity + seed Cambridge, scoring engine, split workspace CD-IELTS, **multi-agent ingestion PDF/DOCX bằng Gemini** (`agentic/`), RAG tutor (`rag/`), Band Roadmap + Band Vocabulary, shadcn-admin UI, cmdk | `4459d22` … `13d9d17` |
| Sprint 3 | Listening: entity/seed 4 đề (gồm Full 40 câu), scoring Cambridge (chuẩn hóa đáp án, bảng band), wavesurfer player, transcript đồng bộ, notepad, palette 40 câu, CBT exam room | `c906387` … `34bd704` |
| Sprint 3 Extension | F-01 single-play, F-02 session persistence, F-03 TableCompletion, F-04 multi-audio (`ListeningSectionAudio`) | `44849a5` … `0050ed9` |
| Sprint 3.5 | Audio lên **AWS S3** (presigned PUT), redesign Bento + CBT, AI Diagnostic Explainer (Gemini), **Dictation Studio**, confetti, fix Safari | `59c481c` … `ae58060` |
| Hạ tầng | Harness CI, vendor chunk splitting, linguist override, README + sơ đồ kiến trúc | cuối lịch sử |

### Chỉ số hiện tại
- Backend: Domain/Application/Infrastructure/API + `agentic/`, `rag/`, `database/seeds`; controllers: Auth, Reading, Listening, Media.
- Test: README ghi **88 unit test** (walkthrough Sprint 3 ghi 84; cần đồng bộ). Chưa có integration test.
- Frontend: features `auth`, `reading`, `listening`, `dashboard`; đã cài sẵn `@tiptap/react`, `@assistant-ui/react`, `recharts`, `react-resizable-panels`, `wavesurfer.js` nhưng Tiptap/assistant-ui/Recharts chưa dùng thực tế.
- Branch `sprint/sprint-4…7` đã tạo trên origin nhưng chưa có code.

## 3. Khoảng lệch giữa tài liệu và thực tế (cần dọn)

1. `plan/Sumary.md` vẫn ghi **GPT-4o/OpenAI + Semantic Kernel**; thực tế dùng **Gemini** (pool API key, embeddings Gemini, `InMemoryVectorStore`; Qdrant mới chỉ có trong docker-compose).
2. `Sumary.md` nói AI Tutor là Sprint 6, nhưng AI tutor Reading/Listening đã làm sẵn → cần gộp thành một `IAiTutorService` chung.
3. Sidebar có nhãn "AI Reading Coach" trong khi plan gọi là "AI Tutor" tổng.
4. Seed Listening mới 4 đề (plan gốc: 10–15), Reading chưa rõ số lượng; Writing/Speaking/Vocab chưa có seed.
5. Số test lệch giữa README (88) và walkthrough (84). Đường dẫn file trong Sprint-3 extension plan trỏ `/Users/nguyenvanminhtam/EduSphere/...` (đường dẫn cũ).
6. Sprint 3 Extension F-05…F-15 chỉ làm một phần (F-09 explainer + dictation làm; F-05 autosave từng câu, F-06 trend chart, F-07 section nav, F-08 community upload, F-10…F-15 chưa xác nhận).

## 4. Bài học nghiệp vụ từ `tuhoc.dolenglish.vn` (khảo sát công khai)

### Cấu trúc sản phẩm
- Menu: **IELTS Online Test** · IELTS Reading Practice · IELTS Listening Practice · Bài mẫu Writing (Task 1 General / Task 1 Academic / Task 2) · Bài mẫu Speaking (Part 1/2/3) · Chép chính tả (Dictation) · Đăng nhập. Phần lớn nội dung xem công khai, **đăng ký để mở khóa premium** (làm bài tính điểm, lưu lịch sử).
- Sinh thái: Tự Học IELTS, Grammar, Từ điển, THPT, superLMS (lớp học).

### Reading
- Kho theo **từng passage** (13–14 câu), mỗi thẻ hiển thị **số câu + lượt làm** (social proof: 12K–57K) và nút "Làm bài".
- Trang đề: tiêu đề SEO, nguồn sách (Cam Inspired 16 Test 1 Passage 3), nút **Làm Bài / Xem giải thích**, 3 phần: Bài đọc – Câu hỏi – **Answer key + giải thích chi tiết (Linearthinking)**, link sang các passage/section cùng bộ đề, bài liên quan.
- Phân trang 26 trang → số lượng đề lớn.

### Listening
- Kho theo **section** (10 câu/section), 37 trang, có lượt làm; audio + transcript + answer key + từ vựng đi kèm; "giao diện như thi trên máy".

### Online Test (Full)
- Tổ chức theo **bộ sách**: Cam Inspired 09–21 (8 test/bộ), Practice Test Plus, **Real Test 2026 Q1/Q2, Forecast 2026** — mỗi bài 40 câu; có mục "Bài test mới nhất".
- 3 lợi thế được quảng bá: đề mới & nhiều; giao diện như thi thật; giải thích + **từ vựng soạn sẵn sau nộp bài**.

### Writing
- Kho bài mẫu tag theo **dạng bài** (Advantages/Disadvantages, Two-part, Agree/Disagree…), **chủ đề**, **quý thi thật** (Quý 2/2026), mỗi bài có **bài mẫu 8.5+, dàn ý, từ vựng, bài tập ôn luyện**.

### Speaking
- Tách theo Part 1/2/3, tag theo chủ đề (Objects, Events…) và **quý thi thật**; mỗi bài: bài mẫu 8.0+, dàn ý, từ vựng, bài tập.

### Điểm EduSphere nên học (và nên khác biệt)
| DOL Tự Học | Hướng cho EduSphere |
|---|---|
| Nội dung tĩnh + giải thích | Giữ giải thích nhưng **thêm AI chấm & hỏi đáp** (lợi thế vượt trội) |
| Bài mẫu band cao + từ vựng + bài tập | Mỗi đề Writing/Speaking có Model answer + dàn ý + vocab → nối thẳng vào Flashcard SM-2 |
| Tag theo quý thi thật / dạng bài | Thêm metadata `Quarter`, `QuestionTypeTag`, `Source` cho mọi đề |
| Lượt làm (social proof) | Thêm `AttemptCount` hiển thị trên thẻ đề |
| Đăng ký mở khóa premium | Gate theo vai trò: khách xem đề, học viên mới nộp & lưu |
| Chép chính tả riêng | Đã có Dictation Studio (Listening) — mở rộng thành module độc lập |

## 4b. Khảo sát chi tiết có đăng nhập (2026-11-22)

> Đã thao tác trên `superlms.dolenglish.vn` và `tuhoc.dolenglish.vn` bằng tài khoản học viên (chỉ xem/Review, không nộp bài). Không ghi lại thông tin cá nhân hay tên học viên khác.

### A. superLMS — Cổng học viên của DOL (LMS thật)
**Điều hướng chính (menu trái):** Home · Courses · Room & schedule · Test history · Thi thật (exam-support) · Certificates · Memory capsule · Notification.

| Màn hình | Route | Nghiệp vụ quan sát được |
|---|---|---|
| **Home / My classes** | `/my-classes` | "Xem nhanh quá trình học": số buổi đã đi học, số bài luyện tập, số assignment hoàn thành; khối "Khóa đang học" (hoặc CTA tìm khóa); tài nguyên khác (Dictionary, Online Test, Writing sample); banner **giới thiệu bạn bè – thưởng 300k** (referral) |
| **Courses** | `/my-classes/courses` | Danh sách khóa theo trạng thái: hoàn thành / **bảo lưu** (`Bảo lưu`) ; mỗi thẻ: tên lớp (level-hình thức-ngày-giờ), Assignment x/y, ngày hoàn thành, **Final test %**, % tiến độ |
| **Course overview (rolling)** | `/my-classes/{id}/rolling-overview` | Khóa chia **3 giai đoạn (stage)**: Speaking+Listening → Writing → Reading, mỗi giai đoạn 9 buổi/3 tuần, lịch 20:00-22:00 Zoom; hiển thị bạn cùng lớp, giáo viên, nút "Xem lại khóa", cờ "Bảo lưu học lại" |
| **Stage overview** | `/my-classes/{id}/overview` | 4 thẻ số liệu: Course progress, Attendance, Practice, Assignments; **streak** luyện tập; tóm tắt điểm danh (có mặt/vắng %), "Các bài test cần làm", "Bài luyện tập" gồm 4 loại: Roadmap · Exercise · Vocabulary set · Online test (mỗi loại có % hoàn thành) |
| **Attendance & summary** | `/attendance` | Danh sách buổi học (Standard + **buổi bù**), giáo viên, ngày giờ, mã bài (R1…R9) + tên bài, nút **View summary** (slide tóm tắt bài học theo buổi); báo giáo viên nếu điểm danh sai |
| **Exercises** | `/exercise` | Bài tập theo giai đoạn/tuần (Reading 1…9), lọc *Trạng thái* (Chưa làm / Đang làm / Đã làm) và *Phân loại*, tìm kiếm; thẻ hiển thị số câu / "Đang làm 1/24" / "Best score 11/16"; thanh tiến độ tổng; menu **Review** hoặc **Làm lại** |
| **Exercise attempt/review** | `/user-exercise/{id}/my-attempt` | Header: tên bài, điểm `11/16 Correct`, **chọn lượt làm (Attempt 1: giờ)**, flag; thông tin exercise (loại, người làm, giờ làm/nộp), thông tin khóa/tuần/giáo viên phụ trách; từng câu hiển thị đáp án chọn + nút **"Xem đáp án và giải thích"** (popup: Câu hỏi → Đáp án đúng → Giải thích); thanh "Bảng câu hỏi" xanh/đỏ/trống |
| **Vocabulary set** | `/vocab`, `/vocab/{id}` | Mỗi bộ từ gắn với bài đọc/nghe; thống kê *đã học / còn mới / cần ôn / từ sai*; "x HV đã học xong" (social); 2 chế độ **Học theo Linear Models** và **Flashcard**; thẻ từ có IPA, loại từ, định nghĩa EN/VI, ví dụ ngữ cảnh song ngữ, phím tắt (←/→, Space, X đổi EN/VI); **"Khu vườn nhỏ" gamification** (cây tươi tốt / cây cần tưới = từ nhớ/cần ôn — mô phỏng spaced repetition); video hướng dẫn; popup "Hướng dẫn học đúng cách" |
| **Online tests (được giao)** | `/online-test` | Danh sách bài practice test theo kỹ năng/tuần/số câu, tiến độ x/19 |
| **Roadmap cá nhân hóa** | `/roadmap`, `/course-roadmap/progress/{id}` | Giáo viên **giao roadmap** (vd. "IELTS 5.0 – Listening Roadmap", "Roadmap IELTS Tết"), hiển thị `x/39 ngày – 65 practices`; bản đồ hành trình dạng game: START → **Mốc 1…4** → END, mỗi mốc gồm DAY 1…N, mỗi ngày vài bài; ngày hoàn thành = tick xanh, ngày hiện tại = vòng xoay; lời động viên theo chặng |
| **Final Test** | `/final-test` | Bài cuối khóa 3 kỹ năng (Reading/Writing/Speaking) với thời gian làm, ngày nộp, trạng thái **Đã chấm** (giáo viên chấm), điểm từng kỹ năng + overall, **thang CEFR A1→C2**, nút Xem kết quả |
| **Test history** | `/my-classes/test-history` | (1) **Kết quả IELTS thực tế**: tự nhập Centre number, ngày thi, 4 band, upload ảnh điểm, gửi cho DOL nhận quà; (2) lịch sử **Final Test** và **Entrance Test** (Vocab/Grammar/Reading/Writing/Speaking %, CEFR) |
| **Thi thật** | `/exam-support` | Hỗ trợ đăng ký thi IELTS chính thức: chọn hội đồng thi, upload phiếu dự thi, inbox DOL |
| **Certificates** | `/certificates` | Chứng chỉ theo khóa (số buổi, số bài học, tổng giờ, mô tả); khóa bảo lưu không được cấp; cập nhật mỗi giờ |
| **Memory capsule** | `/memories` | Album kỷ niệm lớp: upload ảnh, danh sách bạn cùng lớp, lọc ảnh của bạn / từ DOL / HV khác |
| **Room & schedule** | `/room-n-schedule` | Lịch học sắp tới (Normal / Extra), link Zoom riêng mỗi học viên (cảnh báo không chia sẻ) |

**Mô hình dữ liệu suy ra:** `Course (level, mode Online/Offline) → Stage (3) → Session (R1…R9, summary slide) ; Registration/Enrollment (trạng thái: học / hoàn thành / bảo lưu) ; Attendance ; Exercise → CourseExercise (giao theo tuần) → UserExercise → Attempt ; VocabSet → Word → UserWordProgress ; Roadmap → Milestone → Day → Practice ; OnlineTest ; FinalTest/EntranceTest (CEFR) ; Certificate ; MemoryPhoto ; Notification ; Referral`.

### B. tuhoc — Phòng thi online (đã đăng nhập)
- **Cổng chọn chế độ trước khi làm bài** (rất đáng học):
  - **Luyện tập**: không tính giờ, *có hỗ trợ khi làm bài*, gợi ý sẵn.
  - **Thi thật**: tính giờ chuẩn, *không hỗ trợ*. Thêm lối tắt **Xem đề**, **Xem giải thích**.
- **Giao diện Reading (CBT)**: thanh trên (thoát, đồng hồ đếm ngược 60:00, cỡ chữ **Aa**, bật/tắt chia đôi/panel hỗ trợ, menu ⋮ gồm *Báo lỗi/Góp ý* và *Giao diện tối*); chia đôi **Passage | Câu hỏi**, có thanh kéo chỉnh độ rộng; câu hỏi gom nhóm ("Question 1-7") kèm đề bài; chân trang: **Bảng câu hỏi theo Passage** (ô số, trạng thái đã làm), "Đã làm 0/13", nút nhảy nhóm "8-13".
- **Hướng dẫn làm bài từng câu (chế độ Luyện tập)**: panel bên phải có tab *Câu 1…7*, các bước **Hiểu câu hỏi** (ý chính, thông tin cần điền, yêu cầu ngữ pháp, giới hạn từ) → **Định vị dẫn chứng** → **Đọc dẫn chứng bằng Linearthinking** → **Chọn đáp án**, mỗi bước có nút **"Thêm gợi ý"** (gợi ý tăng dần). Lần mở đầu mất vài chục giây (sinh gợi ý bằng AI/cache).
- Trang đề: lượt làm, "Bài làm gần đây – Làm tiếp" (resume), kho theo bộ sách, nút Xem giải thích sau thi; báo mạng ("Đã có mạng trở lại") → có xử lý offline/khôi phục.
- Cookie consent chia nhỏ (đo lường/quảng cáo chỉ bật khi đồng ý).

### C. Rút ra cho EduSphere (bổ sung cho mục 4)
1. **Hai chế độ làm bài (Practice vs Real exam)** là trụ cột: EduSphere hiện thiên về CBT thi thật; cần thêm **Practice mode có gợi ý tăng dần** (AI tutor đã có nền sẵn).
2. **Hint ladder 4 bước** cho từng câu Reading/Listening: Understand → Locate evidence → Read evidence → Choose answer.
3. **Lớp học/giai đoạn/buổi/điểm danh** là LMS thật, nhưng EduSphere là self-study → chỉ cần bản nhẹ: *Study Plan / Roadmap theo ngày–mốc* (đã có `BandRoadmap`) + streak + giao bài (nếu có teacher).
4. **Roadmap dạng bản đồ game** (Mốc → Day → Practices) + tiến độ % → nâng cấp `ReadingRoadmapHub` hiện có, mở rộng cho cả 4 kỹ năng.
5. **Vocabulary set theo bài học** + Linear Model + flashcard + "khu vườn" (cây tươi/cần tưới) + trạng thái đã học/mới/cần ôn/sai → ánh xạ trực tiếp vào SM-2 của Sprint 5.
6. **Lịch sử kiểm tra**: Entrance test → Final test → IELTS thật, thang **CEFR** song song band → Dashboard cần "Placement/Entrance test" đầu vào và biểu đồ so sánh.
7. **Review attempt** theo lượt (Attempt 1, 2…), nút Làm lại, popup đáp án+giải thích; **Báo lỗi/Góp ý** ngay trong phòng thi.
8. Gamification: streak, chứng chỉ, referral/thưởng, memory capsule (nice-to-have, ưu tiên thấp).
9. Giáo viên chấm Writing/Speaking trong Final test (trạng thái *Đã chấm*) → EduSphere thay bằng **AI chấm + (tùy chọn) teacher review**.

> Chưa quan sát: Writing/Speaking exercise có chấm bởi giáo viên (không có bài đang mở), màn hình kết quả Final Test chi tiết (mở tab mới bị chặn), chế độ Thi thật, phòng thi Listening (chỉ xem cổng chọn chế độ).

## 4c. Khảo sát bổ sung: giáo trình & giao diện bài học trên superLMS (quyết định: EduSphere giữ **tự học thuần**, không làm LMS-lite)

### Giáo trình IELTS 5.0 (3 giai đoạn × 9 buổi, phương pháp **Linearthinking**)
| Giai đoạn | Kỹ năng | 9 buổi |
|---|---|---|
| 1 | **Listening + Speaking** | SL1 Tư duy học Listening – cách luyện tập · SL2 Structures for Reasons · SL3 Structures cho Wh-questions (Feeling/Opinion) · SL4 Cấu trúc Yes/No – Revision · SL5 Think in English · SL6 Linear tools · SL7 Ứng dụng Linearthinking vào Part 1 · SL8 …vào Part 3 · SL9 Revision & Improve câu trả lời |
| 2 | **Writing** | W1 Viết câu đúng · W2 Tự sửa lỗi + cải thiện câu · W3 Nối 2 câu + học vocab theo Linearthinking · W4 Các bước viết Task 2 + Outline Adv/Disadv · W5 Hoàn thiện essay Adv/Disadv · W6 Problem–Solution · W7 Mindset paraphrase Introduction · W8 Cause–Solution + Roadmap sau khóa · W9 Review + Final test |
| 3 | **Reading** | R1 How to read correctly · R2 Basic sentence structures · R3 Other structures · R4 Review structures (mixed) · R5 Gap fill · R6 TFNG · R7 How to read connection · R8 Deal with difficult vocab · R9 Review |

- Mỗi buổi có **summary PDF/slide** (viewer có mục lục, zoom, điều hướng trang). Ví dụ R6 TFNG: *Step 1 Read question & understand → Step 2 Locate information → Step 3 Read information & understand → Step 4 Compare meaning with meaning*; tư duy: tìm được thông tin agree ⇒ TRUE, disagree ⇒ FALSE, không tìm được ⇒ NOT GIVEN. **Đây chính là "hint ladder" mà tuhoc dùng** → xác nhận hướng thiết kế.
- Bài tập mỗi tuần (syllabus → "Homework"): **Exercises** (Grammar/lý thuyết), **Vocabulary set**, **Online test** (practice theo passage), ngoài ra giai đoạn Speaking còn **Sample W/S**, **Phòng thi ảo**, **AI mock test**, **Assignment**.
- Bản đồ cấp độ: Entrance test → 4.0 → 5.0 → 6.0 → … (R5.0 kết thúc "chuẩn bị học Reading 6.0").

### Các loại bài luyện (practice types) quan sát được
| Loại | Mô tả | Gợi ý cho EduSphere |
|---|---|---|
| Exercise (Grammar/Reading structures) | MCQ có chấm tự động, đa số "chọn đáp án theo chức năng cấu trúc", điền, đọc hiểu; có giải thích từng câu | Kho bài ngữ pháp/cấu trúc gắn với mỗi bài đọc; Question types mới: *structure function*, *sentence completion* |
| Vocabulary set | Gắn với 1 passage, flashcard + Linear Model, ví dụ song ngữ | `VocabSet` theo passage/test (Sprint 5) |
| Online test | Passage + câu hỏi chuẩn IELTS | Đã có Reading/Listening |
| **Sample W/S** | Trang bài mẫu có mục lục: *Danh sách câu hỏi → Sample từng câu (audio + dàn ý) → Vocabulary → Bài tập exercise (điền từ)*; Speaking Part 1 theo chủ đề (Technology, Sports, Daily life, Crime, Travel); đánh dấu đã đọc/chưa đọc (0/5) | Module **Samples** cho Writing & Speaking, tích hợp audio TTS/ghi sẵn và mini-quiz từ vựng |
| **AI mock test (Speaking)** | Luyện nói từng câu Part 1 (L1, L2, L4…) | Speaking Practice theo bài học (Sprint 5) |
| **Phòng thi ảo** | Mô phỏng thi Speaking Part 1/3: bước *Kiểm tra Microphone* (ghi thử, đổi micro, nghe lại) → *Bắt đầu vào hội thoại*; có "Real mode" | Speaking Simulation Room: mic check trước khi thi, chế độ Real |
| **Assignment** | Bài quan trọng, **có hạn nộp** ("Hết hạn"), có điểm (Score 5.0/10.0), 3–4 bài/giai đoạn: Speaking P1/P3, *Build a sentence/paragraph*, *Collocation*, Writing Task 2 (Adv/Disadv, 2-part) | Bỏ phần "giao bài/hạn nộp" (không LMS); giữ dạng bài **Build a sentence/paragraph** & **Collocation** như bài tập Writing nền tảng |

### Giao diện chấm bài (rất đáng áp dụng cho Sprint 4–5)
- **Màn review**: header (tên bài, **Điểm lớn màu đỏ**), 3 tab **Bài mẫu | Thông tin | Đánh giá**, điều hướng *Câu trước / Tiếp theo*.
- **Speaking review**: câu hỏi `1/4`, **waveform audio + thời lượng**, nút **"AI sửa phát âm"**, transcript từng từ được **gạch chân xanh/đỏ** (đúng/sai phát âm), đếm từ, "Copy nội dung", khối **Nhận xét bài làm** (khen cấu trúc/Linear tools + 3 gợi ý nâng cấp từ vựng dạng `"get new knowledge" → expand my knowledge`).
- **Writing review**: hiển thị đề + **sửa lỗi inline** (gạch ngang phần sai, thêm từ đúng), **thẻ chú thích** `[IMPROVE LANGUAGE IDEA 1]`, `[IMPROVE COHERENCE + LANGUAGE IDEA 2]`, ghi chú định dạng ("không cách đoạn nhé"), "Xem full đề bài".
- **Vòng phản hồi**: học viên **chấm lại chất lượng bài chấm** (0–10 + góp ý) sau mỗi bài → EduSphere thêm 👍/👎 + điểm chất lượng cho phản hồi AI để cải thiện prompt.

### Tính năng khóa học khác (ghi nhận, không triển khai)
Course info, Extra class, Feedback khóa học, Kỷ yếu, Certification, Assignment có hạn nộp, điểm danh, Zoom, bảo lưu → **bỏ qua** theo quyết định tự học thuần.

## 4d. Khảo sát bổ sung lượt 3 (phòng thi Listening, giải thích, Final Test, chính tả)
Chi tiết đầy đủ và ảnh tham chiếu: `DOL-Reference-Gap-Analysis.md` và `plan/references/`. Điểm mới đáng ghi:
- **Listening room (tuhoc)**: audio tự phát, player nổi (±15s, tốc độ), timer **chạy liên tục dù tạm dừng audio**, 4 section chia chip ở chân trang, nút *Section n →* và *Nộp bài* ở Section 4; dạng câu: Table/Note completion, MCQ, **Choose TWO letters**, Matching; bộ công cụ **Highlight (5 màu) / Note / Eraser / Tra nghĩa / quản lý highlight-note**.
- **Reading**: thêm dạng **Which paragraph contains…? (lưới A–F)**; hộp thoại *Tiếp tục làm bài*; chip điều hướng theo Passage.
- **Giải thích sau thi**: tab *Giải thích / Từ vựng*, toggle *Định vị đáp án*, giải thích 4 bước Linear (Phân tích câu hỏi → Định vị → Đọc vùng liên quan & read connections + Mạch ý + TÓM LẠI → Kiểm tra option/paraphrase); từ vựng "N từ hay cần học" mỗi passage.
- **Chép chính tả**: kho có bộ lọc/lượt chép; làm theo câu với EASY/HARD, nhập giọng nói, shadowing, script + dịch + từ hay.
- **Final Test result (superLMS)**: tổng % + Passed + nhận xét chung; Reading (thời gian, đúng/sai/trống), Writing overall, Speaking theo PR/FC/LR/GR.
- **Build a sentence / Collocation**: đề dạng từ khóa gợi ý, panel *Sửa bài làm* theo câu với nhóm nhận xét WORD PATTERN / IMPROVE MEANING / IMPROVE LANGUAGE; có Leaderboard Top 5 và timeline Mở bài → Làm → Nộp → Chấm → Gửi kết quả.
- **Bài mẫu Writing (Task 2)**: Đề bài → Dàn ý (Idea/Expand/Antithesis/Example) → Bài mẫu → Vocabulary → Bài tập → Lời kết.
- Chưa quan sát: màn kết quả ngay sau khi nộp (tuhoc), hội thoại Phòng thi ảo, chế độ Thi thật, Writing editor.

## 5. Rủi ro hiện tại
1. **Writing (tính năng chủ lực) chưa có** → ưu tiên cao nhất.
2. Phụ thuộc Gemini free-tier/key pool: cần retry, cache, fallback, kiểm soát chi phí.
3. Nội dung/audio Cambridge: kiểm tra **bản quyền** trước khi công khai deploy (S3 public bucket cho `audio/*`).
4. Không có integration test; Qdrant chưa thực sự dùng (đang InMemory) → RAG chưa bền vững.
5. Chưa có deploy; secrets trong `.env` cần quản lý khi lên cloud.

## 6. Ghi chú phạm vi
- Mục 4b đã thay thế phần "chưa khảo sát được superLMS" của bản đầu. Đã ghi chú những màn hình chưa quan sát được ở cuối mục 4b.
