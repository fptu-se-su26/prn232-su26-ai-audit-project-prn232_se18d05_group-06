using System.Collections.Generic;
using System.Threading.Tasks;
using BACKEND.DTOs;

namespace BACKEND.Services
{
    public interface IStockTransferService
    {
        Task<StockTransferDto> CreateTransferAsync(StockTransferCreateRequest request, int userId);
        Task<IEnumerable<StockTransferDto>> GetTransfersAsync();
        Task<IEnumerable<BinInventoryDto>> GetBinInventoryAsync(int binId);
    }
    
    public class BinInventoryDto
    {
        public int SkuId { get; set; }
        public string SkuCode { get; set; } = null!;
        public string SkuName { get; set; } = null!;
        public int Quantity { get; set; }
    }
}
