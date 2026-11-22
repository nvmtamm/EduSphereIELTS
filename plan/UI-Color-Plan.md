# Kế hoạch chỉnh màu giao diện (theo tông màu tự nhiên của DOL)

Nguồn: đo trực tiếp màu thật trên superlms/tuhoc (computed style), 2026-11-22. Chỉ học **cách dùng màu**, không dùng logo/ảnh/nội dung của DOL.

## 1. Vấn đề hiện tại
Sau khi bỏ icon nhiều màu và gradient, giao diện chỉ còn trắng/xám + đỏ → nhạt, khó phân biệt các khu vực và trạng thái. DOL không "ít màu"; DOL dùng **ít màu nhưng mỗi màu có việc riêng**, và phần lớn là các **màu nền nhạt (tint)** thay vì màu đặc.

## 2. Bảng màu DOL đo được → token của EduSphere
| Vai trò | DOL (đo được) | Token EduSphere | Dùng cho |
|---|---|---|---|
| Chữ chính | `#242938` / `#313a44` | `slate-900/800` (đã có) | Tiêu đề, nội dung |
| Chữ phụ / nhãn mục | `#6d7d8d`, `#5a6877`, `#8594a3` | `slate-500/400` (đã có) | Mô tả, nhãn mục in hoa |
| **Đỏ thương hiệu** | `#d14242` (chữ/nút), `#d42525` (số nhấn) | `red-600` (đã có) | Nút chính, mục menu đang chọn, điểm nhấn |
| **Đỏ nhạt (tint)** | `#fdeded` | `red-50` | Nền mục menu đang chọn, ô icon, banner nhắc nhở |
| **Xanh dương** | `#2b52d4` | `blue-600` (đã có) | Link ("Xem thêm"), thanh tiến độ, phần trăm |
| **Xanh lá** | `#329546` nền nhạt `#ecf9ee` | `emerald-600` / `emerald-50` | Hoàn thành, số liệu tích cực, thưởng, "Đã làm" |
| **Cam/vàng nhạt** | nền be/cam nhạt, chữ cam (huy hiệu "Bảo lưu", banner thông báo) | `amber-50` + `amber-700` | Cảnh báo nhẹ, "Sắp hết hạn", banner thông báo |
| Nền trang | trắng, vùng phụ `#f2f4f7` | `slate-100` (đã có) | Nền xám nhạt, thẻ trắng |

Quy tắc 60/30/10: 60% trắng/xám nhạt, 30% chữ xám-xanh đậm, 10% màu nhấn (đỏ chủ đạo; xanh dương, xanh lá, cam chỉ cho đúng vai trò).

## 3. Nguyên tắc dùng màu (tránh "AI hoá")
1. **Một màu = một ý nghĩa.** Đỏ = hành động chính/đang chọn; xanh dương = tiến độ/liên kết; xanh lá = hoàn thành/đúng; cam = chú ý/sắp hết hạn; không dùng màu chỉ để trang trí.
2. **Dùng tint, không dùng màu đặc cho diện tích lớn.** Banner/ô icon dùng nền `*-50` + chữ/icon đậm cùng tông; chỉ nút chính và huy hiệu nhỏ mới dùng màu đặc.
3. **Không gradient, không viền phát sáng, không emoji màu.**
4. **Icon:** giữ đen/xám như yêu cầu; chỉ icon *trạng thái* (✓ hoàn thành, cảnh báo) mới có màu.
5. Màu theo kỹ năng chỉ xuất hiện ở **một chỗ nhỏ** (chấm 8px hoặc nhãn chữ) nếu thật sự cần, không tô cả thẻ.

## 4. Áp dụng theo màn hình
| Màn hình | Thay đổi màu |
|---|---|
| **Dashboard** | Ô icon thống kê: nền `red-50` + icon đỏ cho "Target"; số liệu tiến bộ (Current estimate) chữ `emerald-600`; "Mock tests" giữ trung tính. Thêm 1 banner nhắc nhở nền `amber-50` ("Tiếp tục bài đang làm") + nút đỏ. Thẻ kỹ năng: nút mũi tên hover → `red-50`; nhãn Band dùng `blue-600` chữ + nền `blue-50`. |
| **Sidebar / Header** | Mục đang chọn đã đỏ nhạt (giữ). Hover `slate-100`. Chấm thông báo đỏ. |
| **Learning Path** | Thanh tiến độ `blue-600` (đã có); bài hoàn thành: icon ✓ `emerald-600` + nền thẻ `emerald-50`; bài đang làm: viền trái/nhãn `blue-600`; nhãn mã bài (SL1, W1…) giữ đỏ. |
| **Reading / Listening / Writing (danh sách)** | Nhãn trạng thái: "Chưa làm" xám, "Đang làm" `blue-50/blue-700`, "Đã làm" `emerald-50/emerald-700`. Nhãn độ khó: Easy xanh lá nhạt, Medium cam nhạt, Hard đỏ nhạt (dạng chữ + tint, không viền đậm). Tab đang chọn: gạch chân đỏ (đã có). |
| **Phòng thi** | Giữ trung tính; chỉ dùng: đỏ cho nút Nộp bài/cảnh báo hết giờ, xanh dương cho câu đang chọn, cam cho câu gắn cờ, xanh lá/đỏ cho đúng/sai khi xem lại. |
| **Kết quả (Reading/Listening/Writing)** | Band điểm lớn chữ `slate-900`; thanh 4 tiêu chí `blue-600`; điểm tốt `emerald-600`, điểm thấp `amber-700`; lỗi gạch chân đỏ nhạt (đã có). |
| **Thông báo / banner** | Thông tin: `blue-50`; thành công: `emerald-50`; cảnh báo: `amber-50`; lỗi: `red-50`. Luôn kèm viền trái 3px cùng tông. |

## 5. Các bước triển khai (khoảng 1 ngày)
1. **Tokens** (`frontend/src/index.css`): bổ sung `amber-50/100/700`, `emerald-50`, `blue-50` theo bảng trên (đã có đỏ, xanh dương, xanh lá).
2. **Component dùng chung**: tạo `StatusBadge` (todo/doing/done/warn), `Banner` (info/success/warn/error), `IconTile` (neutral | red-tint), để các trang dùng chung thay vì lặp class.
3. **Dashboard** → **Learning Path** → **3 trang danh sách** → **trang kết quả** → **phòng thi** (theo thứ tự nhìn thấy nhiều nhất).
4. Rà soát: tìm các `bg-*-500|600` diện tích lớn, `border-*` màu, `text-*-400` trên nền trắng (độ tương phản).
5. Kiểm tra: tương phản chữ ≥ 4.5:1 (WCAG AA), dark mode, chụp màn hình trước/sau.

## 6. Tiêu chí hoàn thành
- Mỗi màn hình có đủ phân cấp: nhìn vào là biết đâu là hành động chính (đỏ), tiến độ (xanh dương), hoàn thành (xanh lá), cần chú ý (cam).
- Không còn màu nào chỉ mang tính trang trí; không còn gradient/emoji màu.
- Icon vẫn đen/xám (ngoại trừ icon trạng thái).
