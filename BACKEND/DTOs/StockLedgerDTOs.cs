using System;
using System.Collections.Generic;

namespace BACKEND.DTOs
{
    public class StockLedgerDto
    {
        public long LedgerId { get; set; }
        public int SkuId { get; set; }
        public string SkuCode { get; set; } = null!;
        public string SkuName { get; set; } = null!;
        public int? BinId { get; set; }
        public string? BinCode { get; set; }
        public string? ZoneName { get; set; }
        public string TxnType { get; set; } = null!;
        public int Qty { get; set; }
        public int QtyBefore { get; set; }
        public int QtyAfter { get; set; }
        public string? RefType { get; set; }
        public int? RefId { get; set; }
        public string? Note { get; set; }
        public string? CreatedByName { get; set; }
        public DateTime? CreatedAt { get; set; }
    }

    public class StockLedgerSummaryDto
    {
        public int SkuId { get; set; }
        public string SkuCode { get; set; } = null!;
        public string SkuName { get; set; } = null!;
        public int TotalInbound { get; set; }
        public int TotalOutbound { get; set; }
        public int TotalTransferIn { get; set; }
        public int TotalTransferOut { get; set; }
        public int TotalWriteOff { get; set; }
        public int TotalStocktakeAdj { get; set; }
        public int CurrentStock { get; set; }
        public int TotalTransactions { get; set; }
    }

    public class PagedResult<T>
    {
        public List<T> Data { get; set; } = new List<T>();
        public int TotalCount { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalPages { get; set; }
    }
}
