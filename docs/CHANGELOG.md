# Changelog

## 1. Quy định ghi Changelog

File này dùng để ghi lại các thay đổi quan trọng trong quá trình thực hiện bài tập, lab, assignment hoặc project.

Nguyên tắc ghi changelog:

- Chỉ ghi những gì đã hoàn thành thật sự.
- Không ghi kế hoạch nếu chưa thực hiện.
- Mỗi thay đổi nên có ngày, nội dung, người thực hiện và minh chứng.
- Nếu có AI hỗ trợ, cần ghi rõ AI đã hỗ trợ phần nào.
- Nếu có commit GitHub, cần ghi link commit.
- Nếu có lỗi đã sửa, cần ghi rõ lỗi, nguyên nhân và cách xử lý.

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
| Repository URL | (chèn URL repository) |
| Ngày bắt đầu | 17/05/2026 |
| Ngày hoàn thành | 02/06/2026 |

---

## 3. Tổng quan các phiên bản/giai đoạn 

| Phiên bản/Giai đoạn | Thời gian | Nội dung chính | Trạng thái |
|---|---|---|---|
| Phase 01 |  | Khởi tạo project | Not Started / In Progress / Completed |
| Phase 02 |  | Phân tích yêu cầu | Not Started / In Progress / Completed |
| Phase 03 |  | Thiết kế hệ thống | Not Started / In Progress / Completed |
| Phase 04 |  | Implementation | Not Started / In Progress / Completed |
| Phase 05 |  | Testing & Debug | Not Started / In Progress / Completed |
| Phase 06 |  | Hoàn thiện báo cáo và demo | Not Started / In Progress / Completed |

---

# [Phase 01] Khởi tạo project

## Ngày thực hiện

```text
DD/MM/YYYY
```

## Đã hoàn thành

- [ ] Tạo repository
- [ ] Tạo cấu trúc thư mục project
- [ ] Tạo file README.md
- [ ] Tạo thư mục `docs/`
- [ ] Tạo file `AI_AUDIT_LOG.md`
- [ ] Tạo file `PROMPTS.md`
- [ ] Tạo file `REFLECTION.md`
- [ ] Tạo file `CHANGELOG.md`
- [ ] Khởi tạo source code ban đầu
- [ ] Cài đặt thư viện/công cụ cần thiết
- [ ] Cấu hình môi trường chạy project

## Thay đổi chi tiết

| STT | Nội dung thay đổi | Người thực hiện | File/Module liên quan | Minh chứng |
|---:|---|---|---|---|
| 1 | Khởi tạo frontend bằng Vite + React; thêm cấu trúc ban đầu | Nhóm 6 | FRONTEND/ | package.json, terminal output
| 2 | Triển khai tính năng OCR frontend: `OcrDropzone`, `OcrExtractedTable`, tích hợp service OCR | Phan Nguyên Gia Huy (DE180088) | FRONTEND/src/features/warehouse/ | commit frontend
| 3 | Cập nhật cấu hình dev (Vite, tsconfig) và khởi chạy dev server | Phan Nguyên Gia Huy (DE180088) | FRONTEND/ | terminal output

## AI có hỗ trợ không?
- [x] Có
- [ ] Không

Nếu có, mô tả AI đã hỗ trợ phần nào:

```text
AI hỗ trợ cấu hình Vite + TypeScript (guide, fix alias), và tối ưu pipeline tiền xử lý ảnh cho OCR trên frontend (grayscale, threshold, deskew, crop, regex ví dụ). Phan (DE180088) áp dụng các hướng dẫn này để khởi tạo frontend và tích hợp OCR.
```

## Commit/Screenshot minh chứng

```text
Minh chứng frontend: terminal output khi chạy `npm run dev` (VITE v5.4.21 ready - http://localhost:3000/); files: FRONTEND/src/features/warehouse/OcrDropzone.tsx, OcrExtractedTable.tsx, FRONTEND/package.json, vite.config.ts. Commit: (chèn link commit frontend khi có).
```

## Ghi chú

```text
Ghi chú: Phan đảm nhiệm khởi tạo frontend bằng Vite, cấu hình TS, và phần tích hợp OCR. Một số minh chứng (commit URLs, screenshots) cần được cập nhật sau khi commit lên repository.
```

---

# [Phase 02] Phân tích yêu cầu

## Ngày thực hiện

```text
DD/MM/YYYY
```

## Đã hoàn thành

- [ ] Xác định problem statement
- [ ] Xác định user roles
- [ ] Viết user stories
- [ ] Viết use cases
- [ ] Xác định functional requirements
- [ ] Xác định non-functional requirements
- [ ] Xác định business rules
- [ ] Xác định acceptance criteria
- [ ] Review yêu cầu với giảng viên/nhóm
- [ ] Chỉnh sửa yêu cầu sau feedback

## Thay đổi chi tiết

| STT | Nội dung thay đổi | Người thực hiện | File/Module liên quan | Minh chứng |
|---:|---|---|---|---|
| 1 |  |  |  |  |
| 2 |  |  |  |  |
| 3 |  |  |  |  |

## AI có hỗ trợ không?

- [x] Có
- [ ] Không

Nếu có, mô tả AI đã hỗ trợ phần nào:

```text
Frontend: AI hỗ trợ chọn cấu trúc workflow OCR và xác nhận các bước tiền xử lý ảnh để giảm lỗi trên client-side.
```

## Commit/Screenshot minh chứng

```text
Minh chứng: cập nhật docs/PROMPTS.md, AI_AUDIT_LOG.md, và FRONTEND/src/features/warehouse/OcrDropzone.tsx.
```

## Ghi chú

```text
Phan DE180088 chịu trách nhiệm frontend; cần bổ sung commit link repo sau khi push.
```

---

# [Phase 03] Thiết kế hệ thống

## Ngày thực hiện

```text
DD/MM/YYYY
```

## Đã hoàn thành

- [ ] Thiết kế kiến trúc tổng quan
- [ ] Thiết kế database/ERD
- [ ] Thiết kế API
- [ ] Thiết kế giao diện/wireframe
- [ ] Thiết kế flow xử lý
- [ ] Thiết kế class diagram
- [ ] Thiết kế sequence diagram
- [ ] Thiết kế security/authorization flow
- [ ] Review thiết kế
- [ ] Chỉnh sửa thiết kế sau feedback

## Thay đổi chi tiết

| STT | Nội dung thay đổi | Người thực hiện | File/Module liên quan | Minh chứng |
|---:|---|---|---|---|
| 1 |  |  |  |  |
| 2 |  |  |  |  |
| 3 |  |  |  |  |

## AI có hỗ trợ không?

- [x] Có
- [ ] Không

Nếu có, mô tả AI đã hỗ trợ phần nào:

```text
AI giúp review cấu hình frontend và xác nhận thiết kế interface OCR trước khi triển khai.
```

## Commit/Screenshot minh chứng

```text
Minh chứng: notes thiết kế frontend, prompt docs, và terminal output khi chạy dev server.
```

## Ghi chú

```text
Nội dung frontend thiết kế và AI review đã được ghi nhận; cần hoàn thiện link minh chứng commit.
```

---

# [Phase 04] Implementation

## Ngày thực hiện

```text
DD/MM/YYYY
```

## Đã hoàn thành

- [ ] Tạo project structure
- [ ] Cài đặt database connection
- [ ] Xây dựng backend
- [ ] Xây dựng frontend
- [ ] Xây dựng authentication/authorization
- [ ] Xử lý CRUD
- [ ] Xử lý validation
- [ ] Tích hợp API
- [ ] Xử lý upload/download file
- [ ] Xử lý lỗi
- [ ] Tối ưu giao diện
- [ ] Cập nhật README hướng dẫn chạy

## Thay đổi chi tiết

| STT | Nội dung thay đổi | Người thực hiện | File/Module liên quan | Minh chứng |
|---:|---|---|---|---|
| 1 | Khởi tạo frontend bằng Vite + React + TypeScript | Phan Nguyên Gia Huy (DE180088) | FRONTEND/ | package.json, terminal output
| 2 | Thêm tính năng OCR frontend: `OcrDropzone`, `OcrExtractedTable`, logic tiền xử lý ảnh | Phan Nguyên Gia Huy (DE180088) | FRONTEND/src/features/warehouse/ | code files
| 3 | Cập nhật cấu hình dev (vite, tsconfig) và thêm script `type-check` | Phan Nguyên Gia Huy (DE180088) | FRONTEND/ | commit / terminal output
| 4 | Kiểm thử OCR trên ~30 ảnh mẫu, điều chỉnh regex và xử lý ảnh | Phan Nguyên Gia Huy (DE180088) | FRONTEND/tests or local samples | test notes
| 5 | Ghi nhận và lưu prompt + log AI liên quan cấu hình và OCR | Phan Nguyên Gia Huy (DE180088) | docs/PROMPTS.md, docs/AI_AUDIT_LOG.md | docs updates

## AI có hỗ trợ không?

- [ ] Có
- [ ] Không

Nếu có, mô tả AI đã hỗ trợ phần nào:

```text
Frontend: Có — Vite config guide, OCR preprocessing pipeline, regex examples.
```

## Commit/Screenshot minh chứng

```text
Minh chứng: terminal output, FRONTEND/src/features/warehouse/OcrDropzone.tsx, OcrExtractedTable.tsx. (Chèn link commit sau khi push.)
```

## Ghi chú

```text
Ghi chú: Nội dung liên quan frontend đã được thực hiện bởi Phan; các link commit cần cập nhật sau khi push.
```

---

# [Phase 05] Testing & Debug

## Ngày thực hiện

```text
DD/MM/YYYY
```

## Đã hoàn thành

- [ ] Viết test case
- [ ] Chạy test chức năng chính
- [ ] Kiểm tra output
- [ ] Kiểm tra validation
- [ ] Kiểm tra lỗi giao diện
- [ ] Kiểm tra lỗi database
- [ ] Kiểm tra phân quyền
- [ ] Kiểm tra bảo mật cơ bản
- [ ] Fix bug
- [ ] Chạy lại sau khi fix bug
- [ ] Ghi nhận kết quả test

## Danh sách lỗi đã xử lý

| STT | Lỗi phát hiện | Nguyên nhân | Cách xử lý | Trạng thái |
|---:|---|---|---|---|
| 1 |  |  |  | Open / Fixed / Pending |
| 2 |  |  |  | Open / Fixed / Pending |
| 3 |  |  |  | Open / Fixed / Pending |
| 4 |  |  |  | Open / Fixed / Pending |
| 5 |  |  |  | Open / Fixed / Pending |

## Thay đổi chi tiết

| STT | Nội dung thay đổi | Người thực hiện | File/Module liên quan | Minh chứng |
|---:|---|---|---|---|
| 1 |  |  |  |  |
| 2 |  |  |  |  |
| 3 |  |  |  |  |

## AI có hỗ trợ không?

- [ ] Có
- [ ] Không

Nếu có, mô tả AI đã hỗ trợ phần nào:

```text
Frontend testing: Có — AI gợi ý metrics và test pipeline; Phan dùng để lên danh sách ảnh thử nghiệm và phương pháp kiểm chứng.
```

## Commit/Screenshot minh chứng

```text
Minh chứng testing frontend: notes về ~30 ảnh mẫu đã thử nghiệm, log kiểm tra kết quả OCR, và screenshot bảng `OcrExtractedTable` khi review.
```

## Ghi chú

```text
Ghi chú: Một số lỗi liên quan đến regex và tiền xử lý ảnh đã được sửa thủ công; cần lưu kết quả test chi tiết trước khi nộp.
```

---

# [Phase 06] Hoàn thiện báo cáo và demo

## Ngày thực hiện

```text
DD/MM/YYYY
```

## Đã hoàn thành

- [ ] Hoàn thiện source code
- [ ] Hoàn thiện README.md
- [ ] Hoàn thiện report
- [ ] Hoàn thiện slide
- [ ] Hoàn thiện video demo
- [ ] Kiểm tra lại `AI_AUDIT_LOG.md`
- [ ] Kiểm tra lại `PROMPTS.md`
- [ ] Hoàn thiện `REFLECTION.md`
- [ ] Kiểm tra lại `CHANGELOG.md`
- [ ] Đóng gói bài nộp

## Thay đổi chi tiết

| STT | Nội dung thay đổi | Người thực hiện | File/Module liên quan | Minh chứng |
|---:|---|---|---|---|
| 1 |  |  |  |  |
| 2 |  |  |  |  |
| 3 |  |  |  |  |

## AI có hỗ trợ không?

- [ ] Có
- [ ] Không

Nếu có, mô tả AI đã hỗ trợ phần nào:

```text
Có — AI hỗ trợ soạn nội dung docs, tóm tắt prompt và gợi ý reflection.
```

## Commit/Screenshot minh chứng

```text
Minh chứng: cập nhật docs/PROMPTS.md, AI_AUDIT_LOG.md, REFLECTION.md (các thay đổi do Phan); chèn link commit khi available.
```

## Ghi chú

```text
Ghi chú: Sau khi hoàn tất, nhóm cần commit và cập nhật link minh chứng trong changelog.
```

---

# 4. Tổng kết thay đổi cuối project

## 4.1. Các chức năng đã hoàn thành

| STT | Chức năng | Trạng thái | Minh chứng | Ghi chú |
|---:|---|---|---|---|
| 1 |  | Completed / Partial / Not Completed |  |  |
| 2 |  | Completed / Partial / Not Completed |  |  |
| 3 |  | Completed / Partial / Not Completed |  |  |
| 4 |  | Completed / Partial / Not Completed |  |  |
| 5 |  | Completed / Partial / Not Completed |  |  |

---

## 4.2. Các chức năng chưa hoàn thành

| STT | Chức năng | Lý do chưa hoàn thành | Hướng cải thiện |
|---:|---|---|---|
| 1 |  |  |  |
| 2 |  |  |  |
| 3 |  |  |  |

---

## 4.3. Tổng hợp AI hỗ trợ trong project

| Hạng mục | AI có hỗ trợ không? | Mức độ hỗ trợ | Ghi chú |
|---|---|---|---|
| Requirement | Có / Không | Ít / Trung bình / Nhiều |  |
| Design | Có / Không | Ít / Trung bình / Nhiều |  |
| Database | Có / Không | Ít / Trung bình / Nhiều |  |
| Coding | Có / Không | Ít / Trung bình / Nhiều |  |
| Debug | Có / Không | Ít / Trung bình / Nhiều |  |
| Testing | Có / Không | Ít / Trung bình / Nhiều |  |
| Report | Có / Không | Ít / Trung bình / Nhiều |  |
| Presentation | Có / Không | Ít / Trung bình / Nhiều |  |

---

## 4.4. Bài học rút ra

```text
Frontend lessons: học được cách cấu hình Vite+TS, hiểu các bước tiền xử lý ảnh cơ bản cho OCR, và tầm quan trọng của kiểm chứng kết quả AI bằng dữ liệu thực tế.
```

---

## 4.5. Hướng cải thiện tiếp theo

```text
Hướng cải thiện: Tối ưu pipeline tiền xử lý bằng benchmark trên nhiều ảnh, tự động hóa test OCR, ghi commit và screenshots làm minh chứng, và cải thiện UX cho kiểm duyệt kết quả OCR.
```

---

# 5. Cam kết cập nhật Changelog

Sinh viên/nhóm cam kết rằng nội dung changelog phản ánh đúng các thay đổi đã thực hiện trong quá trình làm bài tập/project.

| Đại diện sinh viên/nhóm | Ngày xác nhận |
|---|---|
|  |  |
