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
| Lớp | SE18D05 |
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

## 4. Tổng kết thay đổi cuối project

### 4.1. Các chức năng đã hoàn thành

| STT | Chức năng | Trạng thái | Minh chứng | Ghi chú |
|---:|---|---|---|---|
| 1 | Giao diện Phòng điều phối | Completed | DispatcherDashboard | Giao diện tĩnh |
| 2 | Giao diện màn hình Tài xế | Completed | DriverDashboard | Giao diện tĩnh |
| 3 | Điều phối và gán đơn hàng | Completed | AssignDispatcherTab | Giao diện tương tác tĩnh |
| 4 | Điều hướng Router chính | Completed | App.tsx | Định tuyến chính xác |

---

### 4.2. Các chức năng chưa hoàn thành

| STT | Chức năng | Lý do chưa hoàn thành | Hướng cải thiện |
|---:|---|---|---|
| 1 | Xử lý Backend và database thực tế | Giới hạn thời gian làm giao diện | Kết nối API thật ở phase sau |

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

```text
Nhóm đã hiểu rõ hơn cách tổ chức một ứng dụng React chia theo component nhỏ và cách sử dụng CSS Tailwind để lập trình giao diện nhanh chóng.
```

---

### 4.5. Hướng cải thiện tiếp theo

```text
Lập trình phần Backend bằng .NET Core để kết nối cơ sở dữ liệu SQL Server, hoàn thiện chức năng đăng nhập và lưu trữ đơn hàng thực tế.
```

---

## 5. Cam kết cập nhật Changelog

Sinh viên/nhóm cam kết rằng nội dung changelog phản ánh đúng các thay đổi đã thực hiện trong quá trình làm bài tập/project.

| Đại diện sinh viên/nhóm | Ngày xác nhận |
|---|---|
| Nhóm trưởng | 02/06/2026 |
