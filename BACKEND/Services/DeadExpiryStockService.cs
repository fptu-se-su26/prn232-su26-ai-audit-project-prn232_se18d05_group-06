using System.Globalization;
using System.Text;
using BACKEND.DTOs;
using BACKEND.Models;
using ClosedXML.Excel;
using Microsoft.EntityFrameworkCore;

namespace BACKEND.Services
{
    public class DeadExpiryStockService : IDeadExpiryStockService
    {
        // Ngưỡng tồn lâu cứng: > 90 ngày
        private const int DeadStockDays = 90;
        // Sắp hết hạn khẩn cấp: <= 7 ngày
        private const int CriticalExpiryDays = 7;
        // Sắp hết hạn thông thường: 8–30 ngày
        private const int WarnExpiryDays = 30;

        private readonly SmartLogAiContext _context;
        private readonly ILogger<DeadExpiryStockService> _logger;

        public DeadExpiryStockService(SmartLogAiContext context, ILogger<DeadExpiryStockService> logger)
        {
            _context = context;
            _logger = logger;
        }

        // ──────────────────────────────────────────────────────────────────────
        // Public API
        // ──────────────────────────────────────────────────────────────────────

        public async Task<List<DeadExpiryStockItemDto>> GetItemsAsync(
            string? skuFilter,
            string? alertType,
            string? zoneCode,
            DateOnly? inboundFrom,
            DateOnly? inboundTo,
            DateOnly? expiryFrom,
            DateOnly? expiryTo)
        {
            var raw = await BuildBaseQueryAsync();
            return ApplyFilters(raw, skuFilter, alertType, zoneCode, inboundFrom, inboundTo, expiryFrom, expiryTo);
        }

        public async Task<DeadExpiryStockSummaryDto> GetSummaryAsync()
        {
            var items = await BuildBaseQueryAsync();
            return new DeadExpiryStockSummaryDto
            {
                DeadStock = items.Count(i => i.AlertType == "DEAD_STOCK"),
                ExpirySoon = items.Count(i => i.AlertType == "EXPIRY_SOON"),
                CriticalExpiry = items.Count(i => i.AlertType == "CRITICAL_EXPIRY"),
                Total = items.Count
            };
        }

        public async Task<List<string>> GetDistinctZonesAsync()
        {
            return await _context.WarehouseZones
                .AsNoTracking()
                .Where(z => z.IsActive != false)
                .OrderBy(z => z.ZoneCode)
                .Select(z => z.ZoneCode)
                .Distinct()
                .ToListAsync();
        }

        public async Task<(byte[] Content, string FileName, string ContentType)> ExportAsync(
            string format,
            string? skuFilter,
            string? alertType,
            string? zoneCode,
            DateOnly? inboundFrom,
            DateOnly? inboundTo,
            DateOnly? expiryFrom,
            DateOnly? expiryTo)
        {
            var raw = await BuildBaseQueryAsync();
            var items = ApplyFilters(raw, skuFilter, alertType, zoneCode, inboundFrom, inboundTo, expiryFrom, expiryTo);
            var today = DateOnly.FromDateTime(DateTime.Today);
            var normalizedFormat = string.IsNullOrWhiteSpace(format) ? "excel" : format.Trim().ToLowerInvariant();

            if (normalizedFormat == "pdf")
            {
                var pdfBytes = BuildPdf(items, today);
                return (pdfBytes, $"dead-expiry-stock-{today:yyyy-MM-dd}.pdf", "application/pdf");
            }
            else
            {
                var excelBytes = BuildExcel(items, today);
                return (excelBytes, $"dead-expiry-stock-{today:yyyy-MM-dd}.xlsx",
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            }
        }

        // ──────────────────────────────────────────────────────────────────────
        // Private Helpers
        // ──────────────────────────────────────────────────────────────────────

        /// <summary>
        /// Query toàn bộ dữ liệu từ view VwDeadAndExpiryStock, JOIN thêm
        /// WarehouseBin → WarehouseShelf → WarehouseZone để lấy ZoneCode/ZoneName.
        /// </summary>
        private async Task<List<DeadExpiryStockItemDto>> BuildBaseQueryAsync()
        {
            try
            {
                // Join Inventory với Bin → Shelf → Zone để lấy thông tin zone
                // Dùng VwDeadAndExpiryStock làm nguồn chính, sau đó enrich zone qua BinCode
                var viewItems = await _context.VwDeadAndExpiryStocks
                    .AsNoTracking()
                    .ToListAsync();

                // Build map BinCode → (ZoneCode, ZoneName)
                // Dùng GroupBy + First để tránh crash nếu BinCode trùng giữa các kho
                var binCodes = viewItems.Select(v => v.BinCode).Distinct().ToList();
                var zoneMap = new Dictionary<string, (string ZoneCode, string ZoneName)>(StringComparer.OrdinalIgnoreCase);

                if (binCodes.Count > 0)
                {
                    var binRows = await _context.WarehouseBins
                        .AsNoTracking()
                        .Where(b => binCodes.Contains(b.BinCode))
                        .Include(b => b.Shelf)
                            .ThenInclude(s => s.Zone)
                        .ToListAsync();

                    foreach (var bin in binRows)
                    {
                        if (!zoneMap.ContainsKey(bin.BinCode))
                        {
                            zoneMap[bin.BinCode] = (
                                bin.Shelf?.Zone?.ZoneCode ?? "",
                                bin.Shelf?.Zone?.ZoneName ?? ""
                            );
                        }
                    }
                }

                var result = viewItems.Select(v =>
                {
                    var hasZone = zoneMap.TryGetValue(v.BinCode, out var zoneInfo);
                    var alertType = ComputeAlertType(v.DaysStored, v.DaysToExpiry);
                    var severity = ComputeSeverity(alertType, v.DaysToExpiry);

                    return new DeadExpiryStockItemDto
                    {
                        Skucode = v.Skucode,
                        ProductName = v.ProductName,
                        CustomerName = v.CustomerName,
                        BinCode = v.BinCode,
                        ZoneCode = hasZone ? zoneInfo.ZoneCode : "",
                        ZoneName = hasZone ? zoneInfo.ZoneName : "",
                        Quantity = v.Quantity,
                        ExpiryDate = v.ExpiryDate?.ToString("yyyy-MM-dd"),
                        InboundDate = v.InboundDate?.ToString("yyyy-MM-dd"),
                        DaysStored = v.DaysStored,
                        DaysToExpiry = v.DaysToExpiry,
                        AlertType = alertType,
                        Severity = severity
                    };
                }).ToList();

                _logger.LogInformation("DeadExpiryStock: fetched {Count} records from view.", result.Count);
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error querying VwDeadAndExpiryStock.");
                throw;
            }
        }

        private static string ComputeAlertType(int? daysStored, int? daysToExpiry)
        {
            // Ưu tiên kiểm tra hạn sử dụng trước
            if (daysToExpiry.HasValue && daysToExpiry.Value <= CriticalExpiryDays)
                return "CRITICAL_EXPIRY";
            if (daysToExpiry.HasValue && daysToExpiry.Value <= WarnExpiryDays)
                return "EXPIRY_SOON";
            // Sau đó kiểm tra tồn lâu
            if (daysStored.HasValue && daysStored.Value > DeadStockDays)
                return "DEAD_STOCK";
            // Fallback: giữ nguyên từ view nếu có
            return "DEAD_STOCK";
        }

        private static string ComputeSeverity(string alertType, int? daysToExpiry)
        {
            return alertType switch
            {
                "CRITICAL_EXPIRY" => "HIGH",
                "EXPIRY_SOON" => "MEDIUM",
                "DEAD_STOCK" => "MEDIUM",
                _ => "LOW"
            };
        }

        private static List<DeadExpiryStockItemDto> ApplyFilters(
            List<DeadExpiryStockItemDto> items,
            string? skuFilter,
            string? alertType,
            string? zoneCode,
            DateOnly? inboundFrom,
            DateOnly? inboundTo,
            DateOnly? expiryFrom,
            DateOnly? expiryTo)
        {
            var result = items.AsEnumerable();

            if (!string.IsNullOrWhiteSpace(skuFilter))
            {
                var keyword = skuFilter.Trim().ToLowerInvariant();
                result = result.Where(i =>
                    (i.Skucode ?? "").ToLowerInvariant().Contains(keyword) ||
                    (i.ProductName ?? "").ToLowerInvariant().Contains(keyword) ||
                    (i.CustomerName ?? "").ToLowerInvariant().Contains(keyword));
            }

            if (!string.IsNullOrWhiteSpace(alertType) && alertType.Trim().ToUpperInvariant() != "ALL")
            {
                var at = alertType.Trim().ToUpperInvariant();
                result = result.Where(i => i.AlertType == at);
            }

            if (!string.IsNullOrWhiteSpace(zoneCode) && zoneCode.Trim().ToUpperInvariant() != "ALL")
            {
                var zc = zoneCode.Trim();
                result = result.Where(i => i.ZoneCode.Equals(zc, StringComparison.OrdinalIgnoreCase));
            }

            if (inboundFrom.HasValue)
            {
                var fromStr = inboundFrom.Value.ToString("yyyy-MM-dd");
                result = result.Where(i => string.Compare(i.InboundDate, fromStr, StringComparison.Ordinal) >= 0);
            }

            if (inboundTo.HasValue)
            {
                var toStr = inboundTo.Value.ToString("yyyy-MM-dd");
                result = result.Where(i => string.Compare(i.InboundDate, toStr, StringComparison.Ordinal) <= 0);
            }

            if (expiryFrom.HasValue)
            {
                var fromStr = expiryFrom.Value.ToString("yyyy-MM-dd");
                result = result.Where(i => i.ExpiryDate != null && string.Compare(i.ExpiryDate, fromStr, StringComparison.Ordinal) >= 0);
            }

            if (expiryTo.HasValue)
            {
                var toStr = expiryTo.Value.ToString("yyyy-MM-dd");
                result = result.Where(i => i.ExpiryDate != null && string.Compare(i.ExpiryDate, toStr, StringComparison.Ordinal) <= 0);
            }

            // Sắp xếp: Critical trước, sau đó theo DaysToExpiry tăng dần, DaysStored giảm dần
            return result
                .OrderBy(i => i.Severity == "HIGH" ? 0 : i.Severity == "MEDIUM" ? 1 : 2)
                .ThenBy(i => i.DaysToExpiry ?? int.MaxValue)
                .ThenByDescending(i => i.DaysStored ?? 0)
                .ToList();
        }

        // ──────────────────────────────────────────────────────────────────────
        // Export helpers
        // ──────────────────────────────────────────────────────────────────────

        private static byte[] BuildExcel(List<DeadExpiryStockItemDto> items, DateOnly reportDate)
        {
            using var workbook = new XLWorkbook();
            var ws = workbook.Worksheets.Add("Dead-Expiry Stock");

            // Tiêu đề
            ws.Cell(1, 1).Value = "Báo cáo Hàng Tồn Lâu / Sắp Hết Hạn";
            ws.Cell(1, 1).Style.Font.Bold = true;
            ws.Cell(1, 1).Style.Font.FontSize = 16;
            ws.Cell(2, 1).Value = $"Ngày xuất: {reportDate:dd/MM/yyyy}  |  Tổng: {items.Count} dòng";

            // Header row
            var headers = new[]
            {
                "Mã SKU", "Tên sản phẩm", "Khách hàng",
                "Bin", "Zone", "Số lượng",
                "Ngày nhập", "Hạn sử dụng",
                "Tồn (ngày)", "Còn lại (ngày)",
                "Loại cảnh báo", "Mức độ"
            };
            for (var i = 0; i < headers.Length; i++)
            {
                ws.Cell(4, i + 1).Value = headers[i];
                ws.Cell(4, i + 1).Style.Font.Bold = true;
                ws.Cell(4, i + 1).Style.Fill.BackgroundColor = XLColor.FromHtml("#1E40AF");
                ws.Cell(4, i + 1).Style.Font.FontColor = XLColor.White;
            }

            // Data rows
            for (var r = 0; r < items.Count; r++)
            {
                var item = items[r];
                var excelRow = r + 5;
                ws.Cell(excelRow, 1).Value = item.Skucode;
                ws.Cell(excelRow, 2).Value = item.ProductName;
                ws.Cell(excelRow, 3).Value = item.CustomerName;
                ws.Cell(excelRow, 4).Value = item.BinCode;
                ws.Cell(excelRow, 5).Value = string.IsNullOrEmpty(item.ZoneName) ? item.ZoneCode : $"{item.ZoneCode} - {item.ZoneName}";
                ws.Cell(excelRow, 6).Value = item.Quantity;
                ws.Cell(excelRow, 7).Value = item.InboundDate ?? "";
                ws.Cell(excelRow, 8).Value = item.ExpiryDate ?? "N/A";
                ws.Cell(excelRow, 9).Value = item.DaysStored?.ToString() ?? "";
                ws.Cell(excelRow, 10).Value = item.DaysToExpiry?.ToString() ?? "N/A";
                ws.Cell(excelRow, 11).Value = MapAlertTypeVi(item.AlertType);
                ws.Cell(excelRow, 12).Value = MapSeverityVi(item.Severity);

                // Tô màu theo mức độ
                var rowColor = item.Severity switch
                {
                    "HIGH" => XLColor.FromHtml("#FEE2E2"),
                    "MEDIUM" => XLColor.FromHtml("#FEF3C7"),
                    _ => XLColor.White
                };
                ws.Row(excelRow).Style.Fill.BackgroundColor = rowColor;
            }

            ws.Columns().AdjustToContents();
            using var stream = new MemoryStream();
            workbook.SaveAs(stream);
            return stream.ToArray();
        }

        private static byte[] BuildPdf(List<DeadExpiryStockItemDto> items, DateOnly reportDate)
        {
            var lines = new List<string>
            {
                "Bao cao Hang Ton Lau / Sap Het Han",
                $"Ngay xuat: {reportDate:dd/MM/yyyy}  |  Tong: {items.Count} dong",
                "",
                "Tong hop:",
                $"  - Hang ton lau (>90 ngay): {items.Count(i => i.AlertType == "DEAD_STOCK")}",
                $"  - Sap het han (8-30 ngay): {items.Count(i => i.AlertType == "EXPIRY_SOON")}",
                $"  - Khan cap (<=7 ngay):     {items.Count(i => i.AlertType == "CRITICAL_EXPIRY")}",
                "",
                "Ma SKU | Ten san pham | Bin | Zone | SL | Ton(ngay) | Con lai(ngay) | Loai"
            };

            lines.AddRange(items.Take(40).Select(i =>
                $"{i.Skucode} | {Truncate(i.ProductName, 20)} | {i.BinCode} | {i.ZoneCode} | {i.Quantity} | {i.DaysStored?.ToString() ?? "-"} | {i.DaysToExpiry?.ToString() ?? "N/A"} | {MapAlertTypeVi(i.AlertType)}"
            ));

            if (items.Count > 40)
                lines.Add($"... con {items.Count - 40} dong khac. Vui long xuat Excel de xem day du.");

            return SimplePdfWriter.Write(lines.Select(ToPdfSafe).ToList());
        }

        private static string Truncate(string value, int max) =>
            value.Length <= max ? value : value[..max] + "...";

        private static string MapAlertTypeVi(string alertType) => alertType switch
        {
            "CRITICAL_EXPIRY" => "Khan cap",
            "EXPIRY_SOON" => "Sap het han",
            "DEAD_STOCK" => "Ton lau",
            _ => alertType
        };

        private static string MapSeverityVi(string severity) => severity switch
        {
            "HIGH" => "Cao",
            "MEDIUM" => "Trung binh",
            "LOW" => "Thap",
            _ => severity
        };

        private static string ToPdfSafe(string value)
        {
            var normalized = value.Normalize(NormalizationForm.FormD);
            var builder = new StringBuilder();
            foreach (var ch in normalized)
            {
                var cat = CharUnicodeInfo.GetUnicodeCategory(ch);
                if (cat == UnicodeCategory.NonSpacingMark) continue;
                builder.Append(ch <= 126 ? ch : ' ');
            }
            return builder.ToString().Normalize(NormalizationForm.FormC);
        }

        // ──────────────────────────────────────────────────────────────────────
        // Minimal PDF writer (reuse same approach as FinanceReportExportService)
        // ──────────────────────────────────────────────────────────────────────
        private static class SimplePdfWriter
        {
            public static byte[] Write(List<string> lines)
            {
                var content = BuildContent(lines);
                var objects = new List<string>
                {
                    "<< /Type /Catalog /Pages 2 0 R >>",
                    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
                    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
                    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
                    $"<< /Length {Encoding.ASCII.GetByteCount(content)} >>\nstream\n{content}\nendstream"
                };

                using var stream = new MemoryStream();
                using var writer = new StreamWriter(stream, Encoding.ASCII, leaveOpen: true);
                writer.WriteLine("%PDF-1.4");
                var offsets = new List<long> { 0 };
                for (var i = 0; i < objects.Count; i++)
                {
                    writer.Flush();
                    offsets.Add(stream.Position);
                    writer.WriteLine($"{i + 1} 0 obj");
                    writer.WriteLine(objects[i]);
                    writer.WriteLine("endobj");
                }

                writer.Flush();
                var xref = stream.Position;
                writer.WriteLine("xref");
                writer.WriteLine($"0 {objects.Count + 1}");
                writer.WriteLine("0000000000 65535 f ");
                foreach (var offset in offsets.Skip(1))
                    writer.WriteLine($"{offset:0000000000} 00000 n ");
                writer.WriteLine("trailer");
                writer.WriteLine($"<< /Size {objects.Count + 1} /Root 1 0 R >>");
                writer.WriteLine("startxref");
                writer.WriteLine(xref);
                writer.WriteLine("%%EOF");
                writer.Flush();
                return stream.ToArray();
            }

            private static string BuildContent(List<string> lines)
            {
                var sb = new StringBuilder();
                sb.AppendLine("BT");
                sb.AppendLine("/F1 9 Tf");
                sb.AppendLine("30 810 Td");
                foreach (var line in lines.Take(50))
                {
                    sb.AppendLine($"({Escape(line)}) Tj");
                    sb.AppendLine("0 -15 Td");
                }
                sb.AppendLine("ET");
                return sb.ToString();
            }

            private static string Escape(string v) =>
                v.Replace("\\", "\\\\").Replace("(", "\\(").Replace(")", "\\)");
        }
    }
}
