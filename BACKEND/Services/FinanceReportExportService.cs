using System.Globalization;
using System.IO;
using System.Text;
using BACKEND.DTOs;
using ClosedXML.Excel;

namespace BACKEND.Services;

public class FinanceReportExportService : IFinanceReportExportService
{
    private readonly IFinanceReportService _financeReportService;
    private readonly IFinanceReconciliationService _reconciliationService;
    private readonly IFinancialForecastService _forecastService;

    public FinanceReportExportService(
        IFinanceReportService financeReportService,
        IFinanceReconciliationService reconciliationService,
        IFinancialForecastService forecastService)
    {
        _financeReportService = financeReportService;
        _reconciliationService = reconciliationService;
        _forecastService = forecastService;
    }

    public async Task<ExportedReportFileDto> ExportAsync(
        string reportType,
        string format,
        DateOnly? fromDate,
        DateOnly? toDate,
        string? status,
        string? category,
        string? period,
        CancellationToken cancellationToken = default)
    {
        var normalizedReport = NormalizeReportType(reportType);
        var normalizedFormat = string.IsNullOrWhiteSpace(format) ? "excel" : format.Trim().ToLowerInvariant();
        var report = await BuildReportDataAsync(normalizedReport, fromDate, toDate, status, category, period, cancellationToken);
        var extension = normalizedFormat == "pdf" ? "pdf" : "xlsx";
        var contentType = normalizedFormat == "pdf"
            ? "application/pdf"
            : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
        var content = normalizedFormat == "pdf" ? BuildPdf(report) : BuildExcel(report);

        return new ExportedReportFileDto
        {
            FileName = $"{normalizedReport}-{report.FromDate:yyyy-MM-dd}-to-{report.ToDate:yyyy-MM-dd}.{extension}",
            ContentType = contentType,
            Content = content
        };
    }

    private async Task<FinanceExportReportData> BuildReportDataAsync(
        string reportType,
        DateOnly? fromDate,
        DateOnly? toDate,
        string? status,
        string? category,
        string? period,
        CancellationToken cancellationToken)
    {
        var today = DateOnly.FromDateTime(DateTime.Today);
        var fallbackTo = toDate ?? today;
        var fallbackFrom = fromDate ?? fallbackTo.AddMonths(-2);

        switch (reportType)
        {
            case "revenue-by-service":
            {
                var report = await _financeReportService.GetRevenueByServiceAsync(fromDate, toDate, status, cancellationToken);
                return new FinanceExportReportData
                {
                    ReportType = reportType,
                    Title = "Revenue by Service",
                    FromDate = report.FromDate,
                    ToDate = report.ToDate,
                    Summary = [
                        ["Total Revenue", report.TotalRevenue.ToString(CultureInfo.InvariantCulture)],
                        ["Collected Revenue", report.CollectedRevenue.ToString(CultureInfo.InvariantCulture)],
                        ["Top Service Type", report.TopServiceType],
                        ["Invoice Status", report.Status]
                    ],
                    Headers = ["Charge Type", "Recognized Revenue", "Collected Revenue", "Invoice Count", "Percentage"],
                    Rows = report.Items.Select(item => new[]
                    {
                        item.ChargeType,
                        item.TotalAmount.ToString(CultureInfo.InvariantCulture),
                        item.CollectedAmount.ToString(CultureInfo.InvariantCulture),
                        item.InvoiceCount.ToString(CultureInfo.InvariantCulture),
                        item.Percentage.ToString(CultureInfo.InvariantCulture)
                    }).ToList()
                };
            }
            case "operating-expenses":
            {
                var report = await _financeReportService.GetOperatingExpensesAsync(fromDate, toDate, category, cancellationToken);
                return new FinanceExportReportData
                {
                    ReportType = reportType,
                    Title = "Operating Expense Report",
                    FromDate = report.FromDate,
                    ToDate = report.ToDate,
                    Summary = [
                        ["Total Expense", report.TotalExpense.ToString(CultureInfo.InvariantCulture)],
                        ["Top Expense Category", report.TopExpenseCategory],
                        ["Category Filter", report.Category]
                    ],
                    Headers = ["Category", "Total Amount", "Entry Count", "Percentage"],
                    Rows = report.Items.Select(item => new[]
                    {
                        item.Category,
                        item.TotalAmount.ToString(CultureInfo.InvariantCulture),
                        item.EntryCount.ToString(CultureInfo.InvariantCulture),
                        item.Percentage.ToString(CultureInfo.InvariantCulture)
                    }).ToList()
                };
            }
            case "profit":
            case "profit-report":
            {
                var report = await _financeReportService.GetProfitReportAsync(fromDate, toDate, period, cancellationToken);
                return new FinanceExportReportData
                {
                    ReportType = "profit-report",
                    Title = "Profit Report",
                    FromDate = report.FromDate,
                    ToDate = report.ToDate,
                    Summary = [
                        ["Total Revenue", report.TotalRevenue.ToString(CultureInfo.InvariantCulture)],
                        ["Total Expense", report.TotalExpense.ToString(CultureInfo.InvariantCulture)],
                        ["Total Profit", report.TotalProfit.ToString(CultureInfo.InvariantCulture)],
                        ["Profit Margin", report.ProfitMargin.ToString(CultureInfo.InvariantCulture)],
                        ["Period", report.Period]
                    ],
                    Headers = ["Period", "Revenue", "Expense", "Profit", "Profit Margin"],
                    Rows = report.Items.Select(item => new[]
                    {
                        item.Period,
                        item.Revenue.ToString(CultureInfo.InvariantCulture),
                        item.Expense.ToString(CultureInfo.InvariantCulture),
                        item.Profit.ToString(CultureInfo.InvariantCulture),
                        item.ProfitMargin.ToString(CultureInfo.InvariantCulture)
                    }).ToList()
                };
            }
            case "payment-reconciliation":
            {
                var report = await _reconciliationService.GetReconciliationsAsync(status, cancellationToken);
                return new FinanceExportReportData
                {
                    ReportType = reportType,
                    Title = "Payment Reconciliation",
                    FromDate = fallbackFrom,
                    ToDate = fallbackTo,
                    Summary = [
                        ["Total", report.Total.ToString(CultureInfo.InvariantCulture)],
                        ["Matched", report.Matched.ToString(CultureInfo.InvariantCulture)],
                        ["Partial", report.Partial.ToString(CultureInfo.InvariantCulture)],
                        ["Unmatched", report.Unmatched.ToString(CultureInfo.InvariantCulture)],
                        ["Status Filter", string.IsNullOrWhiteSpace(status) ? "ALL" : status.Trim().ToUpperInvariant()]
                    ],
                    Headers = ["Bank Txn Ref", "Bank Date", "Bank Amount", "Invoice", "Invoice Amount", "Payment", "Payment Amount", "Status", "Note"],
                    Rows = report.Items.Select(item => new[]
                    {
                        item.BankTxnRef,
                        item.BankTxnDate.ToString("yyyy-MM-dd"),
                        item.BankAmount.ToString(CultureInfo.InvariantCulture),
                        item.InvoiceNo ?? "",
                        item.InvoiceAmount?.ToString(CultureInfo.InvariantCulture) ?? "",
                        item.PaymentCode ?? "",
                        item.PaymentAmount?.ToString(CultureInfo.InvariantCulture) ?? "",
                        item.Status,
                        item.MatchNote
                    }).ToList()
                };
            }
            case "financial-forecast":
            {
                var report = await _forecastService.GetDashboardAsync();
                return new FinanceExportReportData
                {
                    ReportType = reportType,
                    Title = "AI Financial Trend Forecasting",
                    FromDate = fallbackFrom,
                    ToDate = fallbackTo,
                    Summary = [
                        ["Next Revenue", report.Summary.NextRevenue.ToString(CultureInfo.InvariantCulture)],
                        ["Next Expense", report.Summary.NextExpense.ToString(CultureInfo.InvariantCulture)],
                        ["Next Profit", report.Summary.NextProfit.ToString(CultureInfo.InvariantCulture)],
                        ["Net Cash Flow", report.Summary.NetCashFlow.ToString(CultureInfo.InvariantCulture)],
                        ["Average Confidence", report.Summary.AverageConfidence.ToString(CultureInfo.InvariantCulture)],
                        ["Overall Risk", report.Summary.OverallRisk]
                    ],
                    Headers = ["Month", "Forecast Revenue", "Forecast Expense", "Forecast Profit", "Cash In", "Cash Out", "Confidence", "Risk", "Trend"],
                    Rows = report.Forecasts.Select(item => new[]
                    {
                        item.Month,
                        item.ForecastRevenue.ToString(CultureInfo.InvariantCulture),
                        item.ForecastExpense.ToString(CultureInfo.InvariantCulture),
                        item.ForecastProfit.ToString(CultureInfo.InvariantCulture),
                        item.CashInForecast.ToString(CultureInfo.InvariantCulture),
                        item.CashOutForecast.ToString(CultureInfo.InvariantCulture),
                        item.ConfidenceScore.ToString(CultureInfo.InvariantCulture),
                        item.RiskLevel,
                        item.TrendDirection
                    }).ToList()
                };
            }
            default:
                throw new ArgumentException($"Unsupported reportType: {reportType}");
        }
    }

    private static byte[] BuildExcel(FinanceExportReportData report)
    {
        using var workbook = new XLWorkbook();
        var worksheet = workbook.Worksheets.Add("Report");
        worksheet.Cell(1, 1).Value = report.Title;
        worksheet.Cell(1, 1).Style.Font.Bold = true;
        worksheet.Cell(1, 1).Style.Font.FontSize = 16;
        worksheet.Cell(2, 1).Value = $"From {report.FromDate:yyyy-MM-dd} to {report.ToDate:yyyy-MM-dd}";

        var row = 4;
        worksheet.Cell(row, 1).Value = "Summary";
        worksheet.Cell(row, 1).Style.Font.Bold = true;
        row++;
        foreach (var summary in report.Summary)
        {
            worksheet.Cell(row, 1).Value = summary[0];
            worksheet.Cell(row, 2).Value = summary[1];
            row++;
        }

        row += 2;
        for (var i = 0; i < report.Headers.Count; i++)
        {
            worksheet.Cell(row, i + 1).Value = report.Headers[i];
            worksheet.Cell(row, i + 1).Style.Font.Bold = true;
            worksheet.Cell(row, i + 1).Style.Fill.BackgroundColor = XLColor.FromHtml("#E2E8F0");
        }

        foreach (var dataRow in report.Rows)
        {
            row++;
            for (var i = 0; i < dataRow.Length; i++)
            {
                worksheet.Cell(row, i + 1).Value = dataRow[i];
            }
        }

        worksheet.Columns().AdjustToContents();
        using var stream = new MemoryStream();
        workbook.SaveAs(stream);
        return stream.ToArray();
    }

    private static byte[] BuildPdf(FinanceExportReportData report)
    {
        var lines = new List<string>
        {
            report.Title,
            $"From {report.FromDate:yyyy-MM-dd} to {report.ToDate:yyyy-MM-dd}",
            "",
            "Summary"
        };
        lines.AddRange(report.Summary.Select(item => $"{item[0]}: {item[1]}"));
        lines.Add("");
        lines.Add(string.Join(" | ", report.Headers));
        lines.AddRange(report.Rows.Take(32).Select(row => string.Join(" | ", row)));
        if (report.Rows.Count > 32)
        {
            lines.Add($"... {report.Rows.Count - 32} more rows in Excel export");
        }

        return SimplePdfWriter.Write(lines.Select(ToPdfText).ToList());
    }

    private static string NormalizeReportType(string reportType)
    {
        if (string.IsNullOrWhiteSpace(reportType)) return "revenue-by-service";
        return reportType.Trim().ToLowerInvariant();
    }

    private static string ToPdfText(string value)
    {
        var normalized = value.Normalize(NormalizationForm.FormD);
        var builder = new StringBuilder();
        foreach (var ch in normalized)
        {
            var category = CharUnicodeInfo.GetUnicodeCategory(ch);
            if (category == UnicodeCategory.NonSpacingMark) continue;
            builder.Append(ch <= 126 ? ch : ' ');
        }

        return builder.ToString().Normalize(NormalizationForm.FormC);
    }

    private sealed class FinanceExportReportData
    {
        public string ReportType { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public DateOnly FromDate { get; set; }
        public DateOnly ToDate { get; set; }
        public List<string[]> Summary { get; set; } = new();
        public List<string> Headers { get; set; } = new();
        public List<string[]> Rows { get; set; } = new();
    }

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
            {
                writer.WriteLine($"{offset:0000000000} 00000 n ");
            }
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
            var builder = new StringBuilder();
            builder.AppendLine("BT");
            builder.AppendLine("/F1 10 Tf");
            builder.AppendLine("40 800 Td");
            foreach (var line in lines.Take(44))
            {
                builder.AppendLine($"({Escape(line)}) Tj");
                builder.AppendLine("0 -16 Td");
            }
            builder.AppendLine("ET");
            return builder.ToString();
        }

        private static string Escape(string value)
        {
            return value.Replace("\\", "\\\\").Replace("(", "\\(").Replace(")", "\\)");
        }
    }
}