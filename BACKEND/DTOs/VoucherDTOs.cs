using System;

namespace BACKEND.DTOs
{
    public class VoucherDto
    {
        public int VoucherId { get; set; }
        public string VoucherCode { get; set; } = null!;
        public string? CustomerTier { get; set; }
        public int? CustomerId { get; set; }
        public decimal? DiscountPct { get; set; }
        public decimal? DiscountAmount { get; set; }
        public decimal? MinOrderValue { get; set; }
        public DateOnly ValidFrom { get; set; }
        public DateOnly ValidTo { get; set; }
        public bool? IsUsed { get; set; }
        public DateTime? UsedAt { get; set; }
        public DateTime? CreatedAt { get; set; }
    }

    public class CreateVoucherDto
    {
        public string VoucherCode { get; set; } = null!;
        public string? CustomerTier { get; set; }
        public int? CustomerId { get; set; }
        public decimal? DiscountPct { get; set; }
        public decimal? DiscountAmount { get; set; }
        public decimal? MinOrderValue { get; set; }
        public DateOnly ValidFrom { get; set; }
        public DateOnly ValidTo { get; set; }
    }

    public class UpdateVoucherDto
    {
        public string VoucherCode { get; set; } = null!;
        public string? CustomerTier { get; set; }
        public int? CustomerId { get; set; }
        public decimal? DiscountPct { get; set; }
        public decimal? DiscountAmount { get; set; }
        public decimal? MinOrderValue { get; set; }
        public DateOnly ValidFrom { get; set; }
        public DateOnly ValidTo { get; set; }
        public bool? IsUsed { get; set; }
    }

    public class AppliedVoucherResponseDto
    {
        public int VoucherId { get; set; }
        public string VoucherCode { get; set; } = null!;
        public decimal DiscountAmount { get; set; }
        public decimal OriginalAmount { get; set; }
        public decimal FinalAmount { get; set; }
        public string AppliedTier { get; set; } = null!;
    }
}
