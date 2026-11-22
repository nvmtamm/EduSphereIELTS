# Đối chiếu EduSphere với DOL (superLMS + tuhoc) — Gap Analysis

> Cập nhật 2026-11-22. Nguồn: khảo sát có đăng nhập hai site DOL + đọc code `frontend/src/features` và `backend/src`. Ảnh tham chiếu: `plan/references/superlms/*` và `plan/references/tuhoc/*` (đã bỏ ảnh có email/tên học viên). Quyết định sản phẩm: **tự học thuần**, không LMS. Không sao chép nội dung/ảnh/đề của DOL; chỉ học nghiệp vụ & bố cục.

Ký hiệu: ✅ đã có · 🟡 có một phần · ❌ chưa có. Sprint = nơi đề xuất làm (xem `Roadmap-Next-Steps.md`).

## 1. Phòng thi Reading / Listening (tuhoc)
| Tính năng DOL | Ảnh | EduSphere hiện tại | Sprint |
|---|---|---|---|
| Cổng chọn chế độ **Luyện tập** (không giờ, có hỗ trợ) / **Thi thật** (tính giờ, không hỗ trợ) + lối tắt Xem đề / Xem giải thích | tuhoc/01, 15 | ❌ (chỉ có chế độ thi CBT; Listening có `IsOfficialExamMode` nhưng chưa có màn chọn) | 3.9 |
| Hộp thoại **Tiếp tục làm bài** ("Bạn còn 40 câu trong 60 phút") | — | 🟡 Listening có `useListeningSessionPersist`; Reading chỉ timer | 3.9 |
| Thanh trên: thoát, tên đề, timer, **Aa cỡ chữ**, cờ báo lỗi, **dark mode**, bật/tắt chia đôi | tuhoc/02,05 | 🟡 có dark (ThemeContext), font-size ở PassagePanel; chưa có báo lỗi/góp ý | 3.9 |
| **Công cụ Highlight / Note / Eraser / Tra nghĩa / quản lý highlight** (5 màu) trên bài đọc & script | tuhoc/06 | 🟡 Reading `PassagePanel` có highlight; chưa có note, màu, eraser, tra nghĩa, quản lý | 3.9 |
| **Bảng câu hỏi theo Passage/Section** + thanh chip số câu ở chân trang, nút nhảy nhóm (8-13 →, Section 2 →, **Nộp bài** ở cuối) | tuhoc/04,05,09 | ✅ có palette (Reading, Listening 40 câu); 🟡 chưa có chip ngay chân trang + nút nhảy nhóm | 3.9 |
| Player Listening nổi: ±15s, play/pause, tốc độ, **tự phát**, 29:00 | tuhoc/05 | ✅ wavesurfer, ±5s, tốc độ, single-play | — |
| **Hint ladder 4 bước** từng câu (Hiểu câu hỏi → Định vị → Đọc dẫn chứng → Chọn đáp án, "Thêm gợi ý") | tuhoc/03 | 🟡 `ReadingAITutorSidebar` (Socratic) nhưng chưa có cấu trúc 4 bước/gợi ý tăng dần | 3.9 |
| Nhóm câu hỏi có tiêu đề + hướng dẫn riêng ("Question 1-7 · Hướng dẫn làm bài") | tuhoc/02 | 🟡 có nhóm, chưa có "hướng dẫn nhóm" | 3.9 |

### Dạng câu hỏi quan sát được vs `QuestionType`
| Dạng (DOL) | Ảnh | EduSphere |
|---|---|---|
| Note/Form/Summary/Table completion (điền từ) | tuhoc/02,05 | ✅ |
| Multiple choice (A–C/D) | tuhoc/07,11 | ✅ |
| **Choose TWO letters (multi-select)** | tuhoc/08 | ✅ Listening (`MultipleChoiceMulti`); ❌ Reading |
| **Matching (opinion/each of the following)** | tuhoc/08 | ✅ Listening `Matching` |
| **Which paragraph contains…? (lưới A–F)** | tuhoc/10 | ❌ **thiếu `MatchingInformation`** (Reading) |
| TFNG / YNNG, Matching headings | (đã có đề) | ✅ |
| Short answer, Sentence endings, Map/Diagram (Reading) | — | ❌ nên thêm `ShortAnswer`, `MatchingSentenceEndings` |

## 2. Giải thích sau thi (tuhoc)
| DOL | Ảnh | EduSphere | Sprint |
|---|---|---|---|
| Trang giải thích tách riêng: tab **Giải thích / Từ vựng**, hiển thị đáp án đúng, nút **Định vị đáp án** (bật highlight bằng chứng trên bài đọc), **Xem Answer Sheet** | tuhoc/12,13 | 🟡 `ExplanationModal` + AI explainer; chưa có tab từ vựng theo đề, chưa có toggle định vị | 3.9 |
| **Giải thích theo 4 bước Linear**: Phân tích câu hỏi → Định vị thông tin → Đọc vùng liên quan & *read connections* (tách câu song ngữ) + *Mạch ý* + *TÓM LẠI* → Kiểm tra từng option / đối chiếu paraphrasing | tuhoc/12 | ❌ (đang là explanation text/AI tự do) | 3.9 (template + prompt Gemini) |
| **Danh sách "N từ hay cần học"** cho mỗi passage: IPA, nghĩa EN/VI, giải thích, ví dụ song ngữ, loa phát âm | tuhoc/13 | 🟡 `BandVocabulary` theo band, chưa sinh theo passage | 5 |

## 3. Chép chính tả (tuhoc)
| DOL | Ảnh | EduSphere |
|---|---|---|
| Kho theo Program (IELTS/TOEIC/General), Type (Audio/Video), Section, trạng thái (chưa/đang/đã làm), sắp xếp, **lượt chép** | (danh sách) | 🟡 có Dictation Studio gắn từng bài Listening, chưa có kho riêng + bộ lọc |
| Làm từng câu: `Câu 1/47 · 15 từ`, **EASY/HARD**, replay, tốc độ, lặp câu, **nhập bằng giọng nói**, phản hồi xanh "Chính xác" + Enter qua câu | tuhoc/14 | 🟡 có dictation theo câu; chưa có EASY/HARD, nhập giọng nói |
| Panel "Script, pronunciation & translate": click từ để nghe phát âm, **Luyện shadowing câu**, bản dịch VI; "Từ hay học được" | tuhoc/14 | ❌ shadowing & phát âm từng từ |

## 4. Writing / Speaking samples (tuhoc + superLMS)
| DOL | Ảnh | EduSphere | Sprint |
|---|---|---|---|
| Bài mẫu Writing: **Đề bài → Dàn ý (Idea / Expand / Antithesis / Example, mũi tên `-->`) → Bài mẫu → Vocabulary → Bài tập (điền từ) → Lời kết**; tag dạng bài, chủ đề, quý thi thật | — | ❌ | 4 |
| Bài mẫu Speaking: **Danh sách câu hỏi → Sample từng câu (audio + dàn ý) → Vocabulary → Bài tập**; chủ đề Part 1; đánh dấu đã đọc 0/5 | superlms/17 | ❌ | 5 |
| **Lesson summary viewer** (PDF/slide có mục lục, zoom) cho mỗi buổi giáo trình | superlms/14 | ❌ | 3.9 |
| Mục tiêu giáo trình: 3 chặng × 9 bài (SL/W/R) | superlms/12,13,15,16 | ❌ (gói Learning Path) | 3.9→6 |

## 5. Chấm & review bài (superLMS)
| DOL | Ảnh | EduSphere (kế hoạch AI thay giáo viên) | Sprint |
|---|---|---|---|
| Header điểm lớn đỏ, nhãn `10.0 – Good`, **Time spent**, 3 tab **Bài mẫu | Thông tin | Đánh giá** | superlms/19,21,24 | ❌ | 4–5 |
| **Writing**: sửa inline (gạch bỏ phần sai, thêm từ đúng), thẻ `[IMPROVE LANGUAGE IDEA n]`, `[IMPROVE COHERENCE]`, ghi chú định dạng | superlms/21 | ❌ | 4 |
| **Build a sentence/Collocation**: đề dạng *từ khóa gợi ý* (`Work hard – help – succeed – scholarship`), panel **Sửa bài làm** theo câu, danh sách câu 1–10 (xanh/cam), nhãn *Cần cải thiện*, nhận xét theo nhóm **WORD PATTERN / IMPROVE MEANING / IMPROVE LANGUAGE** | superlms/24 | ❌ | 4 |
| **Speaking**: câu 1/4, waveform + thời lượng, **AI sửa phát âm**, transcript gạch xanh/đỏ từng từ, đếm từ, nhận xét + 3 gợi ý nâng từ vựng | superlms/19 | ❌ | 5 |
| **Final test result**: tổng % + Passed, nhận xét chung, từng kỹ năng (Reading: thời gian + đúng/sai/bỏ trống; Writing overall; Speaking PR/FC/LR/GR) | (đã khảo sát, ảnh bỏ vì có PII) | ❌ | 6 |
| **Lịch sử xử lý bài**: Mở bài → Làm bài → Nộp → Chấm → Gửi kết quả (timeline) | (nội dung đã đọc) | 🟡 có submission timestamps; bỏ bước "teacher" | 4 |
| **Leaderboard Top 5** (điểm, thời gian) theo bài | (nội dung đã đọc) | ❌ — tùy chọn (ẩn danh/nickname) | Backlog |
| **Đánh giá bài chấm** (0–10 + góp ý) | superlms/20 | ❌ | 4–5 |
| Phòng thi ảo Speaking: **Mic check** → vào hội thoại, Real mode | superlms/18 | ❌ | 5 |

## 6. Điều hướng & bố cục
| DOL | Ảnh | EduSphere |
|---|---|---|
| Desktop: **sidebar cố định** của khóa (Overview, Syllabus ▸ tuần, Attendance, Assignments, Vocabulary, Exercises, Sample W/S, Phòng thi ảo, Roadmap, Final Test…) | superlms/23 | ✅ sidebar có (Dashboard, 4 kỹ năng…); thêm nhóm "Learning Path" |
| Mobile: menu trượt, thẻ xếp dọc, nút lớn; phòng thi mobile (mode select) dùng được | superlms/25, tuhoc/15 | 🟡 cần kiểm thử responsive các phòng thi |
| Bộ lọc **Trạng thái / Kỹ năng / Phân loại** + tìm kiếm + thanh tiến độ tổng ("2/15") ở mọi danh sách bài | superlms/06 | 🟡 Reading/Listening có filter; chưa có tiến độ tổng & trạng thái Đang làm |
| **Roadmap dạng bản đồ** (Mốc → Day), vòng xoay = hiện tại | superlms/09 | 🟡 `ReadingRoadmapHub` cho Reading, chưa dạng bản đồ/nhiều kỹ năng |
| Lời nhắc streak, banner CTA | superlms/05 | ❌ |

## 7. Ưu tiên đề xuất (gap lớn nhất → nhỏ)
1. **Chế độ Luyện tập vs Thi thật + Hint ladder 4 bước + giải thích 4 bước Linear** (tác động lớn nhất tới chất lượng học).
2. **Dạng câu hỏi Reading còn thiếu**: Matching Information (lưới A–F), Multi-select, Short answer.
3. **Công cụ Highlight/Note/Tra nghĩa** + chip điều hướng chân trang + báo lỗi/góp ý.
4. **Writing review inline + Build-a-sentence/Collocation** (Sprint 4).
5. **Speaking review (waveform + phát âm từng từ) + Phòng thi ảo/mic check** (Sprint 5).
6. **Vocabulary theo passage + khu vườn SM-2**, **Samples**, **Learning Path 3 chặng**.
7. Final/Entrance test + CEFR, Test history, rating chất lượng chấm AI.

## 8. Giới hạn của lần khảo sát này
- Không bấm **Nộp bài** ở phòng thi nào, không bắt đầu ghi âm Speaking; vì vậy **màn hình kết quả ngay sau khi nộp bài** của tuhoc và hội thoại Phòng thi ảo/AI mock test **chưa được quan sát** (chỉ có trang giải thích công khai và Final Test result của superLMS).
- Chế độ **Thi thật** chỉ xem được màn chọn chế độ.
- Màn Writing editor đang làm bài (khi soạn) chưa mở vì không có bài chưa nộp.
- Tab "Thông tin" / "Bài mẫu" của màn review chỉ đọc nội dung văn bản, không chụp riêng.
- Các thao tác khảo sát tạo thêm trạng thái trên tài khoản của bạn: đã **bắt đầu** (không nộp) 2 bài luyện trên tuhoc — *CAM Inspired 21 Reading Test 1* và *Listening Test 1* — nên xuất hiện ở "Bài làm gần đây" (0/40 câu); đã mở xem bộ từ vựng *Dangers of the WWW* (0/12 từ). Có thể bỏ qua hoặc xóa tiến độ nếu muốn.
