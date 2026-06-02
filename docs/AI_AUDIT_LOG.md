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
| MSSV / Danh sách MSSV | DE180071,DE180096,DE180088,DE180109,DE180104 |
| Giảng viên hướng dẫn | Lê Thiện Nhật Quang |
| Ngày bắt đầu | 17/05/2026 |
| Ngày hoàn thành |  |

---

## 2. Công cụ AI đã sử dụng

Đánh dấu các công cụ AI đã sử dụng trong quá trình thực hiện bài tập/project.

- [x] ChatGPT
- [x] Gemini
- [ ] Claude
- [ ] GitHub Copilot
- [ ] Cursor
- [x] Antigravity
- [ ] Perplexity
- [ ] Microsoft Copilot
- [ ] Công cụ khác: ....................................

---

## 3. Mục tiêu sử dụng AI

### Mô tả mục tiêu sử dụng AI

Nhóm sử dụng AI làm trợ lý kỹ thuật xuyên suốt dự án FleetNova nhằm tối ưu hóa thời gian nghiên cứu công nghệ, xây dựng nhanh các module lõi có yếu tố thông minh (AI/ML) như tối ưu tuyến đường giao hàng, nhận diện hóa đơn và dự báo tài chính. Đồng thời, AI hỗ trợ kiểm tra tính đúng đắn của mã nguồn, phát hiện lỗ hổng logic trong khâu đối soát tài chính COD và dịch thuật/chuẩn hóa các thuật ngữ chuyên ngành Logistics.

---

## 4. Nhật ký sử dụng AI chi tiết

## Log #01
- Date: 2026-05-24
- Author: Vũ Duy Lê (DE180071)
- AI Tool: ChatGPT
- Purpose: Tạo layout cho Sidebar điều phối
- Prompt Reference: PROMPTS.md#prompt-01
- AI Output Summary: Gợi ý sử dụng CSS Flexbox `h-screen` và `overflow-y-auto`
- Human Decision: Thay đổi tông màu nền xám mặc định sang màu xanh navy và bo góc các ô (glass-panel)
- Applied To: FRONTEND/src/layouts/DispatcherLayout.tsx
- Verification: Chạy localhost:5173 và co dãn màn hình để xem hiển thị layout.

## Log #02
- Date: 2026-05-25
- Author: Vũ Duy Lê (DE180071)
- AI Tool: Gemini
- Purpose: Cấu hình Router định tuyến
- Prompt Reference: PROMPTS.md#prompt-02
- AI Output Summary: Gợi ý sử dụng react-router-dom v6 với Routes và Route
- Human Decision: Thay đổi import tương đối và thêm Catch-all Route
- Applied To: FRONTEND/src/App.tsx
- Verification: Click chuyển trang giữa /dispatcher và /driver thành công.

---

## 5. Bảng tổng hợp mức độ sử dụng AI

Đánh dấu mức độ AI hỗ trợ ở từng hạng mục.

| Hạng mục | Không dùng AI | AI hỗ trợ ít | AI hỗ trợ nhiều | AI sinh chính | Ghi chú |
|---|:---:|:---:|:---:|:---:|---|
| Phân tích yêu cầu |  | [x] |  |  |  |
| Viết user story/use case | [x] |  |  |  |  |
| Thiết kế database | [x] |  |  |  |  |
| Thiết kế kiến trúc hệ thống | [x] |  |  |  |  |
| Thiết kế giao diện |  | [x] |  |  |  |
| Code frontend |  | [x] |  |  |  |
| Code backend | [x] |  |  |  |  |
| Debug lỗi |  | [x] |  |  |  |
| Viết test case | [x] |  |  |  |  |
| Kiểm thử sản phẩm | [x] |  |  |  |  |
| Tối ưu code |  | [x] |  |  |  |
| Viết báo cáo |  | [x] |  |  |  |
| Làm slide thuyết trình | [x] |  |  |  |  |

---

## 6. Các lỗi hoặc hạn chế từ AI

Ghi lại các trường hợp AI trả lời sai, thiếu, chưa phù hợp hoặc sinh code không chạy.

| STT | Lỗi/hạn chế từ AI | Cách phát hiện | Cách xử lý/cải tiến |
|---:|---|---|---|
| 1 | Sử dụng class CSS Tailwind cũ không còn hỗ trợ | Trình duyệt không nhận diện được style và hiển thị lệch | Tra cứu lại tài liệu chính thức của Tailwind để cập nhật lại class đúng |
| 2 | Code gợi ý thiếu import thư viện Router | Chương trình báo lỗi compile thiếu định nghĩa | Tự bổ sung thủ công dòng import ở đầu file |

---

## 7. Kiểm chứng kết quả AI

### Nội dung kiểm chứng

```text
Nhóm chạy thử chương trình trên môi trường phát triển cục bộ bằng lệnh npm run dev. Sau đó, các thành viên trực tiếp nhấp chuột tương tác trên các tab để kiểm tra hiển thị giao diện, kiểm tra xem có phát sinh lỗi đỏ trên Console của trình duyệt hay không.
```

---

## 8. Đóng góp cá nhân hoặc đóng góp nhóm

### 8.2. Đối với bài nhóm

| Thành viên | MSSV | Nhiệm vụ chính | Có sử dụng AI không? | Minh chứng đóng góp |
|---|---|---|---|---|
| Vũ Duy Lê | DE180071 | Cấu trúc dự án, điều hướng Router chính | Có | [App.tsx](file:///d:/PRN232/Project/prn232-su26-ai-audit-project-prn232_se18d05_group-06/FRONTEND/src/App.tsx) |
| Nguyễn Văn B | DE180096 | Thiết lập các trang hiển thị Driver | Có | Các tab driver |
| Trần Thị C | DE180088 | Xây dựng CSS và HSL theme | Có | [index.css](file:///d:/PRN232/Project/prn232-su26-ai-audit-project-prn232_se18d05_group-06/FRONTEND/src/index.css) |
| Phạm Văn D | DE180109 | Thiết lập layout, Sidebar, Header | Có | Các components layout |
| Hoàng Thị E | DE180104 | Viết tài liệu dự án, kiểm thử thủ công | Có | File tài liệu |

---

## 9. Reflection cuối bài

### 9.1. AI đã hỗ trợ em/nhóm ở điểm nào?

```text
AI hỗ trợ nhóm tìm hiểu nhanh các class CSS Tailwind để dựng giao diện tĩnh và thiết lập khung layout tổng thể.
```

### 9.2. Phần nào em/nhóm không sử dụng theo gợi ý của AI? Vì sao?

```text
Nhóm không copy các đoạn code logic điều phối phức tạp của AI do không phù hợp với thiết kế tối giản hiện tại và gây khó khăn khi tự debug lỗi.
```

### 9.3. Em/nhóm đã kiểm tra tính đúng đắn của kết quả AI như thế nào?

```text
Chạy dự án trên localhost và trực tiếp nhấp chuột thử nghiệm chức năng trên màn hình.
```

### 9.4. Nếu không có AI, phần nào sẽ khó khăn nhất?

```text
Việc tra cứu các class Tailwind cụ thể để làm giao diện sẽ mất nhiều thời gian hơn.
```

### 9.5. Sau bài tập/project này, em/nhóm học được gì về môn học?

```text
Hiểu về cách bố trí luồng điều hướng của một trang web quản trị và cách làm việc nhóm trên git.
```

### 9.6. Sau bài tập/project này, em/nhóm học được gì về cách sử dụng AI có trách nhiệm?

```text
Nhận ra AI chỉ là trợ lý tham khảo, mọi đoạn code do AI gợi ý cần được hiểu rõ bản chất trước khi đưa vào dự án để tránh phát sinh lỗi hệ thống.
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
| Nhóm trưởng | 02/06/2026 |
