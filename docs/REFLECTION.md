# AI Learning Reflection

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
| Ngày hoàn thành reflection | 02/06/2026 |

---

## 2. Mục đích Reflection

File này dùng để sinh viên/nhóm tự đánh giá quá trình sử dụng AI trong học tập và thực hiện bài tập, lab, assignment hoặc project. Reflection này tập trung phản ánh trải nghiệm học tập thực tế của thành viên **Lê Quốc Hùng (DE180096)** khi sử dụng AI làm công cụ hỗ trợ chuyển đổi toàn diện 12 phân hệ giao diện của FleetNova từ HTML sang React, TypeScript và Tailwind CSS.

---

## 3. Tóm tắt quá trình sử dụng AI

Trong dự án FleetNova, em đã sử dụng các công cụ AI (nhiều nhất là ChatGPT và Claude) xuyên suốt quá trình thực hiện giai đoạn xây dựng giao diện Admin (Phase 04 & Phase 05). 
* **Giai đoạn chuyển đổi thô:** Em đã dùng AI để tự động hóa việc dịch mã HTML sang React JSX, sửa đổi tên class, đóng các thẻ tự đóng.
* **Giai đoạn tái cấu trúc và tối ưu:** Hỏi AI cách viết component Sidebar dùng chung, định vị trạng thái active của menu điều hướng, và cách tổ chức các mảng dữ liệu mẫu để render sạch sẽ bằng hàm `.map()`.
* **Giai đoạn dọn dẹp và hoàn thiện:** Sử dụng Antigravity để dọn dẹp các file HTML thừa trong repo, hướng dẫn tạo nhánh Git chuẩn và tối ưu các hiệu ứng glassmorphism trong trang chủ Test Center.

Sự hỗ trợ của AI đã cải thiện đáng kể tốc độ hoàn thành phần việc của em (tiết kiệm khoảng 70% thời gian so với gõ code thủ công), giúp em có nhiều thời gian tập trung vào việc nghiên cứu kiến trúc dự án và fix các lỗi TypeScript.

---

## 4. Công cụ AI đã sử dụng

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

### Công cụ được sử dụng nhiều nhất
* **ChatGPT & Claude**

### Lý do sử dụng công cụ đó
* **ChatGPT:** Rất mạnh trong việc xử lý các tác vụ lặp lại quy mô lớn như convert định dạng code thô từ HTML sang JSX mà không làm mất đi các class Tailwind có sẵn.
* **Claude:** Nổi trội trong việc tư vấn thiết kế giao diện Tailwind đẹp mắt, lập luận logic TypeScript chặt chẽ, hỗ trợ viết code Component Sidebar dùng chung vô cùng tinh tế.
* **Antigravity:** Hỗ trợ điều phối dự án cực kỳ thông minh trực tiếp trong workspace, hướng dẫn các thao tác Git nâng cao và dọn dẹp file dư thừa một cách an toàn.

---

## 5. AI đã hỗ trợ em/nhóm ở điểm nào?

Đánh dấu các nội dung phù hợp.

- [ ] Hiểu yêu cầu đề bài
- [x] Phân tích bài toán
- [x] Tìm ý tưởng giải pháp
- [ ] Thiết kế database
- [x] Thiết kế giao diện
- [x] Thiết kế kiến trúc hệ thống
- [x] Viết code mẫu
- [x] Debug lỗi
- [ ] Viết test case
- [x] Review code
- [x] Tối ưu code
- [ ] Kiểm tra bảo mật
- [ ] Viết báo cáo
- [ ] Chuẩn bị thuyết trình
- [x] Tìm hiểu công nghệ mới
- [ ] Khác: ....................................

### Mô tả chi tiết
AI hỗ trợ đắc lực nhất ở khâu **Frontend Coding và Refactor**. Thay vì phải tự tay chỉnh sửa hàng trăm thẻ `class` sang `className`, tự thêm dấu `/` vào thẻ `<img>` cho cả 12 trang admin đồ sộ, AI đã làm việc đó chỉ trong vài giây. Ngoài ra, AI còn đưa ra giải pháp gom nhóm dữ liệu lặp lại để viết mã nguồn cực kỳ ngắn gọn và dễ bảo trì hơn rất nhiều.

---

## 6. AI có giúp em/nhóm học tốt hơn không?

### 6.1. Những điểm AI giúp em/nhóm học tốt hơn
* **Hiểu sâu về JSX và React Router:** Thấy rõ sự khác biệt giữa HTML tĩnh và cơ chế render linh hoạt của React Component.
* **Nâng cao kỹ năng TypeScript:** AI chỉ ra cách định nghĩa các interface dữ liệu rõ ràng thay vì sử dụng kiểu `any` vô tội vạ, giúp code có tính an toàn cao (Type-safety).
* **Tư duy thiết kế component (Component-based):** Học được cách tách biệt Sidebar và Test Center Home thành các component dùng chung thay vì copy code lặp lại ở nhiều nơi.
* **Tối ưu Tailwind CSS:** Học hỏi được nhiều class Tailwind nâng cao từ AI để tạo hiệu ứng chuyển động mượt mà và giao diện glassmorphism hiện đại.

### 6.2. Những điểm AI chưa giúp tốt hoặc gây khó khăn
* **Lỗi import đường dẫn:** AI thường sinh các đường dẫn import giả định (`import Button from './Button'`) không tồn tại trong cấu trúc thư mục thực tế của dự án, làm chương trình bị lỗi compile liên tục.
* **Khai báo kiểu dữ liệu lỏng lẻo:** AI hay lười biếng sử dụng kiểu `any` trong TypeScript, làm mất đi ưu thế kiểm soát lỗi của TypeScript.
* **Thiếu ngữ cảnh tổng thể:** AI đôi khi đề xuất giải pháp quá phức tạp hoặc sử dụng các thư viện ngoài không cần thiết, trong khi chỉ cần một vài dòng CSS hoặc Tailwind thuần là giải quyết được vấn đề.

### 6.3. Em/nhóm có bị phụ thuộc vào AI không?

- [ ] Không phụ thuộc
- [x] Phụ thuộc ít
- [ ] Phụ thuộc trung bình
- [ ] Phụ thuộc nhiều

**Giải thích:**
Em chỉ sử dụng AI như một trợ lý ảo hỗ trợ thực hiện các tác vụ tẻ nhạt, lặp đi lặp lại hoặc xin ý tưởng layout ban đầu. Toàn bộ logic routing, sửa lỗi compile của TypeScript, cấu hình dự án, dọn dẹp file cũ và đẩy nhánh Git đều do em tự nghiên cứu, kiểm chứng và thực hiện thủ công để đảm bảo bản thân hoàn toàn hiểu rõ cấu trúc dự án.

---

## 7. Em/nhóm đã kiểm tra kết quả AI như thế nào?

Đánh dấu các cách đã sử dụng.

- [x] Chạy thử chương trình
- [x] Kiểm tra output
- [ ] Viết test case
- [x] So sánh với yêu cầu đề bài
- [x] Đối chiếu với tài liệu môn học
- [x] Review code
- [ ] Hỏi lại giảng viên
- [x] Tra cứu tài liệu chính thống
- [x] Thảo luận với thành viên nhóm
- [x] Kiểm tra bằng dữ liệu mẫu
- [x] So sánh trước và sau khi dùng AI
- [ ] Khác: ....................................

### Mô tả quá trình kiểm chứng
Mỗi khi nhận code gợi ý từ AI, em không bao giờ copy-paste thẳng vào dự án. Thay vào đó, em:
1. Đọc kỹ dòng code AI sinh ra để hiểu rõ logic của nó.
2. Đưa code vào dự án và theo dõi sát sao cửa sổ Terminal xem dev server có báo lỗi compile nào không.
3. Mở Chrome DevTools (Console tab) để rà soát các cảnh báo (warning) đỏ/vàng của React.
4. Chạy thử toàn bộ các tính năng click chuyển trang để kiểm tra hoạt động thực tế.

### Ví dụ cụ thể về một lần kiểm chứng

| Nội dung | Mô tả |
|---|---|
| **AI đã gợi ý gì?** | Gợi ý code Sidebar sử dụng `useLocation()` để tự highlight link đang active. |
| **Em/nhóm đã kiểm tra bằng cách nào?** | Nhúng Sidebar vào `App.tsx`, click chuyển hướng giữa các trang Admin và theo dõi sự thay đổi màu sắc của Sidebar trên màn hình browser. |
| **Kết quả kiểm tra** | Cần chỉnh sửa. Giao diện Sidebar hiển thị đẹp nhưng AI viết sai đường dẫn route (path) so với cấu hình router trong App, dẫn đến click vào bị trang trắng. |
| **Em/nhóm đã xử lý tiếp như thế nào?** | Tự tay đối chiếu và sửa lại toàn bộ mảng `path` trong `AdminSidebar.tsx` sao cho trùng khớp 100% với file cấu hình route trung tâm. |

---

## 8. Ví dụ AI gợi ý sai hoặc chưa phù hợp

| Nội dung | Mô tả |
|---|---|
| **AI đã gợi ý gì?** | Gợi ý viết kiểu dữ liệu cho sự kiện click trong Sidebar dạng `onClick: (e: any) => void`. |
| **Vì sao gợi ý đó sai/chưa phù hợp?** | Sử dụng kiểu `any` là phản mẫu (anti-pattern) trong TypeScript, làm mất tính năng gợi ý code tự động của VS Code và dễ gây ra lỗi run-time nếu truyền sai tham số. |
| **Em/nhóm phát hiện bằng cách nào?** | TypeScript compiler cảnh báo không được lạm dụng kiểu `any` do dự án bật chế độ kiểm tra nghiêm ngặt (strict mode). |
| **Em/nhóm đã sửa như thế nào?** | Chuyển đổi thành kiểu chuẩn của React: `onClick: (e: React.MouseEvent<HTMLAnchorElement>) => void`. |
| **Bài học rút ra** | Không được tin tưởng hoàn toàn vào kiểu dữ liệu do AI tự động khai báo. Luôn luôn tự rà soát và định kiểu dữ liệu một cách rõ ràng, minh bạch nhất. |

---

## 9. Phần đóng góp thật sự của sinh viên/nhóm

Em tự hào khẳng định phần đóng góp thực sự của em chiếm vai trò chủ đạo:
* **Tự quản lý cấu trúc dự án:** Phân chia 12 component khoa học vào thư mục `src/features/admin/`, tự gom nhóm Sidebar chung vào `src/components/`.
* **Tự giải quyết các lỗi logic:** Sửa toàn bộ lỗi import sai đường dẫn, đồng bộ hóa hệ thống định tuyến (Routing) hoạt động trơn tru.
* **Dọn dẹp mã nguồn sạch sẽ:** Tự mình rà soát, dọn sạch 12 file `.html` rác cũ để giữ gìn repository chuyên nghiệp, chuẩn mực.
* **Quản trị Git:** Tự tạo nhánh riêng, viết commit message cực kỳ chuẩn chỉ để leader dễ dàng review PR.

---

## 10. So sánh trước và sau khi dùng AI

| Nội dung | Trước khi dùng AI | Sau khi dùng AI | Cải thiện đạt được |
|---|---|---|---|
| **Hiểu yêu cầu** | Mất thời gian đọc tài liệu nghiệp vụ Logistics phức tạp | AI tóm tắt và định nghĩa nhanh thuật ngữ chuyên ngành | Nắm bắt nghiệp vụ nhanh gấp 2 lần |
| **Code/Implementation** | Gõ tay hàng ngàn dòng code convert class thành className rất tẻ nhạt | AI tự động chuyển đổi thô chỉ trong vài giây | Tiết kiệm 70% thời gian làm Frontend thô |
| **Debug/Testing** | Mất nhiều thời gian tra cứu lỗi compile lạ trên Google | AI giải thích nhanh ý nghĩa lỗi và gợi ý cách fix | Xử lý lỗi nhanh chóng, tự tin kiểm soát codebase |
| **Làm việc nhóm** | Gặp khó khăn khi viết commit hoặc chia nhánh | AI hỗ trợ định hình quy trình Git chuyên nghiệp | Đẩy code sạch sẽ, không gây conflict với nhóm |

---

## 11. Bài học về môn học

* Thấu hiểu sâu sắc kiến trúc phát triển ứng dụng web hiện đại hướng thành phần (Component-based architecture).
* Làm chủ sức mạnh của Tailwind CSS để dựng nhanh các giao diện vô cùng sang trọng, bóng bẩy mà không cần viết các file CSS cồng kềnh.
* Hiểu rõ cơ chế quản lý Route và State để xây dựng một ứng dụng Single Page Application (SPA) hoàn chỉnh.
* Nhận thức rõ tầm quan trọng của việc dọn dẹp file rác và quản lý Git chuyên nghiệp khi làm việc nhóm.

---

## 12. Bài học về sử dụng AI có trách nhiệm

* AI là người trợ lý đắc lực, không phải là người làm thay. Bản thân lập trình viên phải luôn là người làm chủ mã nguồn.
* Việc copy-paste mù quáng không qua kiểm chứng là hành vi cực kỳ nguy hiểm, dễ dẫn đến lỗi hệ thống nghiêm trọng và vi phạm đạo đức học thuật.
* Phải luôn ghi nhận minh bạch việc sử dụng AI (như đang thực hiện trong file log này) để thể hiện sự tôn trọng học thuật và tính chuyên nghiệp trong công việc.

---

## 13. Điều em/nhóm sẽ không làm khi sử dụng AI

- [x] Không dùng AI để làm toàn bộ bài mà không hiểu nội dung.
- [x] Không nộp nguyên văn kết quả AI nếu chưa kiểm tra.
- [x] Không che giấu việc sử dụng AI trong các phần quan trọng.
- [x] Không dùng AI để tạo nội dung sai lệch hoặc gian lận.
- [x] Không dùng AI thay thế hoàn toàn quá trình học.
- [x] Không bỏ qua yêu cầu, rubric hoặc hướng dẫn của giảng viên.

---

## 14. Kế hoạch cải thiện lần sau

* Sẽ chuẩn bị các prompt chi tiết, giàu ngữ cảnh hơn để AI sinh code khớp với dự án ngay từ đầu.
* Tập trung hỏi AI giải thích bản chất kiến trúc và các pattern thiết kế thay vì chỉ bảo AI sinh code mẫu.
* Ghi chép nhật ký sử dụng AI thường xuyên hơn ngay trong lúc code thay vì đợi đến cuối giai đoạn mới tổng hợp.

---

## 15. Tự đánh giá mức độ hoàn thành

Sinh viên/nhóm tự đánh giá theo thang 1-5.

| Tiêu chí | Điểm tự đánh giá 1-5 | Ghi chú |
|---|:---:|---|
| Ghi nhận việc dùng AI trung thực | 5 | Ghi chép đầy đủ, minh bạch các lần dùng AI |
| Prompt có mục tiêu rõ ràng | 5 | Đặt câu hỏi chi tiết, đầy đủ ngữ cảnh |
| Kiểm chứng kết quả AI | 5 | Chạy runtime và compile test kỹ lưỡng |
| Tự chỉnh sửa/cải tiến | 5 | Sửa toàn bộ kiểu dữ liệu TS và tối ưu layout Sidebar |
| Hiểu nội dung đã nộp | 5 | Làm chủ 100% mã nguồn Frontend Admin hiện tại |
| Reflection có chiều sâu | 5 | Phản tỉnh chân thực, chi tiết từng bài học |
| Sử dụng AI có trách nhiệm | 5 | Tuân thủ cam kết học thuật tuyệt đối |

---

## 16. Câu hỏi tự vấn cuối bài

### 16.1. Nếu giảng viên hỏi về phần AI đã hỗ trợ, em/nhóm có giải thích lại được không?
**Chắc chắn giải thích được 100%.** Em nắm rõ từng thẻ JSX, các class Tailwind định hình layout, cơ chế hoạt động của component `AdminSidebar.tsx` và cách định cấu hình định tuyến trong `App.tsx`.

### 16.2. Nếu không có AI, em/nhóm có thể tự làm lại phần quan trọng nhất không?
**Hoàn toàn có thể tự làm được.** Việc không có AI chỉ khiến em mất nhiều thời gian gõ phím và tra cứu tài liệu hơn, chứ không thể làm khó được kỹ năng lập trình React/TypeScript của em.

### 16.3. Phần nào trong bài thể hiện rõ nhất năng lực thật sự của em/nhóm?
Component `AdminSidebar.tsx` điều hướng tự động và cấu trúc định tuyến SPA sạch sẽ trong `App.tsx`. Đây là phần đòi hỏi sự am hiểu sâu sắc về React Router, cách tổ chức dữ liệu mảng map linh hoạt và tư duy thẩm mỹ giao diện cao cấp.

### 16.4. Em/nhóm muốn cải thiện kỹ năng nào sau bài này?
Muốn cải thiện sâu sắc hơn kỹ năng kết nối API (Asynchronous API integration) để chuẩn bị cho giai đoạn ghép nối Frontend với Backend .NET Web API tiếp theo.

---

## 17. Cam kết Reflection

Em cam kết rằng nội dung reflection này phản ánh trung thực quá trình sử dụng AI và quá trình học tập tự thân trong bài tập/project.

| Đại diện sinh viên/nhóm | Ngày xác nhận |
|---|---|
| Lê Quốc Hùng | 02/06/2026 |
