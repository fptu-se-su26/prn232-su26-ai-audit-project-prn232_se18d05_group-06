using BACKEND.DTOs;

namespace BACKEND.Services;

public interface IFinanceReportService
{
    Task<RevenueByServiceDto> GetRevenueByServiceAsync(DateOnly? fromDate, DateOnly? toDate, string? status, CancellationToken cancellationToken = default);
    Task<OperatingExpenseReportDto> GetOperatingExpensesAsync(DateOnly? fromDate, DateOnly? toDate, string? category, CancellationToken cancellationToken = default);
    Task<ProfitReportDto> GetProfitReportAsync(DateOnly? fromDate, DateOnly? toDate, string? period, CancellationToken cancellationToken = default);
}