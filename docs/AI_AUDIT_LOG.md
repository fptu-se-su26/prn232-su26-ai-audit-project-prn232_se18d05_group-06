# AI Audit Log

## 1. Thông tin chung

| Thông tin | Nội dung |
|---|---|
| Môn học |Building Cross-Platform Back-End Application With .NET  |
| Mã môn học | PRN232 |
| Lớp |	SE18D05  |
| Học kỳ | 8 |
| Tên bài tập / Project | FleetNova - Hệ thống Quản trị Logistics Thông minh  |
| Tên sinh viên / Nhóm | Nhóm 6 |
| MSSV / Danh sách MSSV | DE180071,DE180096,DE180088,DE180109,DE180104 |
| Giảng viên hướng dẫn | Lê Thiện Nhật Quang |
| Ngày bắt đầu | 17/05/2026 |
| Ngày hoàn thành | 09/06/2026 |

---

## 2. Công cụ AI đã sử dụng

Đánh dấu các công cụ AI đã sử dụng trong quá trình thực hiện bài tập/project.

- [x] ChatGPT
- [x] Gemini
- [ ] Claude
- [ ] GitHub Copilot
- [ ] Cursor
- [x] Antigravity
- [ ] Perplexity
- [ ] Microsoft Copilot
- [ ] Công cụ khác: ....................................

---

## 3. Mục tiêu sử dụng AI

### Mô tả mục tiêu sử dụng AI

Nhóm sử dụng AI làm trợ lý kỹ thuật xuyên suốt dự án FleetNova nhằm tối ưu hóa thời gian nghiên cứu công nghệ, xây dựng nhanh các module lõi có yếu tố thông minh (AI/ML) như tối ưu tuyến đường giao hàng, nhận diện hóa đơn và dự báo tài chính. Đồng thời, AI hỗ trợ kiểm tra tính đúng đắn của mã nguồn, phát hiện lỗ hổng logic trong khâu đối soát tài chính COD và dịch thuật/chuẩn hóa các thuật ngữ chuyên ngành Logistics.

---

## 4. Nhật ký sử dụng AI chi tiết

## Log #01
- Date: 2026-05-24
- Author: Vũ Duy Lê (DE180071)
- AI Tool: ChatGPT
- Purpose: Tạo layout cho Sidebar điều phối
- Prompt Reference: PROMPTS.md#prompt-01
- AI Output Summary: Gợi ý sử dụng CSS Flexbox `h-screen` và `overflow-y-auto`
- Human Decision: Thay đổi tông màu nền xám mặc định sang màu xanh navy và bo góc các ô (glass-panel)
- Applied To: FRONTEND/src/layouts/DispatcherLayout.tsx
- Verification: Chạy localhost:5173 và co dãn màn hình để xem hiển thị layout.

## Log #02
- Date: 2026-05-25
- Author: Vũ Duy Lê (DE180071)
- AI Tool: Gemini
- Purpose: Cấu hình Router định tuyến
- Prompt Reference: PROMPTS.md#prompt-02
- AI Output Summary: Gợi ý sử dụng react-router-dom v6 với Routes và Route
- Human Decision: Thay đổi import tương đối và thêm Catch-all Route
- Applied To: FRONTEND/src/App.tsx
- Verification: Click chuyển trang giữa /dispatcher và /driver thành công.

## Log #03
- Date: 2026-05-27
- Author: Trần Văn Tùng (DE180109)
- AI Tool: Antigravity
- Purpose: Tích hợp thiết kế Glassmorphism cho AuthPage và Profile
- Prompt Reference: PROMPTS.md#prompt-03
- AI Output Summary: Gợi ý các class `backdrop-blur-md` và `bg-white/10` cho card UI.
- Human Decision: Tinh chỉnh độ mờ của card và màu border để nổi bật trên nền tối (navy).
- Applied To: FRONTEND/src/features/auth/AuthPage.tsx, FRONTEND/src/features/customer/CustomerProfile.tsx
- Verification: Kiểm tra hiển thị trên trình duyệt, đảm bảo chữ rõ ràng trên nền mờ.

## Log #04
- Date: 2026-05-29
- Author: Trần Văn Tùng (DE180109)
- AI Tool: ChatGPT
- Purpose: Xử lý hiển thị danh sách đơn hàng động
- Prompt Reference: PROMPTS.md#prompt-04
- AI Output Summary: Gợi ý dùng `.map()` để render danh sách thẻ đơn hàng từ mảng dữ liệu.
- Human Decision: Thêm logic phân loại trạng thái đơn hàng (Đang giao, Hoàn thành) bằng màu sắc badge riêng biệt.
- Applied To: FRONTEND/src/features/customer/OrderHistory.tsx, FRONTEND/src/features/customer/CustomerDashboard.tsx
- Verification: Thêm dữ liệu giả vào mảng và xem danh sách có hiển thị đúng và đồng nhất không.

## Log #05
- Date: 2026-05-31
- Author: Trần Văn Tùng (DE180109)
- AI Tool: Antigravity
- Purpose: Vẽ lộ trình trên bản đồ theo dõi (OrderTrackingMap)
- Prompt Reference: PROMPTS.md#prompt-05
- AI Output Summary: Gợi ý cấu trúc SVG và các animation CSS cho icon xe tải di chuyển theo đường kẻ.
- Human Decision: Thay đổi icon xe tải sang SVG cao cấp hơn và chỉnh lại tốc độ animation cho mượt mà.
- Applied To: FRONTEND/src/features/customer/OrderTrackingMap.tsx
- Verification: Quan sát xe tải di chuyển trên lộ trình khi load trang trên Chrome.

## Log #06
- Date: 2026-06-01
- Author: Trần Văn Tùng (DE180109)
- AI Tool: Gemini
- Purpose: Thiết kế Voucher Center và Support Chat
- Prompt Reference: PROMPTS.md#prompt-06
- AI Output Summary: Gợi ý layout lưới (Grid) cho các thẻ khuyến mãi và cấu trúc khung chat box.
- Human Decision: Tùy chỉnh hiệu ứng hover cho voucher và phối hợp màu sắc tin nhắn chat theo theme chung.
- Applied To: FRONTEND/src/features/voucher/VoucherCenter.tsx, FRONTEND/src/features/support/SupportChat.tsx
- Verification: Kiểm tra tương tác hover voucher và nhập tin nhắn vào khung chat thành công.

## Log #07
- Date: 2026-06-09
- Author: Lập Quốc Hùng (DE180096)
- AI Tool: Antigravity
- Purpose: Thiết kế & Hoàn thiện UC004: Tạo lệnh xuất kho & In vận đơn (Full-stack)
- Prompt Reference: PROMPTS.md#prompt-07
- AI Output Summary: Thiết kế toàn bộ cấu trúc Backend (.NET 8 Web API, EF Core entity mapping, thuật toán lập Picking List sắp xếp tối ưu Aisle -> Shelf -> Row, mã hóa bảo mật HMACSHA256 kết hợp QRCoder sinh ảnh QR Base64, API Controller) và tích hợp kết nối Axios ở Frontend React, phân tích RegEx bóc tách ID số đơn hàng (ví dụ #ORD-9921 thành 9921) và nhúng CSS `@media print` ẩn sidebar/header khi gọi window.print().
- Human Decision: Cấu hình thêm CORS policy ("AllowAll") trong Program.cs để ứng dụng React gọi API an toàn, tinh chỉnh lại kiểu cột decimal cho DbContext, và thực hiện dọn dẹp các thư mục rác `bin/` và `obj/` ra khỏi Git cache, cấu hình `.gitignore` gốc.
- Applied To: BACKEND/DTOs/OutboundRequestDto.cs, BACKEND/DTOs/PickingListItemDto.cs, BACKEND/DTOs/OutboundResponseDto.cs, BACKEND/Models/Entities.cs, BACKEND/Models/SmartLogDbContext.cs, BACKEND/Services/IOutboundService.cs, BACKEND/Services/OutboundService.cs, BACKEND/Controllers/OutboundController.cs, BACKEND/Program.cs, FRONTEND/src/features/admin/Orders.tsx, .gitignore
- Verification: Chạy `dotnet build` đạt 0 Errors và 0 Warnings. Chạy `npm run type-check` ở frontend đạt 0 lỗi TypeScript.

---

## 5. Bảng tổng hợp mức độ sử dụng AI

Đánh dấu mức độ AI hỗ trợ ở từng hạng mục.

| Hạng mục | Không dùng AI | AI hỗ trợ ít | AI hỗ trợ nhiều | AI sinh chính | Ghi chú |
|---|:---:|:---:|:---:|:---:|---|
| Phân tích yêu cầu |  | [x] |  |  |  |
| Viết user story/use case | [x] |  |  |  |  |
| Thiết kế database | [x] |  |  |  |  |
| Thiết kế kiến trúc hệ thống | [x] |  |  |  |  |
| Thiết kế giao diện |  | [x] |  |  |  |
| Code frontend |  | [x] |  |  |  |
| Code backend | [x] |  |  |  |  |
| Debug lỗi |  | [x] |  |  |  |
| Viết test case | [x] |  |  |  |  |
| Kiểm thử sản phẩm | [x] |  |  |  |  |
| Tối ưu code |  | [x] |  |  |  |
| Viết báo cáo |  | [x] |  |  |  |
| Làm slide thuyết trình | [x] |  |  |  |  |

---

## 6. Các lỗi hoặc hạn chế từ AI

Ghi lại các trường hợp AI trả lời sai, thiếu, chưa phù hợp hoặc sinh code không chạy.

| STT | Lỗi/hạn chế từ AI | Cách phát hiện | Cách xử lý/cải tiến |
|---:|---|---|---|
| 1 | Sử dụng class CSS Tailwind cũ không còn hỗ trợ | Trình duyệt không nhận diện được style và hiển thị lệch | Tra cứu lại tài liệu chính thức của Tailwind để cập nhật lại class đúng |
| 2 | Code gợi ý thiếu import thư viện Router | Chương trình báo lỗi compile thiếu định nghĩa | Tự bổ sung thủ công dòng import ở đầu file |

---

## 7. Kiểm chứng kết quả AI

### Nội dung kiểm chứng

```text
Nhóm chạy thử chương trình trên môi trường phát triển cục bộ bằng lệnh npm run dev. Sau đó, các thành viên trực tiếp nhấp chuột tương tác trên các tab để kiểm tra hiển thị giao diện, kiểm tra xem có phát sinh lỗi đỏ trên Console của trình duyệt hay không.
```

---

## 8. Đóng góp cá nhân hoặc đóng góp nhóm

### 8.2. Đối với bài nhóm

| Thành viên | MSSV | Nhiệm vụ chính | Có sử dụng AI không? | Minh chứng đóng góp |
|---|---|---|---|---|
| Vũ Duy Lê | DE180071 | Cấu trúc dự án, điều hướng Router chính | Có | [App.tsx](file:///d:/PRN232/Project/prn232-su26-ai-audit-project-prn232_se18d05_group-06/FRONTEND/src/App.tsx) |
| Lập Quốc Hùng | DE180096 | Thiết lập các trang hiển thị Driver & Thực hiện UC004 (Full-stack) | Có | [Orders.tsx](file:///d:/Ky%208%20-%20Summer/PRN232/Project/PRN232_Project/prn232-su26-ai-audit-project-prn232_se18d05_group-06/FRONTEND/src/features/admin/Orders.tsx) |
| Trần Thị C | DE180088 | Xây dựng CSS và HSL theme | Có | [index.css](file:///d:/PRN232/Project/prn232-su26-ai-audit-project-prn232_se18d05_group-06/FRONTEND/src/index.css) |
| Trần Văn Tùng | DE180109 | Xây dựng toàn bộ giao diện khách hàng (Customer), hệ thống xác thực (Auth), trung tâm hỗ trợ và voucher | Có | [AuthPage.tsx](file:///d:/PRN232/Project/prn232-su26-ai-audit-project-prn232_se18d05_group-06/FRONTEND/src/features/auth/AuthPage.tsx), [CustomerDashboard.tsx](file:///d:/PRN232/Project/prn232-su26-ai-audit-project-prn232_se18d05_group-06/FRONTEND/src/features/customer/CustomerDashboard.tsx) |
| Phạm Văn D | DE180109 | Thiết lập layout, Sidebar, Header | Có | Các components layout |
| Hoàng Thị E | DE180104 | Viết tài liệu dự án, kiểm thử thủ công | Có | File tài liệu |

---

## 9. Reflection cuối bài

### 9.1. AI đã hỗ trợ em/nhóm ở điểm nào?

```text
AI hỗ trợ nhóm tìm hiểu nhanh các class CSS Tailwind để dựng giao diện tĩnh và thiết lập khung layout tổng thể.
```

### 9.2. Phần nào em/nhóm không sử dụng theo gợi ý của AI? Vì sao?

```text
Nhóm không copy các đoạn code logic điều phối phức tạp của AI do không phù hợp với thiết kế tối giản hiện tại và gây khó khăn khi tự debug lỗi.
```

### 9.3. Em/nhóm đã kiểm tra tính đúng đắn của kết quả AI như thế nào?

```text
Chạy dự án trên localhost và trực tiếp nhấp chuột thử nghiệm chức năng trên màn hình.
```

### 9.4. Nếu không có AI, phần nào sẽ khó khăn nhất?

```text
Việc tra cứu các class Tailwind cụ thể để làm giao diện sẽ mất nhiều thời gian hơn.
```

### 9.5. Sau bài tập/project này, em/nhóm học được gì về môn học?

```text
Hiểu về cách bố trí luồng điều hướng của một trang web quản trị và cách làm việc nhóm trên git.
```

### 9.6. Sau bài tập/project này, em/nhóm học được gì về cách sử dụng AI có trách nhiệm?

```text
Nhận ra AI chỉ là trợ lý tham khảo, mọi đoạn code do AI gợi ý cần được hiểu rõ bản chất trước khi đưa vào dự án để tránh phát sinh lỗi hệ thống.
```

---

## 10. Cam kết học thuật

Sinh viên/nhóm cam kết rằng:

- Nội dung AI hỗ trợ đã được ghi nhận trung thực.
- Không nộp nguyên văn kết quả AI mà không kiểm tra.
- Có khả năng giải thích các phần đã nộp.
- Chịu trách nhiệm về tính đúng đắn của sản phẩm cuối cùng.
- Hiểu rằng việc sử dụng AI không khai báo có thể ảnh hưởng đến kết quả đánh giá.

| Đại diện sinh viên/nhóm | Ngày xác nhận |
|---|---|
| Nhóm trưởng | 02/06/2026 |
