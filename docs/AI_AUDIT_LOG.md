# AI Audit Log

## 1. Thông tin chung

| Thông tin | Nội dung |
|---|---|
| Môn học |Building Cross-Platform Back-End Application With .NET  |
| Mã môn học | PRN232 |
| Lớp |	SE18D05  |
| Học kỳ | 8 |
| Tên bài tập / Project | FleetNova - Hệ thống Quản trị Logistics Thông minh  |
| Tên sinh viên / Nhóm | Nhóm 6 |
| MSSV / Danh sách MSSV | DE180071,DE180096,DE180088,DE180109,DE180104
| Giảng viên hướng dẫn | Lê Thiện Nhật Quang |
| Ngày bắt đầu | 17/05/2026 |
| Ngày hoàn thành | 02/06/2026 |

---

## 2. Công cụ AI đã sử dụng

Đánh dấu các công cụ AI đã sử dụng trong quá trình thực hiện bài tập/project.

- [x] ChatGPT
- [x] Gemini
- [x] Claude
- [] GitHub Copilot
- [ ] Cursor
- [x] Antigravity
- [ ] Perplexity
- [ ] Microsoft Copilot
- [ ] Công cụ khác: ....................................

---

## 3. Mục tiêu sử dụng AI

Mô tả ngắn gọn sinh viên/nhóm đã sử dụng AI để hỗ trợ những công việc nào.


- Phân tích yêu cầu bài toán
- Gợi ý ý tưởng giải pháp
- Thiết kế database
- Thiết kế giao diện
- Viết code mẫu
- Debug lỗi
- Tối ưu code
- Kiểm tra bảo mật
- Tìm hiểu công nghệ mới

### Mô tả mục tiêu sử dụng AI

Nhóm sử dụng AI làm trợ lý kỹ thuật xuyên suốt dự án FleetNova nhằm tối ưu hóa thời gian nghiên cứu công nghệ, xây dựng nhanh các module lõi có yếu tố thông minh (AI/ML) như tối ưu tuyến đường giao hàng, nhận diện hóa đơn và dự báo tài chính. Đồng thời, AI hỗ trợ kiểm tra tính đúng đắn của mã nguồn, phát hiện lỗ hổng logic trong khâu đối soát tài chính COD và dịch thuật/chuẩn hóa các thuật ngữ chuyên ngành Logistics.

## 4. Nhật ký sử dụng AI chi tiết

> Mỗi lần sử dụng AI cho một phần quan trọng của bài tập/project, sinh viên cần ghi lại theo mẫu bên dưới.  
> Sinh viên/nhóm có thể nhân bản mẫu “Lần sử dụng AI” nhiều lần tùy theo số lần sử dụng AI thực tế.

---

### Lần sử dụng AI số 1

| Nội dung | Thông tin |
|---|---|
| Ngày sử dụng |  |
| Công cụ AI | ChatGPT / Gemini / Claude / GitHub Copilot / Cursor / Antigravity / Khác |
| Mục đích sử dụng |  |
| Phần việc liên quan | Requirement / Design / Database / Frontend / Backend / Testing / Debug / Report / Presentation / Other |
| Mức độ sử dụng | Hỗ trợ ý tưởng / Hỗ trợ một phần / Hỗ trợ nhiều / Sinh chính nội dung |

#### 4.1. Prompt đã sử dụng

```text
Đề xuất schema cho hệ thống quản lý kho/đơn hàng: các bảng Orders, OrderItems, Products, Warehouses, Inventory; các trường chính, khóa ngoại, và các chỉ mục cần thiết cho truy vấn theo order_id, product_id, warehouse_id.
```

#### 4.2. Kết quả AI gợi ý

Tóm tắt nội dung AI đã trả lời hoặc gợi ý.

```text
AI trả về một cấu trúc gợi ý gồm các bảng: Orders, OrderItems, Products, Warehouses, Inventory, Shipments, Users. Đề xuất các quan hệ 1-n và n-n, thêm chỉ mục cho trường tìm kiếm theo mã đơn và trạng thái, và gợi ý một số constraint (unique, not null).
```

#### 4.3. Phần sinh viên/nhóm đã sử dụng từ AI

Mô tả rõ phần nào được sử dụng lại từ gợi ý của AI.

```text
N/A cho phần frontend (Phan không trực tiếp làm database). Phần backend đã dùng gợi ý để tạo migration và model.
```

#### 4.4. Phần sinh viên/nhóm tự chỉnh sửa hoặc cải tiến

Mô tả sinh viên/nhóm đã thay đổi, kiểm tra, sửa lỗi hoặc cải tiến gì so với gợi ý ban đầu của AI.

```text
N/A cho phần frontend. Backend team đã tinh chỉnh schema để thêm chỉ mục cần thiết và tối ưu hóa một số quan hệ.
```

#### 4.5. Minh chứng

| Loại minh chứng | Nội dung |
|---|---|
| Link commit | (backend migration commit - cập nhật bởi backend) |
| File liên quan | backend/models, migrations |
| Screenshot | ERD sơ bộ trong docs/diagrams |
| Kết quả chạy/test | Migration chạy thành công trên môi trường dev |
| Link video demo |  |
| Ghi chú khác | Phần chi tiết schema do backend team cung cấp.

#### 4.6. Nhận xét cá nhân/nhóm

Sinh viên/nhóm học được gì sau lần sử dụng AI này?

```text
Phần frontend (Phan DE180088): học được cách tiền xử lý ảnh cơ bản cho OCR (grayscale, denoise, adaptive threshold, deskew), cách thiết kế regex để trích dữ liệu hóa đơn, và cách tích hợp pipeline client-side vào component React để cho phép kiểm duyệt thủ công.
```


---

### Lần sử dụng AI số 2

| Nội dung | Thông tin |
|---|---|
| Ngày sử dụng | 24/05/2026 |
| Công cụ AI | ChatGPT |
| Mục đích sử dụng | Thiết kế pipeline tiền xử lý ảnh và regex cho OCR hóa đơn |
| Phần việc liên quan | Frontend (OCR integration) |
| Mức độ sử dụng | Hỗ trợ nhiều |

#### 4.1. Prompt đã sử dụng

```text
Viết prompt và pipeline tiền xử lý ảnh để tăng accuracy cho OCR trên hóa đơn: hướng dẫn grayscale, thresholding, deskew, crop region detection, ví dụ regex để trích số tiền, mã hóa đơn, ngày.
```

#### 4.2. Kết quả AI gợi ý

```text
AI gợi ý các bước tiền xử lý (grayscale, denoise, adaptive threshold, deskew), crop vùng chứa thông tin, và ví dụ regex cho số tiền/invoice_id/date. Đưa ra các lưu ý về dữ liệu mẫu để đánh giá accuracy.
```

#### 4.3. Phần sinh viên/nhóm đã sử dụng từ AI

```text
Nhóm (phần của Phan Nguyên Gia Huy) đã áp dụng pipeline tiền xử lý trên ảnh mẫu, tích hợp kết quả OCR vào `OcrExtractedTable`, điều chỉnh regex để phù hợp định dạng hóa đơn Việt Nam và lưu các trường không chắc chắn để kiểm duyệt thủ công.
```

#### 4.4. Phần sinh viên/nhóm tự chỉnh sửa hoặc cải tiến

```text
Phan đã tinh chỉnh regex trích xuất để phù hợp hóa đơn Việt Nam, thêm bước enhance cho ảnh mờ (contrast/denoise) và lưu các mục không chắc chắn để cho phép kiểm duyệt thủ công trong UI. Ngoài ra, tối ưu UI hiển thị để hỗ trợ kiểm duyệt nhanh.
```

#### 4.5. Minh chứng

| Loại minh chứng | Nội dung |
|---|---|
| Link commit | (commit frontend OCR integration) |
| File liên quan | FRONTEND/src/features/warehouse/OcrDropzone.tsx, FRONTEND/src/features/warehouse/OcrExtractedTable.tsx |
| Screenshot | ảnh before/after pipeline (docs/screenshots) |
| Kết quả chạy/test | Test bộ ~30 ảnh mẫu, accuracy cải thiện trên ảnh rõ nét |
| Link video demo |  |
| Ghi chú khác | Một số hóa đơn mờ vẫn cần xử lý thêm.

#### 4.6. Nhận xét cá nhân/nhóm

```text
Prompt và hướng dẫn AI cung cấp rất hữu ích để xác định pipeline nhanh; cần thu thập thêm ảnh mẫu để tăng độ robust. Phan đã test với ~30 ảnh mẫu và điều chỉnh regex theo đặc thù hóa đơn VN.
```

---

### Lần sử dụng AI số 3

| Nội dung | Thông tin |
|---|---|
| Ngày sử dụng | 02/06/2026 |
| Công cụ AI | ChatGPT |
| Mục đích sử dụng | Hướng dẫn cấu hình Vite + React + TypeScript và khắc phục lỗi dev server |
| Phần việc liên quan | Frontend (setup, dev run) |
| Mức độ sử dụng | Hỗ trợ nhiều |

#### 4.1. Prompt đã sử dụng

```text
Hướng dẫn cấu hình Vite cho React + TypeScript, plugin `@vitejs/plugin-react`, cấu hình alias, và cách khắc phục lỗi khi chạy `npm run dev`.
```

#### 4.2. Kết quả AI gợi ý

```text
AI cung cấp checklist `tsconfig.json`, `vite.config.ts`, và các mẹo sửa lỗi. Nhóm (do Phan thực hiện phần frontend) đã áp dụng cấu hình và chạy dev server thành công tại http://localhost:3000.
```

#### 4.3. Phần sinh viên/nhóm đã sử dụng từ AI

```text
Phan đã thêm/điều chỉnh `vite.config.ts` và `tsconfig.json` theo gợi ý, thêm plugin `@vitejs/plugin-react` và xác nhận dev server hoạt động.
```

#### 4.4. Phần sinh viên/nhóm tự chỉnh sửa hoặc cải tiến

```text
Phan cập nhật `vite.config.ts` và `tsconfig.json`, thêm plugin `@vitejs/plugin-react`, cấu hình alias cho đường dẫn, và thêm script `type-check` để kiểm tra tĩnh. Đồng thời tinh chỉnh cấu hình dev để giảm thời gian khởi động và tránh lỗi path khi dùng alias.
```

#### 4.5. Minh chứng

| Loại minh chứng | Nội dung |
|---|---|
| Link commit | Chèn link commit frontend Vite/config khi có |
| File liên quan | FRONTEND/package.json, vite.config.ts, tsconfig.json |
| Screenshot | Screenshot terminal `npm run dev` và cấu hình Vite/React |
| Kết quả chạy/test | Dev server chạy thành công tại http://localhost:3000; test upload OCR với bộ ảnh mẫu (~30 ảnh) |
| Link video demo |  |
| Ghi chú khác | Kiểm tra prompt AI và chỉnh sửa cấu hình theo tài liệu thực tế |

#### 4.6. Nhận xét cá nhân/nhóm

```text
Hướng dẫn AI hữu ích để thiết lập môi trường nhanh; tuy nhiên cần kiểm tra tương thích phiên bản các plugin và test thực tế trước khi áp dụng vào production. Việc kiểm chứng thủ công vẫn cần thiết.
```

---

## 5. Bảng tổng hợp mức độ sử dụng AI

Đánh dấu mức độ AI hỗ trợ ở từng hạng mục.

| Hạng mục | Không dùng AI | AI hỗ trợ ít | AI hỗ trợ nhiều | AI sinh chính | Ghi chú |
|---|:---:|:---:|:---:|:---:|---|
| Phân tích yêu cầu |  | x |  |  | Prompt AI chỉ hỗ trợ bối cảnh chung, không thay thế phân tích yêu cầu nhóm. |
| Viết user story/use case | x |  |  |  | Phần này do nhóm tự thực hiện. |
| Thiết kế database | x |  |  |  | Không phải phần frontend. |
| Thiết kế kiến trúc hệ thống |  | x |  |  | AI hỗ trợ gợi ý cấu trúc frontend/OCR. |
| Thiết kế giao diện |  | x |  |  | AI chỉ đề xuất ý tưởng UI, nhóm tự thiết kế. |
| Code frontend |  |  | x |  | AI hỗ trợ nhiều cho Vite config và pipeline OCR. |
| Code backend | x |  |  |  | Không thực hiện backend. |
| Debug lỗi |  |  | x |  | AI giúp sửa lỗi cấu hình dev và debug Vite. |
| Viết test case |  | x |  |  | AI hỗ trợ ít với đề xuất kiểm thử chung. |
| Kiểm thử sản phẩm |  | x |  |  | AI gợi ý cách kiểm tra nhưng không chạy test thay nhóm. |
| Tối ưu code |  | x |  |  | AI đề xuất tối ưu pipeline và config. |
| Viết báo cáo | x |  |  |  | Không dùng AI cho báo cáo chính. |
| Làm slide thuyết trình | x |  |  |  | Không áp dụng AI cho slide. |

---

## 6. Các lỗi hoặc hạn chế từ AI

Ghi lại các trường hợp AI trả lời sai, thiếu, chưa phù hợp hoặc sinh code không chạy.

| STT | Lỗi/hạn chế từ AI | Cách phát hiện | Cách xử lý/cải tiến |
|---:|---|---|---|
| 1 | Prompt OCR ban đầu thiếu ngữ cảnh định dạng hóa đơn VN | Test với ảnh mẫu cho thấy regex và pipeline chung chung không đủ chính xác | Thêm thông tin định dạng hóa đơn, yêu cầu output regex/JSON cụ thể, và tinh chỉnh theo dữ liệu thực tế |
| 2 | AI gợi ý regex không khớp hoàn toàn với nhiều mẫu hóa đơn | Phát hiện qua kiểm thử ~30 ảnh mẫu và so sánh kết quả với nhãn tay | Chỉnh sửa regex, thêm bước kiểm duyệt thủ công cho trường bất thường, và lưu các giá trị không chắc chắn |
| 3 | Hướng dẫn cấu hình Vite/TS có thể khác phiên bản và gây lỗi nếu dùng nguyên văn | Lỗi chạy `npm run dev` và cảnh báo plugin/alias trên môi trường thực tế | Kiểm tra phiên bản, cập nhật `package.json`, thêm `@vitejs/plugin-react` và script `type-check`, rồi test lại dev server |

---

## 7. Kiểm chứng kết quả AI

Mô tả cách sinh viên/nhóm kiểm tra lại kết quả do AI gợi ý.

Có thể bao gồm:

- Chạy thử chương trình
- Viết test case
- So sánh với yêu cầu đề bài
- Kiểm tra output
- Đối chiếu tài liệu môn học
- Hỏi lại giảng viên
- Review cùng thành viên nhóm
- Kiểm tra lỗi bảo mật
- Kiểm tra bằng dữ liệu mẫu
- So sánh trước và sau khi dùng AI

### Nội dung kiểm chứng

```text
Phan kiểm chứng các phần frontend bằng cách:
- Chạy `npm install` và `npm run dev`, xác nhận Vite ready tại `http://localhost:3000`.
- Kiểm tra tính năng upload OCR với bộ ảnh mẫu (~30 ảnh), so sánh kết quả OCR với nhãn tay và chỉnh regex.
- Peer-review với 1 thành viên để xác nhận UI/UX cho màn hình kiểm duyệt kết quả OCR.
```

---

## 8. Đóng góp cá nhân hoặc đóng góp nhóm

### 8.1. Đối với bài cá nhân

Mô tả phần sinh viên tự làm, phần AI hỗ trợ và phần đã tự cải tiến.

```text
Họ tên: Phan Nguyên Gia Huy
MSSV: DE180088
Phần việc chính: Frontend — triển khai `OcrDropzone`, `OcrExtractedTable`, tích hợp OCR service, xử lý tiền xử lý ảnh client-side cơ bản, và điều chỉnh UI kiểm duyệt.
AI đã hỗ trợ: ChatGPT cho pipeline tiền xử lý ảnh, regex trích xuất, và hướng dẫn cấu hình Vite.
Kiểm chứng: Kiểm thử thủ công trên bộ ảnh mẫu, sửa regex và UI, và xác nhận dev server hoạt động.
```

### 8.2. Đối với bài nhóm

| Thành viên | MSSV | Nhiệm vụ chính | Có sử dụng AI không? | Minh chứng đóng góp |
|---|---|---|---|---|
| Phan Nguyên Gia Huy | DE180088 | Frontend — OCR integration, UI kiểm duyệt | Có | FRONTEND/src/features/warehouse/OcrDropzone.tsx, FRONTEND/src/features/warehouse/OcrExtractedTable.tsx, commit frontend
| Thành viên B | DE180096 | Backend - API & DB | Có / Không |  |
| Thành viên D | DE180109 | Testing & DevOps | Có / Không |  |
| Thành viên E | DE180104 | Documentation & Report | Có / Không |  |

---

## 9. Reflection cuối bài

### 9.1. AI đã hỗ trợ em/nhóm ở điểm nào?

```text
AI hỗ trợ nhanh trong việc gợi ý pipeline OCR (tiền xử lý ảnh, regex), cấu hình môi trường frontend (Vite + React + TS), và đưa ra ví dụ code/snippet để tích hợp nhanh tính năng.
```

### 9.2. Phần nào em/nhóm không sử dụng theo gợi ý của AI? Vì sao?

```text
Một vài gợi ý regex và cấu hình database của AI không được sử dụng nguyên văn vì cần điều chỉnh cho phù hợp dữ liệu thực tế và convention của nhóm; nhóm chỉnh sửa để đảm bảo tương thích và hiệu năng.
```

### 9.3. Em/nhóm đã kiểm tra tính đúng đắn của kết quả AI như thế nào?

```text
Bằng cách chạy dev server, test upload và xử lý OCR trên bộ ảnh mẫu (~30 ảnh), so sánh kết quả với nhãn tay, tinh chỉnh regex và UI; review với 1 thành viên khác trước khi commit.
```

### 9.4. Nếu không có AI, phần nào sẽ khó khăn nhất?

```text
Phần tiền xử lý ảnh và tìm regex phù hợp cho các định dạng hóa đơn sẽ tốn nhiều thời gian hơn; cấu hình nhanh môi trường frontend cũng sẽ chậm hơn nếu không có gợi ý.
```

### 9.5. Sau bài tập/project này, em/nhóm học được gì về môn học?

```text
Học cách tích hợp hệ thống frontend với service AI/OCR, hiểu hơn về flow dữ liệu từ file ảnh đến UI kiểm duyệt, và nâng cao kỹ năng debug cấu hình toolchain (Vite, TypeScript).
```

### 9.6. Sau bài tập/project này, em/nhóm học được gì về cách sử dụng AI có trách nhiệm?

```text
Phải kiểm chứng mọi kết quả AI trước khi sử dụng, ghi lại prompt/kết quả, và chỉ dùng AI như công cụ hỗ trợ chứ không sao chép nguyên văn.
```

---

## 10. Cam kết học thuật

Sinh viên/nhóm cam kết rằng:

- Nội dung AI hỗ trợ đã được ghi nhận trung thực.
- Không nộp nguyên văn kết quả AI mà không kiểm tra.
- Có khả năng giải thích các phần đã nộp.
- Chịu trách nhiệm về tính đúng đắn của sản phẩm cuối cùng.
- Hiểu rằng việc sử dụng AI không khai báo có thể ảnh hưởng đến kết quả đánh giá.

| Đại diện sinh viên/nhóm | Ngày xác nhận |
|---|---|
|  |  |
