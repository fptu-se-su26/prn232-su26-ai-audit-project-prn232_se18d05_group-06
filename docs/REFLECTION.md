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
| MSSV / Danh sách MSSV | DE180071,DE180096,DE180088,DE180109,DE180104 |
| Giảng viên hướng dẫn | Lê Thiện Nhật Quang |
| Ngày hoàn thành reflection | 02/06/2026 |

---

## 2. Mục đích Reflection

File này dùng để sinh viên/nhóm tự đánh giá quá trình sử dụng AI trong học tập và thực hiện bài tập, lab, assignment hoặc project.

Reflection cần thể hiện:
- AI đã hỗ trợ gì trong quá trình học.
- Sinh viên/nhóm đã kiểm chứng kết quả AI như thế nào.
- Sinh viên/nhóm đã tự chỉnh sửa, cải tiến ra sao.
- Sinh viên/nhóm học được gì về môn học.
- Sinh viên/nhóm học được gì về cách sử dụng AI minh bạch và có trách nhiệm.

---

## 3. Tóm tắt quá trình sử dụng AI

Mô tả ngắn gọn quá trình sử dụng AI trong bài tập/project này.

```text
Nhóm chủ yếu sử dụng AI (ChatGPT và Gemini) ở giai đoạn xây dựng giao diện Front-end. AI hỗ trợ tra cứu các class CSS Tailwind và gợi ý cách cấu hình Router định tuyến cơ bản. Việc này giúp nhóm tiết kiệm thời gian thiết kế khung tĩnh ban đầu. Nhóm không áp dụng các gợi ý code xử lý logic phức tạp để đảm bảo kiểm soát được hoạt động của chương trình.
```

---

## 4. Công cụ AI đã sử dụng

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

### Công cụ được sử dụng nhiều nhất

```text
ChatGPT
```

### Lý do sử dụng công cụ đó

```text
Do ChatGPT trả lời nhanh các cú pháp CSS Tailwind ngắn và có nhiều ví dụ trực quan dễ hiểu.
```

---

## 5. AI đã hỗ trợ em/nhóm ở điểm nào?

Đánh dấu các nội dung phù hợp.

- [ ] Hiểu yêu cầu đề bài
- [ ] Phân tích bài toán
- [ ] Tìm ý tưởng giải pháp
- [ ] Thiết kế database
- [x] Thiết kế giao diện
- [ ] Thiết kế kiến trúc hệ thống
- [x] Viết code mẫu
- [x] Debug lỗi
- [ ] Viết test case
- [ ] Review code
- [ ] Tối ưu code
- [ ] Kiểm tra bảo mật
- [ ] Viết báo cáo
- [ ] Chuẩn bị thuyết trình
- [x] Tìm hiểu công nghệ mới
- [ ] Khác: ....................................

### Mô tả chi tiết

```text
Nhóm sử dụng AI để tìm hiểu các thuộc tính CSS cần thiết cho việc bố trí Sidebar, Header và cách sử dụng react-router-dom để điều hướng các trang cơ bản.
```

---

## 5. Nhật ký Phản ánh Chi tiết

## Reflection - Tuần 1

Trong tuần này, nhóm đã sử dụng ChatGPT để dựng cấu trúc layout sidebar cơ bản cho trang Dashboard điều phối. Tuy nhiên, mã màu xám mà AI gợi ý quá đơn giản và không mang lại cảm giác hiện đại cho một hệ thống logistics thông minh.

Nhóm đã thảo luận, xem xét đề xuất của AI và tiến hành chỉnh sửa thủ công bằng cách chuyển tông màu xám mặc định sang màu xanh navy tối kết hợp hiệu ứng kính mờ (glassmorphism). Điều này giúp nhóm hiểu rõ hơn tầm quan trọng của việc chủ động thiết kế và tùy chỉnh CSS để tạo phong cách độc đáo cho giao diện thay vì chỉ phụ thuộc vào các thiết lập mặc định của AI.

## Reflection - Tuần 2

Tuần này, nhóm đã sử dụng Gemini để viết cấu hình Router định tuyến chính của ứng dụng. Do AI sử dụng cú pháp cũ (phiên bản v5) nên chương trình đã báo lỗi compile ngay khi khởi chạy dev server.

Nhóm đã kiểm tra lại lỗi, tự tìm hiểu tài liệu chính thức của React Router v6 để cập nhật cú pháp từ `component` sang `element`. Bài học lớn nhất rút ra là sinh viên cần luôn tự xác minh, kiểm chứng code do AI gợi ý trước khi áp dụng vào sản phẩm thực tế, vì AI có thể đưa ra các gợi ý lỗi thời hoặc không tương thích phiên bản.

## Reflection - Tuần 3

Trong tuần thứ 3, Trần Văn Tùng đã sử dụng Antigravity để thử nghiệm các hiệu ứng giao diện hiện đại như Glassmorphism cho trang Auth và Profile. AI đã gợi ý các class Backdrop Blur rất ấn tượng, giúp giao diện trông cao cấp hơn hẳn so với các mẫu UI thông thường.

Tuy nhiên, việc lạm dụng hiệu ứng này có thể gây khó đọc trên một số thiết bị hoặc nền hình ảnh quá sáng. Nhóm đã tự điều chỉnh lại độ mờ (opacity) và thêm các lớp phủ màu tối để đảm bảo tính khả dụng (accessibility) mà vẫn giữ được tính thẩm mỹ cao.

## Reflection - Tuần 4 (Final)

Trong tuần cuối cùng, nhóm tập trung hoàn thiện các tính năng nâng cao như theo dõi đơn hàng trên bản đồ và hệ thống Voucher. Việc sử dụng AI để tạo các animation SVG cho xe tải di chuyển giúp tiết kiệm rất nhiều thời gian lập trình CSS thuần.

Nhóm cũng nhận ra rằng khi project càng lớn, việc kiểm soát code do AI sinh ra càng quan trọng. Chúng tôi đã dành nhiều thời gian để refactor lại code, chia nhỏ components và đảm bảo các trang như VoucherCenter, SupportChat hoạt động đồng bộ với theme chung của FleetNova.


---

## 6. AI có giúp em/nhóm học tốt hơn không?

### 6.1. Những điểm AI giúp em/nhóm học tốt hơn

```text
- Giúp tra cứu nhanh cú pháp CSS Tailwind mà không cần tìm kiếm thủ công trên nhiều trang web.
- Gợi ý cách sửa các lỗi hiển thị giao diện cơ bản (như tràn chữ, căn giữa phần tử).
```

### 6.2. Những điểm AI chưa giúp tốt hoặc gây khó khăn

```text
- Đôi khi AI gợi ý các class CSS cũ đã bị loại bỏ ở phiên bản Tailwind mới.
- Một số đoạn code định tuyến do AI sinh ra bị thiếu import thư viện khiến chương trình không chạy được ngay.
```

### 6.3. Em/nhóm có bị phụ thuộc vào AI không?

- [ ] Không phụ thuộc
- [x] Phụ thuộc ít
- [ ] Phụ thuộc trung bình
- [ ] Phụ thuộc nhiều

Giải thích:

```text
Nhóm tự viết logic hiển thị chính và phân chia component, chỉ hỏi AI khi cần tra cứu nhanh các từ khóa CSS hoặc lỗi định dạng nhỏ.
```

---

## 7. Em/nhóm đã kiểm tra kết quả AI như thế nào?

Đánh dấu các cách đã sử dụng.

- [x] Chạy thử chương trình
- [x] Kiểm tra output
- [ ] Viết test case
- [x] So sánh với yêu cầu đề bài
- [ ] Đối chiếu với tài liệu môn học
- [x] Review code
- [ ] Hỏi lại giảng viên
- [ ] Tra cứu tài liệu chính thống
- [ ] Thảo luận với thành viên nhóm
- [ ] Kiểm tra bằng dữ liệu mẫu
- [ ] So sánh trước và sau khi dùng AI
- [ ] Khác: ....................................

### Mô tả quá trình kiểm chứng

```text
Mỗi khi áp dụng một gợi ý CSS hay Router của AI, nhóm chạy dự án bằng lệnh npm run dev trên localhost và mở trình duyệt để trực tiếp click tương tác và quan sát giao diện.
```

---

## 8. Phần đóng góp thật sự của sinh viên/nhóm

Mô tả rõ phần nào là đóng góp chính của sinh viên/nhóm, không phải chỉ copy từ AI.

```text
- Tự thiết kế bố cục, lựa chọn màu sắc chủ đạo của giao diện.
- Tự lập trình logic phân chia các Tab điều phối và liên kết hoạt động của Dashboard.
- Sắp xếp và tổ chức thư mục dự án theo chuẩn cấu trúc dễ bảo trì.
```

---

## 9. So sánh trước và sau khi dùng AI

| Nội dung | Trước khi dùng AI | Sau khi dùng AI | Cải thiện đạt được |
|---|---|---|---|
| Hiểu yêu cầu | Tự đọc hiểu yêu cầu đề bài | Tự đọc hiểu yêu cầu đề bài | Không có |
| Phân tích bài toán | Tự thảo luận nhóm | Tự thảo luận nhóm | Không có |
| Thiết kế giải pháp | Thiết kế thủ công trên giấy | Tham khảo một số bố cục đẹp | Tiết kiệm thời gian phác thảo |
| Code/Implementation | Gõ từng dòng CSS thuần | Sử dụng Tailwind tra cứu từ AI | Code giao diện nhanh hơn |
| Debug/Testing | Tự tìm lỗi mất nhiều thời gian | Nhờ AI khoanh vùng lỗi CSS | Sửa lỗi giao diện nhanh hơn |
| Báo cáo/Thuyết trình | Tự soạn thảo báo cáo | Định dạng báo cáo rõ ràng | Báo cáo chuyên nghiệp hơn |
| Làm việc nhóm | Phân chia công việc cơ bản | Phân chia công việc cơ bản | Không có |

---

## 10. Bài học về môn học

Sau bài tập/project này, em/nhóm học được gì về kiến thức môn học?

```text
Hiểu được tầm quan trọng của việc thiết kế giao diện thân thiện với người dùng và cách tổ chức các component React một cách khoa học để dễ mở rộng dự án sau này. Đồng thời học được cách ORM như Entity Framework biên dịch mã LINQ sang SQL, nhận ra không thể gọi hàm tự viết của C# tùy ý bên trong câu lệnh truy vấn tới Cơ sở dữ liệu.
```

---

## 11. Bài học về sử dụng AI có trách nhiệm

Sau bài tập/project này, em/nhóm học được gì về việc sử dụng AI một cách minh bạch, có trách nhiệm?

```text
Hiểu rằng AI chỉ đóng vai trò hỗ trợ tra cứu nhanh thông tin, sinh viên cần hiểu rõ từng dòng code đưa vào ứng dụng và tự chịu trách nhiệm về sản phẩm cuối cùng của mình.
```

---

## 12. Điều em/nhóm sẽ không làm khi sử dụng AI

Đánh dấu các cam kết phù hợp.

- [x] Không dùng AI để làm toàn bộ bài mà không hiểu nội dung.
- [x] Không nộp nguyên văn kết quả AI nếu chưa kiểm tra.
- [x] Không che giấu việc sử dụng AI trong các phần quan trọng.
- [x] Không dùng AI để tạo nội dung sai lệch hoặc gian lận.
- [x] Không dùng AI thay thế hoàn toàn quá trình học.
- [x] Không bỏ qua yêu cầu, rubric hoặc hướng dẫn của giảng viên.

---

## 13. Kế hoạch cải thiện lần sau

Lần sau em/nhóm sẽ sử dụng AI tốt hơn bằng cách nào?

```text
Đặt câu hỏi có tính chi tiết cao hơn, cung cấp cụ thể phiên bản thư viện đang dùng để nhận được câu trả lời chính xác nhất từ AI, tránh lỗi tương thích phiên bản.
```

---

## 14. Tự đánh giá mức độ hoàn thành

Sinh viên/nhóm tự đánh giá theo thang 1-5.

| Tiêu chí | Điểm tự đánh giá 1-5 | Ghi chú |
|---|:---:|---|
| Ghi nhận việc dùng AI trung thực | 5 | Khai báo đầy đủ |
| Prompt có mục tiêu rõ ràng | 4 | Tập trung vào CSS/Router |
| Kiểm chứng kết quả AI | 4 | Chạy thử localhost kỹ càng |
| Tự chỉnh sửa/cải tiến | 4 | Tự viết code giao diện chính |
| Hiểu nội dung đã nộp | 5 | Hiểu toàn bộ logic code frontend |
| Reflection có chiều sâu | 4 | Trả lời trung thực |
| Sử dụng AI có trách nhiệm | 5 | Không copy nguyên bản |

---

## 15. Câu hỏi tự vấn cuối bài

### 15.1. Nếu giảng viên hỏi về phần AI đã hỗ trợ, em/nhóm có giải thích lại được không?

```text
Hoàn toàn giải thích được vì nhóm tự tay viết và chỉnh sửa toàn bộ các file code giao diện.
```

### 15.2. Nếu không có AI, em/nhóm có thể tự làm lại phần quan trọng nhất không?

```text
Hoàn toàn có thể tự làm lại được, chỉ mất nhiều thời gian hơn trong khâu tra cứu cú pháp CSS Tailwind.
```

### 15.3. Phần nào trong bài thể hiện rõ nhất năng lực thật sự của em/nhóm?

```text
Phần tổ chức bố cục giao diện Dashboard trực quan và luồng điều phối đơn hàng chạy tĩnh trên trang web.
```

### 15.4. Em/nhóm muốn cải thiện kỹ năng nào sau bài này?

```text
Kỹ năng lập trình phần Backend để kết nối cơ sở dữ liệu thực tế và xử lý các nghiệp vụ nâng cao.
```

---

## 16. Cam kết Reflection

Em/nhóm cam kết rằng nội dung reflection này phản ánh trung thực quá trình sử dụng AI và quá trình học tập trong bài tập/project.

Sinh viên/nhóm hiểu rằng:
- AI là công cụ hỗ trợ học tập, không thay thế hoàn toàn năng lực cá nhân.
- Mọi kết quả AI gợi ý cần được kiểm tra trước khi sử dụng.
- Sinh viên/nhóm chịu trách nhiệm với sản phẩm cuối cùng.
- Sinh viên/nhóm cần giải thích được các phần đã nộp.

| Đại diện sinh viên/nhóm | Ngày xác nhận |
|---|---|
| Nhóm trưởng | 02/06/2026 |