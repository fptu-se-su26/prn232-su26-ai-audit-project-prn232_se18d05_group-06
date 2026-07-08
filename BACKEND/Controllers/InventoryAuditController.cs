using BACKEND.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BACKEND.Controllers
{
    [Route("api/inventory-audit")]
    [ApiController]
    public class InventoryAuditController : ControllerBase
    {
        private readonly SmartLogAiContext _context;

        public InventoryAuditController(SmartLogAiContext context)
        {
            _context = context;
        }

        [HttpGet("stocktake/{stocktakeId}")]
        public async Task<IActionResult> GetStocktakeAudit(int stocktakeId)
        {
            var stocktake = await _context.StocktakeOrders
                .AsNoTracking()
                .Where(s => s.StocktakeId == stocktakeId)
                .Select(s => new
                {
                    s.StocktakeId,
                    s.StocktakeCode,
                    s.Status,
                    s.StocktakeDate,
                    Warehouse = s.Warehouse != null ? s.Warehouse.WarehouseName : "Unknown",
                    Lines = s.StocktakeLines.Select(line => new
                    {
                        lineId = line.LineId,
                        sku = line.Sku != null ? line.Sku.Skucode : "N/A",
                        label = line.Sku != null ? line.Sku.ProductName : "Unknown",
                        category = line.Sku != null && line.Sku.Category != null ? line.Sku.Category.CategoryName : "General",
                        systemQty = line.SystemQty,
                        actualQty = line.CountedQty ?? 0,
                        variance = line.Variance ?? ((line.CountedQty ?? 0) - line.SystemQty),
                        variancePct = line.VariancePct,
                        requireRecount = line.RequireRecount ?? false,
                        note = line.Note
                    }).ToList()
                })
                .FirstOrDefaultAsync();

            if (stocktake == null)
            {
                return NotFound(new { Message = "Stocktake order not found" });
            }

            var auditData = stocktake.Lines;
            var stats = new
            {
                totalItems = auditData.Count,
                matched = auditData.Count(d => d.actualQty == d.systemQty),
                mismatches = auditData.Count(d => d.actualQty != d.systemQty),
                criticalAlerts = auditData.Count(d => Math.Abs(d.variance) > 0 && d.variancePct.HasValue && Math.Abs(d.variancePct.Value) > 10),
                status = stocktake.Status,
                stocktakeDate = stocktake.StocktakeDate,
                warehouse = stocktake.Warehouse
            };

            return Ok(new
            {
                stocktakeId = stocktake.StocktakeId,
                stocktakeCode = stocktake.StocktakeCode,
                data = auditData,
                stats
            });
        }

        [HttpGet("stocktake-list")]
        public async Task<IActionResult> GetStocktakeList()
        {
            var stocktakes = await _context.StocktakeOrders
                .AsNoTracking()
                .OrderByDescending(s => s.StocktakeDate)
                .Select(s => new
                {
                    stocktakeId = s.StocktakeId,
                    stocktakeCode = s.StocktakeCode,
                    stocktakeDate = s.StocktakeDate,
                    status = s.Status,
                    warehouse = s.Warehouse != null ? s.Warehouse.WarehouseName : "Unknown",
                    varianceAlert = s.VarianceAlert ?? false
                })
                .ToListAsync();

            return Ok(stocktakes);
        }

        [HttpPost("stocktake/{stocktakeId}/update-count")]
        public async Task<IActionResult> UpdateCountedQty(int stocktakeId, [FromBody] UpdateCountRequest request)
        {
            var line = await _context.StocktakeLines
                .FirstOrDefaultAsync(l => l.LineId == request.LineId && l.StocktakeId == stocktakeId);

            if (line == null)
            {
                return NotFound(new { Message = "Stocktake line not found" });
            }

            line.CountedQty = request.CountedQty;

            var variance = request.CountedQty - line.SystemQty;
            var variancePct = line.SystemQty > 0
                ? Math.Abs((decimal)variance * 100m / line.SystemQty)
                : 0m;
            line.RequireRecount = variancePct > 10m;

            await _context.SaveChangesAsync();

            return Ok(new { Message = "Count updated successfully" });
        }
    }

    public class UpdateCountRequest
    {
        public int LineId { get; set; }
        public int CountedQty { get; set; }
    }
}
