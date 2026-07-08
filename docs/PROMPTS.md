# Prompt Log

## 1. Thông tin chung

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
| Ngày bắt đầu | 17/05/2026 |
| Ngày cập nhật gần nhất | 09/06/2026 |

---

## 2. Mục đích của file Prompt Log

File này dùng để ghi lại các prompt quan trọng đã sử dụng trong quá trình thực hiện bài tập, lab, assignment hoặc project.

Sinh viên/nhóm cần ghi lại:
- Đã hỏi AI điều gì.
- Mục đích sử dụng prompt.
- Công cụ AI đã sử dụng.
- AI đã trả lời hoặc gợi ý gì.
- Kết quả đó có được áp dụng vào bài hay không.
- Sinh viên/nhóm đã kiểm tra, chỉnh sửa hoặc cải tiến gì sau khi nhận kết quả từ AI.

---

## 3. Công cụ AI đã sử dụng

Đánh dấu các công cụ AI đã sử dụng.

- [x] ChatGPT
- [x] Gemini
- [ ] Claude
- [ ] GitHub Copilot
- [ ] Cursor
- [x] Antigravity
- [ ] Microsoft Copilot
- [ ] Perplexity
- [ ] Công cụ khác: ....................................

---

## 4. Bảng tổng hợp prompt đã sử dụng

| STT | Ngày | Công cụ AI | Mục đích | Prompt tóm tắt | Kết quả chính | Có sử dụng vào bài không? | Minh chứng |
|---:|---|---|---|---|---|---|---|
| 1 | 24/05/2026 | ChatGPT | Thiết kế layout | Căn chỉnh sidebar | Gợi ý dùng CSS flexbox | Có | DispatcherLayout |
| 2 | 25/05/2026 | Gemini | Định tuyến | Định tuyến router | Cấu trúc Route v6 | Có | App.tsx |
| 3 | 27/05/2026 | Antigravity | UI/UX | Hiệu ứng Glassmorphism | CSS backdrop-blur | Có | AuthPage, Profile |
| 4 | 29/05/2026 | ChatGPT | Implementation | Render danh sách động | Sử dụng .map() | Có | OrderHistory |
| 5 | 31/05/2026 | Antigravity | Animation | Animation xe tải | SVG & CSS Animation | Có | TrackingMap |
| 6 | 01/06/2026 | Gemini | UI/UX | Layout Grid & Chat | Grid & Flexbox layout | Có | VoucherCenter |
| 7 | 09/06/2026 | Antigravity | DB Design | Tham khảo thiết kế bảng Vận đơn | Cấu trúc bảng SQL & DTO cơ bản | Có | BACKEND/DTOs |
| 8 | 10/06/2026 | Antigravity | Coding | Code mẫu Axios POST kèm Token | Đoạn code Axios gọi API Login | Có | FRONTEND/api.ts |
| 9 | 15/06/2026 | Antigravity | Authentication | Tham khảo tích hợp Google Login & JWT | Cấu trúc endpoint & thư viện Google.Apis.Auth | Có | AuthController.cs |
| 10 | 21/06/2026 | Antigravity | Notification & UI | Tích hợp Email thông báo & Cải tiến UI Stock Alerts | Cấu trúc EmailService & Layout Grid responsive | Có | StockAlertService.cs, StockAlerts.tsx |

---

## 5. Prompt chi tiết

## Prompt #01

- Date: 2026-05-24
- AI Tool: ChatGPT
- Author: Vũ Lê Duy (DE180104)
- Purpose: Thiết kế layout sidebar điều hướng cho trang điều phối

### Prompt
Làm thế nào để tạo sidebar cố định bên trái và phần nội dung cuộn bên phải bằng Tailwind CSS trong React?

### Expected Output
- Cấu trúc các class Tailwind CSS cần sử dụng cho thẻ container, sidebar và main content.
- Đoạn mã mẫu JSX tối giản của layout.

### Evaluation
Mẫu gợi ý của AI rõ ràng và dễ hiểu. Nhóm đã tối ưu thêm bằng cách đổi nền xám của AI thành nền navy tối và thêm bo góc glassmorphic cho phù hợp với FleetNova.

---

## Prompt #02

- Date: 2026-05-25
- AI Tool: Gemini
- Author: Vũ Lê Duy (DE180104)
- Purpose: Cấu hình Router định tuyến chính của ứng dụng

### Prompt
Cách sử dụng React Router v6 để chuyển trang giữa /dispatcher và /driver trong ứng dụng React Vite?

### Expected Output
- Hướng dẫn cài đặt react-router-dom.
- Mã nguồn mẫu sử dụng BrowserRouter, Routes và Route của phiên bản v6.

### Evaluation
Gợi ý ban đầu của Gemini bị lỗi thiếu các import cần thiết và sử dụng nhầm một số thuộc tính v5. Sau khi tự đối chiếu với tài liệu chính thống của Router v6, nhóm đã sửa lại cú pháp `element` thay cho `component` thành công.

---

## Prompt #03

- Date: 2026-05-27
- AI Tool: Antigravity
- Author: Trần Văn Tùng (DE180109)
- Purpose: Thiết kế hiệu ứng kính mờ (Glassmorphism) cho giao diện hiện đại

### Prompt
Làm thế nào để tạo hiệu ứng Glassmorphism cho một thẻ Card trong Tailwind CSS? Tôi muốn nó có độ mờ hậu cảnh và viền mỏng semi-transparent.

### Expected Output
- Các class Tailwind như `bg-white/10`, `backdrop-blur-md`, `border-white/20`.
- Ví dụ code JSX áp dụng các class này.

### Evaluation
Antigravity gợi ý rất chính xác. Nhóm đã áp dụng và tùy chỉnh thêm độ bóng (`shadow`) để các thẻ Card trông nổi bật hơn trên nền tối của ứng dụng.

---

## Prompt #04

- Date: 2026-05-29
- AI Tool: ChatGPT
- Author: Trần Văn Tùng (DE180109)
- Purpose: Hiển thị danh sách đơn hàng từ mảng dữ liệu

### Prompt
Trong React, làm thế nào để render một danh sách các đối tượng từ mảng `orders` thành các thẻ Card, kèm theo logic hiển thị màu sắc khác nhau cho từng trạng thái (Status)?

### Expected Output
- Sử dụng hàm `.map()`.
- Logic render có điều kiện (conditional rendering) cho class CSS dựa trên thuộc tính status.

### Evaluation
Gợi ý của ChatGPT giúp xử lý nhanh phần hiển thị. Nhóm đã tự viết thêm các hàm helper để chuyển đổi mã trạng thái sang tiếng Việt tương ứng.

---

## Prompt #05

- Date: 2026-05-31
- AI Tool: Antigravity
- Author: Trần Văn Tùng (DE180109)
- Purpose: Tạo hiệu ứng xe tải di chuyển trên bản đồ theo dõi đơn hàng

### Prompt
Viết mã CSS để tạo animation cho một icon SVG di chuyển dọc theo một đường kẻ (path) giả định trong trang web theo dõi đơn hàng.

### Expected Output
- Keyframes animation định nghĩa chuyển động từ điểm A đến điểm B.
- Cách áp dụng animation vào thẻ SVG.

### Evaluation
Antigravity cung cấp đoạn mã CSS animation rất mượt. Nhóm đã thay thế path giả định bằng tọa độ thực tế trên bản đồ mockup để tăng tính chân thực.

---

## Prompt #06

- Date: 2026-06-01
- AI Tool: Gemini
- Author: Trần Văn Tùng (DE180109)
- Purpose: Thiết kế layout lưới cho Voucher Center

### Prompt
Gợi ý layout tối ưu cho trang hiển thị danh sách Voucher sao cho hiển thị tốt trên cả mobile và desktop bằng Tailwind CSS Grid.

### Expected Output
- Sử dụng `grid-cols-1`, `md:grid-cols-2`, `lg:grid-cols-3`.
- Các class căn chỉnh khoảng cách (`gap`) và padding.

### Evaluation
Gemini gợi ý layout chuẩn responsive. Nhóm đã thêm các hiệu ứng nhấn (`active:scale-95`) khi người dùng click vào voucher để nhận mã.

---

## Prompt #07

- Date: 2026-06-09
- AI Tool: Antigravity
- Author: Lê Quốc Hùng (DE180096)
- Purpose: Quét cấu trúc UI, thiết kế cấu trúc Backend Web API .NET 8, và tích hợp API Axios Frontend kèm CSS window.print cho UC004

### Prompt
1. Quét cấu trúc UI: "Làm cách nào để tìm các tệp UI liên quan đến chức năng Outbound Order và Picking List trong cấu trúc mã nguồn React hiện tại?"
2. Backend API: "Hãy thiết kế và viết toàn bộ các lớp DTO, Entity model Entity Framework Core, Service xử lý logic (xác thực trạng thái đơn hàng, phân bổ tồn kho tối ưu từ WarehouseStocks theo thứ tự Aisle/Shelf/Row, ký mã HMACSHA256 bảo mật và sinh mã QR Base64 bằng QRCoder) và Controller API (POST /api/outbound/create) cho UC004."
3. Frontend Integration: "Hãy giúp tôi viết code tích hợp API qua Axios trong React, định nghĩa các interfaces thích hợp, xử lý state loading/outboundResult, bóc tách ID số đơn hàng bằng RegEx và cấu hình CSS @media print để chỉ in đúng khu vực tem nhãn vận đơn và phiếu lấy hàng khi gọi lệnh window.print()."

### Expected Output
- Backend: Cấu trúc code C# hoàn chỉnh, các class DTOs, Entities, DbContext mapping, logic Service phân bổ tồn kho và thuật toán ký mã QR bảo mật HMACSHA256, CORS policy được cấu hình.
- Frontend: State variables, handle function gửi request Axios và update status, layout html hiển thị QR Base64 & table picking list, và code CSS in ấn @media print.

### Evaluation
Antigravity đã sinh ra giải pháp toàn diện và cực kỳ chi tiết từ Database, Service, Controller cho đến cách thiết lập CORS ở backend và cách tích hợp Axios, Regex tách ID số đơn hàng, và cấu hình print CSS ở frontend. Toàn bộ mã nguồn biên dịch thành công 100% không có cảnh báo/lỗi và đáp ứng hoàn hảo yêu cầu nghiệp vụ của UC004.

---

## Prompt #08

- Date: 2026-06-10
- AI Tool: Antigravity
- Author: Lập Quốc Hùng (DE180096)
- Purpose: Quét cấu trúc UI, thiết kế cấu trúc Backend Web API .NET 9, và tích hợp API Axios Frontend cho UC015

### Prompt
1. UI Discovery: Scanning FRONTEND for vehicle components and pending statuses.
2. UI Specs Integration: Customizing VehiclesTab.tsx with locked input fields and expiration timers based on insuranceExpiry.
3. Database & API Architecture: Analyzing SmartLogAIDb.sql schema to enforce strict NOT NULL constraints via default backend dummy mappings and spinning up a BackgroundService.

### Expected Output
- Backend: Cấu trúc code C# hoàn chỉnh, các class DTOs, Entities, DbContext mapping cho Vehicle, và logic Service xử lý bypass dữ liệu. Thêm Hosted BackgroundService để tự động xóa các xe pending quá hạn.
- Frontend: Cập nhật VehiclesTab.tsx tích hợp bộ lọc xe Chờ duyệt, thanh hiển thị thời gian tự hủy đếm ngược, khóa cứng ô nhập biển số xe khi nhấn phê duyệt để gọi API Axios đến local backend.

### Evaluation
Antigravity đã sinh ra giải pháp toàn diện và cực kỳ chi tiết từ việc thiết kế DB, Service, Controller, Worker cho đến tích hợp Axios và xử lý UI khóa ô biển số xe. Mã nguồn cả 2 phía FE/BE biên dịch thành công 100% không có cảnh báo/lỗi và giải quyết triệt để yêu cầu nghiệp vụ của UC015.

---

## Prompt #09

- Date: 2026-06-15
- AI Tool: Antigravity
- Author: Vũ Lê Duy (DE180104)
- Purpose: Tham khảo phương thức tích hợp Google Login và xác thực JWT trong .NET

### Prompt
Làm cách nào để tiếp nhận Token của Google từ Frontend React và giải mã, xác thực nó ở Backend .NET bằng thư viện `Google.Apis.Auth`, sau đó sinh ra một chuỗi JWT của riêng hệ thống để phản hồi về Frontend?

### Expected Output
- Tên các thư viện NuGet cần cài đặt.
- Đoạn code mẫu sử dụng `GoogleJsonWebSignature.ValidateAsync()` để kiểm tra Token.
- Cấu trúc cơ bản của hàm tạo JWT.

### Evaluation
Antigravity cung cấp đoạn code mẫu và tài liệu tham khảo chính xác. Nhóm đã sử dụng để làm cơ sở thiết kế `GoogleLoginRequest`, tự viết API `[HttpPost("google")]` trong `AuthController.cs`, tự code logic khởi tạo user (nếu email chưa tồn tại) và cấu hình lại các claims để phân quyền (Role) đúng với yêu cầu của đề tài.

---

## Prompt #10

- Date: 2026-06-21
- AI Tool: Antigravity
- Author: Trần Văn Tùng (DE180109)
- Purpose: Triển khai gửi Email thật và tái cấu trúc giao diện Dashboard cảnh báo

### Prompt
1. "Hãy viết EmailService sử dụng SmtpClient để gửi email HTML từ Gmail. Làm sao để tích hợp nó vào luồng quét tồn kho có cơ chế Debounce 12h?"
2. "Sửa lại file StockAlerts.tsx: tăng padding, mở rộng bảng cảnh báo chiếm 75% chiều ngang, thêm bộ lọc tìm kiếm theo SKU và loại cảnh báo."

---

## Prompt #11 

- Date: 2026-07-01
- AI Tool: Antigravity
- Author: Trần Văn Tùng (DE180109)
- Purpose: Hoàn thiện Overstay Alert cho Dispatcher
### Bối cảnh
```text
Dự án SmartLog AI cần hoàn thiện chức năng Cảnh báo xe lưu bãi quá hạn cho role Dispatcher. Backend dùng ASP.NET Core, Entity Framework Core và SQL Server. Frontend dùng React/TypeScript.
```

### Prompt đã dùng
```text
Hãy hoàn thành chức năng Cảnh báo xe lưu bãi quá hạn (Overstay Alert). Tự động tính toán thời gian xe đỗ tại khu vực Dock, kích hoạt cảnh báo trực quan trên màn hình điều phối nếu xe vượt quá thời gian quy định của SLA. Có thể thêm dữ liệu vào database để nó hiển thị lên UI. Lưu ý UI hiển thị Overstay Alert.
```

### Kết quả đã áp dụng
```text
Tạo API /api/fleet/overstay-alerts, service tính SLA, worker quét nền, schema VehicleDockSessions/OverstayAlerts và màn hình Overstay Alert trong Dispatcher.
```

### Điều chỉnh của nhóm
```text
Nhóm kiểm tra dữ liệu trả về từ API bằng HTTP request, tự quyết định nhãn UI là Overstay Alert và loại bỏ mã use case khỏi giao diện.
```

---

## Prompt #12

- Date: 2026-07-01
- AI Tool: Antigravity
- Author: Trần Văn Tùng (DE180109)
- Purpose: Cải thiện UI/UX Dispatcher
### Bối cảnh
```text
Dispatcher là màn hình điều phối logistics, cần phù hợp mô tả SmartLog AI và các use case đội xe, dock, cảnh báo SLA.
```

### Prompt đã dùng
```text
Hãy sửa lại toàn bộ UI/UX của Dispatcher cho đẹp hơn. Chỉ sửa UI/UX sao cho phù hợp với mô tả dự án và use case.
```

### Kết quả đã áp dụng
```text
Cập nhật DispatcherLayout, Sidebar, Header, DashboardTab, KPISection, ActiveOrders, AIInsights, LiveEvents, MapLayer và CSS dispatcher-shell.
```

### Điều chỉnh của nhóm
```text
Nhóm giữ nguyên routing và cấu trúc tab chính, chỉ đổi giao diện, nhãn hiển thị và cách tổ chức thông tin.
```

---

## Prompt #13

- Date: 2026-07-01
- AI Tool: Antigravity
- Author: Trần Văn Tùng (DE180109)
- Purpose: Gộp SQL Overstay Alert
### Bối cảnh
```text
Dự án đang có smartlogAI.sql là file SQL chính và setup-overstay-alert.sql là file vá riêng cho chức năng Overstay Alert.
```

### Prompt đã dùng
```text
Hai file SQL này hãy tối ưu thành một file.
```

### Kết quả đã áp dụng
```text
Gộp schema và seed Overstay Alert vào smartlogAI.sql, xóa setup-overstay-alert.sql để tránh duy trì hai nguồn dữ liệu.
```

### Điều chỉnh của nhóm
```text
Không chạy lại smartlogAI.sql sau khi gộp vì file chính có lệnh DROP DATABASE; chỉ rà nội dung và giữ logic seed an toàn hơn bằng cách lấy Vehicle/Dock/Booking hiện có.
```

---

## Prompt #14

- Date: 2026-07-01
- AI Tool: Antigravity
- Author: Trần Văn Tùng (DE180109)
- Purpose: Xử lý log SMTP khi test backend
### Bối cảnh
```text
Khi backend chạy, StockAlertWorker gửi email tồn kho và Gmail trả lỗi Authentication Required, làm console xuất hiện lỗi đỏ trong lúc test Overstay Alert.
```

### Prompt đã dùng
```text
Log backend báo SMTP Authentication Required trong khi Overstay Alert vẫn query được. Hãy xử lý để lỗi email không làm nhiễu console khi test Dispatcher/Overstay.
```

### Kết quả đã áp dụng
```text
EmailService bắt riêng SmtpException do authentication, log warning và mô phỏng email thay vì throw exception.
```

### Điều chỉnh của nhóm
```text
Chỉ xử lý lỗi xác thực SMTP; các lỗi gửi email khác vẫn throw để nhóm có thể phát hiện sự cố thật.
```

### Expected Output
- Backend: Code C# EmailService, đăng ký DI và logic kiểm tra `NextAllowedAt` trong StockAlertService.
- Frontend: Code React/Tailwind cập nhật grid layout, thêm `filterText` state và `filteredAlerts` logic.

### Evaluation
Antigravity gợi ý cấu trúc SMTP rất chuẩn. Nhóm đã tự bổ sung thêm bước cấu hình App Password cho Gmail và viết lại template HTML sinh động hơn. Phần UI được AI hỗ trợ căn chỉnh Grid 4 cột rất mượt mà.

---

## Prompt #15

- Date: 2026-07-02
- AI Tool: Antigravity
- Author: Trần Văn Tùng (DE180109)
- Purpose: Hoan thien AI Financial Trend Forecasting cho Admin

### Boi canh
```text
Du an SmartLog AI da co module Admin Finance nhung man hinh con la mock UI cu, chua co API forecast tai chinh, chua co schema luu forecast va log retrain model.
```

### Prompt da dung
```text
Hay lam Du bao tai chinh (AI Trend) doi voi role Admin. Co the sua UI/UX cua man hinh du bao tai chinh lai cho dep hon va xin hon. Su dung FRONTEND, BACKEND va cac skills da hoc de lam tot hon.
```

### Ket qua da ap dung
```text
Them backend API /api/finance/forecast, /generate, /retrain, /history; them DTO, model FinancialForecast, AiModelTrainingLog, service tinh forecast 3 thang; bo sung schema/seed vao smartlogAI.sql; lam lai man hinh Admin Finance thanh dashboard AI Trend co KPI, chart, cash flow, bang forecast, insight, training logs va export CSV.
```

### Dieu chinh cua nhom
```text
Nhom giu route /admin/finance, khong hien thi ma UC042 tren UI, dung fallback data khi API/database chua san sang va kiem tra lai bang dotnet build. Phan type-check frontend con loi cu InventoryAudit.types nen khong tinh la loi cua.
```

### Expected Output
- Backend: API forecast tai chinh, service xu ly du lieu lich su toi thieu 6 thang, generate forecast 3 thang, retrain log va history.
- Database: Bang `FinancialForecasts`, `AiModelTrainingLogs` va seed mau trong `smartlogAI.sql`.
- Frontend: Dashboard Admin Finance hien dai, de doc, co chart revenue/cost, cash flow forecast, bang du bao 3 thang, risk badge, confidence va AI insights.

### Evaluation
Antigravity ho tro chia nho use case thanh cac lop backend, database va UI ro rang. Nhom tu dieu chinh theo cau truc hien co cua du an, bo cac phan khong can thiet, uu tien giao dien nghiep vu gon va tranh dua ma use case len man hinh nguoi dung.

---
<<<<<<< Updated upstream

=======
## Prompt #20 

- Date: 2026-07-08
- AI Tool: Antigravity
- Author: Trần Văn Tùng (DE180109)
- Purpose: Hoàn thiện Stock Alerts, gửi email thật và cải thiện UI/UX trang cảnh báo tồn kho.

### Prompt Content
```text
Hoàn thiện chức năng Cảnh báo tồn kho và gửi Email. Khi SKU chạm mức tối thiểu, hệ thống gửi cảnh báo trên dashboard và email cho nhân viên phụ trách. Email mặc định là tungtvde180109@fpt.edu.vn. Sau đó cải thiện thêm để gửi về email của người đang đăng nhập, nếu không có thì mới gửi về email mặc định. Đồng thời sửa UI trang Stock Alerts cho rõ ràng, đẹp hơn và sửa lỗi font tiếng Việt.
```

### AI Assistance
- Phân tích lỗi SMTP `5.7.0 Authentication Required` và xác định Gmail cần App Password.
- Gợi ý sửa `EmailSettings` đúng key mà backend đang đọc: `SmtpHost`, `SmtpPort`, `SmtpUser`, `SmtpPass`, `SenderEmail`, `SenderName`, `EnableSsl`.
- Gợi ý thêm dữ liệu test SKU tồn kho thấp để kích hoạt cảnh báo.
- Gợi ý tách luồng worker nền và quét thủ công: worker dùng debounce, nút Quét ngay dùng `force=true` để test gửi lại email.
- Gợi ý lấy email người dùng hiện tại từ JWT claim `ClaimTypes.Email` và fallback về email mặc định.
- Gợi ý cải thiện UI Stock Alerts với màu tương phản cao, bảng dễ đọc, mobile cards và trạng thái email gần nhất.

### Human Adjustment
Nhóm kiểm tra bằng log backend, test SMTP thật, thay App Password do Gmail cấp và tự quyết định chỉ cho phép quét thủ công gửi lại email để test, còn worker nền vẫn tránh spam bằng debounce. UI được chỉnh để không hiển thị mã use case, không dùng chữ bị lỗi font và phù hợp màn hình vận hành kho.

### Expected Output
- Backend gửi email cảnh báo tồn kho thật qua Gmail SMTP.
- Nếu người dùng đăng nhập có email, email cảnh báo gửi về email đó.
- Nếu request không có email đăng nhập, hệ thống gửi về `tungtvde180109@fpt.edu.vn`.
- Trang Stock Alerts hiển thị danh sách cảnh báo rõ, có nút Quét ngay, thông báo kết quả gửi email và email gần nhất.

### Evaluation
Kết quả được kiểm chứng bằng SMTP test, API `/api/stockalerts/scan?force=true`, backend build và frontend build. AI hỗ trợ tốt ở phần debug, định hướng luồng xử lý và cải thiện UI; nhóm vẫn kiểm soát quyết định nghiệp vụ để tránh gửi email trùng không cần thiết.

---
>>>>>>> Stashed changes
## 6. Prompt quan trọng nhất

Chọn một prompt có ảnh hưởng lớn nhất đến bài tập/project.

### 6.1. Prompt được chọn

```text
Làm thế nào để tạo sidebar cố định bên trái và phần nội dung cuộn bên phải bằng Tailwind CSS trong React?
```

### 6.2. Vì sao prompt này quan trọng?

```text
Prompt này giúp định hình và giải quyết nhanh cấu trúc khung giao diện cơ bản của toàn bộ trang web điều phối, giúp giao diện không bị lỗi hiển thị khi cuộn trang.
```

### 6.3. Kết quả prompt này mang lại

```text
Bộ khung giao diện hiển thị ổn định, giúp dễ dàng bố trí các thông tin khác vào phần main content.
```

### 6.4. Sinh viên/nhóm đã kiểm tra kết quả như thế nào?

```text
Nhóm chạy thử chương trình trên trình duyệt Chrome và thực hiện thay đổi kích thước cửa sổ để kiểm tra tính linh hoạt của layout.
```

### 6.5. Sinh viên/nhóm đã cải tiến gì từ kết quả AI?

```text
Đổi màu sắc của sidebar và main content sang tông xanh navy tối thay vì màu xám thông thường để tạo cảm giác hiện đại hơn.
```

---

## 7. Prompt chưa hiệu quả

Ghi lại ít nhất một prompt chưa tạo ra kết quả tốt hoặc chưa phù hợp.

### 7.1. Prompt chưa hiệu quả

```text
Viết cho tôi giao diện của hệ thống FleetNova.
```

### 7.2. Vì sao prompt này chưa hiệu quả?

```text
Prompt quá ngắn và quá chung chung, không cung cấp thông tin về công nghệ đang dùng (React, Vite, Tailwind) khiến AI trả về các gợi ý lý thuyết mơ hồ không thể áp dụng vào dự án.
```

### 7.3. Cách cải thiện prompt

```text
Cần hỏi cụ thể từng thành phần giao diện nhỏ, chỉ rõ công nghệ React và Tailwind CSS.
```

### 7.4. Prompt sau khi cải tiến

```text
Làm thế nào để tạo một thanh Sidebar điều hướng bằng Tailwind CSS trong dự án React?
```

### 7.5. Kết quả sau khi cải tiến prompt

```text
AI trả về mã nguồn mẫu chi tiết kèm giải thích cụ thể cho từng class CSS Tailwind, có thể copy và tùy chỉnh ngay.
```

---

## 8. Bài học về cách viết prompt

### 8.1. Khi viết prompt, em/nhóm cần cung cấp thông tin gì để AI trả lời tốt hơn?

```text
Cần cung cấp rõ ràng công nghệ đang sử dụng (như React, Tailwind CSS), mô tả cụ thể thành phần muốn viết và hành vi mong muốn hiển thị.
```

### 8.2. Em/nhóm đã học được gì về cách đặt câu hỏi cho AI?

```text
Không nên hỏi AI làm hộ toàn bộ dự án mà nên chia nhỏ từng việc như chia layout, viết menu định tuyến để hỏi từng bước một.
```

### 8.3. Lần sau em/nhóm sẽ cải thiện prompt như thế nào?

```text
Đặt câu hỏi rõ ràng hơn, kèm theo ví dụ cụ thể về cấu trúc file hiện tại để AI hiểu bối cảnh tốt nhất.
```

---

## 9. Phân loại prompt đã sử dụng

Đánh dấu số lượng prompt theo từng nhóm.

| Loại prompt | Số lượng | Ví dụ prompt tiêu biểu |
|---|---:|---|
| Prompt phân tích yêu cầu | 0 |  |
| Prompt giải thích kiến thức | 0 |  |
| Prompt thiết kế giải pháp | 0 |  |
| Prompt thiết kế database | 0 |  |
| Prompt sinh code mẫu | 1 | "Cách sử dụng React Router v6..." |
| Prompt debug lỗi | 0 |  |
| Prompt viết test case | 0 |  |
| Prompt review code | 0 |  |
| Prompt tối ưu code | 0 |  |
| Prompt viết báo cáo | 0 |  |
| Prompt chuẩn bị thuyết trình | 0 |  |
| Prompt khác | 1 | "Làm thế nào để tạo sidebar..." |

---

## 10. Checklist chất lượng prompt

Sinh viên/nhóm tự kiểm tra chất lượng prompt đã dùng.

| Tiêu chí | Đã đạt? | Ghi chú |
|---|:---:|---|
| Prompt có mục tiêu rõ ràng | [x] |  |
| Prompt có đủ bối cảnh | [x] |  |
| Prompt có nêu công nghệ/ngôn ngữ sử dụng | [x] |  |
| Prompt có nêu yêu cầu đầu ra | [x] |  |
| Prompt không yêu cầu AI làm toàn bộ bài một cách máy móc | [x] |  |
| Prompt có yêu cầu AI giải thích hoặc phân tích | [x] |  |
| Kết quả AI được kiểm tra lại | [x] |  |
| Kết quả AI được chỉnh sửa trước khi sử dụng | [x] |  |
| Prompt quan trọng được ghi lại đầy đủ | [x] |  |
| Prompt sai/chưa hiệu quả được rút kinh nghiệm | [x] |  |

---

## 11. Cam kết sử dụng prompt minh bạch

Sinh viên/nhóm cam kết rằng:

- Các prompt quan trọng đã được ghi lại trung thực.
- Không che giấu việc sử dụng AI trong các phần quan trọng của bài.
- Không nộp nguyên văn kết quả AI nếu chưa kiểm tra và chỉnh sửa.
- Có khả năng giải thích các phần đã sử dụng từ AI.
- Chịu trách nhiệm với sản phẩm cuối cùng.

| Đại diện sinh viên/nhóm | Ngày xác nhận |
|---|---|
| Nhóm trưởng | 02/06/2026 |
