using System.ComponentModel.DataAnnotations;

namespace BACKEND.DTOs;

public class CreateStockTransferRequestDto
{
    [Required]
    public int Skuid { get; set; }

    [Required]
    public int FromBinId { get; set; }

    [Required]
    public int ToBinId { get; set; }

    [Required]
    [Range(1, int.MaxValue, ErrorMessage = "Số lượng chuyển phải lớn hơn 0.")]
    public int Quantity { get; set; }
}

public class StockTransferResponseDto
{
    public int TransferId { get; set; }
    public string TransferCode { get; set; } = null!;
    public int Skuid { get; set; }
    public string Skucode { get; set; } = null!;
    public string ProductName { get; set; } = null!;
    
    public int FromBinId { get; set; }
    public string FromBinCode { get; set; } = null!;
    
    public int ToBinId { get; set; }
    public string ToBinCode { get; set; } = null!;
    
    public int Quantity { get; set; }
    public string Status { get; set; } = null!;
    public DateTime? CreatedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    
    public string? CreatedByName { get; set; }
}

public class StockTransferOptionsDto
{
    public List<SkuOptionDto> Skus { get; set; } = new();
    public List<BinOptionDto> FromBins { get; set; } = new();
    public List<BinOptionDto> AllBins { get; set; } = new();
}

public class SkuOptionDto
{
    public int Skuid { get; set; }
    public string Skucode { get; set; } = null!;
    public string ProductName { get; set; } = null!;
}

public class BinOptionDto
{
    public int BinId { get; set; }
    public string BinCode { get; set; } = null!;
    public string ZoneName { get; set; } = null!;
    public int? Skuid { get; set; }
    public int? Quantity { get; set; }
}

public class StockTransferPagedResultDto
{
    public int TotalCount { get; set; }
    public List<StockTransferResponseDto> Items { get; set; } = new();
}
