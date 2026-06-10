using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using BACKEND.DTOs;
using BACKEND.Models;
using QRCoder;

namespace BACKEND.Services
{
    public class OutboundService : IOutboundService
    {
        private readonly SmartLogDbContext _context;
        private readonly IConfiguration _configuration;

        public OutboundService(SmartLogDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
            EnsureWaybillsTableExists();
        }

        private void EnsureWaybillsTableExists()
        {
            try
            {
                // Ensure Waybills table is created if it does not exist in the database
                string sql = @"
                    IF OBJECT_ID('Waybills', 'U') IS NULL
                    BEGIN
                        CREATE TABLE Waybills (
                            WaybillId INT IDENTITY(1,1) PRIMARY KEY,
                            WaybillCode VARCHAR(50) NOT NULL UNIQUE,
                            OrderId INT NOT NULL FOREIGN KEY REFERENCES Orders(OrderId) ON DELETE CASCADE,
                            QrCodeBase64 NVARCHAR(MAX) NOT NULL,
                            CreatedAt DATETIME2 DEFAULT GETDATE(),
                            Status VARCHAR(20) NOT NULL DEFAULT 'SUCCESS'
                        );
                    END";
                _context.Database.ExecuteSqlRaw(sql);
            }
            catch (Exception ex)
            {
                // Log or ignore during design-time/database migrations
                Console.WriteLine($"Database initialization warning: {ex.Message}");
            }
        }

        public async Task<OutboundResponseDto> CreateOutboundOrderAsync(OutboundRequestDto request)
        {
            // 1. Validate Order
            var order = await _context.Orders
                .Include(o => o.OrderDetails)
                .ThenInclude(od => od.Product)
                .FirstOrDefaultAsync(o => o.OrderId == request.OrderId);

            if (order == null)
            {
                throw new KeyNotFoundException($"Order with ID {request.OrderId} does not exist.");
            }

            // Valid status for picking/outbound is DRAFT, PENDING, or LOADING
            // If already shipped/in transit, reject the request
            if (order.OrderStatus.Equals("IN_TRANSIT", StringComparison.OrdinalIgnoreCase) ||
                order.OrderStatus.Equals("DELIVERED", StringComparison.OrdinalIgnoreCase) ||
                order.OrderStatus.Equals("COMPLETED", StringComparison.OrdinalIgnoreCase))
            {
                throw new InvalidOperationException($"Order {request.OrderId} is already in transit or completed.");
            }

            if (!order.OrderDetails.Any())
            {
                throw new InvalidOperationException($"Order {request.OrderId} does not contain any products.");
            }

            // 2. Generate picking list and allocate stocks
            var pickingList = new List<PickingListItemDto>();

            foreach (var detail in order.OrderDetails)
            {
                int remainingToPick = detail.Quantity;
                var product = detail.Product;
                if (product == null) continue;

                // Query inventory for the product, ordering by warehouse location aisle, shelf, and row (optimal picking path)
                var stocks = await _context.WarehouseStocks
                    .Include(ws => ws.WarehouseLocation)
                    .Where(ws => ws.ProductId == detail.ProductId && ws.Quantity > 0)
                    .OrderBy(ws => ws.WarehouseLocation!.Aisle)
                    .ThenBy(ws => ws.WarehouseLocation!.Shelf)
                    .ThenBy(ws => ws.WarehouseLocation!.Row)
                    .ToListAsync();

                foreach (var stock in stocks)
                {
                    if (remainingToPick <= 0) break;

                    int pickQty = Math.Min(remainingToPick, stock.Quantity);
                    remainingToPick -= pickQty;

                    // Deduct inventory
                    stock.Quantity -= pickQty;

                    pickingList.Add(new PickingListItemDto
                    {
                        ProductSku = product.Sku,
                        ProductName = product.ProductName,
                        QuantityToPick = pickQty,
                        ZoneName = $"Zone {stock.WarehouseLocation?.Aisle ?? "N/A"}",
                        BinName = $"Shelf {stock.WarehouseLocation?.Shelf ?? "N/A"} - Row {stock.WarehouseLocation?.Row ?? "N/A"}"
                    });
                }

                if (remainingToPick > 0)
                {
                    throw new InvalidOperationException($"Insufficient stock for product '{product.ProductName}' (SKU: {product.Sku}). Shortage quantity: {remainingToPick}.");
                }
            }

            // Sort picking list optimally: Zone (Aisle) -> Bin (Shelf - Row)
            pickingList = pickingList
                .OrderBy(p => p.ZoneName)
                .ThenBy(p => p.BinName)
                .ToList();

            // 3. Generate Secure QR Code
            string waybillCode = $"WB-{order.OrderId}-{DateTime.UtcNow:yyyyMMddHHmmss}";
            string secretKey = _configuration["OutboundSettings:SecretKey"] ?? "SmartLogAI_Default_Secret_Key_2026!";
            string signature = GenerateHMACSignature(order.OrderId.ToString(), secretKey);

            // Payload details embedded inside QR
            string qrPayload = $"OrderId:{order.OrderId}|WaybillCode:{waybillCode}|Signature:{signature}";
            string qrCodeBase64 = GenerateQRCodeBase64(qrPayload);

            // 4. Save Waybill to Database
            var waybill = new Waybill
                {
                    WaybillCode = waybillCode,
                    OrderId = order.OrderId,
                    QrCodeBase64 = qrCodeBase64,
                    CreatedAt = DateTime.UtcNow,
                    Status = "SUCCESS"
                };

            // Update Order Status to IN_TRANSIT
            order.OrderStatus = "IN_TRANSIT";

            _context.Waybills.Add(waybill);
            await _context.SaveChangesAsync();

            return new OutboundResponseDto
            {
                WaybillCode = waybill.WaybillCode,
                QrCodeBase64 = waybill.QrCodeBase64,
                PickingList = pickingList,
                CreatedAt = waybill.CreatedAt
            };
        }

        private string GenerateHMACSignature(string payload, string secretKey)
        {
            var keyBytes = Encoding.UTF8.GetBytes(secretKey);
            using (var hmac = new HMACSHA256(keyBytes))
            {
                var payloadBytes = Encoding.UTF8.GetBytes(payload);
                var hashBytes = hmac.ComputeHash(payloadBytes);
                return Convert.ToHexString(hashBytes).ToLower();
            }
        }

        private string GenerateQRCodeBase64(string payload)
        {
            using (var qrGenerator = new QRCodeGenerator())
            {
                using (var qrCodeData = qrGenerator.CreateQrCode(payload, QRCodeGenerator.ECCLevel.Q))
                {
                    using (var qrCode = new PngByteQRCode(qrCodeData))
                    {
                        byte[] qrCodeImage = qrCode.GetGraphic(20);
                        string base64 = Convert.ToBase64String(qrCodeImage);
                        return $"data:image/png;base64,{base64}";
                    }
                }
            }
        }
    }
}
