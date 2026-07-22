using System;

namespace BACKEND.DTOs
{
    // WF: Tạo phiếu thanh lý mới
    public class StockWriteOffCreateRequest
    {
        public int SkuId { get; set; }
        public int BinId { get; set; }
        public int Quantity { get; set; }
        public string Reason { get; set; } = string.Empty;
    }

    // ADMIN: Duyệt hoặc từ chối phiếu
    public class StockWriteOffApprovalRequest
    {
        public bool Approved { get; set; }
        public string? RejectionNote { get; set; }
    }

    // Response DTO
    public class StockWriteOffDto
    {
        public int WriteOffId { get; set; }
        public string WriteOffCode { get; set; } = null!;
        public int SkuId { get; set; }
        public string SkuCode { get; set; } = null!;
        public string SkuName { get; set; } = null!;
        public int? BinId { get; set; }
        public string? BinCode { get; set; }
        public string? ZoneName { get; set; }
        public int Quantity { get; set; }
        public string? Reason { get; set; }
        public string? Status { get; set; }
        public string? CreatedByName { get; set; }
        public DateTime? CreatedAt { get; set; }
        public string? ApprovedByName { get; set; }
        public DateTime? ApprovedAt { get; set; }
    }
}
