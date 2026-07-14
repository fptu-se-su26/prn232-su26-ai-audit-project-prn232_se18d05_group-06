using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BACKEND.DTOs;
using BACKEND.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using QRCoder;
using Microsoft.Data.SqlClient;

namespace BACKEND.Services
{
    public class OutboundService : IOutboundService
    {
        private readonly SmartLogAiContext _context;
        private readonly IConfiguration _config;
        private readonly IGateService _gateService;

        public OutboundService(SmartLogAiContext context, IConfiguration config, IGateService gateService)
        {
            _context = context;
            _config = config;
            _gateService = gateService;
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

        public async Task<ShippingLabelDto> GetOrCreateShippingLabelAsync(int outboundId, int authenticatedUserId)
        {
            var outbound = await _context.OutboundOrders
                .Include(o => o.Order)
                    .ThenInclude(so => so.Customer)
                .Include(o => o.Warehouse)
                .FirstOrDefaultAsync(o => o.OutboundId == outboundId);

            if (outbound == null)
            {
                throw new KeyNotFoundException($"Outbound order with ID {outboundId} was not found.");
            }

            if (outbound.Status != "PACKED" && outbound.Status != "DISPATCHED")
            {
                throw new InvalidOperationException($"Outbound order status is '{outbound.Status}'. A shipping label can only be generated for PACKED or DISPATCHED orders.");
            }

            var strategy = _context.Database.CreateExecutionStrategy();
            return await strategy.ExecuteAsync(async () =>
            {
                var existing = await _context.Waybills.FirstOrDefaultAsync(w => w.OutboundId == outboundId);
                if (existing != null)
                {
                    return MapToShippingLabelDto(existing, outbound);
                }

                var today = DateTime.UtcNow.ToString("yyyyMMdd");
                var guidSegment = Guid.NewGuid().ToString("N").Substring(0, 8).ToUpper();
                var waybillCode = $"WB-{today}-{guidSegment}";

                while (await _context.Waybills.AnyAsync(w => w.WaybillCode == waybillCode))
                {
                    guidSegment = Guid.NewGuid().ToString("N").Substring(0, 8).ToUpper();
                    waybillCode = $"WB-{today}-{guidSegment}";
                }

                var newWaybill = new Waybill
                {
                    OrderId = outbound.OrderId,
                    OutboundId = outbound.OutboundId,
                    WaybillCode = waybillCode,
                    QrCodeBase64 = null,
                    Status = "CREATED",
                    CreatedAt = DateTime.UtcNow
                };

                using (var transaction = await _context.Database.BeginTransactionAsync())
                {
                    try
                    {
                        _context.Waybills.Add(newWaybill);
                        await _context.SaveChangesAsync();
                        await transaction.CommitAsync();
                        return MapToShippingLabelDto(newWaybill, outbound);
                    }
                    catch (DbUpdateException ex)
                    {
                        await transaction.RollbackAsync();

                        var sqlException = ex.InnerException as SqlException;
                        if (sqlException != null && (sqlException.Number == 2601 || sqlException.Number == 2627))
                        {
                            _context.Entry(newWaybill).State = EntityState.Detached;

                            Waybill? competingWaybill = null;
                            for (int i = 0; i < 5; i++)
                            {
                                competingWaybill = await _context.Waybills.AsNoTracking().FirstOrDefaultAsync(w => w.OutboundId == outboundId);
                                if (competingWaybill != null) break;
                                await Task.Delay(100);
                            }

                            if (competingWaybill != null)
                            {
                                return MapToShippingLabelDto(competingWaybill, outbound);
                            }
                            throw;
                        }
                        else
                        {
                            throw;
                        }
                    }
                }
            });
        }

        public async Task<ShippingLabelDto?> GetShippingLabelAsync(int outboundId)
        {
            var outbound = await _context.OutboundOrders
                .Include(o => o.Order)
                    .ThenInclude(so => so.Customer)
                .Include(o => o.Warehouse)
                .FirstOrDefaultAsync(o => o.OutboundId == outboundId);

            if (outbound == null)
            {
                throw new KeyNotFoundException($"Outbound order with ID {outboundId} was not found.");
            }

            var waybill = await _context.Waybills.FirstOrDefaultAsync(w => w.OutboundId == outboundId);
            if (waybill == null)
            {
                return null;
            }

            return MapToShippingLabelDto(waybill, outbound);
        }

        public async Task<OutboundOrderDto> DispatchOrderAsync(int outboundId, int authenticatedUserId)
        {
            var outbound = await _context.OutboundOrders
                .Include(o => o.Order)
                .Include(o => o.Warehouse)
                .Include(o => o.CreatedByNavigation)
                .Include(o => o.Waybill)
                .Include(o => o.OutboundLines)
                    .ThenInclude(l => l.Sku)
                .Include(o => o.OutboundLines)
                    .ThenInclude(l => l.Bin)
                        .ThenInclude(b => b.Shelf)
                            .ThenInclude(s => s.Zone)
                .FirstOrDefaultAsync(o => o.OutboundId == outboundId);

            if (outbound == null)
            {
                throw new KeyNotFoundException($"Outbound order with ID {outboundId} was not found.");
            }

            // 3. Idempotency Check
            if (outbound.Status == "DISPATCHED")
            {
                return MapToDto(outbound);
            }

            // 4. Precondition Validation
            if (outbound.Status != "PACKED")
            {
                throw new InvalidOperationException($"Only packed outbound orders can be dispatched. Current status is '{outbound.Status}'.");
            }

            if (outbound.Waybill == null)
            {
                throw new InvalidOperationException("A shipping label/waybill must be generated before dispatch.");
            }

            // 5. Stage 1 (Checkout - Reuse UC020)
            var booking = await _context.SlotBookings
                .FirstOrDefaultAsync(b => b.OrderId == outbound.OrderId && (b.Status == "IN_DOCK" || b.Status == "CHECKED_IN"));

            if (booking != null)
            {
                await _gateService.ProcessCheckoutAsync(new CheckoutRequestDto { BookingCode = booking.BookingCode }, authenticatedUserId);
            }

            // 6. Stage 2 (Dispatch & Session updates inside transaction)
            var strategy = _context.Database.CreateExecutionStrategy();
            await strategy.ExecuteAsync(async () =>
            {
                using var transaction = await _context.Database.BeginTransactionAsync();
                try
                {
                    var dbOutbound = await _context.OutboundOrders
                        .Include(o => o.Order)
                        .Include(o => o.Waybill)
                        .FirstOrDefaultAsync(o => o.OutboundId == outboundId);

                    if (dbOutbound != null && dbOutbound.Status != "DISPATCHED")
                    {
                        dbOutbound.Status = "DISPATCHED";
                        dbOutbound.CompletedAt = DateTime.UtcNow;
                        dbOutbound.Order.Status = "DISPATCHED";
                        if (dbOutbound.Waybill != null)
                        {
                            dbOutbound.Waybill.Status = "DISPATCHED";
                        }

                        // Close active VehicleDockSession associated with this order
                        var session = await _context.VehicleDockSessions
                            .FirstOrDefaultAsync(s => s.Booking.OrderId == dbOutbound.OrderId && s.DockEndTime == null);
                        if (session != null)
                        {
                            session.DockEndTime = DateTime.UtcNow;
                            session.CurrentStatus = "COMPLETED";
                            session.UpdatedAt = DateTime.UtcNow;
                        }

                        await _context.SaveChangesAsync();
                    }
                    await transaction.CommitAsync();
                }
                catch (Exception)
                {
                    await transaction.RollbackAsync();
                    throw;
                }
            });

            // Reload final state
            var finalOutbound = await _context.OutboundOrders
                .Include(o => o.Order)
                .Include(o => o.Warehouse)
                .Include(o => o.CreatedByNavigation)
                .Include(o => o.Waybill)
                .Include(o => o.OutboundLines)
                    .ThenInclude(l => l.Sku)
                .Include(o => o.OutboundLines)
                    .ThenInclude(l => l.Bin)
                        .ThenInclude(b => b.Shelf)
                            .ThenInclude(s => s.Zone)
                .FirstOrDefaultAsync(o => o.OutboundId == outboundId);

            return MapToDto(finalOutbound!);
        }

        private ShippingLabelDto MapToShippingLabelDto(Waybill waybill, OutboundOrder outbound)
        {
            string qrCodeBase64 = string.Empty;
            using (var qrGenerator = new QRCodeGenerator())
            {
                var qrCodeData = qrGenerator.CreateQrCode(waybill.WaybillCode, QRCodeGenerator.ECCLevel.Q);
                using (var qrCode = new PngByteQRCode(qrCodeData))
                {
                    byte[] qrCodeBytes = qrCode.GetGraphic(20);
                    qrCodeBase64 = Convert.ToBase64String(qrCodeBytes);
                }
            }

            return new ShippingLabelDto
            {
                WaybillId = waybill.WaybillId,
                WaybillCode = waybill.WaybillCode,
                OutboundId = outbound.OutboundId,
                OutboundCode = outbound.OutboundCode,
                OrderCode = outbound.Order?.OrderCode ?? string.Empty,
                WarehouseName = outbound.Warehouse?.WarehouseName ?? string.Empty,
                WarehouseAddress = outbound.Warehouse?.Address ?? string.Empty,
                DestinationAddress = outbound.Order?.Customer?.Address ?? string.Empty,
                RecipientName = outbound.Order?.Customer?.ContactName ?? outbound.Order?.Customer?.CompanyName ?? string.Empty,
                RecipientPhone = outbound.Order?.Customer?.Phone ?? string.Empty,
                TotalWeightKg = outbound.Order?.TotalWeightKg ?? 0,
                TotalPallets = outbound.Order?.TotalPallets ?? 0,
                CreatedAt = waybill.CreatedAt ?? DateTime.UtcNow,
                QrPayload = waybill.WaybillCode,
                QrCodeBase64 = qrCodeBase64,
                OutboundStatus = outbound.Status ?? string.Empty
            };
        }

        public async Task<List<EligibleServiceOrderDto>> GetEligibleServiceOrdersAsync()
        {
            return await _context.ServiceOrders
                .AsNoTracking()
                .Include(o => o.Customer)
                .Include(o => o.OrderLines)
                .Where(o => o.Status == "CONFIRMED"
                         && o.OrderLines.Any(ol => ol.Skuid != null && ol.Quantity > 0)
                         && !_context.OutboundOrders.Any(oo => oo.OrderId == o.OrderId))
                .OrderByDescending(o => o.CreatedAt ?? DateTime.MinValue)
                .ThenByDescending(o => o.OrderId)
                .Select(o => new EligibleServiceOrderDto
                {
                    OrderId = o.OrderId,
                    OrderCode = o.OrderCode ?? string.Empty,
                    CustomerName = o.Customer != null ? o.Customer.CompanyName : string.Empty,
                    Status = o.Status ?? string.Empty,
                    CreatedAt = o.CreatedAt
                })
                .ToListAsync();
        }
    }
}
