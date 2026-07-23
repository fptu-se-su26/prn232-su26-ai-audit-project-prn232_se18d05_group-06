using BACKEND.DTOs;
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
            line.Variance = variance;
            line.VariancePct = variancePct;

            if (variance != 0)
            {
                var ledger = new StockLedger
                {
                    Skuid = line.Skuid,
                    BinId = line.BinId,
                    TxnType = "STOCKTAKE",
                    Qty = variance,
                    QtyBefore = line.SystemQty,
                    QtyAfter = request.CountedQty,
                    RefType = "StocktakeOrder",
                    RefId = stocktakeId,
                    Note = $"Kiểm kê lệch {variance} so với hệ thống",
                    CreatedBy = 1, // Fallback
                    CreatedAt = DateTime.Now
                };
                _context.StockLedgers.Add(ledger);
            }

            await _context.SaveChangesAsync();

            return Ok(new { Message = "Count updated successfully" });
        }

        [HttpGet("comparison")]
        public async Task<IActionResult> GetInventoryComparison([FromQuery] string? zoneCode = null)
        {
            var normalizedZone = string.IsNullOrWhiteSpace(zoneCode) ? null : zoneCode.Trim();

            var inventoryItems = await (from i in _context.Inventories.AsNoTracking()
                                        join b in _context.WarehouseBins.AsNoTracking() on i.BinId equals b.BinId
                                        join sh in _context.WarehouseShelves.AsNoTracking() on b.ShelfId equals sh.ShelfId
                                        join z in _context.WarehouseZones.AsNoTracking() on sh.ZoneId equals z.ZoneId
                                        join s in _context.Skus.AsNoTracking() on i.Skuid equals s.Skuid
                                        where normalizedZone == null || normalizedZone == "All" || z.ZoneCode == normalizedZone
                                        orderby s.Skucode
                                        select new
                                        {
                                            i.InventoryId,
                                            i.Skuid,
                                            SkuCode = s.Skucode,
                                            ProductName = s.ProductName,
                                            i.Quantity,
                                            i.BinId,
                                            BinCode = b.BinCode,
                                            ZoneCode = z.ZoneCode
                                        }).ToListAsync();

            var stocktakeLines = await _context.StocktakeLines
                .AsNoTracking()
                .Where(l => l.Skuid > 0)
                .Select(l => new { l.Skuid, l.BinId, l.CountedQty })
                .ToListAsync();

            var comparisonData = inventoryItems.Select(i =>
            {
                var systemQty = i.Quantity;
                var matchingLine = stocktakeLines.FirstOrDefault(l => l.Skuid == i.Skuid && l.BinId == i.BinId);
                var actualQty = matchingLine?.CountedQty ?? i.Quantity;
                var difference = actualQty - systemQty;
                var variancePct = systemQty > 0 ? (decimal)Math.Abs(difference) * 100 / systemQty : 0;
                var status = difference == 0 ? "Matched" : "Mismatch";

                return new InventoryComparisonDto
                {
                    SkuId = i.Skuid,
                    SkuCode = i.SkuCode ?? "N/A",
                    ProductName = i.ProductName ?? "Unknown",
                    SystemQty = systemQty,
                    ActualQty = actualQty,
                    Difference = difference,
                    VariancePct = Math.Round(variancePct, 2),
                    Status = status,
                    ZoneCode = i.ZoneCode ?? "Unknown",
                    BinCode = i.BinCode ?? "Unknown"
                };
            }).ToList();

            var response = new InventoryComparisonResponseDto
            {
                Data = comparisonData,
                TotalItems = comparisonData.Count,
                Matched = comparisonData.Count(d => d.Status == "Matched"),
                Mismatches = comparisonData.Count(d => d.Status == "Mismatch"),
                ZoneCode = normalizedZone ?? "All"
            };

            return Ok(response);
        }

        [HttpPost("reconcile")]
        public async Task<IActionResult> ReconcileInventory([FromBody] ReconcileRequestDto request)
        {
            if (request.InventoryIds == null || !request.InventoryIds.Any())
            {
                return BadRequest(new { Message = "No inventory IDs provided" });
            }

            var inventoryItems = await _context.Inventories
                .Where(i => request.InventoryIds.Contains(i.InventoryId))
                .ToListAsync();

            foreach (var item in inventoryItems)
            {
                // In real scenario, this would update system qty to match actual qty
                // For now, we'll just update LastCountDate
                item.LastCountDate = DateOnly.FromDateTime(DateTime.Now);
            }

            await _context.SaveChangesAsync();

            return Ok(new { Message = $"Reconciled {inventoryItems.Count} inventory items" });
        }
    }

    public class UpdateCountRequest
    {
        public int LineId { get; set; }
        public int CountedQty { get; set; }
    }
}
