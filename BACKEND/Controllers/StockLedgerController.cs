using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BACKEND.DTOs;
using BACKEND.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BACKEND.Controllers
{
    [ApiController]
    [Route("api/stock-ledger")]
    [Authorize(Roles = "ADMIN,WF")]
    public class StockLedgerController : ControllerBase
    {
        private readonly SmartLogAiContext _context;

        public StockLedgerController(SmartLogAiContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<PagedResult<StockLedgerDto>>> GetLedgers(
            [FromQuery] int? skuId,
            [FromQuery] int? binId,
            [FromQuery] string? txnType,
            [FromQuery] DateTime? fromDate,
            [FromQuery] DateTime? toDate,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            try
            {
                var query = _context.StockLedgers
                    .Include(l => l.Sku)
                    .Include(l => l.Bin).ThenInclude(b => b != null ? b.Shelf : null).ThenInclude(s => s != null ? s.Zone : null)
                    .Include(l => l.CreatedByNavigation)
                    .AsQueryable();

                if (skuId.HasValue)
                {
                    query = query.Where(l => l.Skuid == skuId.Value);
                }

                if (binId.HasValue)
                {
                    query = query.Where(l => l.BinId == binId.Value);
                }

                if (!string.IsNullOrEmpty(txnType))
                {
                    var normalizedType = txnType.ToUpper();
                    // Normalize: treat "WRITEOFF" and "WRITE_OFF" as equivalent
                    if (normalizedType == "WRITEOFF" || normalizedType == "WRITE_OFF")
                    {
                        query = query.Where(l => l.TxnType.ToUpper() == "WRITEOFF" || l.TxnType.ToUpper() == "WRITE_OFF");
                    }
                    else
                    {
                        query = query.Where(l => l.TxnType.ToUpper() == normalizedType);
                    }
                }

                if (fromDate.HasValue)
                {
                    query = query.Where(l => l.CreatedAt >= fromDate.Value.Date);
                }

                if (toDate.HasValue)
                {
                    var endOfDay = toDate.Value.Date.AddDays(1).AddTicks(-1);
                    query = query.Where(l => l.CreatedAt <= endOfDay);
                }

                var totalCount = await query.CountAsync();
                var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

                var items = await query
                    .OrderByDescending(l => l.CreatedAt)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .Select(l => new StockLedgerDto
                    {
                        LedgerId = l.LedgerId,
                        SkuId = l.Skuid,
                        SkuCode = l.Sku.Skucode,
                        SkuName = l.Sku.ProductName,
                        BinId = l.BinId,
                        BinCode = l.Bin != null ? l.Bin.BinCode : null,
                        ZoneName = l.Bin != null && l.Bin.Shelf != null && l.Bin.Shelf.Zone != null ? l.Bin.Shelf.Zone.ZoneName : null,
                        TxnType = l.TxnType,
                        Qty = l.Qty,
                        QtyBefore = l.QtyBefore,
                        QtyAfter = l.QtyAfter,
                        RefType = l.RefType,
                        RefId = l.RefId,
                        Note = l.Note,
                        CreatedByName = l.CreatedByNavigation != null ? l.CreatedByNavigation.FullName : (l.CreatedBy == null ? "System Administrator" : null),
                        CreatedAt = l.CreatedAt
                    })
                    .ToListAsync();

                return Ok(new PagedResult<StockLedgerDto>
                {
                    Data = items,
                    TotalCount = totalCount,
                    Page = page,
                    PageSize = pageSize,
                    TotalPages = totalPages
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpGet("summary")]
        public async Task<ActionResult<StockLedgerSummaryDto>> GetSummary([FromQuery] int skuId)
        {
            try
            {
                var sku = await _context.Skus.FindAsync(skuId);
                if (sku == null) return NotFound(new { message = "SKU không tồn tại" });

                var ledgers = await _context.StockLedgers
                    .Where(l => l.Skuid == skuId)
                    .ToListAsync();

                var currentStock = await _context.Inventories
                    .Where(i => i.Skuid == skuId)
                    .SumAsync(i => i.Quantity);

                var summary = new StockLedgerSummaryDto
                {
                    SkuId = skuId,
                    SkuCode = sku.Skucode,
                    SkuName = sku.ProductName,
                    TotalInbound = ledgers.Where(l => l.TxnType == "INBOUND").Sum(l => l.Qty),
                    TotalOutbound = ledgers.Where(l => l.TxnType == "OUTBOUND").Sum(l => l.Qty),
                    TotalTransferIn = ledgers.Where(l => l.TxnType == "TRANSFER_IN").Sum(l => l.Qty),
                    TotalTransferOut = ledgers.Where(l => l.TxnType == "TRANSFER_OUT").Sum(l => l.Qty),
                    TotalWriteOff = ledgers.Where(l => l.TxnType == "WRITE_OFF" || l.TxnType == "WRITEOFF").Sum(l => l.Qty),
                    TotalStocktakeAdj = ledgers.Where(l => l.TxnType == "STOCKTAKE").Sum(l => l.Qty),
                    CurrentStock = currentStock,
                    TotalTransactions = ledgers.Count
                };

                return Ok(summary);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpGet("sku-list")]
        public async Task<ActionResult<IEnumerable<object>>> GetSkuList()
        {
            try
            {
                // Query from Skus table directly so all SKUs are listed,
                // not just those that already have ledger entries.
                var skus = await _context.Skus
                    .Where(s => s.IsActive != false)
                    .OrderBy(s => s.Skucode)
                    .Select(s => new { s.Skuid, s.Skucode, ProductName = s.ProductName })
                    .ToListAsync();

                return Ok(skus);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

    }
}
