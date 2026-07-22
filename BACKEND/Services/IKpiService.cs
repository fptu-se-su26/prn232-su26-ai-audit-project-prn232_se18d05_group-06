using BACKEND.DTOs;

namespace BACKEND.Services;

public interface IKpiService
{
    Task<KpiDashboardDto> GetDashboardKpisAsync();
    Task<KpiOverviewDto> GetOverviewKpisAsync();
    Task<KpiWarehouseDto> GetWarehouseKpisAsync();
    Task<KpiDispatcherDto> GetDispatcherKpisAsync();
    Task<KpiFinanceDto> GetFinanceKpisAsync();
    Task<byte[]> ExportKpisAsync(string format, DateTime? fromDate, DateTime? toDate, string reportType);
}
