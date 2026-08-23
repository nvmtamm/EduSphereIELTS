# Sprint 6: 24/7 IELTS AI Tutor, Mock Test Simulation & Analytics Dashboard

- **Duration:** 1 tuần
- **Objective:** Tích hợp phòng **24/7 IELTS AI Tutor** hoàn chỉnh với `@assistant-ui/react` (kết nối SSE Streaming + Qdrant RAG), hệ thống thi thử mô phỏng toàn diện **180 phút Mock Test**, và bảng phân tích dữ liệu học tập **Dashboard Analytics** với `recharts` và `cmdk` từ `shadcn-admin`.

---

## 1. Công Nghệ & Thư Viện Chuyên Biệt Áp Dụng (Specialized Tech Stack)

| Thư Viện | Mục Đích Sử Dụng Trong Sprint 6 |
| :--- | :--- |
| **`@assistant-ui/react`** *(từ `assistant-ui`)* | **24/7 IELTS AI Tutor Interface (`AiTutorPage.tsx`):** Giao diện AI Chatbot chuẩn ChatGPT/Claude với SSE streaming token, markdown syntax highlighting, citations thẻ trích dẫn tài liệu IELTS, và rẽ nhánh câu hỏi (Branching). |
| **`recharts`** *(từ `shadcn-admin`)* | **Advanced Learning Analytics (`AnalyticsDashboard.tsx`):** Biểu đồ Radar 4 kỹ năng IELTS, biểu đồ đường tiến trình Band Score theo thời gian, và biểu đồ cột tần suất học tập. |
| **`cmdk`** *(từ `shadcn-admin`)* | **Global Command Palette (`CommandMenu.tsx`):** Phím tắt `Cmd + K` tìm kiếm và điều hướng nhanh trong toàn bộ hệ thống. |
| **`canvas-confetti`** | Bắn pháo hoa chúc mừng khi học viên hoàn thành bài Mock Test Full 4 kỹ năng vượt Band Score mục tiêu. |

---

## 2. Scope & Deliverables

### Backend (.NET 8 + Microsoft Semantic Kernel + Qdrant Vector DB)
- [ ] **24/7 IELTS AI Tutor Streaming Endpoint:**
  - Controller `AiTutorController` endpoint `POST /api/aitutor/chat-stream` trả về `text/event-stream` (Server-Sent Events).
  - Semantic Kernel RAG Kernel Plugin truy vấn Qdrant Vector Search tìm tài liệu đề thi và thang điểm IELTS chính thức để đưa vào context.
- [ ] **Full Mock Test Engine (180 Minutes):**
  - Điều phối liên tục 4 kỹ năng: Listening (30p + 10p transfer) $\rightarrow$ Reading (60p) $\rightarrow$ Writing (60p) $\rightarrow$ Speaking (15p).
  - Tự động khóa bài và chuyển phần khi hết thời gian của từng kỹ năng.
  - Tính điểm Overall Band Score tổng hợp 4 kỹ năng.
- [ ] **Learning Analytics Aggregator:**
  - `GetStudentAnalyticsQuery` (thống kê lịch sử làm bài, phân tích điểm mạnh/điểm yếu theo từng dạng câu hỏi).

### Frontend (React 18 + assistant-ui + Recharts + cmdk)
- [ ] **24/7 AI Tutor Room (`AiTutorPage.tsx`):**
  - Tích hợp `@assistant-ui/react` với custom adapter `useEduSphereRuntime` kết nối SSE endpoint.
  - Hỗ trợ các mẫu câu hỏi gợi ý nhanh (Quick Prompts: *"Chiến thuật làm dạng Heading Matching", "Nâng cấp từ vựng C1 chủ đề Environment"*).
- [ ] **Full Mock Test Simulation Mode:**
  - Giao diện full-screen không xao nhãng (Distraction-free mode) có thanh đếm ngược tổng thể.
- [ ] **Executive Analytics Dashboard:**
  - Radar Chart 4 kỹ năng (Listening, Reading, Writing, Speaking).
  - Trajectory Chart dự đoán ngày chạm mốc Target Band Score dựa trên tốc độ học hiện tại.
- [ ] **Global Command Menu (`Cmd + K`):**
  - Tích hợp `CommandMenu.tsx` mở nhanh bất cứ kỹ năng hoặc đề thi nào.

---

## 3. Acceptance Criteria
- [ ] AI Tutor stream câu trả lời tức thì (First Token dưới 1.2s), hiển thị trích dẫn tài liệu IELTS rõ ràng.
- [ ] Mock Test chuyển giao 4 kỹ năng mượt mà, lưu tạm thời bài làm để không mất dữ liệu nếu reload.
- [ ] Biểu đồ Recharts hiển thị trực quan, tương thích hoàn hảo trên cả Dark Mode và Light Mode.
