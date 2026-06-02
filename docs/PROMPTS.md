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
| MSSV / Danh sách MSSV | DE180071, DE180096, DE180088, DE180109, DE180104 |
| Giảng viên hướng dẫn | Lê Thiện Nhật Quang |
| Ngày bắt đầu | 17/05/2026 |
| Ngày cập nhật gần nhất | 02/06/2026 |

---

## 2. Mục đích của file Prompt Log

File này dùng để ghi lại các prompt quan trọng đã sử dụng trong quá trình thực hiện bài tập, lab, assignment hoặc project. Ghi nhận trung thực các câu hỏi gửi tới AI, cách AI phản hồi và quá trình con người kiểm chứng, cải tiến kết quả để đảm bảo đạo đức học thuật và sử dụng AI có trách nhiệm.

---

## 3. Công cụ AI đã sử dụng

Đánh dấu các công cụ AI đã sử dụng.

- [x] ChatGPT
- [x] Gemini
- [x] Claude
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
| 1 | 25/05/2026 | ChatGPT | Di chuyển giao diện thô | Chuyển đổi mã nguồn HTML tĩnh của dashboard.html sang React JSX (TypeScript) | Trả về code React Component thô, đổi class thành className, đóng các thẻ tự đóng. | Có | `FRONTEND/src/features/admin/Dashboard.tsx` |
| 2 | 27/05/2026 | Claude | Thiết kế component chung | Tạo component AdminSidebar.tsx điều hướng thông minh sử dụng useLocation | Component Sidebar hoàn chỉnh với hiệu ứng hover bóng bẩy và widget AI Insight độc đáo. | Có | `FRONTEND/src/components/AdminSidebar.tsx` |
| 3 | 02/06/2026 | Antigravity | Tối ưu UI/UX & Git Cleanup | Hướng dẫn dọn dẹp file HTML rác và tạo giao diện glassmorphism cho Test Center | Cấu trúc file sạch sẽ, xóa bỏ file rác, hoàn thiện code App.tsx đẹp mắt. | Có | `FRONTEND/src/App.tsx` & Git branch |

---

## 5. Prompt chi tiết

### Prompt số 1 (Bởi Lê Quốc Hùng - DE180096)

| Nội dung | Thông tin |
|---|---|
| Ngày sử dụng | 25/05/2026 |
| Công cụ AI | ChatGPT |
| Mục đích | Di chuyển (Migrate) cấu trúc mã nguồn HTML tĩnh sang React Functional Components (TSX) |
| Phần việc liên quan | Coding / Frontend |
| Mức độ sử dụng | Hỏi sinh code |

#### 5.1. Prompt nguyên văn
```text
Tôi đang làm dự án PRN232 bằng React + Vite + TypeScript + Tailwind CSS. Tôi có file HTML tĩnh của trang Dashboard quản trị Logistics (giao diện dashboard.html). Hãy chuyển đổi mã nguồn HTML này thành một React Functional Component viết bằng TypeScript. Lưu ý:
1. Đổi tất cả thuộc tính "class" thành "className".
2. Tự đóng tất cả các thẻ tự đóng chưa đúng chuẩn JSX (như <input>, <img>, <br>, <hr>).
3. Đổi thuộc tính "style" từ string sang dạng Object trong React (ví dụ: style="font-variation-settings: 'FILL' 1" thành style={{ fontVariationSettings: "'FILL' 1" }}).
4. Tổ chức code gọn gàng, chia các phần dữ liệu lặp lại thành dạng mảng rồi map ra.
Đây là code HTML:
[Mã nguồn HTML tĩnh của file dashboard.html]
```

#### 5.2. Bối cảnh khi viết prompt
Trong dự án, leader yêu cầu chuyển toàn bộ giao diện HTML cũ sang React để làm ứng dụng Single Page Application (SPA). Số lượng trang cần chuyển đổi lên tới 12 trang. Việc chuyển đổi thủ công rất tốn thời gian và dễ gõ thiếu các thẻ tự đóng dẫn tới lỗi biên dịch của React JSX.

#### 5.3. Kết quả AI trả về
AI sinh ra code React Component (`Dashboard.tsx`) hoàn chỉnh. Các class đã được đổi thành `className`, các thẻ như `<img ...>` được thêm dấu `/` tự đóng chuẩn xác. Các phần thông tin lặp đi lặp lại như KPI Grid được gom lại thành mảng `kpiData` rồi render tự động bằng vòng lặp `.map()`.

#### 5.4. Kết quả đã áp dụng vào bài
* Bộ khung cấu trúc layout của file TSX.
* Hệ thống class Tailwind CSS để style cho giao diện.

#### 5.5. Phần sinh viên/nhóm đã chỉnh sửa hoặc cải tiến
* Tự khai báo `interface` kiểu dữ liệu cho mảng KPI thay vì để kiểu `any` như gợi ý của AI.
* Tách một số đoạn mã phức tạp thành các Sub-Component nhỏ để dễ quản lý.
* Định dạng lại định dạng font chữ để đồng bộ với theme chung của dự án.

#### 5.6. Đánh giá chất lượng prompt
- [x] Prompt rõ ràng
- [x] Prompt có đủ bối cảnh
- [ ] Prompt còn thiếu thông tin
- [x] Prompt tạo ra kết quả tốt
- [ ] Prompt tạo ra kết quả chưa phù hợp
- [ ] Cần hỏi lại AI nhiều lần
- [ ] Cần tự kiểm tra và chỉnh sửa nhiều
- [ ] Kết quả AI có lỗi hoặc chưa chính xác

#### 5.7. Minh chứng liên quan
* **File liên quan:** `FRONTEND/src/features/admin/Dashboard.tsx`

---

### Prompt số 2 (Bởi Lê Quốc Hùng - DE180096)

| Nội dung | Thông tin |
|---|---|
| Ngày sử dụng | 27/05/2026 |
| Công cụ AI | Claude |
| Mục đích | Thiết kế component điều hướng Sidebar dùng chung cho 12 trang admin |
| Phần việc liên quan | Coding / Architecture |
| Mức độ sử dụng | Hỏi thiết kế giải pháp / Hỏi sinh code |

#### 5.1. Prompt nguyên văn
```text
Hãy thiết kế giúp tôi một component AdminSidebar.tsx bằng React, TypeScript và Tailwind CSS dành cho trang quản trị Admin. Sidebar cần có:
1. Một Header hiển thị thương hiệu "SmartLog AI" với background gradient mượt mà.
2. Danh sách các liên kết điều hướng gồm 12 mục: Dashboard, User Management, Role & Permission, Orders, Warehouses, Fleet Map, Finance, BI Analytics, SmartLog AI, Notifications, Audit Logs, Settings.
3. Sử dụng thư viện Material Symbols làm icon.
4. Tự động kiểm tra trang hiện tại qua react-router-dom `useLocation` để thay đổi style của menu active (active thì có shadow, border bên phải và đổi màu chữ).
5. Riêng mục "SmartLog AI" (AI assistant), hiển thị một widget nhỏ hình bong bóng ghi "AI Insight Ready" ở phía trên và có hiệu ứng viền phát sáng nhẹ.
```

#### 5.2. Bối cảnh khi viết prompt
Do có 12 trang admin riêng biệt, nếu ở mỗi trang đều nhét đống code Sidebar điều hướng thì sẽ cực kỳ lãng phí, khó bảo trì. Sinh viên cần xây dựng một component Sidebar tập trung để sử dụng chung cho toàn bộ layout admin.

#### 5.3. Kết quả AI trả về
Claude sinh ra mã nguồn hoàn chỉnh của `AdminSidebar.tsx` với giao diện màu tối sang trọng, sử dụng `react-router-dom` để điều hướng động và đổi trạng thái active dựa trên đường dẫn hiện tại một cách cực kỳ mượt mà.

#### 5.4. Kết quả đã áp dụng vào bài
* Toàn bộ cấu trúc render Sidebar sử dụng danh sách mảng dữ liệu.
* Widget hiển thị độc đáo cho phần SmartLog AI.

#### 5.5. Phần sinh viên/nhóm đã chỉnh sửa hoặc cải tiến
* Tùy chỉnh màu sắc nền của Sidebar để ăn khớp với phong cách giao diện chung.
* Sửa lỗi TypeScript khi sử dụng `Link` từ `react-router-dom` (AI viết thiếu import).
* Bổ sung hiệu ứng phản hồi vật lý `active:scale-95 transition-all` khi bấm nút.

#### 5.6. Đánh giá chất lượng prompt
- [x] Prompt rõ ràng
- [x] Prompt có đủ bối cảnh
- [ ] Prompt còn thiếu thông tin
- [x] Prompt tạo ra kết quả tốt
- [ ] Prompt tạo ra kết quả chưa phù hợp
- [ ] Cần hỏi lại AI nhiều lần
- [ ] Cần tự kiểm tra và chỉnh sửa nhiều
- [ ] Kết quả AI có lỗi hoặc chưa chính xác

#### 5.7. Minh chứng liên quan
* **File liên quan:** `FRONTEND/src/components/AdminSidebar.tsx`

---

### Prompt số 3 (Bởi Lê Quốc Hùng - DE180096)

| Nội dung | Thông tin |
|---|---|
| Ngày sử dụng | 02/06/2026 |
| Công cụ AI | Antigravity |
| Mục đích | Dọn dẹp codebase và cấu trúc giao diện glassmorphism cho trang Test Center |
| Phần việc liên quan | Refactor / Git Cleanup |
| Mức độ sử dụng | Hỏi tối ưu / Hỏi giải thích |

#### 5.1. Prompt nguyên văn
```text
Tôi vừa hoàn thành việc migrate 12 trang admin từ HTML sang React. Trong thư mục dự án của tôi vẫn còn các file .html thừa của phiên bản cũ. Làm thế nào để dọn dẹp chúng một cách an toàn và tạo nhánh Git mới tuân thủ đúng chuẩn của nhóm (nhánh feature/DE180096-migrate-admin-ui, commit message: [DE180096] feat: ...)? Hãy hướng dẫn và hỗ trợ tôi tối ưu trang Test Center trong App.tsx với hiệu ứng glassmorphism để chạy thử nghiệm 12 module này.
```

#### 5.2. Bối cảnh khi viết prompt
Sau khi chuyển giao diện sang React thành công, dự án cần được dọn dẹp các file rác trước khi đưa lên môi trường sản xuất (Staging/Production). Sinh viên muốn thực hiện quá trình này thật chuẩn chỉ, không gây mất dữ liệu và tuân thủ đúng quy định nhánh/commit của leader.

#### 5.3. Kết quả AI trả về
Antigravity đã cung cấp chuỗi lệnh Git chuẩn xác để tạo nhánh mới, dọn dẹp file HTML tĩnh thông qua lệnh dòng lệnh nhanh chóng, đồng thời viết lại mã nguồn giao diện Test Center tuyệt đẹp cho `App.tsx` sử dụng phong cách glassmorphism hiện đại.

#### 5.4. Kết quả đã áp dụng vào bài
* Các lệnh Git để khởi tạo và push nhánh.
* Cấu trúc CSS và JSX của trang Test Center Home bóng bẩy.

#### 5.5. Phần sinh viên/nhóm đã chỉnh sửa hoặc cải tiến
* Tự kiểm chứng kỹ lưỡng danh sách thay đổi qua lệnh `git status -u` trước khi commit.
* Điều chỉnh các card module liên kết để định vị chính xác tới các route tương ứng của React Router.

#### 5.6. Đánh giá chất lượng prompt
- [x] Prompt rõ ràng
- [x] Prompt có đủ bối cảnh
- [ ] Prompt còn thiếu thông tin
- [x] Prompt tạo ra kết quả tốt
- [ ] Prompt tạo ra kết quả chưa phù hợp
- [ ] Cần hỏi lại AI nhiều lần
- [ ] Cần tự kiểm tra và chỉnh sửa nhiều
- [ ] Kết quả AI có lỗi hoặc chưa chính xác

#### 5.7. Minh chứng liên quan
* **File liên quan:** `FRONTEND/src/App.tsx`, `FRONTEND/src/features/admin/`

---

## 6. Prompt quan trọng nhất

### 6.1. Prompt được chọn
Prompt số 2 (Thiết kế Sidebar điều hướng dùng chung tích hợp định vị `useLocation`).

### 6.2. Vì sao prompt này quan trọng?
Vì Sidebar là linh hồn trong việc điều hướng toàn bộ hệ thống quản trị 12 trang Admin. Thiết kế Sidebar tốt giúp gom toàn bộ logic chuyển trang lại làm một, giúp người dùng không cảm thấy ứng dụng bị tải lại trang (reload) từ đó nâng cao trải nghiệm ứng dụng đơn trang (SPA).

### 6.3. Kết quả prompt này mang lại
Một component Sidebar đẹp mắt, tối ưu, dễ cấu hình thêm bớt menu chỉ bằng cách chỉnh sửa mảng dữ liệu tĩnh, định vị trang hiện tại cực chuẩn.

### 6.4. Sinh viên/nhóm đã kiểm tra kết quả như thế nào?
Sinh viên đã chạy dev server, click liên tục vào 12 trang khác nhau để kiểm tra xem thanh highlight active của Sidebar có nhảy chính xác và mượt mà hay không.

### 6.5. Sinh viên/nhóm đã cải tiến gì từ kết quả AI?
Cấu hình lại các đường dẫn link tương đối, sửa lỗi thiếu thư viện và tinh chỉnh lại font chữ, màu sắc theo tông chủ đạo của hệ thống.

---

## 7. Prompt chưa hiệu quả

### 7.1. Prompt chưa hiệu quả
```text
Hãy chuyển code HTML này sang React component giúp tôi.
[Mã nguồn HTML thô]
```

### 7.2. Vì sao prompt này chưa hiệu quả?
Prompt quá ngắn, thiếu bối cảnh dự án sử dụng TypeScript, dẫn đến AI sinh ra mã nguồn React JS thuần không có định kiểu. Hơn nữa, AI giữ nguyên các style inline dạng chuỗi (string) làm React ném ra hàng loạt cảnh báo đỏ, đồng thời không biết cách chia nhỏ code lặp thành hàm `.map()` làm component cực kỳ dài và khó đọc.

### 7.3. Cách cải thiện prompt
Cần cung cấp bối cảnh cụ thể (dự án dùng React + Vite + TypeScript + Tailwind CSS), nêu các ràng buộc kỹ thuật mong muốn (đổi class sang className, đổi style sang dạng object React, map dữ liệu lặp từ mảng).

### 7.4. Prompt sau khi cải tiến
*(Chính là Prompt số 1 đã trình bày chi tiết ở trên)*

### 7.5. Kết quả sau khi cải tiến prompt
AI sinh ra code chất lượng cao, chuẩn cú pháp TypeScript, sử dụng Tailwind CSS sạch sẽ và có cấu trúc mảng map dữ liệu cực kỳ chuyên nghiệp.

---

## 8. Bài học về cách viết prompt

### 8.1. Khi viết prompt, em/nhóm cần cung cấp thông tin gì để AI trả lời tốt hơn?
* **Mục tiêu rõ ràng:** Nêu rõ tác vụ cần làm (migrate code, thiết kế sidebar, dọn dẹp git).
* **Công nghệ sử dụng:** Luôn chỉ rõ phiên bản công nghệ sử dụng (React, TypeScript, Tailwind CSS).
* **Ràng buộc đầu ra:** Định rõ cấu trúc mong muốn (JSX tự đóng thẻ, map mảng dữ liệu).
* **Bối cảnh dự án:** Cung cấp thông tin về cấu trúc thư mục hoặc cách thức hoạt động chung.

### 8.2. Em/nhóm đã học được gì về cách đặt câu hỏi cho AI?
Biết cách chia nhỏ vấn đề lớn thành các phần nhỏ để hỏi AI thay vì ném toàn bộ dự án vào. Việc đặt câu hỏi chi tiết, có kèm ví dụ cụ thể giúp AI đưa ra câu trả lời có độ chính xác gần như tuyệt đối.

### 8.3. Lần sau em/nhóm sẽ cải thiện prompt như thế nào?
Sẽ lập sẵn các template prompt có đầy đủ bối cảnh công nghệ để tái sử dụng nhanh chóng và chia nhỏ các phân hệ giao diện phức tạp thành các phần nhỏ trước khi đưa cho AI xử lý.

---

## 9. Phân loại prompt đã sử dụng

Đánh dấu số lượng prompt theo từng nhóm.

| Loại prompt | Số lượng | Ví dụ prompt tiêu biểu |
|---|---:|---|
| Prompt phân tích yêu cầu | 1 | Hỏi giải nghĩa các thuật ngữ Logistics của đề bài |
| Prompt giải thích kiến thức | 0 | |
| Prompt thiết kế giải pháp | 1 | Hỏi thiết kế Component Sidebar dùng chung cho 12 trang |
| Prompt thiết kế database | 0 | |
| Prompt sinh code mẫu | 12 | Hỏi chuyển đổi từng file HTML tĩnh sang component React |
| Prompt debug lỗi | 3 | Hỏi cách fix lỗi biên dịch kiểu dữ liệu `any` trong TS |
| Prompt viết test case | 0 | |
| Prompt review code | 1 | Hỏi review giao diện sau khi ghép Sidebar |
| Prompt tối ưu code | 2 | Hỏi cách dùng hàm map tối ưu card KPI |
| Prompt viết báo cáo | 0 | |
| Prompt chuẩn bị thuyết trình | 0 | |
| Prompt khác | 1 | Hỏi cách tạo nhánh Git và dọn dẹp file HTML rác |

---

## 10. Checklist chất lượng prompt

Sinh viên/nhóm tự kiểm tra chất lượng prompt đã dùng.

| Tiêu chí | Đã đạt? | Ghi chú |
|---|:---:|---|
| Prompt có mục tiêu rõ ràng | [x] | Luôn nêu rõ mong muốn chuyển đổi hay tối ưu |
| Prompt có đủ bối cảnh | [x] | Nêu rõ bối cảnh đang làm dự án React + Tailwind |
| Prompt có nêu công nghệ/ngôn ngữ sử dụng | [x] | Chỉ rõ TypeScript và React Router |
| Prompt có nêu yêu cầu đầu ra | [x] | Yêu cầu đổi class sang className, tự đóng thẻ |
| Prompt không yêu cầu AI làm toàn bộ bài một cách máy móc | [x] | Hỏi từng phân trang và component nhỏ lẻ |
| Prompt có yêu cầu AI giải thích hoặc phân tích | [x] | AI giải thích rõ vì sao có cấu trúc map và import |
| Kết quả AI được kiểm tra lại | [x] | Chạy runtime và build test đầy đủ |
| Kết quả AI được chỉnh sửa trước khi sử dụng | [x] | Tự sửa kiểu dữ liệu và tinh chỉnh màu sắc |
| Prompt quan trọng được ghi lại đầy đủ | [x] | Đã ghi đầy đủ 3 lần quan trọng nhất |
| Prompt sai/chưa hiệu quả được rút kinh nghiệm | [x] | Rút ra bài học từ prompt ngắn thiếu bối cảnh |

---

## 11. Cam kết sử dụng prompt minh bạch

Sinh viên/nhóm cam kết rằng:
* Các prompt quan trọng đã được ghi lại trung thực.
* Không che giấu việc sử dụng AI trong các phần quan trọng của bài.
* Không nộp nguyên văn kết quả AI nếu chưa kiểm tra và chỉnh sửa.
* Có khả năng giải thích các phần đã sử dụng từ AI.
* Chịu trách nhiệm với sản phẩm cuối cùng.

| Đại diện sinh viên/nhóm | Ngày xác nhận |
|---|---|
| Lê Quốc Hùng | 02/06/2026 |
