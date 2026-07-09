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
- [x] Claude
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
- Author: Vũ Lê Duy (DE180104)
- AI Tool: ChatGPT
- Purpose: Tạo layout cho Sidebar điều phối
- Prompt Reference: PROMPTS.md#prompt-01
- AI Output Summary: Gợi ý sử dụng CSS Flexbox `h-screen` và `overflow-y-auto`
- Human Decision: Thay đổi tông màu nền xám mặc định sang màu xanh navy và bo góc các ô (glass-panel)
- Applied To: FRONTEND/src/layouts/DispatcherLayout.tsx
- Verification: Chạy localhost:5173 và co dãn màn hình để xem hiển thị layout.

## Log #02
- Date: 2026-05-25
- Author: Vũ Lê Duy (DE180104)
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
- Author: Lê Quốc Hùng (DE180096)
- AI Tool: Antigravity
- Purpose: Tham khảo thiết kế DB cho In vận đơn (UC004)
- Prompt Reference: PROMPTS.md#prompt-07
- AI Output Summary: Gợi ý các trường dữ liệu cần thiết cho bảng Waybill và Picking List.
- Human Decision: Nhóm tự thiết kế bảng `Waybills` thông qua Entity Framework Core, ánh xạ các trường cho phù hợp với yêu cầu thực tế của dự án và tự code các API CRUD liên quan.
- Applied To: BACKEND/DTOs/OutboundRequestDto.cs, BACKEND/Models/Entities.cs, BACKEND/Controllers/OutboundController.cs
- Verification: Chạy lệnh add-migration và update-database thành công.

## Log #08
- Date: 2026-06-10
- Author: Lê Quốc Hùng (DE180096)
- AI Tool: Antigravity
- Purpose: Cú pháp Axios gọi API có Token
- Prompt Reference: PROMPTS.md#prompt-08
- AI Output Summary: Cung cấp đoạn code mẫu gọi Axios POST với Header Authorization.
- Human Decision: Nhóm tự tích hợp vào file cấu hình API, viết thêm interceptor để bắt lỗi token hết hạn và refresh lại token tự động.
- Applied To: FRONTEND/src/lib/api.ts, FRONTEND/src/features/auth/AuthPage.tsx
- Verification: Đăng nhập thành công và console log trả về thông tin user chính xác.

## Log #09
- Date: 2026-06-15
- Author: Vũ Lê Duy (DE180104)
- AI Tool: Antigravity
- Purpose: Tham khảo quy trình xác thực Google Login và JWT
- Prompt Reference: PROMPTS.md#prompt-09
- AI Output Summary: Cung cấp tài liệu cấu hình `Google.Apis.Auth` và code mẫu sinh token JWT.
- Human Decision: Nhóm chỉ dùng code mẫu để kiểm tra token Google. Sau đó tự viết Endpoint `[HttpPost("google")]` và tự cấu hình JWT Claims để phân quyền dựa vào Database thực tế.
- Applied To: BACKEND/Controllers/AuthController.cs, BACKEND/DTOs/AuthDTOs.cs
- Verification: Đăng nhập bằng tài khoản Google thành công, lấy được JWT token và giải
## Log #11
- Date: 2026-06-21
- Author: Lê Quốc Hùng (DE180096)
- AI Tool: Antigravity
- Purpose: Triển khai UC018 (Track Vehicle Entry/Exit) và tối ưu độ tương phản văn bản UI
- Prompt Reference: PROMPTS.md#prompt-11
- AI Output Summary: Gợi ý cách chặn thao tác UPDATE/DELETE ở SaveChanges, thuật toán đếm cặp CheckIn/CheckOut, và thay thế class màu text-on-surface-variant.
- Human Decision: Tự phát triển hoàn thiện giao diện điều hành dòng thời gian di chuyển, và thay đổi linh hoạt các class màu text sang slate-300, slate-400 và xanh dương để đồng bộ với theme.
- Applied To: BACKEND/Models/SmartLogAiContext.cs, BACKEND/Services/TrackingService.cs, FRONTEND/src/features/dispatcher/pages/VehicleTrackingDashboard.tsx
- Verification: Thực hiện ghi nhận chuỗi sự kiện check-in ↔ load ↔ check-out, kiểm tra số lượng chuyến xe tăng lên đúng kịch bản, cố tình gửi yêu cầu PUT cập nhật thì bị database chặn thành công.

## Log #12
- Date: 2026-06-21
- Author: Lê Quốc Hùng (DE180096)
- AI Tool: Antigravity
- Purpose: Triển khai UC020 (Confirm Check-out & Exit Gate Control) và hoàn hoạt SVG Barrier Gate
- Prompt Reference: PROMPTS.md#prompt-12
- AI Output Summary: Gợi ý cấu trúc GateService chạy trong giao dịch ACID và code SVG/React mô phỏng Barrier Gate xoay.
- Human Decision: Tự phát triển hoàn thiện giao diện điều hành cổng ra, thiết kế bảng điều khiển bảo vệ và tích hợp các bộ giả lập kiểm thử nhanh các biển số xe.
- Applied To: BACKEND/Services/GateService.cs, BACKEND/Controllers/GateController.cs, FRONTEND/src/features/warehouse/GateCheckoutDashboard.tsx
- Verification: Sử dụng Swagger thực hiện check-out thành công cho xe 51C-88888, kiểm tra DB thấy trạng thái SlotBookings đã COMPLETED, DockID 1 về AVAILABLE, GateLogs ghi nhận sự kiện, và VehicleEvents ghi nhận check-out thành công.

## Log #13
- Date: 2026-06-29
- Author: Lê Quốc Hùng (DE180096)
- AI Tool: Antigravity (Claude Sonnet 4.6)
- Purpose: Triển khai UC021 - Quản lý Danh sách Đen Phương tiện & Tài xế (Blacklist Management)
- Prompt Reference: PROMPTS.md#prompt-13
- AI Output Summary: Gợi ý thiết kế guard clause blacklist nguyên tử trong GateService trước mọi thao tác booking, cấu trúc BlacklistAlertDto để trả về HTTP 403 Forbidden, thiết kế toggle UI glassmorphism cho VehiclesTab & DispatchersTab, và Red Critical Security Alert Modal cho GateCheckoutDashboard.
- Human Decision: Tự kiểm tra nghiêm ngặt các ràng buộc business: không tạo migration, không cho blacklist nếu thiếu lý do, không gửi API nếu người dùng hủy prompt. Tự chạy 3 kịch bản đầu cuối (blacklist xe, blacklist tài xế, unblacklist + check-in lại) để xác nhận tính đúng đắn.
- Applied To: BACKEND/Services/VehicleService.cs, BACKEND/Services/DriverService.cs, BACKEND/Services/GateService.cs, BACKEND/Controllers/GateController.cs, FRONTEND/src/features/dispatcher/components/tabs/VehiclesTab.tsx, FRONTEND/src/features/dispatcher/components/tabs/DispatchersTab.tsx, FRONTEND/src/features/warehouse/GateCheckoutDashboard.tsx
- Verification: Test 3 case: (1) Blacklist xe → check-in → nhận 403 + modal đỏ + barrier không mở. (2) Blacklist tài xế → check-in → nhận 403 + modal đỏ. (3) Unblacklist → check-in lại → thành công bình thường.

## Log #14
- Date: 2026-06-29
- Author: Lê Quốc Hùng (DE180096)
- AI Tool: Antigravity (Claude Sonnet 4.6)
- Purpose: Sửa lỗi UI Contrast tối toàn diện trong Dispatcher Dashboard (Vehicles & Dispatchers Tabs)
- Prompt Reference: PROMPTS.md#prompt-14
- AI Output Summary: Phân tích nguyên nhân gốc rễ: `tailwind.config.js` định nghĩa trùng key `on-surface`, `surface-variant`, v.v. khiến màu light theme override màu dark theme. Gợi ý chuyển các token màu sang CSS custom properties và áp dụng `.dark` class override.
- Human Decision: Áp dụng giải pháp và kiểm tra lại giao diện trên trình duyệt, xác nhận độ tương phản và khả năng đọc của text trong các panel chi tiết xe, tài xế và các điều khiển blacklist.
- Applied To: FRONTEND/tailwind.config.js, FRONTEND/src/index.css, FRONTEND/src/layouts/DispatcherLayout.tsx
- Verification: Chạy `npm run build` thành công (0 lỗi). Quan sát trực tiếp các text trong panel chi tiết xe/tài xế hiển thị rõ ràng, sáng đủ trên nền tối glassmorphism.

## Log #15
- Date: 2026-07-01
- Author: Trần Văn Tùng (DE180109)
- AI Tool: Antigravity
- Purpose: Cải thiện toàn bộ UI/UX Dispatcher theo hướng màn hình vận hành logistics.
- Prompt Reference: PROMPTS.md#prompt-12
- AI Output Summary: Gợi ý chuyển từ giao diện tối/glow sang operations console sáng, có sidebar nhóm chức năng, header tìm kiếm booking/biển số/dock, KPI Dock & SLA, queue điều phối, AI insight và nhật ký vận hành.
- Human Decision: Nhóm giữ cấu trúc tab Dispatcher hiện có, chỉ thay đổi UI/UX và nhãn hiển thị để phù hợp mô tả dự án SmartLog AI.
- Applied To: FRONTEND/src/layouts/DispatcherLayout.tsx, FRONTEND/src/features/dispatcher/components/Sidebar.tsx, FRONTEND/src/features/dispatcher/components/Header.tsx, FRONTEND/src/features/dispatcher/components/tabs/DashboardTab.tsx, FRONTEND/src/index.css
- Verification: Kiểm tra route `/dispatcher`; trong màn hình Dispatcher.

## Log #16
- Date: 2026-07-01
- Author: Trần Văn Tùng (DE180109)
- AI Tool: Antigravity
- Purpose: Gộp script SQL Overstay Alert vào file SQL chính.
- Prompt Reference: PROMPTS.md#prompt-13
- AI Output Summary: Đề xuất loại bỏ file setup rời, đưa schema và seed Overstay Alert vào `smartlogAI.sql` để tránh lệch dữ liệu giữa hai script.
- Human Decision: Nhóm giữ `smartlogAI.sql` là nguồn chính cho database, dùng dữ liệu mẫu tự chọn Vehicle/Dock/Booking có sẵn thay vì hard-code phụ thuộc môi trường.
- Applied To: smartlogAI.sql
- Verification: Rà `rg` xác nhận chỉ còn một file SQL chính chứa `VehicleDockSessions` và `OverstayAlerts`; không chạy lại script vì có lệnh `DROP DATABASE`.

## Log #17
- Date: 2026-07-01
- Author: Trần Văn Tùng (DE180109)
- AI Tool: Antigravity
- Purpose: Giảm lỗi console do SMTP khi StockAlertWorker chạy nền.
- Prompt Reference: PROMPTS.md#prompt-14
- AI Output Summary: Gợi ý bắt riêng lỗi SMTP authentication để chuyển sang simulated email thay vì throw exception gây spam log đỏ.
- Human Decision: Nhóm chỉ thay đổi hành vi khi SMTP từ chối xác thực; các lỗi email khác vẫn giữ cơ chế log error và throw để không che lỗi thật.
- Applied To: BACKEND/Services/EmailService.cs
- Verification: Build backend sang thư mục kiểm tra thành công và endpoint Overstay Alert vẫn trả HTTP 200.

## Log #18
- Date: 2026-07-02
- Author: Trần Văn Tùng (DE180109)
- AI Tool: Antigravity
- Purpose: AI Financial Trend Forecasting cho role Admin.
- Prompt Reference: PROMPTS.md#prompt-15
- AI Output Summary: Goi y tach use case thanh cac phan backend API forecast, schema database, service tinh xu huong tai chinh va dashboard Admin Finance co chart, KPI, insight, retrain model va export.
- Human Decision: Nhom chi ap dung phan phu hop voi cau truc hien co cua SmartLog AI, giu route `/admin/finance`, khong hien thi ma UC042 tren UI va thiet ke man hinh theo phong cach operations dashboard gon, sang, de doc.
- Applied To: BACKEND/Controllers/FinancialForecastController.cs, BACKEND/Services/FinancialForecastService.cs, BACKEND/DTOs/FinancialForecastDTOs.cs, BACKEND/Models/FinancialForecast.cs, BACKEND/Models/AiModelTrainingLog.cs, BACKEND/Models/SmartLogAiContext.UC023.cs, BACKEND/Program.cs, FRONTEND/src/features/admin/Finance.tsx, smartlogAI.sql
- Verification: `dotnet build` backend thanh cong; `npm run type-check` frontend van con loi cu ngoai pham vi UC042 do thieu `InventoryAudit.types`; thu seed SQL local khong thanh cong vi SQL Server `(local)` khong ket noi duoc.

## Log #15
- Date: 2026-07-08
- Author: Trần Văn Tùng (DE180109)
- AI Tool: Antigravity
- Purpose: Hoàn thiện chức năng Cảnh báo tồn kho và gửi Email cho nhân viên phụ trách.
- Prompt Reference: PROMPTS.md#prompt-20
- AI Output Summary: Gợi ý kiểm tra chuỗi lỗi SMTP, cấu hình Gmail App Password, sửa service gửi email thật, thêm dữ liệu test tồn kho thấp, cải thiện luồng quét thủ công và quét nền, đồng thời làm rõ trạng thái gửi email trên UI Stock Alerts.
- Human Decision: Nhóm áp dụng luồng gửi email thật bằng SMTP Gmail, ưu tiên gửi về email của người đang đăng nhập thông qua JWT claim, nếu không có email thì fallback về `tungtvde180109@fpt.edu.vn`. Nút Quét ngay được dùng cho test thủ công nên cho phép gửi lại email, còn worker nền vẫn giữ debounce để tránh spam.
- Applied To: BACKEND/appsettings.json, BACKEND/Services/EmailService.cs, BACKEND/Services/StockAlertService.cs, BACKEND/Services/IStockAlertService.cs, BACKEND/Services/StockAlertWorker.cs, BACKEND/Controllers/StockAlertsController.cs, FRONTEND/src/features/warehouse/StockAlerts.tsx, insert-stock-alert-email-test.sql
- Verification: Test SMTP gửi thành công bằng Gmail App Password; gọi `/api/stockalerts/scan?force=true` trả về `Đã gửi 3 email`; `dotnet build` backend thành công 0 warning/0 error; `npm run build` frontend thành công.
## Log #16
- Date: 2026-07-08
- Author: Vũ Lê Duy (DE180104)
- AI Tool: Antigravity
- Purpose: Khắc phục lỗi 500 khi Entity Framework Core không dịch được hàm C# sang SQL trong tính năng ALPR Gate In/Out.
- Prompt Reference: PROMPTS.md#prompt-21
- AI Output Summary: Phát hiện hàm `NormalizePlate()` gây lỗi `IQueryable` translation, gợi ý dùng `.Replace()` và `.ToUpper()` lồng nhau để xử lý chuỗi trên database server.
- Human Decision: Xác nhận thay đổi đúng đắn, áp dụng ngay vào backend. Ngoài ra quyết định làm Modal Pop-up đỏ chót cho dễ nhìn thay vì in lỗi 404 xuống Console.
- Applied To: BACKEND/Services/GateService.cs, FRONTEND/src/features/warehouse/GateCheckoutDashboard.tsx
- Verification: Đã chạy thử AI Camera quét biển số trên trình duyệt. Backend không còn văng lỗi HTTP 500, Frontend hiện đúng cảnh báo UI đỏ.

--

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

## Log #19
- Date: 2026-07-09
- Author: Vũ Lê Duy (DE180104)
- AI Tool: ChatGPT/Codex
- Purpose: Tham khảo hướng triển khai nghiệp vụ quản lý hồ sơ phương tiện cho Dispatcher
- Prompt Reference: PROMPTS.md#prompt-22
- AI Output Summary: AI gợi ý các điểm cần kiểm tra ở backend/frontend như DTO phương tiện, service đặt lịch, service check-in cổng và UI danh sách phương tiện.
- Human Decision: Sinh viên tự xác định lại yêu cầu nghiệp vụ, chọn cách giữ dữ liệu đăng kiểm/bảo trì trong bảng Vehicle, không tạo bảng mới; tự rà soát luồng đặt lịch và check-in để đặt rule đúng vị trí.
- Applied To: BACKEND/Services/BookingService.cs, BACKEND/Services/GateService.cs, FRONTEND/src/features/dispatcher/components/tabs/VehiclesTab.tsx
- Verification: Chạy `dotnet build`, `npm run build`, chạy backend/frontend trên localhost và kiểm tra thủ công màn Dispatcher.

## Log #20
- Date: 2026-07-09
- Author: Vũ Lê Duy (DE180104)
- AI Tool: ChatGPT/Codex
- Purpose: Tham khảo cải thiện UI/UX và sửa lỗi cuộn danh sách phương tiện
- Prompt Reference: PROMPTS.md#prompt-23
- AI Output Summary: AI gợi ý nguyên nhân layout bị lấp do container cha `overflow-hidden`, vùng bảng dùng chiều cao chưa đúng và phần KPI/filter chiếm nhiều viewport.
- Human Decision: Sinh viên tự kiểm tra lại giao diện thực tế, quyết định cho tab Vehicles có scroll dọc riêng, giữ bảng trong panel riêng và chỉ dùng AI như công cụ gợi ý cách debug layout.
- Applied To: FRONTEND/src/features/dispatcher/components/tabs/VehiclesTab.tsx, FRONTEND/src/index.css
- Verification: Chạy `npm run build`, mở `http://127.0.0.1:3000/dispatcher`, kiểm tra kéo xuống xem danh sách phương tiện.

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
| Vũ Lê Duy | DE180104 | Cấu trúc dự án, điều hướng Router chính | Có | [App.tsx](prn232-su26-ai-audit-project-prn232_se18d05_group-06/FRONTEND/src/App.tsx) |
| Lê Quốc Hùng | DE180096 | Thiết lập Driver UI, Thực hiện UC004, UC015, UC018, UC020, UC021 (Full-stack) và tối ưu độ tương phản giao diện Dispatcher Dashboard | Có | [Orders.tsx](prn232-su26-ai-audit-project-prn232_se18d05_group-06/FRONTEND/src/features/admin/Orders.tsx), [VehicleTrackingDashboard.tsx](prn232-su26-ai-audit-project-prn232_se18d05_group-06/FRONTEND/src/features/dispatcher/pages/VehicleTrackingDashboard.tsx), [GateCheckoutDashboard.tsx](prn232-su26-ai-audit-project-prn232_se18d05_group-06/FRONTEND/src/features/warehouse/GateCheckoutDashboard.tsx), [VehiclesTab.tsx](prn232-su26-ai-audit-project-prn232_se18d05_group-06/FRONTEND/src/features/dispatcher/components/tabs/VehiclesTab.tsx) |
| Trần Văn Tùng | DE180109 | Xây dựng toàn bộ giao diện khách hàng (Customer), hệ thống xác thực (Auth), trung tâm hỗ trợ và voucher | Có | [AuthPage.tsx](prn232-su26-ai-audit-project-prn232_se18d05_group-06/FRONTEND/src/features/auth/AuthPage.tsx), [CustomerDashboard.tsx](prn232-su26-ai-audit-project-prn232_se18d05_group-06/FRONTEND/src/features/customer/CustomerDashboard.tsx) |

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
| Nhóm trưởng | 21/06/2026 |
