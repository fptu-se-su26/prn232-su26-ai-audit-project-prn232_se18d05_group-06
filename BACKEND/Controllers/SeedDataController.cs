using BACKEND.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BACKEND.Controllers
{
    [Route("api/seed")]
    [ApiController]
    public class SeedDataController : ControllerBase
    {
        private readonly SmartLogAiContext _context;

        public SeedDataController(SmartLogAiContext context)
        {
            _context = context;
        }

        [HttpPost("inventory-sample")]
        public async Task<IActionResult> SeedInventorySampleData()
        {
            try
            {
                // Check if data already exists
                if (await _context.Inventories.AnyAsync())
                {
                    return Ok(new { Message = "Inventory data already exists" });
                }

                // Create warehouse, zones, shelves, bins if needed
                var warehouse = await _context.Warehouses.FirstOrDefaultAsync();
                if (warehouse == null)
                {
                    warehouse = new Warehouse
                    {
                        WarehouseCode = "WH-001",
                        WarehouseName = "Main Warehouse",
                        Address = "Ho Chi Minh City",
                        TotalCapacity = 10000,
                        IsActive = true
                    };
                    _context.Warehouses.Add(warehouse);
                    await _context.SaveChangesAsync();
                }

                // Create zones
                var zones = new List<WarehouseZone>();
                var zoneCodes = new[] { "A-1", "A-2", "B-1", "B-2", "B-3", "B-4", "C-1", "C-2" };
                
                foreach (var zoneCode in zoneCodes)
                {
                    var zone = await _context.WarehouseZones.FirstOrDefaultAsync(z => z.ZoneCode == zoneCode);
                    if (zone == null)
                    {
                        zone = new WarehouseZone
                        {
                            WarehouseId = warehouse.WarehouseId,
                            ZoneCode = zoneCode,
                            ZoneName = $"Zone {zoneCode}",
                            ZoneType = "Storage",
                            Capacity = 1000,
                            IsActive = true
                        };
                        _context.WarehouseZones.Add(zone);
                        await _context.SaveChangesAsync();
                    }
                    zones.Add(zone);
                }

                // Create shelves and bins
                var bins = new List<WarehouseBin>();
                foreach (var zone in zones)
                {
                    for (int shelfNum = 1; shelfNum <= 3; shelfNum++)
                    {
                        var shelf = new WarehouseShelf
                        {
                            ZoneId = zone.ZoneId,
                            ShelfCode = $"{zone.ZoneCode}-S{shelfNum}",
                            MaxWeightKg = 100,
                            IsActive = true
                        };
                        _context.WarehouseShelves.Add(shelf);
                        await _context.SaveChangesAsync();

                        for (int binNum = 1; binNum <= 5; binNum++)
                        {
                            var bin = new WarehouseBin
                            {
                                ShelfId = shelf.ShelfId,
                                BinCode = $"{zone.ZoneCode}-S{shelfNum}-B{binNum}",
                                BinType = "Standard",
                                CapacityCbm = 1.5m,
                                MaxWeightKg = 500,
                                IsActive = true
                            };
                            _context.WarehouseBins.Add(bin);
                            await _context.SaveChangesAsync();
                            bins.Add(bin);
                        }
                    }
                }

                // Create SKUs
                var skus = new List<Sku>();
                var productNames = new[] 
                { 
                    "Laptop Dell XPS 15", "iPhone 15 Pro", "Samsung Galaxy S24", 
                    "MacBook Air M3", "iPad Pro 12.9", "Sony WH-1000XM5",
                    "Logitech MX Master 3", "Dell UltraSharp Monitor", "Keychron K2 Keyboard",
                    "Samsung 27\" Monitor", "HP Pavilion Desktop", "Lenovo ThinkPad X1"
                };

                for (int i = 0; i < productNames.Length; i++)
                {
                    var sku = new Sku
                    {
                        Skucode = $"SKU-{1000 + i}",
                        Barcode = $"BAR-{1000 + i}",
                        ProductName = productNames[i],
                        WeightKg = 1.5m,
                        LengthCm = 30,
                        WidthCm = 20,
                        HeightCm = 10,
                        VolumeCbm = 0.006m,
                        SafetyMinQty = 10,
                        IsActive = true,
                        CreatedAt = DateTime.Now
                    };
                    _context.Skus.Add(sku);
                    await _context.SaveChangesAsync();
                    skus.Add(sku);
                }

                // Create Inventory records
                var random = new Random();
                for (int i = 0; i < 142; i++)
                {
                    var sku = skus[random.Next(skus.Count)];
                    var bin = bins[random.Next(bins.Count)];
                    var systemQty = random.Next(5, 100);
                    var actualQty = systemQty + random.Next(-5, 6); // Small variance

                    var inventory = new Inventory
                    {
                        Skuid = sku.Skuid,
                        BinId = bin.BinId,
                        Quantity = systemQty,
                        BatchNo = $"BATCH-{DateTime.Now:yyyyMMdd}-{random.Next(1000, 9999)}",
                        ExpiryDate = DateOnly.FromDateTime(DateTime.Now.AddDays(random.Next(30, 365))),
                        InboundDate = DateOnly.FromDateTime(DateTime.Now.AddDays(-random.Next(1, 90))),
                        LastCountDate = DateOnly.FromDateTime(DateTime.Now.AddDays(-random.Next(1, 30)))
                    };
                    _context.Inventories.Add(inventory);
                }

                await _context.SaveChangesAsync();

                return Ok(new { 
                    Message = "Sample inventory data seeded successfully",
                    TotalSKUs = skus.Count,
                    TotalBins = bins.Count,
                    TotalInventory = 142
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = $"Error seeding data: {ex.Message}" });
            }
        }
    }
}
