using BACKEND.DTOs;

namespace BACKEND.Services;

public interface IFinanceReconciliationService
{
    Task<PaymentReconciliationListDto> GetReconciliationsAsync(string? status, CancellationToken cancellationToken = default);
    Task<AutoMatchReconciliationResponseDto> AutoMatchAsync(CancellationToken cancellationToken = default);
    Task<ManualMatchReconciliationResponseDto> ManualMatchAsync(ManualMatchReconciliationRequestDto request, CancellationToken cancellationToken = default);
}