using BACKEND.DTOs;

namespace BACKEND.Services;

public interface IFinancialForecastService
{
    Task<FinancialForecastDashboardDto> GetDashboardAsync();
    Task<FinancialForecastDashboardDto> GenerateAsync(GenerateFinancialForecastRequestDto request);
    Task<AiModelTrainingLogDto> RetrainAsync(RetrainFinancialForecastRequestDto request);
    Task<List<FinancialForecastPointDto>> GetHistoryAsync();
}
