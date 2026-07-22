namespace BACKEND.DTOs
{
    /// <summary>
    /// Một dòng dữ liệu hàng tồn lâu / sắp hết hạn trả về cho client.
    /// </summary>
    public class DeadExpiryStockItemDto
    {
        public string Skucode { get; set; } = null!;
        public string ProductName { get; set; } = null!;
        public string CustomerName { get; set; } = null!;
        public string BinCode { get; set; } = null!;

        /// <summary>Tên khu vực (Zone) — lấy qua Bin → Shelf → Zone.</summary>
        public string ZoneCode { get; set; } = null!;
        public string ZoneName { get; set; } = null!;

        public int Quantity { get; set; }

        /// <summary>Ngày hết hạn, định dạng yyyy-MM-dd.</summary>
        public string? ExpiryDate { get; set; }

        /// <summary>Ngày nhập kho, định dạng yyyy-MM-dd.</summary>
        public string? InboundDate { get; set; }

        /// <summary>Số ngày đã tồn kho.</summary>
        public int? DaysStored { get; set; }

        /// <summary>Số ngày còn đến hạn sử dụng (âm = đã hết hạn).</summary>
        public int? DaysToExpiry { get; set; }

        /// <summary>DEAD_STOCK | EXPIRY_SOON | CRITICAL_EXPIRY</summary>
        public string AlertType { get; set; } = null!;

        /// <summary>HIGH | MEDIUM | LOW</summary>
        public string Severity { get; set; } = null!;
    }

    /// <summary>
    /// Thống kê tổng hợp cho 4 summary cards.
    /// </summary>
    public class DeadExpiryStockSummaryDto
    {
        /// <summary>Hàng tồn > 90 ngày.</summary>
        public int DeadStock { get; set; }

        /// <summary>Hàng sắp hết hạn (8–30 ngày).</summary>
        public int ExpirySoon { get; set; }

        /// <summary>Hàng hết hạn trong 7 ngày hoặc đã quá hạn.</summary>
        public int CriticalExpiry { get; set; }

        public int Total { get; set; }
    }
}
