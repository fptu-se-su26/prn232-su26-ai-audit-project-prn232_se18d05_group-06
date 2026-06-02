# AI Audit Log

## 1. Thông tin chung

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
| Ngày bắt đầu | 17/05/2026 |
| Ngày hoàn thành | 02/06/2026 |

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

Nhóm sử dụng AI làm trợ lý kỹ thuật xuyên suốt dự án FleetNova nhằm tối ưu hóa thời gian nghiên cứu công nghệ, xây dựng nhanh các module lõi có yếu tố thông minh (AI/ML) như tối ưu tuyến đường giao hàng, nhận diện hóa đơn và dự báo tài chính. Đồng thời, AI hỗ trợ kiểm tra tính đúng đắn của mã nguồn, phát hiện lỗ hổng logic trong khâu đối soát tài chính COD và dịch thuật/chuẩn hóa các thuật ngữ chuyên ngành Logistics.

Riêng đối với phần Frontend Admin, thành viên **Lê Quốc Hùng (DE180096)** đã sử dụng AI hỗ trợ thực hiện di chuyển toàn bộ **12 trang giao diện HTML tĩnh** sang cấu trúc **React Functional Components (TSX)**, tích hợp Tailwind CSS, tái cấu trúc Sidebar điều hướng chung và tối ưu hóa các hiệu ứng chuyển tiếp động (micro-interactions).

---

## 4. Nhật ký sử dụng AI chi tiết

### Lần sử dụng AI số 1 (Bởi Lê Quốc Hùng - DE180096)

| Nội dung | Thông tin |
|---|---|
| Ngày sử dụng | 25/05/2026 |
| Công cụ AI | ChatGPT |
| Mục đích sử dụng | Di chuyển (Migrate) cấu trúc mã nguồn HTML tĩnh sang React Functional Components (TSX) |
| Phần việc liên quan | Frontend / Design |
| Mức độ sử dụng | Hỗ trợ một phần / Sinh chính nội dung |

#### 4.1. Prompt đã sử dụng
```text
Tôi đang làm dự án PRN232 bằng React + Vite + TypeScript + Tailwind CSS. Tôi có file HTML tĩnh của trang Dashboard quản trị Logistics (giao diện dashboard.html). Hãy chuyển đổi mã nguồn HTML này thành một React Functional Component viết bằng TypeScript. Lưu ý:
1. Đổi tất cả thuộc tính "class" thành "className".
2. Tự đóng tất cả các thẻ tự đóng chưa đúng chuẩn JSX (như <input>, <img>, <br>, <hr>).
3. Đổi thuộc tính "style" từ string sang dạng Object trong React (ví dụ: style="font-variation-settings: 'FILL' 1" thành style={{ fontVariationSettings: "'FILL' 1" }}).
4. Tổ chức code gọn gàng, chia các phần dữ liệu lặp lại thành dạng mảng rồi map ra.
Đây là code HTML:
[Dán mã nguồn HTML của dashboard.html vào đây]
```

#### 4.2. Kết quả AI gợi ý
AI trả về cấu trúc component React (`Dashboard.tsx`) hoàn chỉnh. Nó đã chuyển đổi thành công toàn bộ class Tailwind tĩnh, thay đổi các thẻ tự đóng theo cú pháp JSX, và tách các chỉ số KPI lặp đi lặp lại thành một mảng dữ liệu mẫu để render bằng hàm `.map()`.

#### 4.3. Phần sinh viên/nhóm đã sử dụng từ AI
* Toàn bộ khung giao diện JSX và hệ thống màu sắc Tailwind CSS đã chuyển đổi.
* Đoạn mảng dữ liệu mẫu đại diện cho KPI và danh sách đơn hàng Logistics.

#### 4.4. Phần sinh viên/nhóm tự chỉnh sửa hoặc cải tiến
* Tự chỉnh sửa lại các biểu tượng (Material Symbols) để hiển thị đúng thiết kế gốc.
* Sửa lỗi TypeScript do AI khai báo sai kiểu dữ liệu của các mảng dữ liệu mẫu.
* Bổ sung thuộc tính `hover:shadow-lg transition-all` vào các thẻ card để tăng trải nghiệm người dùng.

#### 4.5. Minh chứng
* **File liên quan:** `FRONTEND/src/features/admin/Dashboard.tsx`
* **Kết quả chạy/test:** Module Dashboard hoạt động trơn tru trong React Test Center, không còn lỗi render.

#### 4.6. Nhận xét cá nhân/nhóm
Việc chuyển đổi thủ công 12 trang HTML rất mất thời gian và dễ sai sót (quên đóng thẻ, gõ nhầm class). ChatGPT đã hỗ trợ cực kỳ đắc lực ở bước chuyển đổi thô này, giúp lập trình viên tập trung vào tối ưu hóa logic của component.

---

### Lần sử dụng AI số 2 (Bởi Lê Quốc Hùng - DE180096)

| Nội dung | Thông tin |
|---|---|
| Ngày sử dụng | 27/05/2026 |
| Công cụ AI | Claude |
| Mục đích sử dụng | Thiết kế Component AdminSidebar điều hướng tập trung dùng chung |
| Phần việc liên quan | Frontend / Architecture |
| Mức độ sử dụng | Hỗ trợ nhiều |

#### 4.1. Prompt đã sử dụng
```text
Hãy thiết kế giúp tôi một component AdminSidebar.tsx bằng React, TypeScript và Tailwind CSS dành cho trang quản trị Admin. Sidebar cần có:
1. Một Header hiển thị thương hiệu "SmartLog AI" với background gradient mượt mà.
2. Danh sách các liên kết điều hướng gồm 12 mục: Dashboard, User Management, Role & Permission, Orders, Warehouses, Fleet Map, Finance, BI Analytics, SmartLog AI, Notifications, Audit Logs, Settings.
3. Sử dụng thư viện Material Symbols làm icon.
4. Tự động kiểm tra trang hiện tại qua react-router-dom `useLocation` để thay đổi style của menu active (active thì có shadow, border bên phải và đổi màu chữ).
5. Riêng mục "SmartLog AI" (AI assistant), hiển thị một widget nhỏ hình bong bóng ghi "AI Insight Ready" ở phía trên và có hiệu ứng viền phát sáng nhẹ.
```

#### 4.2. Kết quả AI gợi ý
Claude cung cấp mã nguồn hoàn chỉnh của `AdminSidebar.tsx` với giao diện tối (dark theme) cực kỳ cao cấp, sử dụng `backdrop-blur-xl` và các màu sắc hài hòa. Hệ thống điều hướng tự nhận diện link active bằng cách so sánh `location.pathname === item.path`.

#### 4.3. Phần sinh viên/nhóm đã sử dụng từ AI
* Cấu trúc mảng `menuItems` chứa thông tin điều hướng của 12 trang.
* Ý tưởng thiết kế widget phát sáng cho phần trợ lý AI (SmartLog AI).

#### 4.4. Phần sinh viên/nhóm tự chỉnh sửa hoặc cải tiến
* Thay đổi màu sắc của Sidebar từ thuần đen sang màu xám Slate đậm (`#2e3039`) để tăng tính thẩm mỹ cao cấp.
* Sửa lỗi TypeScript khi import `Link` và `useLocation` từ `react-router-dom`.
* Bổ sung hiệu ứng `active:scale-95 transition-all duration-300` khi click vào các mục điều hướng để tạo cảm giác bấm chân thực.

#### 4.5. Minh chứng
* **File liên quan:** `FRONTEND/src/components/AdminSidebar.tsx`
* **Kết quả chạy/test:** Sidebar hiển thị đẹp mắt ở cạnh trái tất cả các trang Admin, click chuyển hướng mượt mà, định vị chính xác trang đang active.

#### 4.6. Nhận xét cá nhân/nhóm
Học hỏi được cách tổ chức code Sidebar linh hoạt bằng cách đưa dữ liệu ra ngoài và sử dụng vòng lặp map để tránh trùng lặp code HTML như trước đây.

---

### Lần sử dụng AI số 3 (Bởi Lê Quốc Hùng - DE180096)

| Nội dung | Thông tin |
|---|---|
| Ngày sử dụng | 02/06/2026 |
| Công cụ AI | Antigravity |
| Mục đích sử dụng | Tối ưu hóa UI/UX trang Test Center chủ, thiết lập Routing và dọn dẹp file HTML rác |
| Phần việc liên quan | Frontend / Git Cleanup / Refactor |
| Mức độ sử dụng | Hỗ trợ nhiều |

#### 4.1. Prompt đã sử dụng
```text
Tôi vừa hoàn thành việc migrate 12 trang admin từ HTML sang React. Trong thư mục dự án của tôi vẫn còn các file .html thừa của phiên bản cũ. Làm thế nào để dọn dẹp chúng một cách an toàn và tạo nhánh Git mới tuân thủ đúng chuẩn của nhóm (nhánh feature/DE180096-migrate-admin-ui, commit message: [DE180096] feat: ...)? Hãy hướng dẫn và hỗ trợ tôi tối ưu trang Test Center trong App.tsx với hiệu ứng glassmorphism để chạy thử nghiệm 12 module này.
```

#### 4.2. Kết quả AI gợi ý
Antigravity đã gợi ý quy trình dọn dẹp file cũ thông qua dòng lệnh Git/PowerShell, đồng thời cung cấp mã nguồn nâng cấp cho `App.tsx` (Test Center Home) với hiệu ứng nền mờ sang trọng, các dải gradient động và các card module có micro-animations cực kỳ cao cấp.

#### 4.3. Phần sinh viên/nhóm đã sử dụng từ AI
* Các câu lệnh Git chuẩn hóa để quản lý nhánh và commit.
* Code giao diện glassmorphism cho trang Test Center chủ (`App.tsx`).

#### 4.4. Phần sinh viên/nhóm tự chỉnh sửa hoặc cải tiến
* Tự chạy lệnh kiểm tra `git status -u` để xác nhận các file `.html` rác đã được xóa hoàn toàn và không bị commit lên GitHub.
* Đổi tên hiển thị của các module trong Test Center sao cho chuyên nghiệp hơn.

#### 4.5. Minh chứng
* **File liên quan:** `FRONTEND/src/App.tsx`, `FRONTEND/src/features/admin/`
* **Kết quả chạy/test:** Đã dọn sạch 12 file `.html` cũ. Nhánh Git được tạo đúng quy chuẩn và được push lên GitHub thành công.

---

## 5. Bảng tổng hợp mức độ sử dụng AI

Đánh dấu mức độ AI hỗ trợ ở từng hạng mục.

| Hạng mục | Không dùng AI | AI hỗ trợ ít | AI hỗ trợ nhiều | AI sinh chính | Ghi chú |
|---|:---:|:---:|:---:|:---:|---|
| Phân tích yêu cầu |  | [x] |  |  | AI hỗ trợ dịch thuật thuật ngữ chuyên ngành |
| Viết user story/use case |  | [x] |  |  | Hỗ trợ định hình kịch bản sử dụng hệ thống |
| Thiết kế database | [x] |  |  |  | Nhóm tự thiết kế |
| Thiết kế kiến trúc hệ thống |  | [x] |  |  | Định hình cấu trúc 3 lớp và Modular Frontend |
| Thiết kế giao diện |  |  | [x] |  | AI hỗ trợ tạo layout Tailwind CSS bóng bẩy |
| Code frontend |  |  | [x] |  | AI hỗ trợ chuyển đổi HTML sang TSX thô |
| Code backend | [x] |  |  |  | Nhóm tự code backend .NET Web API |
| Debug lỗi |  | [x] |  |  | AI giải nghĩa nhanh các lỗi TypeScript |
| Viết test case | [x] |  |  |  | Nhóm tự thực hiện kiểm thử thủ công |
| Kiểm thử sản phẩm | [x] |  |  |  |  |
| Tối ưu code |  | [x] |  |  | AI hỗ trợ viết gọn code lặp bằng hàm map |
| Viết báo cáo |  | [x] |  |  | Hỗ trợ lập cấu trúc báo cáo |
| Làm slide thuyết trình | [x] |  |  |  |  |

---

## 6. Các lỗi hoặc hạn chế từ AI

Ghi lại các trường hợp AI trả lời sai, thiếu, chưa phù hợp hoặc sinh code không chạy.

| STT | Lỗi/hạn chế từ AI | Cách phát hiện | Cách xử lý/cải tiến |
|---:|---|---|---|
| 1 | AI sinh code chứa kiểu dữ liệu `any` bừa bãi trong TypeScript | Trình biên dịch TypeScript báo lỗi nghiêm ngặt (strict mode). | Tự định nghĩa các `interface` rõ ràng cho các mảng dữ liệu (như `MenuItem`, `KPICard`). |
| 2 | AI import sai các module (sai relative path hoặc thiếu path alias) | Dự án không thể biên dịch thành công (Compile error: Cannot find module). | Tự cấu hình lại `tsconfig.json` và sửa thủ công các câu lệnh `import` sử dụng path alias `@features/`. |
| 3 | AI sinh thuộc tính style inline dạng chuỗi (string) như trong HTML | React hiển thị cảnh báo đỏ lòm ở màn hình console của trình duyệt. | Chuyển đổi thủ công sang dạng Object trong React (ví dụ: `style={{ fontVariationSettings: "'FILL' 1" }}`). |

---

## 7. Kiểm chứng kết quả AI

Thành viên Lê Quốc Hùng đã thực hiện kiểm chứng kết quả từ AI thông qua các phương pháp sau:
1. **Chạy thử chương trình trực tiếp (Runtime Testing):** Khởi chạy local dev server qua `npm run dev` để kiểm tra trực quan giao diện của cả 12 module. Rê chuột thử vào các nút bấm, kiểm tra xem Sidebar có thu nhỏ và định vị chuẩn xác màu sắc của mục điều hướng hay không.
2. **Kiểm tra cú pháp nghiêm ngặt (Linter & Compiler):** Chạy trình biên dịch TypeScript và ESLint để đảm bảo code React mới không chứa bất kỳ lỗi cú pháp, cảnh báo kiểu dữ liệu hay lỗi logic ngầm nào.
3. **Đối chiếu thực tế:** So sánh giao diện chạy thực tế của React với 12 bản thiết kế HTML tĩnh ban đầu để đảm bảo tính đồng bộ hoàn toàn về mặt hình ảnh (Pixel Perfect).

---

## 8. Đóng góp cá nhân hoặc đóng góp nhóm

### 8.1. Đối với bài cá nhân (Của Lê Quốc Hùng - DE180096)

* **Phần tự thực hiện:**
  * Tổ chức lại cấu trúc thư mục của phân hệ `admin` trong `FRONTEND/src/features/admin/`.
  * Viết mã nguồn cho Sidebar điều hướng (`AdminSidebar.tsx`) đồng bộ tất cả trang.
  * Tự dọn dẹp, xóa sạch toàn bộ 12 file `.html` rác cũ, cấu hình routing trung tâm `App.tsx` và `routes/index.tsx`.
  * Tạo nhánh riêng, viết commit message tuân thủ quy chuẩn và push lên GitHub.
* **Phần AI hỗ trợ:** Chuyển đổi mã nguồn giao diện thô từ HTML sang các thẻ JSX của React.
* **Phần tự cải tiến:**
  * Nâng cấp giao diện lên chuẩn glassmorphism cao cấp ở trang chủ Test Center.
  * Sửa toàn bộ lỗi kiểu dữ liệu TypeScript nghiêm ngặt (strict type validation).

### 8.2. Đối với bài nhóm

| Thành viên | MSSV | Nhiệm vụ chính | Có sử dụng AI không? | Minh chứng đóng góp |
|---|---|---|---|---|
| Lê Quốc Hùng | DE180096 | Thiết kế & Migrate 12 module Admin UI sang React; dọn dẹp codebase; cấu hình routing. | Có | Commit `d49b4964c3` trên nhánh `feature/DE180096-migrate-admin-ui` |
| [Thành viên 2] | DE180071 | Xây dựng Backend Web API, thiết kế Database. | Có | Commit trên các nhánh liên quan đến Backend |
| [Thành viên 3] | DE180088 | Kiểm thử, viết tài liệu test case, tích hợp API. | Có | Các báo cáo kiểm thử và tích hợp |
| [Thành viên 4] | DE180109 | Thiết kế UI/UX ban đầu, xây dựng bản mẫu HTML. | Có | Các file HTML tĩnh ban đầu |
| [Thành viên 5] | DE180104 | Nghiên cứu tài liệu nghiệp vụ, viết báo cáo & slide. | Có | Slide thuyết trình và file Word báo cáo |

---

## 9. Reflection cuối bài

### 9.1. AI đã hỗ trợ em/nhóm ở điểm nào?
AI đã hỗ trợ cực kỳ đắc lực trong việc tăng tốc độ phát triển giao diện (Frontend Development). Nó đóng vai trò như một bộ máy chuyển đổi định dạng tự động cực mạnh từ HTML tĩnh sang React JSX, đồng thời tư vấn các thiết kế Tailwind CSS đẹp mắt giúp tiết kiệm hàng chục giờ gõ code thủ công.

### 9.2. Phần nào em/nhóm không sử dụng theo gợi ý của AI? Vì sao?
Các đoạn code import tự động và kiểu dữ liệu `any` do AI sinh ra. Lý do vì AI không nắm rõ 100% cấu trúc thư mục thực tế của dự án nên thường import sai đường dẫn, đồng thời việc lạm dụng kiểu `any` sẽ làm mất đi ý nghĩa an toàn dữ liệu (Type-safety) của TypeScript.

### 9.3. Em/nhóm đã kiểm tra tính đúng đắn của kết quả AI như thế nào?
Bằng cách chạy trực tiếp server chạy thử (`vite dev`), quan sát lỗi ở cửa sổ console của trình duyệt và chạy lệnh build production (`npm run build`) để kiểm tra lỗi biên dịch của TypeScript trước khi tiến hành tạo commit.

### 9.4. Nếu không có AI, phần nào sẽ khó khăn nhất?
Phần chuyển đổi 12 file HTML tĩnh khổng lồ sang React Component. Việc rà soát từng thẻ mở, thẻ đóng, đổi class sang className cho hàng ngàn dòng code bằng tay sẽ rất dễ gây nản lòng và phát sinh hàng loạt lỗi vặt khó phát hiện.

### 9.5. Sau bài tập/project này, em/nhóm học được gì về môn học?
Hiểu sâu sắc về kiến trúc Modular Frontend, cơ chế hoạt động của Single Page Application (SPA), cách quản lý State và Route trong React, cũng như tầm quan trọng của việc viết mã nguồn sạch sẽ, không thừa thãi rác (như việc dọn dẹp các file HTML tĩnh sau khi đã hoàn thành migration).

### 9.6. Sau bài tập/project này, em/nhóm học được gì về cách sử dụng AI có trách nhiệm?
Sử dụng AI phải đi đôi với sự hiểu biết và kiểm chứng. AI chỉ là người trợ lý tăng tốc, lập trình viên mới là người chịu trách nhiệm cuối cùng. Phải hiểu rõ từng dòng code do AI sinh ra, làm chủ nó, sửa đổi cho khớp ngữ cảnh thực tế của dự án chứ không được copy-paste một cách vô thức.

---

## 10. Cam kết học thuật

Sinh viên/nhóm cam kết rằng:
* Nội dung AI hỗ trợ đã được ghi nhận trung thực.
* Không nộp nguyên văn kết quả AI mà không kiểm tra.
* Có khả năng giải thích, làm chủ các phần đã nộp.
* Chịu trách nhiệm về tính đúng đắn của sản phẩm cuối cùng.

| Đại diện sinh viên/nhóm | Ngày xác nhận |
|---|---|
| Lê Quốc Hùng | 02/06/2026 |
