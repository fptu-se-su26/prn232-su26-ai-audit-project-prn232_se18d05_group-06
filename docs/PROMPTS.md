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

- [x ] ChatGPT
- [x ] Gemini
- [x ] Claude
- [ x] GitHub Copilot
- [ ] Cursor
- [ x] Antigravity
- [x ] Microsoft Copilot
- [ x] Perplexity
- [ ] Công cụ khác: ....................................

---

## 4. Bảng tổng hợp prompt đã sử dụng

| STT | Ngày | Công cụ AI | Mục đích | Prompt tóm tắt | Kết quả chính | Có sử dụng vào bài không? | Minh chứng |
|---:|---|---|---|---|---|---|---|
| 1 | 20/05/2026 | ChatGPT | Thiết kế sơ bộ database và API | "Đề xuất schema cho đơn hàng, sản phẩm, kho" | Gợi ý schema và quan hệ bảng | Có | backend/models
| 2 | 24/05/2026 | ChatGPT | Tối ưu prompt cho OCR hóa đơn | "Viết prompt cho pipeline tiền xử lý ảnh, regex trích xuất số tiền, invoice_id, date" | Pipeline steps + regex examples | Có | FRONTEND/src/features/warehouse/OcrDropzone.tsx
| 3 | 02/06/2026 | ChatGPT | Cấu hình Vite + React + TypeScript | "Cách cấu hình vite cho react + typescript và chạy dev" | Hướng dẫn cấu hình và chạy dev server | Có | terminal output
| 4 |  |  |  |  | Có / Không |  |
| 5 |  |  |  |  | Có / Không |  |
| 6 |  |  |  |  | Có / Không |  |
| 7 |  |  |  |  | Có / Không |  |
| 8 |  |  |  |  | Có / Không |  |
| 9 |  |  |  |  | Có / Không |  |
| 10 |  |  |  |  | Có / Không |  |

---

## 5. Prompt chi tiết

> Sinh viên/nhóm có thể nhân bản mẫu “Prompt số...” nhiều lần tùy số lượng prompt thực tế đã sử dụng.

---

### Prompt số 1

| Nội dung | Thông tin |
|---|---|
| Ngày sử dụng | 20/05/2026 |
| Công cụ AI | ChatGPT |
| Mục đích | Thiết kế schema database sơ bộ (backend) |
| Phần việc liên quan | Design / Database |
| Mức độ sử dụng | Hỏi ý tưởng |

#### 5.1. Prompt nguyên văn

```text
Đề xuất schema cho hệ thống quản lý kho/đơn hàng: các bảng Orders, OrderItems, Products, Warehouses, Inventory; các trường chính, khóa ngoại, và các chỉ mục cần thiết cho truy vấn theo order_id, product_id, warehouse_id.
```

#### 5.2. Bối cảnh khi viết prompt

Mô tả ngắn gọn vì sao sinh viên/nhóm cần dùng prompt này.

```text
Bối cảnh: cần một cấu trúc DB để backend có thể tạo migration và triển khai API CRUD cho Orders/Inventory.
```

#### 5.3. Kết quả AI trả về

Tóm tắt nội dung AI đã trả lời hoặc gợi ý.

```text
AI trả về mô tả chi tiết các bảng, mối quan hệ, và ví dụ migration SQL cho Orders/OrderItems.
```

#### 5.4. Kết quả đã áp dụng vào bài

Mô tả phần nào từ kết quả AI đã được sử dụng vào bài tập/project.

```text
Được backend sử dụng làm baseline để viết migration; không thuộc phần frontend của Phan.
```

#### 5.5. Phần sinh viên/nhóm đã chỉnh sửa hoặc cải tiến

Mô tả sinh viên/nhóm đã thay đổi, kiểm tra, sửa lỗi hoặc cải tiến gì so với kết quả AI trả về.

```text
Backend team đã thêm chỉ mục và tinh chỉnh một vài trường theo requirement.
```

#### 5.6. Đánh giá chất lượng prompt

Đánh dấu các nhận xét phù hợp.

- [ x] Prompt rõ ràng
- [ x] Prompt có đủ bối cảnh
- [ x] Prompt còn thiếu thông tin
- [ x] Prompt tạo ra kết quả tốt
- [x ] Prompt tạo ra kết quả chưa phù hợp
- [ x] Cần hỏi lại AI nhiều lần
- [ x] Cần tự kiểm tra và chỉnh sửa nhiều
- [ x] Kết quả AI có lỗi hoặc chưa chính xác

#### 5.7. Minh chứng liên quan

| Loại minh chứng | Nội dung |
|---|---|
| Link commit |  |
| File liên quan |  |
| Screenshot |  |
| Kết quả chạy/test |  |
| Link tài liệu/báo cáo |  |
| Ghi chú khác |  |

#### 5.8. Ghi chú thêm

```text
Ghi chú: Prompt liên quan chủ yếu backend; Phan (frontend) không trực tiếp dùng prompt này.
```

---

### Prompt số 2

| Nội dung | Thông tin |
|---|---|
| Ngày sử dụng |  |
| Công cụ AI | ChatGPT / Gemini / Claude / GitHub Copilot / Cursor / Antigravity / Khác |
| Mục đích |  |
| Phần việc liên quan | Requirement / Design / Database / Coding / Testing / Debug / Report / Presentation / Other |
| Mức độ sử dụng | Hỏi ý tưởng / Hỏi giải thích / Hỏi review / Hỏi debug / Hỏi sinh code / Hỏi tối ưu |

#### 5.1. Prompt nguyên văn

```text
Viết prompt và pipeline tiền xử lý ảnh để tăng accuracy cho OCR trên hóa đơn: hướng dẫn grayscale, thresholding, deskew, crop region detection, ví dụ regex để trích số tiền, invoice_id, date.
```

#### 5.2. Bối cảnh khi viết prompt

```text
Bối cảnh: Cần pipeline client-side để tiền xử lý ảnh trước khi gửi lên OCR service, giảm lỗi trích xuất cho hóa đơn VN.
```

#### 5.3. Kết quả AI trả về

```text
AI cung cấp các bước tiền xử lý (grayscale, denoise, adaptive threshold, deskew), ví dụ regex cho các trường quan trọng, và gợi ý metrics đánh giá accuracy.
```

#### 5.4. Kết quả đã áp dụng vào bài

```text
Phan áp dụng pipeline trước khi gửi ảnh lên OCR, điều chỉnh regex, và hiển thị kết quả trong `OcrExtractedTable` để kiểm duyệt thủ công.
```

#### 5.5. Phần sinh viên/nhóm đã chỉnh sửa hoặc cải tiến

```text
Điều chỉnh regex cho định dạng hóa đơn VN, thêm bước enhance cho ảnh mờ, và lưu các kết quả không chắc chắn cho kiểm duyệt thủ công.
```

#### 5.6. Đánh giá chất lượng prompt

- [ ] Prompt rõ ràng
- [ ] Prompt có đủ bối cảnh
- [ ] Prompt còn thiếu thông tin
- [ ] Prompt tạo ra kết quả tốt
- [ ] Prompt tạo ra kết quả chưa phù hợp
- [ ] Cần hỏi lại AI nhiều lần
- [ ] Cần tự kiểm tra và chỉnh sửa nhiều
- [ ] Kết quả AI có lỗi hoặc chưa chính xác

#### 5.7. Minh chứng liên quan

| Loại minh chứng | Nội dung |
|---|---|
| Link commit |  |
| File liên quan |  |
| Screenshot |  |
| Kết quả chạy/test |  |
| Link tài liệu/báo cáo |  |
| Ghi chú khác |  |

#### 5.8. Ghi chú thêm

```text
Ghi chú: Lưu prompt nguyên văn trong docs/ prompts trước khi nộp (nếu cần). Minh chứng: FRONTEND/src/features/warehouse/OcrDropzone.tsx
```

---

### Prompt số 3

| Nội dung | Thông tin |
|---|---|
| Ngày sử dụng |  |
| Công cụ AI | ChatGPT / Gemini / Claude / GitHub Copilot / Cursor / Antigravity / Khác |
| Mục đích |  |
| Phần việc liên quan | Requirement / Design / Database / Coding / Testing / Debug / Report / Presentation / Other |
| Mức độ sử dụng | Hỏi ý tưởng / Hỏi giải thích / Hỏi review / Hỏi debug / Hỏi sinh code / Hỏi tối ưu |

#### 5.1. Prompt nguyên văn

```text
Hướng dẫn chi tiết để cấu hình Vite cho React + TypeScript, liệt kê plugin cần thiết, và cách khắc phục lỗi thường gặp khi chạy `npm run dev`.
```

#### 5.2. Bối cảnh khi viết prompt

```text
Bối cảnh: Khởi tạo frontend bằng Vite + React + TS, gặp lỗi alias và cấu hình plugin.
```

#### 5.3. Kết quả AI trả về

```text
AI cung cấp checklist cấu hình `tsconfig.json` và `vite.config.ts`, plugin `@vitejs/plugin-react`, và mẹo sửa lỗi tương thích.
```

#### 5.4. Kết quả đã áp dụng vào bài

```text
Phan áp dụng cấu hình, khởi chạy dev server thành công và lưu lại terminal output làm minh chứng.
```

#### 5.5. Phần sinh viên/nhóm đã chỉnh sửa hoặc cải tiến

```text
Cập nhật `tsconfig` cho path aliases và thêm script `type-check`.
```

#### 5.6. Đánh giá chất lượng prompt

- [ ] Prompt rõ ràng
- [ ] Prompt có đủ bối cảnh
- [ ] Prompt còn thiếu thông tin
- [ ] Prompt tạo ra kết quả tốt
- [ ] Prompt tạo ra kết quả chưa phù hợp
- [ ] Cần hỏi lại AI nhiều lần
- [ ] Cần tự kiểm tra và chỉnh sửa nhiều
- [ ] Kết quả AI có lỗi hoặc chưa chính xác

#### 5.7. Minh chứng liên quan

| Loại minh chứng | Nội dung |
|---|---|
| Link commit |  |
| File liên quan |  |
| Screenshot |  |
| Kết quả chạy/test |  |
| Link tài liệu/báo cáo |  |
| Ghi chú khác |  |

#### 5.8. Ghi chú thêm

```text
Ghi chú: Thêm link terminal output và commit cấu hình vào minh chứng.
```

---

## 6. Prompt quan trọng nhất

Chọn một prompt có ảnh hưởng lớn nhất đến bài tập/project.

### 6.1. Prompt được chọn

```text
Viết prompt và pipeline tiền xử lý ảnh để tăng accuracy cho OCR trên hóa đơn: hướng dẫn grayscale, thresholding, deskew, crop region detection, ví dụ regex để trích số tiền, invoice_id, date.
```

### 6.2. Vì sao prompt này quan trọng?

```text
Vì ảnh hóa đơn đầu vào rất đa dạng; prompt giúp xác định các bước tiền xử lý cần thiết và regex mẫu để tăng tỷ lệ trích xuất chính xác trên frontend trước khi gửi lên OCR service.
```

### 6.3. Kết quả prompt này mang lại

```text
Cung cấp pipeline tiền xử lý rõ ràng (grayscale, denoise, adaptive threshold, deskew, crop), và ví dụ regex cho các trường quan trọng, giúp giảm lỗi trích xuất.
```

### 6.4. Sinh viên/nhóm đã kiểm tra kết quả như thế nào?

```text
Kiểm thử trên ~30 ảnh mẫu khác nhau (độ sáng, góc, chất lượng), so sánh kết quả OCR trước/sau tiền xử lý, lưu các kết quả không chắc chắn để kiểm duyệt thủ công.
```

### 6.5. Sinh viên/nhóm đã cải tiến gì từ kết quả AI?

```text
Điều chỉnh regex theo định dạng hóa đơn VN, thêm bước enhance cho ảnh mờ, và thêm UI kiểm duyệt trong `OcrExtractedTable`.
```

---

## 7. Prompt chưa hiệu quả

Ghi lại ít nhất một prompt chưa tạo ra kết quả tốt hoặc chưa phù hợp.

### 7.1. Prompt chưa hiệu quả

```text
Viết prompt cho pipeline OCR hóa đơn nhưng không nêu rõ định dạng hóa đơn VN, không nói rõ là client-side React, và không yêu cầu output dưới dạng regex/JSON.
```

### 7.2. Vì sao prompt này chưa hiệu quả?

```text
Prompt thiếu ngữ cảnh (không nêu định dạng hóa đơn, ngôn ngữ, hoặc ví dụ input), dẫn đến kết quả chung chung, cần tinh chỉnh để áp dụng thực tế trên ảnh VN.
```

Gợi ý nguyên nhân:

- Prompt quá ngắn.
- Thiếu bối cảnh bài toán.
- Không nêu rõ yêu cầu đầu ra.
- Không cung cấp ngôn ngữ lập trình/công nghệ đang dùng.
- Không đưa lỗi cụ thể.
- Không đưa ví dụ input/output.
- Không yêu cầu AI giải thích.
- Hỏi AI làm toàn bộ thay vì hỏi từng phần.

### 7.3. Cách cải thiện prompt

```text
Thêm ví dụ input/output, nêu rõ định dạng hóa đơn (VN), cung cấp sample image links, và yêu cầu output dưới dạng regex/ngôn ngữ cụ thể.
```

### 7.4. Prompt sau khi cải tiến

```text
Viết prompt chi tiết cho React/TypeScript frontend, yêu cầu pipeline tiền xử lý ảnh hóa đơn VN (grayscale, denoise, adaptive threshold, deskew, crop), và đưa ra ví dụ regex để trích `invoice_id`, `total_amount`, `date`.
```

### 7.5. Kết quả sau khi cải tiến prompt

```text
Sau khi cải tiến, prompt cho kết quả thực tế hơn: regex phù hợp hơn, pipeline giảm được tỷ lệ lỗi trong các ảnh thử nghiệm.
```

---

## 8. Bài học về cách viết prompt

### 8.1. Khi viết prompt, em/nhóm cần cung cấp thông tin gì để AI trả lời tốt hơn?

```text
- Mục tiêu cụ thể (ví dụ: tăng accuracy OCR lên X%).
- Bối cảnh (loại hóa đơn, ngôn ngữ, ví dụ ảnh).
- Công nghệ đang dùng (client-side JS, thư viện OCR nào nếu có).
- Định dạng output mong muốn (regex, JSON fields).
- Các ràng buộc (không dùng server-side preprocessing).
```

Gợi ý:

- Mục tiêu cần đạt.
- Bối cảnh bài toán.
- Công nghệ/ngôn ngữ lập trình đang dùng.
- Input/output mong muốn.
- Ràng buộc của đề bài.
- Lỗi đang gặp.
- Format kết quả mong muốn.
- Yêu cầu AI giải thích từng bước.

### 8.2. Em/nhóm đã học được gì về cách đặt câu hỏi cho AI?

```text
Cần cung cấp ví dụ cụ thể và bối cảnh; câu hỏi càng cụ thể càng nhận được kết quả áp dụng được; yêu cầu output có cấu trúc (regex/JSON) giúp tích hợp nhanh vào code.
```

### 8.3. Lần sau em/nhóm sẽ cải thiện prompt như thế nào?

```text
Đưa sample input, rõ ràng định dạng mong muốn, yêu cầu ví dụ test cases và metrics, và iteratively refine prompt based on results.
```

---

## 9. Phân loại prompt đã sử dụng

Đánh dấu số lượng prompt theo từng nhóm.

| Loại prompt | Số lượng | Ví dụ prompt tiêu biểu |
|---|---:|---|
| Prompt phân tích yêu cầu | 1 | Ví dụ: DB schema request |
| Prompt giải thích kiến thức | 1 | Ví dụ: Vite + TS config |
| Prompt thiết kế giải pháp | 1 | Ví dụ: OCR pipeline |
| Prompt thiết kế database | 1 | Ví dụ: Orders schema |
| Prompt sinh code mẫu | 1 | Ví dụ: tiền xử lý ảnh JS snippet |
| Prompt debug lỗi | 1 | Ví dụ: lỗi alias Vite |
| Prompt viết test case | 1 | Ví dụ: test ảnh OCR |
| Prompt review code | 0 |  |
| Prompt tối ưu code | 0 |  |
| Prompt viết báo cáo | 1 | Ví dụ: tóm tắt docs |
| Prompt chuẩn bị thuyết trình | 0 |  |
| Prompt khác | 0 |  |

---

## 10. Checklist chất lượng prompt

Sinh viên/nhóm tự kiểm tra chất lượng prompt đã dùng.

| Tiêu chí | Đã đạt? | Ghi chú |
|---|:---:|---|
| Prompt có mục tiêu rõ ràng | Có | Với prompt OCR và Vite |
| Prompt có đủ bối cảnh | Có | Nếu cung cấp sample image |
| Prompt có nêu công nghệ/ngôn ngữ sử dụng | Có | Nêu React + TypeScript, client-side JS |
| Prompt có nêu yêu cầu đầu ra | Có | Yêu cầu regex/JSON |
| Prompt không yêu cầu AI làm toàn bộ bài một cách máy móc | Có | Hỏi giải pháp, không yêu cầu code hoàn chỉnh |
| Prompt có yêu cầu AI giải thích hoặc phân tích | Có | Yêu cầu các bước tiền xử lý và ví dụ |
| Kết quả AI được kiểm tra lại | Có | Đã test trên ~30 ảnh mẫu |
| Kết quả AI được chỉnh sửa trước khi sử dụng | Có | Điều chỉnh regex và thêm steps xử lý ảnh |
| Prompt quan trọng được ghi lại đầy đủ | Có | Prompt OCR được lưu trong docs |
| Prompt sai/chưa hiệu quả được rút kinh nghiệm | Có | Có ghi prompt chưa hiệu quả và cách cải tiến |


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
|  |  |
