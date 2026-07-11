using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BACKEND.DTOs;
using BACKEND.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using QRCoder;

namespace BACKEND.Services
{
    public class OutboundService : IOutboundService
    {
        private readonly SmartLogAiContext _context;
        private readonly IConfiguration _config;

        public OutboundService(SmartLogAiContext context, IConfiguration config)
        {
            _context = context;
            _config = config;
        }

        public async Task<OutboundResponseDto> CreateOutboundOrderAsync(int orderId, int authenticatedUserId)
        {
            var strategy = _context.Database.CreateExecutionStrategy();
            return await strategy.ExecuteAsync(async () =>
            {
                using (var transaction = await _context.Database.BeginTransactionAsync())
                {
                    try
                    {
                        // 1. Load ServiceOrder
                        var order = await _context.ServiceOrders
                            .Include(o => o.OrderLines)
                                .ThenInclude(ol => ol.Sku)
                            .FirstOrDefaultAsync(o => o.OrderId == orderId);

                        if (order == null)
                        {
                            throw new KeyNotFoundException($"ServiceOrder {orderId} was not found.");
                        }

                        // 2. Validate status (must be CONFIRMED)
                        if (!string.Equals(order.Status?.Trim(), "CONFIRMED", StringComparison.OrdinalIgnoreCase))
                        {
                            throw new InvalidOperationException($"ServiceOrder {orderId} is in status '{order.Status}', but must be 'CONFIRMED' to create an outbound order.");
                        }

                        // 3. Reject empty or invalid orders
                        if (order.OrderLines == null || !order.OrderLines.Any())
                        {
                            throw new InvalidOperationException($"ServiceOrder {orderId} has no order lines.");
                        }

                        var validLines = order.OrderLines.Where(ol => ol.Skuid != null).ToList();
                        if (!validLines.Any())
                        {
                            throw new InvalidOperationException($"ServiceOrder {orderId} has no valid SKU lines.");
                        }

                        if (validLines.Any(ol => ol.Quantity <= 0))
                        {
                            throw new InvalidOperationException("Order quantities must be greater than zero.");
                        }

                        // 4. Keep existing MVP duplicate rule (only one outbound order per ServiceOrder)
                        var exists = await _context.OutboundOrders.AnyAsync(o => o.OrderId == orderId);
                        if (exists)
                        {
                            throw new InvalidOperationException($"An outbound order has already been created for ServiceOrder {orderId}.");
                        }

                        // 5. Group OrderLines by SKU to prevent duplicate allocation & double-counting
                        var groupedLines = validLines
                            .GroupBy(ol => ol.Skuid!.Value)
                            .Select(g => new
                            {
                                Skuid = g.Key,
                                TotalQty = g.Sum(ol => ol.Quantity),
                                Sku = g.First().Sku
                            })
                            .ToList();

                        // 6. Build the OutboundOrder entity graph
                        var randomSuffix = new Random().Next(1000, 9999);
                        var outboundCode = $"OUT-{order.OrderCode}-{randomSuffix}";
                        var waybillCode = $"WB-{order.OrderCode}-{randomSuffix}";

                        var outboundOrder = new OutboundOrder
                        {
                            OutboundCode = outboundCode,
                            OrderId = orderId,
                            WarehouseId = order.WarehouseId,
                            Status = "PENDING",
                            LabelPrinted = false,
                            CreatedBy = authenticatedUserId <= 0 ? 1 : authenticatedUserId,
                            CreatedAt = DateTime.UtcNow
                        };

                        var pickingListItems = new List<PickingListItemDto>();

                        // 7. Allocate quantities per grouped SKU
                        foreach (var group in groupedLines)
                        {
                            var skuId = group.Skuid;
                            var skuCode = group.Sku?.Skucode ?? $"SKU-{skuId}";
                            var skuName = group.Sku?.ProductName ?? string.Empty;
                            var qtyNeeded = group.TotalQty;

                            // Query available inventory (Strategy B) in deterministic order
                            var inventories = await _context.Inventories
                                .Include(i => i.Bin)
                                    .ThenInclude(b => b.Shelf)
                                        .ThenInclude(s => s.Zone)
                                .Where(i => i.Skuid == skuId && i.Bin.Shelf.Zone.WarehouseId == order.WarehouseId && i.Quantity > 0)
                                .OrderBy(i => i.InboundDate)
                                .ThenBy(i => i.InventoryId)
                                .ToListAsync();

                            var totalAvailable = inventories.Sum(i => i.Quantity);
                            if (totalAvailable < qtyNeeded)
                            {
                                throw new InvalidOperationException($"Insufficient inventory in warehouse for SKU {skuCode}. Requested: {qtyNeeded}, Available: {totalAvailable}.");
                            }

                            var qtyRemaining = qtyNeeded;
                            foreach (var inv in inventories)
                            {
                                if (qtyRemaining <= 0) break;

                                var qtyToDeduct = Math.Min(inv.Quantity, qtyRemaining);
                                
                                // Deduct quantity
                                inv.Quantity -= qtyToDeduct;
                                qtyRemaining -= qtyToDeduct;

                                // Create OutboundLine and link to parent OutboundOrder
                                var outboundLine = new OutboundLine
                                {
                                    Skuid = skuId,
                                    BinId = inv.BinId,
                                    RequiredQty = qtyToDeduct,
                                    PickedQty = 0,
                                    Qrlabel = $"OUTLINE-{outboundCode}-{skuId}-{inv.BinId}"
                                };

                                outboundOrder.OutboundLines.Add(outboundLine);

                                pickingListItems.Add(new PickingListItemDto
                                {
                                    ProductSku = skuCode,
                                    ProductName = skuName,
                                    QuantityToPick = qtyToDeduct,
                                    ZoneName = inv.Bin.Shelf.Zone.ZoneName,
                                    BinName = inv.Bin.BinCode
                                });
                            }
                        }

                        // 8. Update ServiceOrder status
                        order.Status = "PROCESSING";
                        _context.ServiceOrders.Update(order);

                        // Register the OutboundOrder to context
                        _context.OutboundOrders.Add(outboundOrder);

                        // 9. Single SaveChangesAsync inside the transaction boundary
                        await _context.SaveChangesAsync();

                        // 10. Generate QR Code dynamic stream
                        string qrCodeBase64 = string.Empty;
                        using (var qrGenerator = new QRCodeGenerator())
                        {
                            var qrCodeData = qrGenerator.CreateQrCode(outboundCode, QRCodeGenerator.ECCLevel.Q);
                            using (var qrCode = new PngByteQRCode(qrCodeData))
                            {
                                byte[] qrCodeBytes = qrCode.GetGraphic(20);
                                qrCodeBase64 = Convert.ToBase64String(qrCodeBytes);
                            }
                        }

                        // 11. Commit
                        await transaction.CommitAsync();

                        return new OutboundResponseDto
                        {
                            WaybillCode = waybillCode,
                            QrCodeBase64 = qrCodeBase64,
                            PickingList = pickingListItems,
                            CreatedAt = outboundOrder.CreatedAt ?? DateTime.UtcNow
                        };
                    }
                    catch (DbUpdateConcurrencyException)
                    {
                        await transaction.RollbackAsync();
                        throw;
                    }
                    catch (Exception)
                    {
                        await transaction.RollbackAsync();
                        throw;
                    }
                }
            });
        }

        public async Task<List<OutboundOrderDto>> GetOutboundOrdersAsync()
        {
            var list = await _context.OutboundOrders
                .Include(o => o.Order)
                .Include(o => o.Warehouse)
                .Include(o => o.CreatedByNavigation)
                .Include(o => o.OutboundLines)
                    .ThenInclude(l => l.Sku)
                .Include(o => o.OutboundLines)
                    .ThenInclude(l => l.Bin)
                        .ThenInclude(b => b.Shelf)
                            .ThenInclude(s => s.Zone)
                .OrderByDescending(o => o.CreatedAt)
                .ToListAsync();

            return list.Select(o => MapToDto(o)).ToList();
        }

        public async Task<OutboundOrderDto?> GetOutboundOrderByIdAsync(int id)
        {
            var order = await _context.OutboundOrders
                .Include(o => o.Order)
                .Include(o => o.Warehouse)
                .Include(o => o.CreatedByNavigation)
                .Include(o => o.OutboundLines)
                    .ThenInclude(l => l.Sku)
                .Include(o => o.OutboundLines)
                    .ThenInclude(l => l.Bin)
                        .ThenInclude(b => b.Shelf)
                            .ThenInclude(s => s.Zone)
                .FirstOrDefaultAsync(o => o.OutboundId == id);

            if (order == null) return null;

            var dto = MapToDto(order);

            // Generate QrCodeBase64 on the fly for the details view
            using (var qrGenerator = new QRCodeGenerator())
            {
                var qrCodeData = qrGenerator.CreateQrCode(order.OutboundCode, QRCodeGenerator.ECCLevel.Q);
                using (var qrCode = new PngByteQRCode(qrCodeData))
                {
                    byte[] qrCodeBytes = qrCode.GetGraphic(20);
                    dto.QrCodeBase64 = Convert.ToBase64String(qrCodeBytes);
                }
            }

            return dto;
        }

        private OutboundOrderDto MapToDto(OutboundOrder o)
        {
            return new OutboundOrderDto
            {
                OutboundId = o.OutboundId,
                OutboundCode = o.OutboundCode,
                OrderId = o.OrderId,
                OrderCode = o.Order?.OrderCode ?? string.Empty,
                WarehouseId = o.WarehouseId,
                WarehouseName = o.Warehouse?.WarehouseName ?? string.Empty,
                Status = o.Status ?? string.Empty,
                LabelPrinted = o.LabelPrinted ?? false,
                CreatedBy = o.CreatedBy,
                CreatedByName = o.CreatedByNavigation?.FullName ?? o.CreatedByNavigation?.Username ?? string.Empty,
                CreatedAt = o.CreatedAt,
                CompletedAt = o.CompletedAt,
                OutboundLines = o.OutboundLines.Select(l => new OutboundLineDto
                {
                    LineId = l.LineId,
                    Skuid = l.Skuid,
                    SkuCode = l.Sku?.Skucode ?? string.Empty,
                    SkuName = l.Sku?.ProductName ?? string.Empty,
                    BinId = l.BinId,
                    BinCode = l.Bin?.BinCode ?? string.Empty,
                    ZoneName = l.Bin?.Shelf?.Zone?.ZoneName ?? string.Empty,
                    RequiredQty = l.RequiredQty,
                    PickedQty = l.PickedQty ?? 0,
                    QrLabel = l.Qrlabel ?? string.Empty
                }).ToList()
            };
        }

        public async Task<OutboundLineDto> MarkLineAsPickedAsync(int outboundId, int lineId, int pickedQty, int authenticatedUserId)
        {
            var order = await _context.OutboundOrders
                .Include(o => o.OutboundLines)
                    .ThenInclude(l => l.Sku)
                .Include(o => o.OutboundLines)
                    .ThenInclude(l => l.Bin)
                        .ThenInclude(b => b.Shelf)
                            .ThenInclude(s => s.Zone)
                .FirstOrDefaultAsync(o => o.OutboundId == outboundId);

            if (order == null)
            {
                throw new KeyNotFoundException($"Outbound order with ID {outboundId} was not found.");
            }

            var line = order.OutboundLines.FirstOrDefault(l => l.LineId == lineId);
            if (line == null)
            {
                throw new KeyNotFoundException($"Outbound line with ID {lineId} does not belong to outbound order {outboundId}.");
            }

            // Validate status: must be PENDING or PICKING
            string status = (order.Status ?? string.Empty).Trim().ToUpper();
            if (status != "PENDING" && status != "PICKING")
            {
                throw new InvalidOperationException($"Cannot pick items for outbound order in '{status}' status. Outbound order must be in PENDING or PICKING status.");
            }

            // Validate requested quantity
            if (pickedQty <= 0)
            {
                throw new ArgumentException("Picked quantity must be greater than zero.");
            }

            // Validate remaining quantity
            int currentPicked = line.PickedQty ?? 0;
            int remaining = line.RequiredQty - currentPicked;
            if (pickedQty > remaining)
            {
                throw new InvalidOperationException($"Cannot pick {pickedQty} items. Remaining required quantity is {remaining}.");
            }

            // Update picking progress
            line.PickedQty = currentPicked + pickedQty;

            // Transition outbound order status to PICKING if it was PENDING
            if (status == "PENDING")
            {
                order.Status = "PICKING";
            }

            await _context.SaveChangesAsync();

            return new OutboundLineDto
            {
                LineId = line.LineId,
                Skuid = line.Skuid,
                SkuCode = line.Sku?.Skucode ?? string.Empty,
                SkuName = line.Sku?.ProductName ?? string.Empty,
                BinId = line.BinId,
                BinCode = line.Bin?.BinCode ?? string.Empty,
                ZoneName = line.Bin?.Shelf?.Zone?.ZoneName ?? string.Empty,
                RequiredQty = line.RequiredQty,
                PickedQty = line.PickedQty ?? 0,
                QrLabel = line.Qrlabel ?? string.Empty
            };
        }

        public async Task<OutboundOrderDto> ConfirmPickingAsync(int outboundId, int authenticatedUserId)
        {
            var order = await _context.OutboundOrders
                .Include(o => o.Order)
                .Include(o => o.Warehouse)
                .Include(o => o.CreatedByNavigation)
                .Include(o => o.OutboundLines)
                    .ThenInclude(l => l.Sku)
                .Include(o => o.OutboundLines)
                    .ThenInclude(l => l.Bin)
                        .ThenInclude(b => b.Shelf)
                            .ThenInclude(s => s.Zone)
                .FirstOrDefaultAsync(o => o.OutboundId == outboundId);

            if (order == null)
            {
                throw new KeyNotFoundException($"Outbound order with ID {outboundId} was not found.");
            }

            string status = (order.Status ?? string.Empty).Trim().ToUpper();
            
            // Idempotent check
            if (status == "PACKED")
            {
                return MapToDto(order);
            }

            if (status != "PENDING" && status != "PICKING")
            {
                throw new InvalidOperationException($"Cannot confirm picking for outbound order in '{status}' status. Outbound order must be in PENDING or PICKING status.");
            }

            // Verify all lines are fully picked
            foreach (var line in order.OutboundLines)
            {
                int picked = line.PickedQty ?? 0;
                if (picked < line.RequiredQty)
                {
                    throw new InvalidOperationException($"Cannot confirm picking. Line {line.LineId} (SKU: {line.Sku?.Skucode}) is incomplete: picked {picked}/{line.RequiredQty}.");
                }
            }

            // Set to PACKED
            order.Status = "PACKED";
            
            // Do NOT update CompletedAt as it is reserved for the final DISPATCHED state.

            await _context.SaveChangesAsync();

            return MapToDto(order);
        }
    }
}
