using BACKEND.DTOs;

namespace BACKEND.Services;

public interface IStockTransferService
{
    Task<StockTransferResponseDto> CreateTransferAsync(CreateStockTransferRequestDto request, int? userId);
    Task<StockTransferPagedResultDto> GetTransferHistoryAsync(int page = 1, int pageSize = 10);
    Task<StockTransferOptionsDto> GetOptionsAsync();
}
