using System.Collections.Generic;
using System.Threading.Tasks;
using BACKEND.DTOs;

namespace BACKEND.Services
{
    public interface IStockWriteOffService
    {
        // WF tạo phiếu mới
        Task<StockWriteOffDto> CreateWriteOffAsync(StockWriteOffCreateRequest request, int userId);

        // WF xem phiếu của mình
        Task<IEnumerable<StockWriteOffDto>> GetMyWriteOffsAsync(int userId);

        // ADMIN xem tất cả phiếu
        Task<IEnumerable<StockWriteOffDto>> GetAllWriteOffsAsync();

        // ADMIN xem riêng phiếu đang chờ duyệt
        Task<IEnumerable<StockWriteOffDto>> GetPendingWriteOffsAsync();

        // ADMIN duyệt hoặc từ chối
        Task<StockWriteOffDto> ApproveWriteOffAsync(int writeOffId, StockWriteOffApprovalRequest request, int adminId);
    }
}
