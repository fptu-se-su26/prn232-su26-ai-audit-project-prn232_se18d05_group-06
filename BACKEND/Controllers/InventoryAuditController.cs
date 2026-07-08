using BACKEND.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Query;

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
                .Include(s => s.StocktakeLines)
                .ThenInclude(l => l.Sku)
                .Include(s => s.Warehouse)
                .FirstOrDefaultAsync(s => s.StocktakeId == stocktakeId);

            if (stocktake == null)
            {
                return NotFound(new { Message = "Stocktake order not found" });
            }

            var auditData = stocktake.StocktakeLines.Select(line => new
            {
                lineId = line.LineId,
                sku = line.Sku?.Skucode ?? "N/A",
                label = line.Sku?.ProductName ?? "Unknown",
                category = line.Sku?.Category?.CategoryName ?? "General",
                systemQty = line.SystemQty,
                actualQty = line.CountedQty ?? 0,
                variance = line.Variance,
                variancePct = line.VariancePct,
                requireRecount = line.RequireRecount,
                note = line.Note
            }).ToList();

            var stats = new
            {
                totalItems = auditData.Count,
                matched = auditData.Count(d => d.actualQty == d.systemQty),
                mismatches = auditData.Count(d => d.actualQty != d.systemQty),
                criticalAlerts = auditData.Count(d => d.variancePct > 10),
                status = stocktake.Status,
                stocktakeDate = stocktake.StocktakeDate,
                warehouse = stocktake.Warehouse?.WarehouseName ?? "Unknown"
            };

            return Ok(new
            {
                stocktakeId = stocktake.StocktakeId,
                stocktakeCode = stocktake.StocktakeCode,
                data = auditData,
                stats = stats
            });
        }

        [HttpGet("stocktake-list")]
        public async Task<IActionResult> GetStocktakeList()
        {
            var stocktakes = await _context.StocktakeOrders
                .Include(s => s.Warehouse)
                .OrderByDescending(s => s.StocktakeDate)
                .Select(s => new
                {
                    stocktakeId = s.StocktakeId,
                    stocktakeCode = s.StocktakeCode,
                    stocktakeDate = s.StocktakeDate,
                    status = s.Status,
                    warehouse = s.Warehouse.WarehouseName,
                    varianceAlert = s.VarianceAlert
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
            line.Variance = line.SystemQty - line.CountedQty;
            line.VariancePct = line.SystemQty > 0 ? (decimal?)Math.Abs((double)line.Variance / line.SystemQty * 100) : null;
            line.RequireRecount = line.VariancePct > 10;

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
