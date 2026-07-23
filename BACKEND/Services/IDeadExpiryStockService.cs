using BACKEND.DTOs;

namespace BACKEND.Services
{
    public interface IDeadExpiryStockService
    {
        /// <summary>
        /// Lấy danh sách hàng tồn lâu / sắp hết hạn với bộ lọc tuỳ chọn.
        /// </summary>
        Task<List<DeadExpiryStockItemDto>> GetItemsAsync(
            string? skuFilter,
            string? alertType,
            string? zoneCode,
            DateOnly? inboundFrom,
            DateOnly? inboundTo,
            DateOnly? expiryFrom,
            DateOnly? expiryTo);

        /// <summary>Lấy số liệu tổng hợp cho 4 summary cards.</summary>
        Task<DeadExpiryStockSummaryDto> GetSummaryAsync();

        /// <summary>Lấy danh sách zone duy nhất để hiển thị dropdown lọc.</summary>
        Task<List<string>> GetDistinctZonesAsync();

        /// <summary>
        /// Xuất danh sách hàng tồn lâu / sắp hết hạn ra Excel hoặc PDF.
        /// </summary>
        Task<(byte[] Content, string FileName, string ContentType)> ExportAsync(
            string format,
            string? skuFilter,
            string? alertType,
            string? zoneCode,
            DateOnly? inboundFrom,
            DateOnly? inboundTo,
            DateOnly? expiryFrom,
            DateOnly? expiryTo);
    }
}
