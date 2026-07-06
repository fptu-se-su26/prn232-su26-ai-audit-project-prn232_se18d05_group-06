using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using BACKEND.DTOs;
using BACKEND.Models;
using ClosedXML.Excel;
using Microsoft.EntityFrameworkCore;

namespace BACKEND.Services
{
    public class ReconciliationService : IReconciliationService
    {
        private readonly SmartLogAiContext _context;

        public ReconciliationService(SmartLogAiContext context)
        {
            _context = context;
        }

        public async Task<ReconciliationResult> ReconcileAsync(ReconciliationRequest request)
        {
            if (request.ActualCountFile == null || request.ActualCountFile.Length == 0)
            {
                throw new ArgumentException("No file uploaded");
            }

            // 1. Get system inventory counts
            var query = _context.Inventories.Include(i => i.Sku).AsQueryable();
            
            // if (request.WarehouseId.HasValue) 
            // { 
            //    // We might need to join WarehouseBin if WarehouseId is provided
            //    query = query.Where(i => i.Bin.WarehouseId == request.WarehouseId.Value);
            // }

            var systemInventory = await query
                .GroupBy(i => new { i.Sku.Skuid, i.Sku.Skucode })
                .Select(g => new
                {
                    SkuId = g.Key.Skuid,
                    SkuCode = g.Key.Skucode,
                    SystemQty = g.Sum(i => i.Quantity)
                })
                .ToListAsync();

            var systemQtyMap = systemInventory.ToDictionary(x => x.SkuCode, x => x);

            var discrepancies = new List<DiscrepancyDto>();

            // 2. Read the actual counts from Excel
            using (var stream = request.ActualCountFile.OpenReadStream())
            using (var workbook = new XLWorkbook(stream))
            {
                var worksheet = workbook.Worksheet(1);
                var rows = worksheet.RangeUsed().RowsUsed().Skip(1); // Skip header

                foreach (var row in rows)
                {
                    var skuCodeCell = row.Cell(1).Value.ToString();
                    var actualQtyCell = row.Cell(2).Value.ToString();

                    if (string.IsNullOrWhiteSpace(skuCodeCell)) continue;

                    string skuCode = skuCodeCell.Trim();
                    int actualQty = 0;
                    if (int.TryParse(actualQtyCell, out int parsedQty))
                    {
                        actualQty = parsedQty;
                    }

                    int systemQty = 0;
                    int skuId = 0;

                    if (systemQtyMap.TryGetValue(skuCode, out var sysData))
                    {
                        systemQty = sysData.SystemQty;
                        skuId = sysData.SkuId;
                    }

                    decimal diffPercent = 0;
                    if (systemQty > 0)
                    {
                        diffPercent = Math.Abs((decimal)(actualQty - systemQty) / systemQty);
                    }
                    else if (actualQty > 0)
                    {
                        diffPercent = 1; // 100% diff if system has 0 but actual has some
                    }

                    discrepancies.Add(new DiscrepancyDto
                    {
                        SkuId = skuId,
                        SkuCode = skuCode,
                        SystemQty = systemQty,
                        ActualQty = actualQty,
                        DiffPercent = diffPercent
                    });
                }
            }

            // 3. Generate result Excel report
            using (var outWorkbook = new XLWorkbook())
            {
                var ws = outWorkbook.Worksheets.Add("ReconciliationReport");
                ws.Cell(1, 1).Value = "SKU Code";
                ws.Cell(1, 2).Value = "System Qty";
                ws.Cell(1, 3).Value = "Actual Qty";
                ws.Cell(1, 4).Value = "Diff %";
                ws.Cell(1, 5).Value = "Flag";

                ws.Range(1, 1, 1, 5).Style.Font.Bold = true;

                int rowIdx = 2;
                var criticalDiffs = new List<DiscrepancyDto>();

                foreach (var item in discrepancies)
                {
                    ws.Cell(rowIdx, 1).Value = item.SkuCode;
                    ws.Cell(rowIdx, 2).Value = item.SystemQty;
                    ws.Cell(rowIdx, 3).Value = item.ActualQty;
                    
                    ws.Cell(rowIdx, 4).Value = item.DiffPercent;
                    ws.Cell(rowIdx, 4).Style.NumberFormat.Format = "0.00%";

                    bool isCritical = item.DiffPercent > request.ThresholdPercentage;
                    if (isCritical)
                    {
                        ws.Cell(rowIdx, 5).Value = "CRITICAL";
                        ws.Row(rowIdx).Style.Fill.BackgroundColor = XLColor.Yellow;
                        criticalDiffs.Add(item);
                    }
                    
                    rowIdx++;
                }

                ws.Columns().AdjustToContents();

                using (var ms = new MemoryStream())
                {
                    outWorkbook.SaveAs(ms);
                    
                    return new ReconciliationResult
                    {
                        ExcelReport = ms.ToArray(),
                        FileName = $"ReconciliationReport_{DateTime.Now:yyyyMMddHHmmss}.xlsx",
                        CriticalDiffs = criticalDiffs
                    };
                }
            }
        }
    }
}
