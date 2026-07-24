using BACKEND.DTOs;
using BACKEND.Models;
using Microsoft.EntityFrameworkCore;

namespace BACKEND.Services;

public class StockTransferService : IStockTransferService
{
    private readonly SmartLogAiContext _context;
    private readonly ILogger<StockTransferService> _logger;

    public StockTransferService(SmartLogAiContext context, ILogger<StockTransferService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<StockTransferOptionsDto> GetOptionsAsync()
    {
        var skus = await _context.Inventories
            .Include(i => i.Sku)
            .Where(i => i.Quantity > 0 && i.Sku != null)
            .Select(i => i.Sku)
            .Distinct()
            .Select(s => new SkuOptionDto { Skuid = s.Skuid, Skucode = s.Skucode ?? "", ProductName = s.ProductName ?? "" })
            .ToListAsync();

        var fromBins = await _context.Inventories
            .Include(i => i.Bin)
            .ThenInclude(b => b.Shelf)
            .ThenInclude(s => s!.Zone)
            .Where(i => i.Quantity > 0)
            .GroupBy(i => new { i.BinId, i.Bin.BinCode, ZoneName = i.Bin.Shelf != null && i.Bin.Shelf.Zone != null ? i.Bin.Shelf.Zone.ZoneName : "", i.Skuid })
            .Select(g => new BinOptionDto 
            {
                BinId = g.Key.BinId,
                BinCode = g.Key.BinCode ?? "",
                ZoneName = g.Key.ZoneName ?? "",
                Skuid = g.Key.Skuid,
                Quantity = g.Sum(i => i.Quantity)
            })
            .ToListAsync();

        var allBins = await _context.WarehouseBins
            .Include(b => b.Shelf)
            .ThenInclude(s => s!.Zone)
            .Select(b => new BinOptionDto { 
                BinId = b.BinId, 
                BinCode = b.BinCode ?? "", 
                ZoneName = b.Shelf != null && b.Shelf.Zone != null ? (b.Shelf.Zone.ZoneName ?? "") : "" 
            })
            .ToListAsync();

        return new StockTransferOptionsDto { Skus = skus, FromBins = fromBins, AllBins = allBins };
    }

    public async Task<StockTransferPagedResultDto> GetTransferHistoryAsync(int page = 1, int pageSize = 10)
    {
        var query = _context.StockTransfers
            .Include(t => t.Sku)
            .Include(t => t.FromBin)
            .Include(t => t.ToBin)
            .Include(t => t.CreatedByNavigation)
            .OrderByDescending(t => t.CreatedAt);

        var totalCount = await query.CountAsync();
        var transfers = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var items = transfers.Select(t => new StockTransferResponseDto
        {
            TransferId = t.TransferId,
            TransferCode = t.TransferCode,
            Skuid = t.Skuid,
            Skucode = t.Sku?.Skucode ?? "",
            ProductName = t.Sku?.ProductName ?? "",
            FromBinId = t.FromBinId,
            FromBinCode = t.FromBin?.BinCode ?? "",
            ToBinId = t.ToBinId,
            ToBinCode = t.ToBin?.BinCode ?? "",
            Quantity = t.Quantity,
            Status = t.Status ?? "UNKNOWN",
            CreatedAt = t.CreatedAt,
            CompletedAt = t.CompletedAt,
            CreatedByName = t.CreatedByNavigation?.FullName
        }).ToList();

        return new StockTransferPagedResultDto { TotalCount = totalCount, Items = items };
    }

    public async Task<StockTransferResponseDto> CreateTransferAsync(CreateStockTransferRequestDto request, int? userId)
    {
        if (request.FromBinId == request.ToBinId)
            throw new Exception("Source and Destination Bins must be different.");

        var strategy = _context.Database.CreateExecutionStrategy();
        return await strategy.ExecuteAsync(async () =>
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // 1. Check if Sku exists
                var sku = await _context.Skus.FindAsync(request.Skuid);
                if (sku == null) throw new Exception("SKU not found.");

                // 2. Find inventory in FromBin
                var fromInventories = await _context.Inventories
                    .Where(i => i.Skuid == request.Skuid && i.BinId == request.FromBinId && i.Quantity > 0)
                    .OrderBy(i => i.InboundDate) // FIFO: oldest first
                    .ToListAsync();

                int totalAvailable = fromInventories.Sum(i => i.Quantity);
                if (totalAvailable < request.Quantity)
                    throw new Exception($"Insufficient quantity in Source Bin. Available: {totalAvailable}, Requested: {request.Quantity}");

                int remainingToTransfer = request.Quantity;
                var transferredBatches = new List<(int Qty, string? BatchNo, DateOnly? Expiry, DateOnly? Inbound)>();

                foreach (var inv in fromInventories)
                {
                    if (remainingToTransfer <= 0) break;
                    int qtyToDeduct = Math.Min(inv.Quantity, remainingToTransfer);
                    inv.Quantity -= qtyToDeduct;
                    transferredBatches.Add((qtyToDeduct, inv.BatchNo, inv.ExpiryDate, inv.InboundDate));
                    remainingToTransfer -= qtyToDeduct;
                }

                // Calculate QtyBefore for Ledgers
                int sourceQtyBefore = totalAvailable;
                int destQtyBefore = await _context.Inventories
                    .Where(i => i.Skuid == request.Skuid && i.BinId == request.ToBinId)
                    .SumAsync(i => i.Quantity);

                // 3. Add to ToBin
                foreach (var batch in transferredBatches)
                {
                    var toInv = await _context.Inventories
                        .FirstOrDefaultAsync(i => 
                            i.Skuid == request.Skuid && 
                            i.BinId == request.ToBinId && 
                            i.BatchNo == batch.BatchNo && 
                            i.ExpiryDate == batch.Expiry && 
                            i.InboundDate == batch.Inbound);

                    if (toInv != null)
                    {
                        toInv.Quantity += batch.Qty;
                    }
                    else
                    {
                        _context.Inventories.Add(new Inventory
                        {
                            Skuid = request.Skuid,
                            BinId = request.ToBinId,
                            Quantity = batch.Qty,
                            BatchNo = batch.BatchNo,
                            ExpiryDate = batch.Expiry,
                            InboundDate = batch.Inbound,
                            LastCountDate = DateOnly.FromDateTime(DateTime.Now)
                        });
                    }
                }

                // 4. Create StockTransfer record
                var transferCode = "TRF-" + DateTime.Now.ToString("yyyyMMddHHmmss") + "-" + new Random().Next(100, 999);
                var transfer = new StockTransfer
                {
                    TransferCode = transferCode,
                    Skuid = request.Skuid,
                    FromBinId = request.FromBinId,
                    ToBinId = request.ToBinId,
                    Quantity = request.Quantity,
                    Status = "COMPLETED",
                    CreatedBy = userId,
                    CreatedAt = DateTime.Now,
                    CompletedAt = DateTime.Now
                };
                _context.StockTransfers.Add(transfer);
                await _context.SaveChangesAsync(); // Save to get transfer.TransferId

                // 5. Create StockLedger entries
                _context.StockLedgers.Add(new StockLedger
                {
                    Skuid = request.Skuid,
                    BinId = request.FromBinId,
                    TxnType = "TRANSFER_OUT",
                    Qty = -request.Quantity,
                    QtyBefore = sourceQtyBefore,
                    QtyAfter = sourceQtyBefore - request.Quantity,
                    RefType = "StockTransfer",
                    RefId = transfer.TransferId,
                    Note = $"Chuyển {request.Quantity} sang Bin {request.ToBinId}",
                    CreatedBy = userId,
                    CreatedAt = DateTime.Now
                });

                _context.StockLedgers.Add(new StockLedger
                {
                    Skuid = request.Skuid,
                    BinId = request.ToBinId,
                    TxnType = "TRANSFER_IN",
                    Qty = request.Quantity,
                    QtyBefore = destQtyBefore,
                    QtyAfter = destQtyBefore + request.Quantity,
                    RefType = "StockTransfer",
                    RefId = transfer.TransferId,
                    Note = $"Nhận {request.Quantity} từ Bin {request.FromBinId}",
                    CreatedBy = userId,
                    CreatedAt = DateTime.Now
                });

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                _logger.LogInformation($"Stock transfer {transferCode} completed successfully.");

                return (await GetTransferHistoryAsync(1, 1)).Items.First();
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Error creating stock transfer.");
                throw;
            }
        });
    }
}
