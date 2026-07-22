using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BACKEND.DTOs;
using BACKEND.Models;
using Microsoft.EntityFrameworkCore;

namespace BACKEND.Services
{
    public class StockTransferService : IStockTransferService
    {
        private readonly SmartLogAiContext _context;

        public StockTransferService(SmartLogAiContext context)
        {
            _context = context;
        }

        public async Task<StockTransferDto> CreateTransferAsync(StockTransferCreateRequest request, int userId)
        {
            if (request.Quantity <= 0)
                throw new ArgumentException("Quantity must be greater than 0");

            if (request.FromBinId == request.ToBinId)
                throw new ArgumentException("Source and Destination Bins must be different");

            // Verify bins exist before entering strategy
            var toBin = await _context.WarehouseBins.FindAsync(request.ToBinId)
                ?? throw new Exception("Destination Bin not found");

            var fromBin = await _context.WarehouseBins.FindAsync(request.FromBinId)
                ?? throw new Exception("Source Bin not found");

            StockTransferDto? result = null;

            // Must wrap manual transactions with CreateExecutionStrategy when SQL Server retry is enabled
            var strategy = _context.Database.CreateExecutionStrategy();
            await strategy.ExecuteAsync(async () =>
            {
                using var transaction = await _context.Database.BeginTransactionAsync();
                try
                {
                    // Find inventory in source bin
                    var fromInventories = await _context.Inventories
                        .Where(i => i.BinId == request.FromBinId && i.Skuid == request.SkuId && i.Quantity > 0)
                        .OrderBy(i => i.ExpiryDate) // FIFO
                        .ToListAsync();

                    int remainingToTransfer = request.Quantity;

                    // Track total before/after for ledger
                    int totalFromQtyBefore = await _context.Inventories
                        .Where(i => i.BinId == request.FromBinId && i.Skuid == request.SkuId)
                        .SumAsync(i => i.Quantity);
                    int totalToQtyBefore = await _context.Inventories
                        .Where(i => i.BinId == request.ToBinId && i.Skuid == request.SkuId)
                        .SumAsync(i => i.Quantity);

                    if (totalFromQtyBefore < request.Quantity)
                        throw new Exception("Not enough quantity in the source bin");

                    foreach (var fromInv in fromInventories)
                    {
                        if (remainingToTransfer <= 0) break;

                        int transferQty = Math.Min(fromInv.Quantity, remainingToTransfer);
                        fromInv.Quantity -= transferQty;
                        remainingToTransfer -= transferQty;

                        // Add to destination bin
                        var toInv = await _context.Inventories.FirstOrDefaultAsync(i =>
                            i.BinId == request.ToBinId &&
                            i.Skuid == request.SkuId &&
                            i.BatchNo == fromInv.BatchNo &&
                            i.ExpiryDate == fromInv.ExpiryDate);

                        if (toInv != null)
                        {
                            toInv.Quantity += transferQty;
                        }
                        else
                        {
                            _context.Inventories.Add(new Inventory
                            {
                                Skuid = request.SkuId,
                                BinId = request.ToBinId,
                                Quantity = transferQty,
                                BatchNo = fromInv.BatchNo,
                                ExpiryDate = fromInv.ExpiryDate,
                                InboundDate = fromInv.InboundDate,
                                LastCountDate = DateOnly.FromDateTime(DateTime.Now)
                            });
                        }
                    }

                    if (remainingToTransfer > 0)
                        throw new Exception("Failed to find enough inventory batches to satisfy transfer.");

                    // Update IsOccupied status
                    int totalRemainingInFromBin = await _context.Inventories
                        .Where(i => i.BinId == request.FromBinId)
                        .SumAsync(i => i.Quantity);
                    fromBin.IsOccupied = totalRemainingInFromBin > 0;
                    toBin.IsOccupied = true;

                    // Create StockTransfer log
                    var stockTransfer = new StockTransfer
                    {
                        TransferCode = "TRF-" + DateTime.Now.ToString("yyyyMMddHHmmss") + new Random().Next(100, 999),
                        Skuid = request.SkuId,
                        FromBinId = request.FromBinId,
                        ToBinId = request.ToBinId,
                        Quantity = request.Quantity,
                        Status = "COMPLETED",
                        CreatedBy = userId,
                        CreatedAt = DateTime.Now,
                        CompletedAt = DateTime.Now
                    };

                    _context.StockTransfers.Add(stockTransfer);
                    await _context.SaveChangesAsync();

                    // Create StockLedger logs
                    _context.StockLedgers.Add(new StockLedger
                    {
                        Skuid = request.SkuId,
                        BinId = request.FromBinId,
                        TxnType = "TRANSFER_OUT",
                        Qty = request.Quantity,
                        QtyBefore = totalFromQtyBefore,
                        QtyAfter = totalFromQtyBefore - request.Quantity,
                        RefType = "StockTransfer",
                        RefId = stockTransfer.TransferId,
                        Note = request.Note ?? $"Transfer out to bin {toBin.BinCode}",
                        CreatedBy = userId,
                        CreatedAt = DateTime.Now
                    });

                    _context.StockLedgers.Add(new StockLedger
                    {
                        Skuid = request.SkuId,
                        BinId = request.ToBinId,
                        TxnType = "TRANSFER_IN",
                        Qty = request.Quantity,
                        QtyBefore = totalToQtyBefore,
                        QtyAfter = totalToQtyBefore + request.Quantity,
                        RefType = "StockTransfer",
                        RefId = stockTransfer.TransferId,
                        Note = request.Note ?? $"Transfer in from bin {fromBin.BinCode}",
                        CreatedBy = userId,
                        CreatedAt = DateTime.Now
                    });

                    await _context.SaveChangesAsync();
                    await transaction.CommitAsync();

                    result = await GetTransferByIdAsync(stockTransfer.TransferId);
                }
                catch (Exception)
                {
                    await transaction.RollbackAsync();
                    throw;
                }
            });

            return result!;
        }


        public async Task<IEnumerable<StockTransferDto>> GetTransfersAsync()
        {
            return await _context.StockTransfers
                .Include(t => t.Sku)
                .Include(t => t.FromBin).ThenInclude(b => b.Shelf).ThenInclude(s => s.Zone)
                .Include(t => t.ToBin).ThenInclude(b => b.Shelf).ThenInclude(s => s.Zone)
                .Include(t => t.CreatedByNavigation)
                .OrderByDescending(t => t.CreatedAt)
                .Select(t => new StockTransferDto
                {
                    TransferId = t.TransferId,
                    TransferCode = t.TransferCode,
                    SkuId = t.Skuid,
                    SkuCode = t.Sku.Skucode,
                    SkuName = t.Sku.ProductName,
                    FromBinId = t.FromBinId,
                    FromBinCode = t.FromBin.BinCode,
                    FromZoneName = t.FromBin.Shelf.Zone.ZoneName,
                    ToBinId = t.ToBinId,
                    ToBinCode = t.ToBin.BinCode,
                    ToZoneName = t.ToBin.Shelf.Zone.ZoneName,
                    Quantity = t.Quantity,
                    Status = t.Status,
                    CreatedByName = t.CreatedByNavigation != null ? t.CreatedByNavigation.FullName : null,
                    CreatedAt = t.CreatedAt,
                    CompletedAt = t.CompletedAt
                })
                .ToListAsync();
        }

        public async Task<IEnumerable<BinInventoryDto>> GetBinInventoryAsync(int binId)
        {
            // Load with explicit Include to avoid EF Core GroupBy translation issues
            var inventories = await _context.Inventories
                .Include(i => i.Sku)
                .Where(i => i.BinId == binId && i.Quantity > 0)
                .AsNoTracking()
                .ToListAsync();

            // Group in memory (safe, no EF Core translation problem)
            return inventories
                .GroupBy(i => new { i.Skuid, i.Sku.Skucode, i.Sku.ProductName })
                .Select(g => new BinInventoryDto
                {
                    SkuId   = g.Key.Skuid,
                    SkuCode = g.Key.Skucode,
                    SkuName = g.Key.ProductName,
                    Quantity = g.Sum(i => i.Quantity)
                })
                .ToList();
        }

        private async Task<StockTransferDto> GetTransferByIdAsync(int id)
        {
            return await _context.StockTransfers
                .Include(t => t.Sku)
                .Include(t => t.FromBin).ThenInclude(b => b.Shelf).ThenInclude(s => s.Zone)
                .Include(t => t.ToBin).ThenInclude(b => b.Shelf).ThenInclude(s => s.Zone)
                .Include(t => t.CreatedByNavigation)
                .Where(t => t.TransferId == id)
                .Select(t => new StockTransferDto
                {
                    TransferId = t.TransferId,
                    TransferCode = t.TransferCode,
                    SkuId = t.Skuid,
                    SkuCode = t.Sku.Skucode,
                    SkuName = t.Sku.ProductName,
                    FromBinId = t.FromBinId,
                    FromBinCode = t.FromBin.BinCode,
                    FromZoneName = t.FromBin.Shelf.Zone.ZoneName,
                    ToBinId = t.ToBinId,
                    ToBinCode = t.ToBin.BinCode,
                    ToZoneName = t.ToBin.Shelf.Zone.ZoneName,
                    Quantity = t.Quantity,
                    Status = t.Status,
                    CreatedByName = t.CreatedByNavigation != null ? t.CreatedByNavigation.FullName : null,
                    CreatedAt = t.CreatedAt,
                    CompletedAt = t.CompletedAt
                })
                .FirstOrDefaultAsync() ?? throw new Exception("Transfer not found after creation");
        }
    }
}
