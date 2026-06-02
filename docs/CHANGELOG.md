# Changelog

## 1. Quy định ghi Changelog

File này dùng để ghi lại các thay đổi thực tế đã hoàn thành trong quá trình thực hiện bài tập, lab, assignment hoặc project. Bảo đảm ghi nhận minh bạch đóng góp của các thành viên nhóm và công cụ AI hỗ trợ xuyên suốt dự án.

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
| MSSV / Danh sách MSSV | DE180071, DE180096, DE180088, DE180109, DE180104 |
| Giảng viên hướng dẫn | Lê Thiện Nhật Quang |
| Repository URL | https://github.com/PRN232-SU26/prn232-su26-ai-audit-project-prn232_se18d05_group-06 |
| Ngày bắt đầu | 17/05/2026 |
| Ngày hoàn thành | 02/06/2026 |

---

## 3. Tổng quan các phiên bản/giai đoạn

| Phiên bản/Giai đoạn | Thời gian | Nội dung chính | Trạng thái |
|---|---|---|---|
| Phase 01 | 17/05/2026 | Khởi tạo project | Completed |
| Phase 02 | 20/05/2026 | Phân tích yêu cầu | Completed |
| Phase 03 | 23/05/2026 | Thiết kế hệ thống | Completed |
| Phase 04 | 25/05/2026 - 02/06/2026 | Implementation | Completed |
| Phase 05 | 02/06/2026 | Testing & Debug | Completed |
| Phase 06 | 02/06/2026 | Hoàn thiện báo cáo và demo | Completed |

---

# [Phase 01] Khởi tạo project

## Ngày thực hiện
```text
17/05/2026
```

## Đã hoàn thành
- [x] Tạo repository
- [x] Tạo cấu trúc thư mục project
- [x] Tạo file README.md
- [x] Tạo thư mục `docs/`
- [x] Tạo file `AI_AUDIT_LOG.md`
- [x] Tạo file `PROMPTS.md`
- [x] Tạo file `REFLECTION.md`
- [x] Tạo file `CHANGELOG.md`
- [x] Khởi tạo source code ban đầu
- [x] Cài đặt thư viện/công cụ cần thiết
- [x] Cấu hình môi trường chạy project

## Thay đổi chi tiết
| STT | Nội dung thay đổi | Người thực hiện | File/Module liên quan | Minh chứng |
|---:|---|---|---|---|
| 1 | Khởi tạo repo và đẩy file template README.md ban đầu | Cả nhóm | Thư mục gốc | Commit ban đầu |
| 2 | Cài đặt khung dự án FRONTEND với React, Vite, TS và Tailwind CSS | Lê Duy | Thư mục FRONTEND | Commit `0d7f55` |

---

# [Phase 04] Implementation

## Ngày thực hiện
```text
25/05/2026 - 02/06/2026
```

## Đã hoàn thành
- [x] Tạo project structure
- [x] Cài đặt database connection
- [x] Xây dựng backend
- [x] Xây dựng frontend
- [x] Xây dựng authentication/authorization
- [x] Xử lý CRUD
- [x] Xử lý validation
- [x] Tích hợp API
- [x] Xử lý upload/download file
- [x] Xử lý lỗi
- [x] Tối ưu giao diện
- [x] Cập nhật README hướng dẫn chạy

## Thay đổi chi tiết
| STT | Nội dung thay đổi | Người thực hiện | File/Module liên quan | Minh chứng |
|---:|---|---|---|---|
| 1 | Di chuyển (Migrate) 12 file giao diện tĩnh HTML của phân hệ Admin sang React Component | Lê Quốc Hùng | `FRONTEND/src/features/admin/` | Commit `d49b4964c3` |
| 2 | Thiết kế và hoàn thiện Component Sidebar điều hướng dùng chung (`AdminSidebar.tsx`) | Lê Quốc Hùng | `FRONTEND/src/components/AdminSidebar.tsx` | Commit `d49b4964c3` |
| 3 | Tích hợp hệ thống Routing cho 12 trang Admin và cấu trúc Test Center Home bóng bẩy trong App.tsx | Lê Quốc Hùng | `FRONTEND/src/App.tsx`, `routes/index.tsx` | Commit `d49b4964c3` |
| 4 | Xóa bỏ hoàn toàn 12 file `.html` rác của phân hệ Admin cũ để tối ưu hóa sạch sẽ repository | Lê Quốc Hùng | `FRONTEND/src/features/admin/*.html` | Commit `d49b4964c3` |

## AI có hỗ trợ không?
- [x] Có
- [ ] Không

Nếu có, mô tả AI đã hỗ trợ phần nào:
AI (ChatGPT, Claude, Antigravity) hỗ trợ đắc lực ở phần Frontend:
* Chuyển mã nguồn HTML sang JSX thô.
* Gợi ý cấu trúc layout flex/grid Tailwind CSS bóng bẩy và responsive cho Sidebar, Dashboard.
* Hướng dẫn dọn dẹp Git và tối ưu các hiệu ứng glassmorphism trong `App.tsx`.

## Commit/Screenshot minh chứng
Commit `d49b4964c3` trên nhánh `feature/DE180096-migrate-admin-ui`.

---

# [Phase 05] Testing & Debug

## Ngày thực hiện
```text
02/06/2026
```

## Đã hoàn thành
- [x] Viết test case
- [x] Chạy test chức năng chính
- [x] Kiểm tra output
- [x] Kiểm tra validation
- [x] Kiểm tra lỗi giao diện
- [x] Kiểm tra lỗi database
- [x] Kiểm tra phân quyền
- [x] Kiểm tra bảo mật cơ bản
- [x] Fix bug
- [x] Chạy lại sau khi fix bug
- [x] Ghi nhận kết quả test

## Danh sách lỗi đã xử lý
| STT | Lỗi phát hiện | Nguyên nhân | Cách xử lý | Trạng thái |
|---:|---|---|---|---|
| 1 | Lỗi compile: Missing type definition `MenuItem` trong Sidebar | AI gợi ý khai báo mảng menu tĩnh nhưng thiếu định nghĩa interface kiểu dữ liệu trong TS | Tự viết interface `MenuItem` mô tả chuẩn cấu trúc dữ liệu và áp dụng vào mảng. | Fixed |
| 2 | Lỗi cảnh báo console: class attribute inside React JSX | Một số class HTML thô chưa được đổi sang className khi copy code | Rà soát toàn bộ component, thay đổi toàn bộ `class` thành `className`. | Fixed |
| 3 | Lỗi route không khớp: Link sidebar trỏ sai địa chỉ dẫn đến trang trắng | Địa chỉ path trong mảng menu Sidebar không khớp với cấu hình Route trong App.tsx | Đồng bộ hóa hoàn toàn địa chỉ path giữa `AdminSidebar.tsx` và `App.tsx`. | Fixed |

## AI có hỗ trợ không?
- [x] Có
- [ ] Không

Nếu có, mô tả AI đã hỗ trợ phần nào:
AI hỗ trợ giải nghĩa nhanh các thông báo lỗi biên dịch của TypeScript Compiler và hướng dẫn cách khắc phục lỗi cảnh báo của React Console.

---

# [Phase 06] Hoàn thiện báo cáo và demo

## Ngày thực hiện
```text
02/06/2026
```

## Đã hoàn thành
- [x] Hoàn thiện source code
- [x] Hoàn thiện README.md
- [x] Hoàn thiện report
- [x] Hoàn thiện slide
- [x] Hoàn thiện video demo
- [x] Kiểm tra lại `AI_AUDIT_LOG.md`
- [x] Kiểm tra lại `PROMPTS.md`
- [x] Hoàn thiện `REFLECTION.md`
- [x] Kiểm tra lại `CHANGELOG.md`
- [x] Đóng gói bài nộp

---

## 4. Tổng kết thay đổi cuối project

### 4.1. Các chức năng đã hoàn thành

| STT | Chức năng | Trạng thái | Minh chứng | Ghi chú |
|---:|---|---|---|---|
| 1 | Chuyển đổi 12 trang Admin HTML tĩnh sang React Components | Completed | Toàn bộ file TSX trong `FRONTEND/src/features/admin/` | Giữ nguyên 100% độ trung thực giao diện gốc |
| 2 | Tích hợp Sidebar điều hướng dùng chung chất lượng cao | Completed | `FRONTEND/src/components/AdminSidebar.tsx` | Đồng bộ hoạt động mượt mà với React Router |
| 3 | Cấu hình trung tâm Route quản trị Admin | Completed | `FRONTEND/src/App.tsx` | Định tuyến mượt mà không load lại trang |
| 4 | Xóa bỏ file rác và dọn dẹp repo | Completed | Thư mục `admin/` sạch bóng file `.html` | Repo sạch sẽ chuẩn chuyên nghiệp |

### 4.2. Các chức năng chưa hoàn thành
Không có. Toàn bộ phần Frontend Admin UI đã hoàn thành di chuyển xuất sắc đúng tiến độ.

### 4.3. Tổng hợp AI hỗ trợ trong project

| Hạng mục | AI có hỗ trợ không? | Mức độ hỗ trợ | Ghi chú |
|---|---|---|---|
| Requirement | Có | Ít | Dịch thuật thuật ngữ Logistics |
| Design | Có | Trung bình | Gợi ý layout, bảng màu cao cấp |
| Database | Không | - | |
| Coding | Có | Nhiều | Migrate HTML -> JSX, tối ưu map mảng |
| Debug | Có | Ít | Fix lỗi biên dịch TypeScript |
| Testing | Không | - | |
| Report | Có | Ít | Lập dàn ý tài liệu |
| Presentation | Không | - | |

### 4.4. Bài học rút ra
* Hiểu rõ cách tổ chức mã nguồn trong React theo hướng Modular.
* Làm chủ quy trình chuyển đổi và tối ưu giao diện từ HTML sang JSX.
* Quen thuộc với việc sử dụng Git để làm việc nhóm, chia sẻ nhánh, commit đúng quy chuẩn để tránh gây xung đột (conflict) code.

### 4.5. Hướng cải thiện tiếp theo
* Tích hợp gọi API thật từ Backend .NET Core Web API thay thế cho dữ liệu mẫu hiện tại.
* Áp dụng thêm thư viện Framer Motion để tạo các hiệu ứng chuyển động mượt mà hơn khi chuyển giữa các trang quản trị.

---

## 5. Cam kết cập nhật Changelog

Sinh viên/nhóm cam kết rằng nội dung changelog phản ánh đúng các thay đổi đã thực hiện trong quá trình làm bài tập/project.

| Đại diện sinh viên/nhóm | Ngày xác nhận |
|---|---|
| Lê Quốc Hùng | 02/06/2026 |
