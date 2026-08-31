# 🎧 Sprint 3 Extension Plan — IELTS Listening Module Feature Enhancements

> **Scope:** Tất cả tính năng đề xuất mở rộng cho phân hệ Listening **đã hoàn thành Sprint 3 baseline**.
> **Nguyên tắc phân loại:** Từ **cần thiết nhất** (lỗ hổng chức năng thực tế) → **khuyến nghị** (UX nâng cao) → **đổi mới** (AI/gamification).
> **Công nghệ nền:** .NET 8 Clean Architecture · CQRS/MediatR · EF Core 8 · Redis · React 19 · Tailwind CSS v4 · TanStack Query v5 · Wavesurfer.js · Framer Motion

---

## 🗂️ Bảng Tổng Quan Ưu Tiên

| # | Tính năng | Nhóm | Ưu tiên | Độ phức tạp | Tác động |
|---|---|---|---|---|---|
| 1 | Single-Play Audio Constraint | Exam Integrity | 🔴 **Critical** | Low | High |
| 2 | Exam Session Persistence (Reload-safe) | Reliability | 🔴 **Critical** | Medium | High |
| 3 | TableCompletionRenderer bị thiếu | Renderers | 🔴 **Critical** | Low | High |
| 4 | Multi-Audio Full Test (4 audio files) | Core Feature | 🔴 **Critical** | High | High |
| 5 | Answer Autosave per Question (không phải draft) | UX | 🟠 **High** | Low | Medium |
| 6 | Band Score Trend Chart (History Trajectory) | Analytics | 🟠 **High** | Medium | High |
| 7 | Section-Level Navigation cho FullTest | UX | 🟠 **High** | Medium | High |
| 8 | Community Upload — Upload Audio + Questions | Content | 🟠 **High** | High | High |
| 9 | Post-Exam Deep Review with AI Explainer (RAG) | AI | 🟡 **Medium** | High | High |
| 10 | Listening Speed Preference Profile | UX Personalization | 🟡 **Medium** | Low | Medium |
| 11 | Bookmarked Questions Review Session | Learning | 🟡 **Medium** | Medium | Medium |
| 12 | In-Exam Accent Training Mode | Pedagogy | 🟡 **Medium** | Medium | Medium |
| 13 | Listening Band Roadmap Integration | Gamification | 🟢 **Low** | Medium | Medium |
| 14 | Real-time Question-Link Highlighting in Transcript | UX Polish | 🟢 **Low** | Low | Low |
| 15 | Spaced Repetition Listening Deck (SM-2) | Advanced Learning | 🟢 **Low** | High | Medium |

---

## 🔴 PRIORITY 1 — CRITICAL (Lỗ hổng nghiêm trọng cần vá ngay)

---

### F-01 · Single-Play Audio Constraint 🔴

**Bối cảnh:** Chuẩn thi thực tế IELTS Cambridge quy định audio chỉ được phát **đúng 1 lần** trong phòng thi. Hiện tại `AudioWaveformPlayer.tsx` không giới hạn số lần phát lại.

**Mô tả tính năng:**
- Sau khi audio kết thúc lần đầu, các nút Play/Pause bị **disable/lock** với thông báo _"Audio has concluded. IELTS regulations permit one playback only."_
- Trong các mode Practice (ngoài thi), vẫn cho phép replay tự do.
- Backend bổ sung field `IsOfficialExamMode: bool` trong `ListeningTestDetailDto`.

**Files ảnh hưởng:**
| Layer | File | Thay đổi |
|---|---|---|
| Frontend | [`AudioWaveformPlayer.tsx`](file:///Users/nguyenvanminhtam/EduSphere/frontend/src/features/listening/components/AudioWaveformPlayer.tsx) | Thêm `hasFinished` state; disable controls sau khi `wavesurfer` emit `finish` event |
| Frontend | [`ListeningExamPage.tsx`](file:///Users/nguyenvanminhtam/EduSphere/frontend/src/features/listening/pages/ListeningExamPage.tsx) | Truyền prop `singlePlayMode={true}` khi ở exam mode |
| Backend | `ListeningTestDetailDto` | Thêm field `IsOfficialExamMode` |

```tsx
// AudioWaveformPlayer.tsx — đề xuất thêm
const [hasFinished, setHasFinished] = useState(false);

wavesurfer.on('finish', () => {
  setHasFinished(true);
  if (singlePlayMode) setIsPlaying(false);
});

// Disabled state khi singlePlayMode && hasFinished
<button disabled={singlePlayMode && hasFinished} ...>
```

**Độ phức tạp:** `Low` | **Ước lượng:** 2–3 giờ

---

### F-02 · Exam Session Persistence — Reload-Safe State 🔴

**Bối cảnh:** Khi người dùng vô tình refresh trình duyệt giữa chừng, toàn bộ trạng thái exam (answers, marked questions, timer) bị mất. `localStorage` draft hiện tại chỉ lưu `answers`, không lưu `timer` và `markedQuestions`.

**Mô tả tính năng:**
- Serialize toàn bộ `ExamSessionState` (answers, markedQuestions, elapsedSeconds, currentQuestionIndex) vào `localStorage` mỗi 5 giây (debounced).
- Khi load trang, kiểm tra session đã tồn tại → hiển thị banner _"Resume your previous exam session?"_ với nút **Resume** / **Start Fresh**.
- Session tự động xóa sau khi submit thành công.

**Files ảnh hưởng:**
| Layer | File | Thay đổi |
|---|---|---|
| Frontend | [`ListeningExamPage.tsx`](file:///Users/nguyenvanminhtam/EduSphere/frontend/src/features/listening/pages/ListeningExamPage.tsx) | Thêm `useListeningSessionPersist` custom hook |
| Frontend (NEW) | `hooks/useListeningSessionPersist.ts` | Serialize/deserialize toàn bộ exam state |
| Frontend | [`ListeningExamTimer.tsx`](file:///Users/nguyenvanminhtam/EduSphere/frontend/src/features/listening/components/ListeningExamTimer.tsx) | Nhận `initialElapsed` prop để tiếp tục đếm từ điểm đã lưu |

**Độ phức tạp:** `Medium` | **Ước lượng:** 4–6 giờ

---

### F-03 · TableCompletionRenderer — Renderer còn thiếu 🔴

**Bối cảnh:** [`Plan-Sprint-3.md`](file:///Users/nguyenvanminhtam/EduSphere/plan/Sprint-3/Plan-Sprint-3.md) liệt kê `TableCompletionRenderer.tsx` là deliverable nhưng file này **không tồn tại** trong `renderers/`. Hiện chỉ có `FormCompletionRenderer.tsx` đảm nhận cả 2 dạng.

**Mô tả tính năng:**
- Component `TableCompletionRenderer.tsx` chuyên biệt cho dạng câu hỏi bảng (Table Completion).
- Render bảng HTML có header/columns từ `prompt` JSON, mỗi ô trống là một `<input>` inline.
- Hỗ trợ highlighting ô hiện tại theo `currentQuestion` của palette.

**Files ảnh hưởng:**
| Layer | File | Thay đổi |
|---|---|---|
| Frontend (NEW) | `renderers/TableCompletionRenderer.tsx` | Component mới |
| Frontend | [`ListeningExamPage.tsx`](file:///Users/nguyenvanminhtam/EduSphere/frontend/src/features/listening/pages/ListeningExamPage.tsx) | Import và gán đúng `QuestionType.TableCompletion` |

**Độ phức tạp:** `Low` | **Ước lượng:** 3–4 giờ

---

### F-04 · Multi-Audio Full Test (4 Independent Audio Files per Section) 🔴

**Bối cảnh:** Entity [`ListeningTest.cs`](file:///Users/nguyenvanminhtam/EduSphere/backend/src/EduSphere.Domain/Entities/ListeningTest.cs) hiện chỉ có **1 `AudioUrl`**. Đề thi `FullTest_4Sections` thực tế Cambridge cần **4 file audio riêng biệt**, mỗi file cho 1 Section, phát tuần tự.

**Mô tả tính năng:**

**Backend:**
- Thêm bảng `ListeningTestAudio` mới hoặc mở rộng `ListeningTest` với collection `SectionAudios`.
- Migration EF Core thêm `SectionAudios: IReadOnlyCollection<ListeningSectionAudio>`.

**Frontend:**
- `AudioWaveformPlayer.tsx` nhận `audioSections: AudioSection[]` thay vì `audioUrl: string`.
- Tự động chuyển sang audio Section tiếp theo khi Section hiện tại kết thúc.
- Progress bar phân chia theo Section (S1 / S2 / S3 / S4).

**Backend Domain Changes:**
```csharp
// NEW entity
public class ListeningSectionAudio : BaseEntity
{
    public Guid ListeningTestId { get; private set; }
    public int SectionNumber { get; private set; }
    public string AudioUrl { get; private set; } = string.Empty;
    public int DurationSeconds { get; private set; }
}
```

**Files ảnh hưởng:**
| Layer | File | Thay đổi |
|---|---|---|
| Backend (NEW) | `EduSphere.Domain/Entities/ListeningSectionAudio.cs` | Entity mới |
| Backend | [`ListeningTest.cs`](file:///Users/nguyenvanminhtam/EduSphere/backend/src/EduSphere.Domain/Entities/ListeningTest.cs) | Thêm collection `SectionAudios` |
| Backend | `EduSphere.Infrastructure` | EF Config + Migration |
| Backend | [`GetListeningTestByIdQuery.cs`](file:///Users/nguyenvanminhtam/EduSphere/backend/src/EduSphere.Application/Features/Listening/Queries/GetListeningTestById/GetListeningTestByIdQuery.cs) | Include SectionAudios trong DTO |
| Frontend | [`AudioWaveformPlayer.tsx`](file:///Users/nguyenvanminhtam/EduSphere/frontend/src/features/listening/components/AudioWaveformPlayer.tsx) | Hỗ trợ multi-audio sections |
| Frontend | [`listening.ts`](file:///Users/nguyenvanminhtam/EduSphere/frontend/src/features/listening/types/listening.ts) | Thêm `sectionAudios` interface |

**Độ phức tạp:** `High` | **Ước lượng:** 1–2 ngày

---

## 🟠 PRIORITY 2 — HIGH (UX/Analytics quan trọng)

---

### F-05 · Answer Autosave — Per-Question Debounced Save 🟠

**Bối cảnh:** Hiện tại draft chỉ lưu toàn bộ `answers` object mỗi khi bất kỳ ô nào thay đổi. Với 40 câu, không có phân biệt câu nào vừa được lưu dẫn đến UX không rõ ràng.

**Mô tả tính năng:**
- Hiển thị **"Saved"** badge nhỏ (xanh lá, fade-out sau 2s) tại từng question card sau khi answer được ghi vào localStorage.
- Debounce 500ms per question thay vì toàn bộ form.
- Thêm icon `CloudCheck` (Lucide) trong Question Palette cho câu đã được autosave.

**Files ảnh hưởng:**
| Layer | File | Thay đổi |
|---|---|---|
| Frontend | [`ListeningExamPage.tsx`](file:///Users/nguyenvanminhtam/EduSphere/frontend/src/features/listening/pages/ListeningExamPage.tsx) | Debounced per-question save callback |
| Frontend | [`ListeningQuestionPalette.tsx`](file:///Users/nguyenvanminhtam/EduSphere/frontend/src/features/listening/components/ListeningQuestionPalette.tsx) | Hiển thị saved indicator |

**Độ phức tạp:** `Low` | **Ước lượng:** 2–3 giờ

---

### F-06 · Band Score Trend Chart — History Trajectory 🟠

**Bối cảnh:** `ListeningHistoryItem[]` từ `GET /api/listening/history` đã có đầy đủ `bandScore`, `completedAt`, `sectionType`. Tuy nhiên `ListeningListPage.tsx` chưa visualize history progression.

**Mô tả tính năng:**
- Card **"Your Band Score Trajectory"** trên `ListeningListPage.tsx`: Line chart (`recharts` — đã có trong `package.json`) hiển thị band score theo thời gian.
- Đường line phân màu theo band (≥7.0 xanh, ≥6.0 vàng, <6.0 đỏ).
- Filter theo Section type (1/2/3/4/Full).
- Tooltip hiển thị test title, date, raw score.

**Files ảnh hưởng:**
| Layer | File | Thay đổi |
|---|---|---|
| Frontend | [`ListeningListPage.tsx`](file:///Users/nguyenvanminhtam/EduSphere/frontend/src/features/listening/pages/ListeningListPage.tsx) | Thêm `BandTrendChart` section |
| Frontend (NEW) | `components/ListeningBandTrendChart.tsx` | `recharts LineChart` component |
| Backend | `GetListeningHistoryQuery` | Sort by `completedAt DESC`, giới hạn 20 records gần nhất |

**Độ phức tạp:** `Medium` | **Ước lượng:** 4–6 giờ

---

### F-07 · Section-Level Navigation cho FullTest 🟠

**Bối cảnh:** Khi làm `FullTest_4Sections` (40 câu), `ListeningQuestionPalette.tsx` hiển thị toàn bộ 40 câu phẳng không phân nhóm. Người dùng khó định hướng đang ở Part nào.

**Mô tả tính năng:**
- Palette có **tab Part 1–4** ở trên, mỗi tab hiển thị câu 1–10 / 11–20 / 21–30 / 31–40 tương ứng với màu sắc Section.
- Header của mỗi Section trong `ListeningExamPage` hiển thị section badge (Part 1: 🗣️ Social Dialogue).
- Khi audio chuyển Section, palette tự động active tab Section tiếp theo.

**Files ảnh hưởng:**
| Layer | File | Thay đổi |
|---|---|---|
| Frontend | [`ListeningQuestionPalette.tsx`](file:///Users/nguyenvanminhtam/EduSphere/frontend/src/features/listening/components/ListeningQuestionPalette.tsx) | Thêm section tab grouping |
| Frontend | [`ListeningExamPage.tsx`](file:///Users/nguyenvanminhtam/EduSphere/frontend/src/features/listening/pages/ListeningExamPage.tsx) | Truyền `currentSectionNumber` vào palette |

**Độ phức tạp:** `Medium` | **Ước lượng:** 4–5 giờ

---

### F-08 · Community Upload — Người Dùng Upload Audio + Questions 🟠

**Bối cảnh:** [`ListeningTest.cs`](file:///Users/nguyenvanminhtam/EduSphere/backend/src/EduSphere.Domain/Entities/ListeningTest.cs) entity đã có `UploadedByUserId` và `IsCommunityShared` field sẵn sàng. Tính năng Upload từ người dùng chưa được implement.

**Mô tả tính năng:**

**Backend:**
- `UploadListeningTestCommand`: nhận audio file (upload Azure Blob / local `/uploads`), title, questions JSON.
- `PublishListeningTestCommand`: chuyển `IsCommunityShared = true` sau khi admin review.
- `GET /api/listening/tests?isPersonalOnly=true` (đã có trong [`ListeningFilterParams`](file:///Users/nguyenvanminhtam/EduSphere/frontend/src/features/listening/types/listening.ts)).

**Frontend:**
- Upload form tại `ListeningListPage.tsx`: drag-and-drop audio file, form nhập title/section/accent, preview waveform trước khi submit.
- Tab **"My Uploads"** trong Listening Hub.

**Files ảnh hưởng:**
| Layer | File | Thay đổi |
|---|---|---|
| Backend (NEW) | `Commands/UploadListeningTest/UploadListeningTestCommand.cs` | CQRS Command |
| Backend (NEW) | `Commands/PublishListeningTest/PublishListeningTestCommand.cs` | CQRS Command |
| Backend | [`ListeningController.cs`](file:///Users/nguyenvanminhtam/EduSphere/backend/src/EduSphere.API/Controllers/ListeningController.cs) | Thêm `POST /api/listening/tests/upload` [Authorize] |
| Frontend (NEW) | `components/ListeningUploadForm.tsx` | Upload form component |
| Frontend | [`ListeningListPage.tsx`](file:///Users/nguyenvanminhtam/EduSphere/frontend/src/features/listening/pages/ListeningListPage.tsx) | Tab "My Uploads" + Upload modal |
| Frontend | [`listeningApi.ts`](file:///Users/nguyenvanminhtam/EduSphere/frontend/src/features/listening/api/listeningApi.ts) | Thêm `uploadTest(formData)` |

**Độ phức tạp:** `High` | **Ước lượng:** 1.5–2 ngày

---

## 🟡 PRIORITY 3 — MEDIUM (AI Enhancement & Personalization)

---

### F-09 · Post-Exam AI Explainer — RAG Deep Review 🟡

**Bối cảnh:** [`ListeningResultPage.tsx`](file:///Users/nguyenvanminhtam/EduSphere/frontend/src/features/listening/pages/ListeningResultPage.tsx) hiển thị `explanation` text từ backend nhưng đây là explanation tĩnh từ seeder, không dựa trên AI. Phân hệ RAG (`rag/chains/DeepDiagnosticReviewChain.cs`) đã được thiết kế để xử lý chính xác use case này.

**Mô tả tính năng:**
- Tại `ListeningResultPage`, mỗi câu sai có nút **"AI Explain"**.
- Gọi `POST /api/listening/submissions/{id}/explain-answer` với `{questionId}`.
- Backend kích hoạt RAG chain: lấy transcript segment liên quan → inject vào Semantic Kernel prompt → trả về phân tích _"Tại sao câu trả lời của bạn sai? Đoạn transcript nào chứa đáp án đúng?"_
- Hiển thị streaming response bằng `@assistant-ui/react` (đã có trong `package.json`).

**New Endpoint:**
```
POST /api/listening/submissions/{submissionId}/explain-answer
Body: { questionId: Guid }
→ Streamed AI diagnostic response
```

**Files ảnh hưởng:**
| Layer | File | Thay đổi |
|---|---|---|
| Backend (NEW) | `Commands/ExplainListeningAnswer/ExplainListeningAnswerCommand.cs` | RAG pipeline trigger |
| Backend | [`ListeningController.cs`](file:///Users/nguyenvanminhtam/EduSphere/backend/src/EduSphere.API/Controllers/ListeningController.cs) | Thêm explain endpoint |
| Frontend | [`ListeningResultPage.tsx`](file:///Users/nguyenvanminhtam/EduSphere/frontend/src/features/listening/pages/ListeningResultPage.tsx) | "AI Explain" button + streaming panel |

**Độ phức tạp:** `High` | **Ước lượng:** 1–2 ngày

---

### F-10 · Listening Speed Preference Profile 🟡

**Bối cảnh:** [`AudioWaveformPlayer.tsx`](file:///Users/nguyenvanminhtam/EduSphere/frontend/src/features/listening/components/AudioWaveformPlayer.tsx) đã hỗ trợ speed controls (0.75x → 1.5x) nhưng lựa chọn tốc độ bị reset mỗi lần load trang mới. Người dùng không giỏi Listening thường cần luyện ở 0.8x trước rồi tăng dần.

**Mô tả tính năng:**
- Lưu `preferredPlaybackRate` vào `localStorage` → tự động apply khi khởi tạo wavesurfer.
- Card **"Your Listening Profile"** tại Dashboard hiển thị: tốc độ trung bình đã luyện, accent yêu thích.

**Files ảnh hưởng:**
| Layer | File | Thay đổi |
|---|---|---|
| Frontend | [`AudioWaveformPlayer.tsx`](file:///Users/nguyenvanminhtam/EduSphere/frontend/src/features/listening/components/AudioWaveformPlayer.tsx) | Persist speed preference |
| Frontend (NEW) | `hooks/useListeningPreferences.ts` | localStorage preference hook |

**Độ phức tạp:** `Low` | **Ước lượng:** 2–3 giờ

---

### F-11 · Bookmarked Questions Review Session 🟡

**Bối cảnh:** [`ListeningExamPage.tsx`](file:///Users/nguyenvanminhtam/EduSphere/frontend/src/features/listening/pages/ListeningExamPage.tsx) đã có `markedQuestions: Set<string>` (flag câu) nhưng sau khi submit không có luồng nào để ôn lại các câu đã đánh dấu.

**Mô tả tính năng:**
- Trang `ListeningResultPage.tsx` có tab **"Flagged Questions"** chứa danh sách các câu đã mark.
- Nút **"Review Flagged Only"** tạo mini review session chỉ với các câu đó + click-to-seek audio.
- Backend: Lưu `markedQuestions` list vào `ListeningSubmission.SectionBreakdownJson` hoặc field riêng.

**Files ảnh hưởng:**
| Layer | File | Thay đổi |
|---|---|---|
| Backend | [`ListeningSubmission.cs`](file:///Users/nguyenvanminhtam/EduSphere/backend/src/EduSphere.Domain/Entities/ListeningSubmission.cs) | Thêm `FlaggedQuestionNumbers` |
| Backend | `SubmitListeningExamCommand` | Nhận và lưu flagged question list |
| Frontend | [`ListeningResultPage.tsx`](file:///Users/nguyenvanminhtam/EduSphere/frontend/src/features/listening/pages/ListeningResultPage.tsx) | Tab "Flagged Questions" + review mode |
| Frontend | [`listeningApi.ts`](file:///Users/nguyenvanminhtam/EduSphere/frontend/src/features/listening/api/listeningApi.ts) | Cập nhật `SubmitListeningExamRequest` |

**Độ phức tạp:** `Medium` | **Ước lượng:** 5–7 giờ

---

### F-12 · Accent Training Mode — Phát Âm Theo Giọng Vùng 🟡

**Bối cảnh:** Nhiều thí sinh gặp khó khăn với giọng Úc hoặc Canada. Hệ thống có `ListeningAccent` enum và filter nhưng không có chế độ luyện tập tập trung vào accent.

**Mô tả tính năng:**
- **Accent Challenge Mode**: Người dùng chọn giọng mục tiêu → hệ thống filter và sắp xếp các bài thi theo accent đó từ dễ đến khó.
- Hiển thị **Accent Progress Card**: _"British: 3 tests completed, Avg Band 6.5"_.
- Tại `ListeningListPage.tsx`: filter accent được nâng cấp thành visual accent selector (cờ quốc gia có progress bar).

**Files ảnh hưởng:**
| Layer | File | Thay đổi |
|---|---|---|
| Backend | `GetListeningTestsQuery` | Thêm ordering by `TargetBandTier ASC` khi filter accent |
| Frontend | [`ListeningListPage.tsx`](file:///Users/nguyenvanminhtam/EduSphere/frontend/src/features/listening/pages/ListeningListPage.tsx) | Visual accent selector với progress |
| Frontend (NEW) | `components/AccentProgressCard.tsx` | Accent-wise history summary |

**Độ phức tạp:** `Medium` | **Ước lượng:** 6–8 giờ

---

## 🟢 PRIORITY 4 — LOW (Gamification & Advanced Learning)

---

### F-13 · Listening Band Roadmap Integration 🟢

**Bối cảnh:** Domain đã có `BandRoadmap`, `BandMilestone`, `UserRoadmapProgress` entities dùng cho Reading. Listening chưa tích hợp vào roadmap hệ thống.

**Mô tả tính năng:**
- Sau khi đạt Band target tại Listening, trigger `BandMilestone` unlock cho Listening skill.
- Dashboard hiển thị **Listening Band Journey**: progress bar từ Band hiện tại → target band.
- Confetti animation (`canvas-confetti` — đã có) khi vượt milestone.

**Files ảnh hưởng:**
| Layer | File | Thay đổi |
|---|---|---|
| Backend | `SubmitListeningExamCommand` | Trigger `UserRoadmapProgress` update sau submit |
| Frontend | `DashboardPage` | Thêm Listening milestone card |

**Độ phức tạp:** `Medium` | **Ước lượng:** 6–8 giờ

---

### F-14 · Real-time Question-Link Highlighting in Transcript 🟢

**Bối cảnh:** `ListeningTranscript.LinkedQuestionNumber` field đã tồn tại trong domain và đã có trong [`listening.ts`](file:///Users/nguyenvanminhtam/EduSphere/frontend/src/features/listening/types/listening.ts). [`SynchronizedTranscript.tsx`](file:///Users/nguyenvanminhtam/EduSphere/frontend/src/features/listening/components/SynchronizedTranscript.tsx) chưa sử dụng field này để bi-directional highlight.

**Mô tả tính năng:**
- Khi người dùng focus vào câu Q15, transcript tự động scroll và highlight (màu vàng nhạt) đoạn transcript có `linkedQuestionNumber === 15`.
- Hai chiều: click câu hỏi → highlight transcript; click transcript → seek audio + focus câu hỏi.

**Files ảnh hưởng:**
| Layer | File | Thay đổi |
|---|---|---|
| Frontend | [`SynchronizedTranscript.tsx`](file:///Users/nguyenvanminhtam/EduSphere/frontend/src/features/listening/components/SynchronizedTranscript.tsx) | Nhận `focusedQuestionNumber` prop và highlight linked line |
| Frontend | [`ListeningExamPage.tsx`](file:///Users/nguyenvanminhtam/EduSphere/frontend/src/features/listening/pages/ListeningExamPage.tsx) | Sync `currentQuestionIndex` → `focusedQuestionNumber` |

**Độ phức tạp:** `Low` | **Ước lượng:** 3–4 giờ

---

### F-15 · Spaced Repetition Listening Deck — SM-2 Vocabulary from Audio 🟢

**Bối cảnh:** Sprint 5 kế hoạch SM-2 Vocabulary dùng cho Reading & Speaking. Listening có thể contribute nguồn từ vựng từ transcript (academic vocabulary từ Section 4 lecture). `BandVocabulary` entity đã có sẵn trong Domain.

**Mô tả tính năng:**
- Sau exam, nút **"Add to Vocabulary Deck"** cho phép chọn từ bất kỳ trong transcript → thêm vào SM-2 flashcard deck.
- Backend: `AddVocabularyFromListeningCommand` tạo `BandVocabulary` entity liên kết với `ListeningTest`.
- Đây là connector bridge giữa Sprint 3 và Sprint 5.

**Files ảnh hưởng:**
| Layer | File | Thay đổi |
|---|---|---|
| Backend (NEW) | `Commands/AddVocabularyFromListening/` | Command tạo `BandVocabulary` từ listening context |
| Frontend | [`ListeningResultPage.tsx`](file:///Users/nguyenvanminhtam/EduSphere/frontend/src/features/listening/pages/ListeningResultPage.tsx) | Text selection → "Add to Vocab" tooltip |

**Độ phức tạp:** `High` | **Ước lượng:** 1–1.5 ngày

---

## 📅 Đề Xuất Sprint Planning

### Phase A — Critical Bug Fix & Core Completion (~2 ngày)
```
F-01  Single-Play Audio Constraint        [2-3 giờ]
F-02  Exam Session Persistence            [4-6 giờ]
F-03  TableCompletionRenderer             [3-4 giờ]
F-10  Listening Speed Preference          [2-3 giờ]  ← Low cost, high UX value
F-14  Question-Link Transcript Highlight  [3-4 giờ]  ← Tận dụng field đã có sẵn
```

### Phase B — UX & Analytics Enhancement (~3–4 ngày)
```
F-05  Answer Autosave per Question        [2-3 giờ]
F-06  Band Score Trend Chart              [4-6 giờ]
F-07  Section-Level Navigation            [4-5 giờ]
F-11  Bookmarked Questions Review         [5-7 giờ]
F-12  Accent Training Mode                [6-8 giờ]
```

### Phase C — Major Features (~1 tuần)
```
F-04  Multi-Audio Full Test               [1-2 ngày]
F-08  Community Upload                    [1.5-2 ngày]
F-09  Post-Exam AI Explainer (RAG)        [1-2 ngày]
```

### Phase D — Gamification & Sprint 5 Bridge (~3–4 ngày)
```
F-13  Listening Band Roadmap Integration  [6-8 giờ]
F-15  SM-2 Vocabulary from Audio          [1-1.5 ngày]
```

---

## 🧰 Technology Mapping (Tất cả từ stack hiện có — Không cần thêm dependency)

| Tính năng cần thêm | Công nghệ sẵn có |
|---|---|
| Band Trend Chart (F-06) | `recharts` — đã có trong `package.json` |
| AI Explain Streaming (F-09) | `@assistant-ui/react` + Semantic Kernel — đã có |
| Confetti Milestone (F-13) | `canvas-confetti` — đã có |
| Vocab Deck Bridge (F-15) | `BandVocabulary` entity — đã có trong Domain |
| Community Upload Form (F-08) | `UploadedByUserId`, `IsCommunityShared` — đã có |
| Multi-Section Audio (F-04) | `wavesurfer.js` load method — đang dùng |
| Session Persistence (F-02) | `localStorage` + `useEffect` — đang dùng dở |
| Question-Link Transcript (F-14) | `LinkedQuestionNumber` field — đã có nhưng chưa dùng |

> [!TIP]
> Tất cả 15 tính năng đều có thể triển khai mà **không cần thêm bất kỳ npm package hay NuGet package mới nào** — toàn bộ đều tận dụng công nghệ và data model đã có sẵn trong project.

> [!IMPORTANT]
> Ưu tiên **F-01, F-02, F-03** trước tiên — đây là các lỗ hổng về tính chính xác Cambridge Academic Standard và reliability của hệ thống thi.

---

*Generated: Sprint 3 Extension Planning — EduSphere IELTS Preparation Platform*
