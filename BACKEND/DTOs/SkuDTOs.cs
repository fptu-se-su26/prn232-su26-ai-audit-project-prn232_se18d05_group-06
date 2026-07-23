using System.ComponentModel.DataAnnotations;

namespace BACKEND.DTOs;

// ==================== DTOs for List/Detail ====================

public class SkuListDto
{
    public int SkuId { get; set; }
    public string SkuCode { get; set; } = null!;
    public string? Barcode { get; set; }
    public string? QrCode { get; set; }
    public string ProductName { get; set; } = null!;
    public string? CategoryName { get; set; }
    public string? CustomerName { get; set; }
    public decimal? WeightKg { get; set; }
    public decimal? LengthCm { get; set; }
    public decimal? WidthCm { get; set; }
    public decimal? HeightCm { get; set; }
    public decimal? VolumeCbm { get; set; }
    public string? StorageTemp { get; set; }
    public bool IsFragile { get; set; }
    public bool IsHazmat { get; set; }
    public bool IsHeavy { get; set; }
    public int SafetyMinQty { get; set; }
    public int? ExpiryDays { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public string? TotalStock { get; set; }
}

public class SkuDetailDto : SkuListDto
{
    public int? CategoryId { get; set; }
    public int? CustomerId { get; set; }
    public int SafetyDebounceH { get; set; }
    public string? CreatedByName { get; set; }
}

// ==================== Request DTOs ====================

public class CreateSkuRequest
{
    [Required]
    [MaxLength(50)]
    public string SkuCode { get; set; } = null!;

    [MaxLength(100)]
    public string? Barcode { get; set; }

    [MaxLength(200)]
    public string? QrCode { get; set; }

    [Required]
    [MaxLength(300)]
    public string ProductName { get; set; } = null!;

    public int? CategoryId { get; set; }

    public int? CustomerId { get; set; }

    [Range(0, 999999)]
    public decimal? WeightKg { get; set; }

    [Range(0, 9999)]
    public decimal? LengthCm { get; set; }

    [Range(0, 9999)]
    public decimal? WidthCm { get; set; }

    [Range(0, 9999)]
    public decimal? HeightCm { get; set; }

    [MaxLength(20)]
    public string? StorageTemp { get; set; }

    public bool IsFragile { get; set; } = false;

    public bool IsHazmat { get; set; } = false;

    public bool IsHeavy { get; set; } = false;

    [Range(0, 999999)]
    public int SafetyMinQty { get; set; } = 0;

    [Range(1, 8760)]
    public int SafetyDebounceH { get; set; } = 12;

    [Range(0, 3650)]
    public int? ExpiryDays { get; set; }

    public bool IsActive { get; set; } = true;
}

public class UpdateSkuRequest
{
    [MaxLength(100)]
    public string? Barcode { get; set; }

    [MaxLength(200)]
    public string? QrCode { get; set; }

    [MaxLength(300)]
    public string? ProductName { get; set; }

    public int? CategoryId { get; set; }

    public int? CustomerId { get; set; }

    [Range(0, 999999)]
    public decimal? WeightKg { get; set; }

    [Range(0, 9999)]
    public decimal? LengthCm { get; set; }

    [Range(0, 9999)]
    public decimal? WidthCm { get; set; }

    [Range(0, 9999)]
    public decimal? HeightCm { get; set; }

    [MaxLength(20)]
    public string? StorageTemp { get; set; }

    public bool? IsFragile { get; set; }

    public bool? IsHazmat { get; set; }

    public bool? IsHeavy { get; set; }

    [Range(0, 999999)]
    public int? SafetyMinQty { get; set; }

    [Range(1, 8760)]
    public int? SafetyDebounceH { get; set; }

    [Range(0, 3650)]
    public int? ExpiryDays { get; set; }

    public bool? IsActive { get; set; }
}

// ==================== Search & Filter DTOs ====================

public class SkuSearchRequest
{
    public string? Query { get; set; }
    public int? CategoryId { get; set; }
    public int? CustomerId { get; set; }
    public bool? IsActive { get; set; }
    public bool? IsFragile { get; set; }
    public bool? IsHazmat { get; set; }
    public bool? IsHeavy { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
    public string? SortBy { get; set; } = "CreatedAt";
    public string? SortOrder { get; set; } = "desc";
}

public class SkuPagedResult
{
    public List<SkuListDto> Items { get; set; } = new();
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalPages => (int)Math.Ceiling(TotalCount / (double)PageSize);
    public bool HasPreviousPage => Page > 1;
    public bool HasNextPage => Page < TotalPages;
}

// ==================== Barcode/QR DTOs ====================

public class GenerateBarcodeRequest
{
    public int SkuId { get; set; }
    public int? Width { get; set; }
    public int? Height { get; set; }
}

public class GenerateQrCodeRequest
{
    public int SkuId { get; set; }
    public int? Size { get; set; }
}

// ==================== Import/Export DTOs ====================

public class SkuImportRow
{
    public string? SkuCode { get; set; }
    public string? ProductName { get; set; }
    public string? Barcode { get; set; }
    public string? QrCode { get; set; }
    public string? CategoryName { get; set; }
    public string? CustomerName { get; set; }
    public decimal? WeightKg { get; set; }
    public decimal? LengthCm { get; set; }
    public decimal? WidthCm { get; set; }
    public decimal? HeightCm { get; set; }
    public string? StorageTemp { get; set; }
    public bool? IsFragile { get; set; }
    public bool? IsHazmat { get; set; }
    public bool? IsHeavy { get; set; }
    public int? SafetyMinQty { get; set; }
    public int? ExpiryDays { get; set; }
}

public class SkuImportResult
{
    public int TotalRows { get; set; }
    public int SuccessCount { get; set; }
    public int ErrorCount { get; set; }
    public List<SkuImportError> Errors { get; set; } = new();
}

public class SkuImportError
{
    public int RowNumber { get; set; }
    public string? SkuCode { get; set; }
    public string ErrorMessage { get; set; } = null!;
}

// ==================== Validation DTOs ====================

public class SkuValidationResult
{
    public bool IsValid { get; set; }
    public List<string> Errors { get; set; } = new();
    public string? WarningMessage { get; set; }
}

public class CheckDuplicateRequest
{
    public string? SkuCode { get; set; }
    public string? Barcode { get; set; }
    public string? QrCode { get; set; }
}

public class CheckDuplicateResult
{
    public bool IsDuplicate { get; set; }
    public string DuplicateField { get; set; } = null!;
    public int? ExistingSkuId { get; set; }
    public string? ExistingSkuCode { get; set; }
}
