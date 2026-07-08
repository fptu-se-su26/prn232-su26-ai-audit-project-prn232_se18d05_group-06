using BACKEND.DTOs;

namespace BACKEND.Services;

public interface IFinanceReportExportService
{
    Task<ExportedReportFileDto> ExportAsync(
        string reportType,
        string format,
        DateOnly? fromDate,
        DateOnly? toDate,
        string? status,
        string? category,
        string? period,
        CancellationToken cancellationToken = default);
}