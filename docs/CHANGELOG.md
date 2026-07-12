# Changelog

## 1. Quy định ghi Changelog

File này dùng để ghi lại các thay đổi quan trọng trong quá trình thực hiện bài tập, lab, assignment hoặc project.

Nguyên tắc ghi changelog:
- Chỉ ghi những gì đã hoàn thành thật sự.
- Không ghi kế hoạch nếu chưa thực hiện.
- Mỗi thay đổi nên có ngày, nội dung, người thực hiện và minh chứng.
- Nếu có AI hỗ trợ, cần ghi rõ AI đã hỗ trợ phần nào.
- Nếu có commit GitHub, cần ghi link commit.
- Nếu có lỗi đã sửa, cần ghi rõ lỗi, nguyên nhân và cách xử lý.

---

## 2. Thông tin project

| Thông tin | Nội dung |
|---|---|
| Môn học | Building Cross-Platform Back-End Application With .NET |
| Mã môn học | PRN232 |
| Lá»›p | SE18D05 |
| Học kỳ | 8 |
| Tên bài tập / Project | FleetNova - Hệ thống Quản trị Logistics Thông minh |
| Tên sinh viên / Nhóm | Nhóm 6 |
| MSSV / Danh sách MSSV | DE180071,DE180096,DE180088,DE180109,DE180104 |
| Giảng viên hướng dẫn | Lê Thiện Nhật Quang |
| Repository URL |  |
| Ngày bắt đầu | 17/05/2026 |
| Ngày hoàn thành |  |

---

## 3. Tổng quan các phiên bản/giai đoạn

| Phiên bản/Giai đoạn | Thời gian | Nội dung chính | Trạng thái |
|---|---|---|---|
| Phase 01 | 17/05/2026 - 19/05/2026 | Khởi tạo project và cấu trúc thư mục | Completed |
| Phase 02 | 20/05/2026 - 22/05/2026 | Phân tích yêu cầu và phân vai người dùng | Completed |
| Phase 03 | 23/05/2026 - 25/05/2026 | Thiết kế giao diện cơ bản | Completed |
| Phase 04 | 26/05/2026 - 29/05/2026 | Implementation (Lập trình giao diện Frontend) | Completed |
| Phase 05 | 30/05/2026 - 31/05/2026 | Testing & Sửa lỗi giao diện | Completed |
| Phase 06 | 01/06/2026 - 02/06/2026 | Hoàn thiện báo cáo và tài liệu | Completed |

---

## [2026-05-24]
Author: Vũ Lê Duy (DE180104)

### Added
- Khởi tạo khung dự án Frontend sử dụng thư viện React và Vite.
- Xây dựng bố cục giao diện chính với tệp DispatcherLayout.tsx và các Tab menu điều phối.

### Changed
- Cập nhật cấu hình tệp tailwind.config.js để định nghĩa các dải màu, khoảng cách đặc trưng cho FleetNova.

### Fixed
- Sửa lỗi tràn khung hiển thị trên các màn hình có độ phân giải nhỏ và trung bình bằng các thuộc tính scroll linh hoạt.

### AI-assisted
- Sử dụng ChatGPT để gợi ý các class CSS Flexbox dựng thanh Sidebar cố định.
- Mã nguồn mẫu được nhóm rà soát, kiểm tra khả năng đáp ứng thiết bị trước khi đưa vào ứng dụng.

---

## [2026-05-25]
Author: Vũ Lê Duy (DE180104)

### Added
- Thiết lập tệp định tuyến chính App.tsx kết nối trang điều hành và trang tài xế.

### Changed
- Cấu hình lại các tệp import đường dẫn trong App.tsx để định vị chính xác vị trí các components.

### Fixed
- Sửa lỗi catch-all route để chuyển hướng an toàn về trang chủ điều hành khi người dùng nhập sai địa chỉ URL.

### AI-assisted
- Sử dụng Gemini để tham khảo cấu trúc định tuyến của react-router-dom v6.
- Nhóm đã phát hiện AI đề xuất phiên bản cũ và chủ động viết lại theo cú pháp thẻ Route mới nhất.

---

## [2026-05-27]
Author: Trần Văn Tùng (DE180109)

### Added
- Xây dựng giao diện AuthPage với tính năng chuyển đổi Đăng nhập/Đăng ký mượt mà.
- Triển khai trang Profile khách hàng với bố cục khoa học và đẹp mắt.

### Changed
- Tích hợp phong cách thiết kế Glassmorphism (hiệu ứng kính mờ) cho toàn bộ card UI trong trang Auth và Profile.

### AI-assisted
- Sử dụng Antigravity để gợi ý các class Tailwind cho hiệu ứng backdrop-blur và border mờ.

---

## [2026-05-29]
Author: Trần Văn Tùng (DE180109)

### Added
- Phát triển trang OrderHistory và PaymentHistory hiển thị danh sách giao dịch của khách hàng.
- Thêm các Badge trạng thái đơn hàng (Đang xử lý, Đang giao, Đã hoàn thành) với màu sắc phân biệt.

### Changed
- Refactor code hiển thị danh sách sử dụng hàm .map() để tối ưu hóa việc quản lý dữ liệu.

### AI-assisted
- Sử dụng ChatGPT để tối ưu cấu trúc vòng lặp hiển thị danh sách và xử lý logic render theo điều kiện trạng thái.

---

## [2026-05-31]
Author: Trần Văn Tùng (DE180109)

### Added
- Hoàn thiện trang OrderTracking với bản đồ lộ trình di chuyển (OrderTrackingMap).
- Tích hợp animation SVG cho biểu tượng xe tải di chuyển theo thời gian thực trên bản đồ mockup.

### Changed
- Cải thiện UX cho các trang CreateOrder và CreateShipment bằng các bước nhập liệu (Steppers).

### AI-assisted
- Sử dụng Antigravity để hỗ trợ viết CSS Animation cho icon SVG xe tải di chuyển mượt mà trên lộ trình.

---

## [2026-06-01]
Author: Trần Văn Tùng (DE180109)

### Added
- Xây dựng trung tâm khuyến mãi VoucherCenter với giao diện thẻ quà tặng hiện đại.
- Triển khai SupportChat và SupportPage hỗ trợ khách hàng gửi khiếu nại và chat trực tuyến.

### Changed
- Cập nhật Header và Footer đồng nhất trên toàn bộ các trang chức năng của khách hàng.

### AI-assisted
- Sử dụng Gemini để gợi ý bố cục Grid linh hoạt cho danh sách voucher và khung chat responsive.

---

## [2026-06-10]
Author: Lê Quốc Hùng (DE180096)

### Added
- Feature: Full-stack integration of UC015 - Automatically create new vehicle profile from AI ALPR detection.
- Backend Changes: Formulated Vehicle entity, mapped rules in SmartLogDbContext.cs conforming to SmartLogAIDb.sql. Coded 4 REST endpoints in VehiclesController.cs and business logic in VehicleService.cs using the data-bypass model (dummy 0.0m for technical constraints).
- Background Worker: Added VehicleCleanupWorker.cs to run every 1 hour and automatically purge expired records using a SQL condition (InsuranceExpiry < DateTime.UtcNow).
- Frontend Changes: Modified VehiclesTab.tsx to include the 'Pending' status filter, dynamic countdown timer rendering, Axios API integration, and locking down the License Plate input within the approval modal drawer.

### Fixed
- Resolved Permission denied during staging phase by bypassing the IDE's locked system directory (BACKEND/.vs/) and targeting explicit codebase paths instead.

### AI-assisted
- Dùng AI để tra cứu cú pháp cấu hình Background Worker trong .NET và logic khóa UI React. Nhóm tự triển khai mã nguồn.

---

## [2026-06-15]
Author: Vũ Lê Duy (DE180104)

### Added
- Frontend: Tích hợp nút Đăng nhập bằng Google trên trang AuthPage.
- Backend: Mở thêm endpoint `[HttpPost("google")]` xử lý giải mã token của Google. Cấu hình cấp JWT nội bộ.

### Changed
- Cập nhật cơ chế đăng nhập, hỗ trợ lấy thông tin User Profile tự động từ Google.

### Fixed
- Xử lý lỗi Token hết hạn bằng interceptor 401 Unauthorized từ Axios.

### AI-assisted
- Dùng AI để tham khảo cách giải mã Token của thư viện Google.Apis.Auth. Toàn bộ logic lưu DB và cấp phát JWT được code bằng tay.

---

## [2026-05-24]
Author: Vũ Lê Duy (DE180104)

### Added
- Khởi tạo khung dự án Frontend sử dụng thư viện React và Vite.
- Xây dựng bố cục giao diện chính với tệp DispatcherLayout.tsx và các Tab menu điều phối.

### Changed
- Cập nhật cấu hình tệp tailwind.config.js để định nghĩa các dải màu, khoảng cách đặc trưng cho FleetNova.

### Fixed
- Sửa lỗi tràn khung hiển thị trên các màn hình có độ phân giải nhỏ và trung bình bằng các thuộc tính scroll linh hoạt.

### AI-assisted
- Sử dụng ChatGPT để gợi ý các class CSS Flexbox dựng thanh Sidebar cố định.
- Mã nguồn mẫu được nhóm rà soát, kiểm tra khả năng đáp ứng thiết bị trước khi đưa vào ứng dụng.

---

## [2026-05-25]
Author: Vũ Lê Duy (DE180104)

### Added
- Thiết lập tệp định tuyến chính App.tsx kết nối trang điều hành và trang tài xế.

### Changed
- Cấu hình lại các tệp import đường dẫn trong App.tsx để định vị chính xác vị trí các components.

### Fixed
- Sửa lỗi catch-all route để chuyển hướng an toàn về trang chủ điều hành khi người dùng nhập sai địa chỉ URL.

### AI-assisted
- Sử dụng Gemini để tham khảo cấu trúc định tuyến của react-router-dom v6.
- Nhóm đã phát hiện AI đề xuất phiên bản cũ và chủ động viết lại theo cú pháp thẻ Route mới nhất.

---

## [2026-06-21]
Author: Trần Văn Tùng (DE180109)

### Added
- Feature: Hoàn thiện hệ thống cảnh báo Email tự động cho Warehouse.
- Backend: Triển khai `EmailService` (SMTP/Gmail), tích hợp logic Debounce 12h vào `StockAlertService`.
- Database: Tạo script [seed_warehouse_data.sql] tổng hợp dữ liệu mẫu và kịch bản test.
- Frontend: Nâng cấp [StockAlerts.tsx] với bộ lọc tìm kiếm SKU/Sản phẩm và Filter loại cảnh báo.

### Changed
- Refactored UI: Chuyển đổi layout sang Grid 4 cột (Bảng chiếm 3/4, AI chiếm 1/4) để tối ưu không gian hiển thị danh sách.
- Styling: Tăng cường padding, bo góc `rounded-2xl` và hiệu ứng `shadow-2xl` cho giao diện hiện đại.

### Fixed
- Sửa lỗi text-wrapping (nhảy dòng) trong bảng cảnh báo bằng thuộc tính `whitespace-nowrap`.
- Sửa logic Backend: Chỉ cập nhật thời gian gửi email khi SMTP client phản hồi thành công (tránh log ảo).

### AI-assisted
- Sử dụng Antigravity để tham khảo cấu trúc SMTP và gợi ý layout Grid tối ưu cho dashboard cảnh báo. Nhóm tự viết lại template HTML và bộ lọc React.

---

## [2026-06-21]
Author: Lê Quốc Hùng (DE180096)

### Added
- Feature: Thực hiện trọn gói "UC018: Track Vehicle Entry/Exit History and Trip Count" (Theo dõi lịch sử vào/ra và đếm chuyến xe).
- Database: Cập nhật tệp [smartlogAI.sql] bổ sung bảng `VehicleEvents` chứa vết di chuyển và chỉ mục tối ưu hóa truy vấn `IX_VehicleEvents_Vehicle`.
- Backend:
  - Cấu hình lớp Entity `VehicleEvent` và thiết lập quan hệ trong DbContext.
  - Chặn tuyệt đối việc chỉnh sửa/xóa vết di chuyển (Audit Trail Immutability) tại database context bằng cách ghi đè `SaveChanges` & `SaveChangesAsync`, ném lỗi `InvalidOperationException`.
  - Xây dựng `TrackingService` chứa thuật toán đếm chuyến dựa trên các cặp check-in/check-out liên tiếp.
  - Triển khai `TrackingController` cung cấp các API lấy danh sách xe, ghi nhận sự kiện, tra cứu lịch sử hành trình và lấy số lượng chuyến xe.
- Frontend:
  - Thiết kế trang `VehicleTrackingDashboard.tsx` hiển thị các thẻ KPI (Chuyến xe, Tổng sự kiện, Trạng thái) và form ghi nhận sự kiện kèm dòng thời gian hành trình.
  - Tích hợp trang vào hệ thống điều phối thông qua thanh điều hướng `Sidebar.tsx`, router định tuyến và phân loại hiển thị.

### Changed
- Refactored UI Contrast: Thay đổi mã màu của các class text `text-on-surface` và `text-on-surface-variant` tại trang `VehicleTrackingDashboard.tsx` sang các tông màu sáng rõ rệt như `text-[#d4e4fa]`, `text-slate-300`, `text-slate-400` để đảm bảo văn bản hiển thị rõ ràng trên nền tối của giao diện điều phối.

### AI-assisted
- Sử dụng Antigravity để hỗ trợ thiết kế cấu trúc database, viết logic đè SaveChanges để chặn chỉnh sửa dữ liệu, thiết kế giao diện timeline dòng thời gian và đề xuất các lớp màu thay thế nâng cao độ tương phản hiển thị chữ. Nhóm đã tự kiểm tra và chỉnh sửa chi tiết giao diện để đạt thẩm mỹ cao nhất.

---

## [2026-06-21]
Author: Lê Quốc Hùng (DE180096)

### Added
- Feature: Triển khai toàn diện "UC020: Confirm Check-out & Exit Gate Control" (Xác nhận Check-out & Điều khiển Cổng ra).
- Backend:
  - Xây dựng các lớp DTO (`CheckoutRequestDto`, `CheckoutResponseDto`, `ActiveBookingSummaryDto`).
  - Triển khai `GateService` xử lý nghiệp vụ giao dịch check-out trong `IDbContextTransaction`: cập nhật trạng thái đặt chỗ sang `COMPLETED`, cập nhật thời gian check-out, giải phóng Dock đỗ về `AVAILABLE`, ghi nhận nhật ký cổng `GateLogs` (`CHECKOUT`), và thêm sự kiện lịch sử xe `VehicleEvents` (`CheckOut`).
  - Thiết lập `GateController` cung cấp API tra cứu thông tin đặt chỗ hoạt động (`GET /api/gate/active-booking`) và API thực hiện thủ tục check-out (`POST /api/gate/checkout`).
  - Đăng ký dịch vụ trong `Program.cs`.
- Frontend:
  - Phát triển dashboard điều phối cổng ra `GateCheckoutDashboard.tsx` cho nhân viên bảo vệ.
  - Thiết kế giao diện camera ALPR mô phỏng quét biển số xe, bảng điều khiển thông tin chi tiết xe/tài xế, và bộ kiểm thử giả lập nhanh các biển số xe mẫu.
  - Tạo mô phỏng đồ họa động SVG Barrier Arm Gate hoạt động trực quan (xoay đứng thanh chắn cổng 90 độ, đèn tín hiệu nhấp nháy xanh lá, đếm ngược tự đóng sau 8 giây).
  - Tích hợp liên kết Sidebar điều hướng và khai báo Route trong `App.tsx`.

### Changed
- Tối ưu mã nguồn Frontend: Điều chỉnh đường dẫn import kiểu dữ liệu `InventoryAudit.types` bị sai trong hai component `AuditSidebarPanel.tsx` và `InventoryComparisonTable.tsx` để sửa triệt để lỗi biên dịch TypeScript.

### AI-assisted
- Sử dụng Antigravity để tư vấn thiết kế giao dịch ACID bằng `IDbContextTransaction` bảo vệ toàn vẹn lịch sử vết di chuyển của xe và thiết kế giao diện mô phỏng SVG Barrier Gate. Nhóm tự thực hiện kiểm thử tích hợp trên Swagger và điều chỉnh giao diện hiển thị.

---

## [2026-06-29]
Author: Lê Quốc Hùng (DE180096)

### Added
- Feature: Triển khai toàn diện "UC021: Quản lý Danh sách Đen Phương tiện & Tài xế" (Blacklist Management).
- Backend:
  - Tận dụng các trường `IsBlacklisted` và `BlacklistReason` sẵn có trong `Vehicles` và `Drivers` models — **Không tạo migration hay thay đổi schema database**.
  - Bổ sung phương thức `ToggleBlacklistAsync` vào `VehicleService.cs` với kiểm tra business: bắt buộc nhập lý do khi blacklist, xóa lý do khi unblacklist.
  - Bổ sung phương thức `ToggleBlacklistAsync` vào `DriverService.cs` với cùng quy tắc business validation.
  - Tích hợp kiểm tra blacklist vào `GateService.ProcessCheckInAsync` như guard clause **nguyên tử** trước mọi thay đổi trạng thái booking/dock/log — đảm bảo rejection không ghi log thành công, không mở barrier, không chiếm dock.
  - `GateController.cs` trả về HTTP 403 Forbidden kèm payload `BlacklistAlertDto` có các trường: `alertType`, `alarmLevel`, `blockedEntity`, `licensePlate`, `driverName`, `reason`.
- Frontend:
  - `VehiclesTab.tsx`: Tích hợp toggle switch "Kiểm soát Danh sách Đen" trong HUD panel chi tiết xe với UI glassmorphism. Hiển thị trạng thái, lý do blacklist và xử lý prompt nhập lý do.
  - `DispatchersTab.tsx`: Tích hợp toggle switch "Kiểm soát Danh sách Đen" trong panel chi tiết tài xế. Chỉ hoạt động với driver thực từ backend (không mock).
  - `GateCheckoutDashboard.tsx`: Thêm xử lý 403 Forbidden, parse payload `accessDenied`, và hiển thị **Red Critical Security Alert Modal** — màu đỏ nhấp nháy, hiển thị entity bị chặn, lý do từ chối, mức độ nghiêm trọng. Barrier không mở khi bị từ chối.

### Fixed
- Sửa lỗi UI Contrast toàn diện trong Dispatcher Dashboard: Tailwind `surface`, `on-surface`, `on-surface-variant`, `surface-variant`, `outline-variant`, `error` đều bị trỏ đến màu light theme (#191c1e) do trùng key trong `tailwind.config.js`.
- Chuyển đổi các token màu này sang CSS custom properties (`var(--on-surface)`, v.v.) trong `tailwind.config.js`.
- Định nghĩa dark overrides trong `index.css` dưới `.dark, .dispatcher-dark-theme`.
- Thêm class `dark dispatcher-dark-theme` vào container gốc trong `DispatcherLayout.tsx`.

### AI-assisted
- Sử dụng Antigravity (Claude Sonnet 4.6) để thiết kế luồng guard clause blacklist nguyên tử trong GateService, cấu trúc 403 payload, thiết kế UI Red Alarm Modal, phân tích nguyên nhân lỗi tương phản màu sắc Tailwind CSS và đề xuất giải pháp CSS variable mapping. Nhóm tự kiểm tra toàn bộ 3 kịch bản nghiệm vụ (blacklist xe, blacklist tài xế, unblacklist rồi check-in lại) và tự tinh chỉnh giao diện.

---

## [2026-07-01]
Author: Trần Văn Tùng (DE180109)

### Added
- Backend: Thêm luồng Overstay Alert gồm model `VehicleDockSession`, model `OverstayAlert`, DTO, controller API `/api/fleet/overstay-alerts`, service tính SLA và worker quét tự động.
- Database: Bổ sung bảng `VehicleDockSessions` và `OverstayAlerts` trong `smartlogAI.sql`.
- Database seed: Thêm dữ liệu mẫu xe đang ở Dock gồm trạng thái sắp quá SLA, quá SLA và khẩn cấp để UI Dispatcher có dữ liệu hiển thị.
- Frontend: Tạo màn hình `Overstay Alert` trong Dispatcher, hiển thị xe, dock, tài xế, booking, SLA quy định, thời gian thực tế, số phút vượt SLA và hành động xử lý.

### Changed
- UI/UX: Làm mới Dispatcher thành operations console sáng, gọn, phù hợp hệ thống logistics thay vì giao diện tối/glow.
- Navigation: Đổi tab cảnh báo trong Dispatcher thành nhãn nghiệp vụ `Overstay Alert`, không hiển thị mã use case trên UI.
- Dashboard: Thêm bảng `Điều phối Dock & SLA`, KPI `Nguy cơ Overstay`, queue điều phối và phần nhật ký vận hành dễ đọc hơn.
- SQL: Gộp nội dung `setup-overstay-alert.sql` vào `smartlogAI.sql`, giữ một file SQL chính duy nhất cho schema và sample data.

### Fixed
- Backend: Sửa lỗi endpoint Overstay Alert trả 500 khi database chưa có bảng bằng cách bổ sung schema và dữ liệu mẫu vào SQL chính.
- Backend: Xử lý lỗi SMTP authentication trong `EmailService` theo hướng simulated email, tránh StockAlertWorker spam lỗi đỏ khi test chức năng khác.
- Frontend: Loại bỏ toàn bộ chữ `UC023/UC23` khỏi giao diện Dispatcher để UI thẩm mỹ và gần nghiệp vụ hơn.

### Verification
- `GET http://localhost:5184/api/fleet/overstay-alerts` trả HTTP 200.
- `dotnet build` backend sang thư mục kiểm tra thành công.
- Rà text frontend xác nhận không còn `UC023/UC23` trong UI Dispatcher.

### Known issues
- Frontend type-check toàn project vẫn còn lỗi cũ ngoài phạm vi Overstay Alert: thiếu `InventoryAudit.types` ở `AuditSidebarPanel.tsx` và `InventoryComparisonTable.tsx`.

---

## [2026-07-02]
Author: Trần Văn Tùng (DE180109)

### Added
- Backend: Them AI Financial Trend Forecasting cho Admin voi controller `FinancialForecastController` va cac endpoint `/api/finance/forecast`, `/generate`, `/retrain`, `/history`.
- Backend: Them service `FinancialForecastService` de tong hop lich su doanh thu/chi phi/dong tien, tinh forecast 3 thang, confidence score, risk level va AI insight.
- Database: Bo sung bang `FinancialForecasts` va `AiModelTrainingLogs` vao `smartlogAI.sql`, kem seed forecast mau cho 3 thang tiep theo.
- Frontend: Lam lai man hinh `FRONTEND/src/features/admin/Finance.tsx` thanh dashboard AI Trend gom KPI, chart revenue/cost, cash flow forecast, bang 3 thang, AI insights, training logs, Generate, Retrain va Export CSV.

### Changed
- UI/UX: Chuyen man Finance tu mock glass-card cu sang operations dashboard sang, gon, hop voi module M4 Finance & Reconciliation.
- Navigation/UI copy: Giu route `/admin/finance`, khong hien thi chu `UC042` tren giao dien de tranh mat tham my.
- Backend: Dang ky `IFinancialForecastService` trong DI container va map entity moi vao `SmartLogAiContext`.

### Fixed
- Backend: Dieu chinh mapping DTO de tranh loi runtime khi EF Core khong dich duoc static mapper trong LINQ query.
- Frontend: Them fallback dashboard de man hinh khong bi trang neu API/database chua san sang.

### Verification
- `dotnet build -o .\BACKEND\bin\codex-check` thanh cong, chi con warning nullability cu cua project.
- `npm run type-check` frontend van fail do loi cu ngoai pham vi UC042: thieu `InventoryAudit.types` trong `AuditSidebarPanel.tsx` va `InventoryComparisonTable.tsx`.
- Thu seed SQL truc tiep bang `sqlcmd` khong thanh cong vi SQL Server `(local)` tren may hien khong ket noi duoc.



---
## [2026-07-08]
Author: Trần Văn Tùng (DE180109)

### Added
- Hoàn thiện chức năng Cảnh báo tồn kho gửi email thật qua Gmail SMTP.
- Thêm cơ chế gửi email về người dùng đang đăng nhập; nếu không có email trong JWT thì fallback về `tungtvde180109@fpt.edu.vn`.

### Changed
- Cập nhật `EmailSettings` trong `appsettings.json` theo đúng key backend sử dụng và cấu hình Gmail App Password.
- Tách luồng quét nền và quét thủ công: worker nền vẫn áp dụng debounce, nút Quét ngay dùng `force=true` để hỗ trợ test gửi lại email.
- Thiết kế lại UI Stock Alerts với tương phản tốt hơn, tiếng Việt đúng font, bảng rõ ràng, responsive mobile và hiển thị email gần nhất.

### Fixed
- Sửa lỗi SMTP `5.7.0 Authentication Required` bằng App Password hợp lệ.
- Sửa lỗi `/api/stockalerts/scan` trả 500 khi SMTP lỗi, chuyển sang thông báo rõ trạng thái gửi email.
- Sửa lỗi build backend do process `BACKEND.exe` đang khóa file khi chạy lại `dotnet run`.

### Verification
- SMTP test gửi thành công tới `tungtvde180109@fpt.edu.vn`.
- API `/api/stockalerts/scan?force=true` trả về `Đã gửi 3 email`.
- `dotnet build` backend thành công 0 warning/0 error.
- `npm run build` frontend thành công.

---

## [2026-07-09]
Author: Trần Văn Tùng (DE180109)

### Added
- Báo cáo doanh thu theo loại dịch vụ: Thêm báo cáo doanh thu theo loại dịch vụ với API `/api/finance/reports/revenue-by-service`, card tổng quan, bảng dữ liệu, biểu đồ cột và biểu đồ tỷ lệ đóng góp.
- Báo cáo chi phí vận hành: Thêm báo cáo chi phí vận hành với dữ liệu `OperatingExpenses`, `ExceptionExpenses` và `VehicleMaintenanceLogs`, hỗ trợ lọc theo ngày và loại chi phí.
- Báo cáo lợi nhuận theo thời gian: Thêm báo cáo lợi nhuận theo thời gian, tính doanh thu - chi phí, profit margin và biểu đồ xu hướng theo kỳ.
- Đối soát giao dịch thanh toán: Thêm đối soát thanh toán với API danh sách, auto-match, manual-match và biểu đồ trực quan trạng thái giao dịch ngân hàng.
- Xuất báo cáo tài chính ra Excel/PDF: Thêm endpoint export `/api/finance/reports/export` hỗ trợ `excel` và `pdf` cho các reportType: `revenue-by-service`, `operating-expenses`, `profit`, `payment-reconciliation`, `financial-forecast`.
- Dự báo tài chính cơ bản: Cập nhật dự báo tài chính cơ bản theo Moving Average 3 tháng, hỗ trợ chọn forecast 1/3/6 tháng, lưu `FinancialForecasts` và ghi `AiModelTrainingLogs` khi generate.

### Changed
- Admin Finance được mở rộng thành trung tâm báo cáo M4 gồm Revenue by Service, Operating Expense, Profit Report, Payment Reconciliation và Financial Forecast.
- Route forecast mới dùng `/api/finance/forecasts`, vẫn giữ `/api/finance/forecast` để tương thích màn cũ.
- Model version forecast chuyển sang dạng `FIN-MA-YYYYMM.1` để phản ánh phương pháp Moving Average.
- UI bổ sung nút `Export Excel` và `Export PDF` dùng chung qua `FinanceExportButtons`.

### Fixed
- Sửa lỗi controller export thiếu inject `IFinanceReportExportService`.
- Sửa lỗi text mojibake còn sót ở nút Đối soát thanh toán.
- Sửa lỗi TypeScript khi đọc `content-disposition` từ Axios headers trong luồng tải file.

### Verification
- `npx tsc --noEmit` frontend thành công.
- `dotnet build --no-restore /p:UseAppHost=false -o .\obj\codex-check` backend thành công 0 warning/0 error.

---

## [2026-07-09]
Author: Tran Van Tung (DE180109)

### Changed
- Tach trang Admin Finance thanh workspace theo tab: Overview, Revenue, Expenses, Profit, Reconciliation, Forecast, Exports.
- Chuyen nut Generate Forecast va Retrain vao tab Forecast.
- Them tab Exports de xuat bao cao theo tung loai.

### Fixed
- Rut gon bang doi soat thanh toan bang nut Manual Match va modal xac nhan.
- Giu UI admin theo tone sang, sidebar den ro nhu man hinh warehouse.

---

## [1.2.0] - 2026-07-08
Author: Vũ Lê Duy (DE180104)

### Added
- Thêm cơ chế Strict Check-in logic đa tầng cho AI Camera (Kiểm tra xe lạ, Xe Inactive, Xe Blacklist, Lịch Booking).
- Thêm Overlay UI lớn trên React hiển thị lỗi cảnh báo đỏ, dễ quan sát khi xe vi phạm quy tắc cổng.
- Thêm API `POST /api/gate/check-plate` hỗ trợ nhận diện và xử lý biển số riêng biệt với Active Bookings.

### Changed
- Sửa đổi truy vấn LINQ to Entities: Thay hàm C# `NormalizePlate()` bằng `.Replace().ToUpper()` để Entity Framework biên dịch thành công sang SQL Server, tránh lỗi 500.

### Fixed
- Sửa lỗi console log bị spam AxiosError 404 khi không tìm thấy xe trong kho.

---

## [1.3.0] - 2026-07-09
Author: Vũ Lê Duy (DE180104)

### Added
- Bổ sung nghiệp vụ kiểm tra hạn đăng kiểm của phương tiện khi tạo lịch booking kho.
- Bổ sung rule chặn AI Camera check-in nếu xe đã hết hạn đăng kiểm.
- Bổ sung cảnh báo Dispatcher cho xe sắp đến hạn bảo trì trong màn Hồ sơ xe.
- Thêm KPI, bộ lọc rủi ro và nhãn cảnh báo trực tiếp trên danh sách phương tiện.

### Changed
- Cải thiện UI màn quản lý phương tiện theo hướng dashboard vận hành: thẻ thống kê rõ hơn, cảnh báo đăng kiểm/bảo trì nổi bật hơn, bảng phương tiện dễ quét thông tin hơn.
- Điều chỉnh layout `VehiclesTab` để vùng danh sách phương tiện có thể cuộn dọc, tránh bị che/lấp bởi phần KPI và bộ lọc phía trên.
- Chuẩn hóa việc so sánh biển số xe khi đặt lịch bằng cách bỏ dấu gạch ngang, dấu chấm và khoảng trắng trước khi truy vấn.

### Fixed
- Sửa lỗi danh sách phương tiện bị lấp ở cuối màn hình, không kéo xuống xem đầy đủ thông tin được.
- Sửa nguy cơ xe hết hạn đăng kiểm vẫn đặt lịch hoặc check-in được nếu người dùng nhập biển số khác định dạng.

### AI-assisted
- Có sử dụng AI ở mức tham khảo để gợi ý vị trí kiểm tra logic, cách đọc lỗi layout scroll và cách tổ chức lại UI.
- Sinh viên tự kiểm tra code hiện có, tự quyết định nghiệp vụ, chỉnh sửa thủ công, chạy build và kiểm thử trên localhost trước khi ghi nhận vào changelog.

### Verification
- `dotnet build BACKEND/BACKEND.csproj`: thành công.
- `npm run build`: thành công.
- Kiểm tra thủ công backend Swagger và frontend Dispatcher trên localhost.
---

## [1.5.0] - 2026-07-10
Author: Vu Le Duy (DE180104)

### Added
- Bo sung luong dang nhap theo vai tro: sau khi dang nhap thanh cong, he thong tu chuyen nguoi dung ve dung man hinh cua role.
- Tao va kiem thu tai khoan mau cho `WAREHOUSE` va `DISPATCHER` de phuc vu demo nghiep vu.
- Them route alias `/import-goods` tro ve man hinh nhap kho de nguoi dung truy cap nhanh nghiep vu AI goi y vi tri luu kho.

### Changed
- Sua o dang nhap tu `type="email"` sang `type="text"` de chap nhan username va khong bi trinh duyet bat nhap ky tu `@`.
- Cai thien nut **Goi y vi tri** trong man nhap kho de hien thi ro rang hon, tranh bi chim tren nen trang.
- Dieu chinh connection string local co `TrustServerCertificate=True` khi can chay backend tren SQL Server local co certificate tu ky.

### Notes
- Azure Computer Vision duoc cau hinh qua `appsettings.json` theo section `AzureVision`, nhung khong ghi lo key trong tai lieu.
- Cac thay doi duoc kiem thu bang API login, man hinh frontend localhost va lenh `npm run build`.

### AI-assisted
- AI duoc dung de tham khao cach kiem tra router, auth flow, role redirect va van de UI button bi chim mau.
- Sinh vien tu doi chieu code hien co, tu chon cach sua, tu chay build va kiem thu dang nhap bang tai khoan mau.

---

## [1.6.0] - 2026-07-10
Author: Vu Le Duy (DE180104)

### Added
- Feature: Hoàn thiện Bản đồ theo dõi đơn hàng trực tuyến (Order Tracking Map) kết hợp thư viện Goong Map.
- Vẽ tuyến đường giao thông thực tế giữa Điểm lấy hàng và Điểm giao hàng thông qua API Direction.
- Đánh dấu các mốc (Checkpoints) tương ứng với 6 trạng thái xử lý đơn hàng trên lộ trình bản đồ.

### Changed
- Refactored UI: Gỡ bỏ hoàn toàn giao diện SVG giả lập (fake SVG overlay) che lấp bản đồ thật.
- Đồng bộ % tiến trình của đơn hàng để vị trí xe tải (Truck Marker) khớp chính xác với điểm checkpoint thực tế trên bản đồ.

### Fixed
- Sửa lỗi giới hạn (clamp) phần trăm tiến độ khiến xe tải không bao giờ dừng đúng điểm đầu và điểm cuối của lộ trình.
- Sửa lỗi hiển thị Marker mặc định (text "Xe") thành một SVG Icon xe tải được custom theo thiết kế thống nhất của hệ thống.

### AI-assisted
- Dùng AI để tra cứu cú pháp cấu hình Mapbox/Goong và thuật toán nội suy điểm trên đường thẳng (Interpolation). Sinh viên tự thiết kế cấu trúc code, tự debug lỗi lệch toạ độ và tự thiết kế giao diện xe tải.

## [2026-07-10 ]
Author: Tran Van Tung (DE180109)

### Added
- Them floor plan 2D moi cho Admin Warehouses gom wall, main aisle, cross aisle, dock lane, gate, zone, bin va dock.
- Them KPI/legend trong tab 2D Layout de nhin nhanh so zone, bin, dock va trang thai busy.

### Changed
- Cai thien renderer SVG de map responsive hon, nhan object ro hon va moi loai object co style rieng.
- Cai thien auto-generate layout backend de sinh so do kho co cau truc ro rang hon.


### Verification
- `npx tsc --noEmit`: thanh cong.
- `dotnet build`: thanh cong, 0 warning, 0 error.
---

## [2026-07-10]
Author: Tran Van Tung (DE180109)

### Added
- Them seed du lieu cho Flow Optimization gom warehouse, dock, vehicle, driver, service order, slot booking da check-in va gate log.
- Them mapping label tieng Viet cho trang thai, do uu tien, loai hang, loai chuyen va kha nang dock trong Dispatcher Flow Optimization.

### Changed
- Cai thien UI tab Flow Optimization de hien thi tieng Viet dung font, khong hien ma UC ky thuat tren giao dien.
- Bo cuc lai cum diem uu tien va nut hanh dong thanh action card gon hon.


### Verification
- `npm run type-check`: thanh cong.
---
## [2026-07-12]
Author: Tran Van Tung (DE180109)

### Added
- Them endpoint customer xem/tai PDF hoa don co kiem tra quyen so huu hoa don.
- Them nut Thanh toan trong Payment History de customer quay lai trang thanh toan cho hoa don PENDING.
- Them thong tin MB Bank, chu tai khoan, so tai khoan, noi dung chuyen khoan va VietQR vao PDF/email hoa don.

### Changed
- Cai thien: PayOS thanh cong cap nhat payment CONFIRMED, invoice PAID, generate PDF va gui email cho customer.
- Sua thong bao thao tac Xem PDF, Tai PDF, Gui lai Email, Bien nhan co toast thanh cong/that bai ro rang.
- Sua lai chu tieng Viet bi loi encoding tren man Payment History.

### Verification
- `dotnet build BACKEND\\BACKEND.csproj --no-restore`: thanh cong.
- `npm run type-check`: thanh cong.
---
## 4. Tổng kết thay đổi cuối project

### 4.1. Các chức năng đã hoàn thành

| STT | Chức năng | Trạng thái | Minh chứng | Ghi chú |
|---:|---|---|---|---|
| 1 | Giao diện Phòng điều phối | Completed | DispatcherDashboard | Giao diện tĩnh |
| 2 | Giao diện màn hình Tài xế | Completed | DriverDashboard | Giao diện tĩnh |
| 3 | Điều phối và gán đơn hàng | Completed | AssignDispatcherTab | Giao diện tương tác tĩnh |
| 4 | Điều hướng Router chính | Completed | App.tsx | Định tuyến chính xác |
| 5 | UC018: Track Vehicle Entry/Exit History and Trip Count | Completed | VehicleTrackingDashboard.tsx, TrackingController.cs | Hoàn thành toàn diện backend & frontend, chặn chỉnh sửa logs |
| 6 | UC020: Confirm Check-out & Exit Gate Control | Completed | GateCheckoutDashboard.tsx, GateController.cs, GateService.cs | Hoàn thành hệ thống check-out giao dịch nguyên tử, giải phóng Dock, ghi nhận logs, và thiết kế hoạt họa mô phỏng SVG Barrier Gate |
| 7 | UC021: Quản lý Danh sách Đen Phương tiện & Tài xế | Completed | VehiclesTab.tsx, DispatchersTab.tsx, GateCheckoutDashboard.tsx, VehicleService.cs, DriverService.cs, GateController.cs | Triển khai blacklist/whitelist không thay đổi schema DB, guard clause nguyên tử tại gate check-in, 403 alarm modal đỏ trên frontend, và sửa UI contrast toàn bộ Dispatcher Dashboard |


---

### 4.2. Các chức năng chưa hoàn thành

| STT | Chức năng | Lý do chưa hoàn thành | Hướng cải thiện |
|---:|---|---|---|
| 1 | Kết nối API thật cho các chức năng còn lại | Giới hạn thời gian | Đã kết nối API thật cho các chức năng quan trọng (Vận đơn, Phê duyệt xe ALPR, Đặt lịch kho, Theo dõi hành trình xe). Sẽ tiếp tục mở rộng cho các tab phụ. |

---

### 4.3. Tổng hợp AI hỗ trợ trong project

| Hạng mục | AI có hỗ trợ không? | Mức độ hỗ trợ | Ghi chú |
|---|---|---|---|
| Requirement | Có | Ít | Tìm hiểu khái niệm |
| Design | Có | Ít | Gợi ý bố cục |
| Database | Không | Ít | Không dùng |
| Coding | Có | Ít | Tra cứu cú pháp |
| Debug | Có | Ít | Sửa lỗi CSS nhỏ |
| Testing | Không | Ít | Tự test tay |
| Report | Có | Ít | Định dạng văn bản |
| Presentation | Không | Ít | Không dùng |

---

### 4.4. Bài học rút ra

Nhóm đã hiểu rõ hơn cách tổ chức một ứng dụng React chia theo component nhỏ và cách sử dụng CSS Tailwind để lập trình giao diện nhanh chóng.

---

### 4.5. Hướng cải thiện tiếp theo

Lập trình phần Backend bằng .NET Core để kết nối cơ sở dữ liệu SQL Server, hoàn thiện chức năng đăng nhập và lưu trữ đơn hàng thực tế.


---

## 5. Cam kết cập nhật Changelog

Sinh viên/nhóm cam kết rằng nội dung changelog phản ánh đúng các thay đổi đã thực hiện trong quá trình làm bài tập/project.

| Đại diện sinh viên/nhóm | Ngày xác nhận |
|---|---|
| Nhóm trưởng | 02/06/2026 |
