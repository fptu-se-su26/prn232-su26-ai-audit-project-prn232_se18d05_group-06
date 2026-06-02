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
| Ngày cập nhật gần nhất | 02/06/2026 |

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

---

## 5. Prompt chi tiết

## Prompt #01

- Date: 2026-05-24
- AI Tool: ChatGPT
- Author: Vũ Duy Lê (DE180071)
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
- Author: Vũ Duy Lê (DE180071)
- Purpose: Cấu hình Router định tuyến chính của ứng dụng

### Prompt
Cách sử dụng React Router v6 để chuyển trang giữa /dispatcher và /driver trong ứng dụng React Vite?

### Expected Output
- Hướng dẫn cài đặt react-router-dom.
- Mã nguồn mẫu sử dụng BrowserRouter, Routes và Route của phiên bản v6.

### Evaluation
Gợi ý ban đầu của Gemini bị lỗi thiếu các import cần thiết và sử dụng nhầm một số thuộc tính v5. Sau khi tự đối chiếu với tài liệu chính thống của Router v6, nhóm đã sửa lại cú pháp `element` thay cho `component` thành công.

---

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
