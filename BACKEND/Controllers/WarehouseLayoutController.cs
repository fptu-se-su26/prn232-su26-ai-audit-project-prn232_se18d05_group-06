using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BACKEND.DTOs;
using BACKEND.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BACKEND.Controllers
{
    [ApiController]
    [Route("api/admin")]
    public class WarehouseLayoutController : ControllerBase
    {
        private readonly SmartLogAiContext _context;

        public WarehouseLayoutController(SmartLogAiContext context)
        {
            _context = context;
        }

        // ==========================================
        // WAREHOUSE LAYOUT TREE
        // ==========================================

        [HttpGet("warehouse-layout/tree")]
        public async Task<ActionResult<List<WarehouseTreeDto>>> GetWarehouseLayoutTree([FromQuery] int? warehouseId = null)
        {
            try
            {
                var query = _context.Warehouses.AsQueryable();
                if (warehouseId.HasValue)
                {
                    query = query.Where(w => w.WarehouseId == warehouseId.Value);
                }

                var warehouses = await query
                    .Include(w => w.Docks)
                    .Include(w => w.WarehouseZones)
                        .ThenInclude(z => z.WarehouseShelves)
                            .ThenInclude(s => s.WarehouseBins)
                                .ThenInclude(b => b.Inventories)
                    .AsNoTracking()
                    .ToListAsync();

                var tree = warehouses.Select(w => new WarehouseTreeDto
                {
                    WarehouseId = w.WarehouseId,
                    WarehouseCode = w.WarehouseCode,
                    WarehouseName = w.WarehouseName,
                    Address = w.Address,
                    TotalCapacity = w.TotalCapacity,
                    IsActive = w.IsActive,
                    Docks = w.Docks.Select(d => new DockTreeDto
                    {
                        DockId = d.DockId,
                        WarehouseId = d.WarehouseId,
                        DockCode = d.DockCode,
                        DockName = d.DockName,
                        Status = d.Status,
                        MaxTruckLength = d.MaxTruckLength,
                        IsActive = d.IsActive
                    }).ToList(),
                    Zones = w.WarehouseZones.Select(z => new ZoneTreeDto
                    {
                        ZoneId = z.ZoneId,
                        WarehouseId = z.WarehouseId,
                        ZoneCode = z.ZoneCode,
                        ZoneName = z.ZoneName,
                        ZoneType = z.ZoneType,
                        Capacity = z.Capacity,
                        IsActive = z.IsActive,
                        Shelves = z.WarehouseShelves.Select(s => new ShelfTreeDto
                        {
                            ShelfId = s.ShelfId,
                            ZoneId = s.ZoneId,
                            ShelfCode = s.ShelfCode,
                            FloorLevel = s.FloorLevel,
                            MaxWeightKg = s.MaxWeightKg,
                            IsActive = s.IsActive,
                            Bins = s.WarehouseBins.Select(b => new BinTreeDto
                            {
                                BinId = b.BinId,
                                ShelfId = b.ShelfId,
                                BinCode = b.BinCode,
                                BinType = b.BinType,
                                CapacityCbm = b.CapacityCbm,
                                MaxWeightKg = b.MaxWeightKg,
                                IsOccupied = b.IsOccupied,
                                IsActive = b.IsActive,
                                CurrentStock = b.Inventories.Sum(i => i.Quantity)
                            }).ToList()
                        }).ToList()
                    }).ToList()
                }).ToList();

                return Ok(tree);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // ==========================================
        // WAREHOUSE CRUD
        // ==========================================

        [HttpGet("warehouses")]
        public async Task<ActionResult<List<WarehouseDetailDto>>> GetWarehouses()
        {
            var warehouses = await _context.Warehouses
                .AsNoTracking()
                .Select(w => new WarehouseDetailDto
                {
                    WarehouseId = w.WarehouseId,
                    WarehouseCode = w.WarehouseCode,
                    WarehouseName = w.WarehouseName,
                    Address = w.Address,
                    TotalCapacity = w.TotalCapacity,
                    IsActive = w.IsActive
                }).ToListAsync();

            return Ok(warehouses);
        }

        [HttpPost("warehouses")]
        public async Task<ActionResult<WarehouseDetailDto>> CreateWarehouse([FromBody] WarehouseCreateDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.WarehouseCode))
                return BadRequest("WarehouseCode is required.");
            if (string.IsNullOrWhiteSpace(dto.WarehouseName))
                return BadRequest("WarehouseName is required.");
            if (dto.TotalCapacity.HasValue && dto.TotalCapacity.Value <= 0)
                return BadRequest("TotalCapacity must be greater than 0.");

            var exists = await _context.Warehouses.AnyAsync(w => w.WarehouseCode == dto.WarehouseCode);
            if (exists)
                return BadRequest($"Warehouse with code '{dto.WarehouseCode}' already exists.");

            var warehouse = new Warehouse
            {
                WarehouseCode = dto.WarehouseCode,
                WarehouseName = dto.WarehouseName,
                Address = dto.Address,
                TotalCapacity = dto.TotalCapacity,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            _context.Warehouses.Add(warehouse);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetWarehouseLayoutTree), new { warehouseId = warehouse.WarehouseId }, new WarehouseDetailDto
            {
                WarehouseId = warehouse.WarehouseId,
                WarehouseCode = warehouse.WarehouseCode,
                WarehouseName = warehouse.WarehouseName,
                Address = warehouse.Address,
                TotalCapacity = warehouse.TotalCapacity,
                IsActive = warehouse.IsActive
            });
        }

        [HttpPut("warehouses/{id}")]
        public async Task<IActionResult> UpdateWarehouse(int id, [FromBody] WarehouseUpdateDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.WarehouseName))
                return BadRequest("WarehouseName is required.");
            if (dto.TotalCapacity.HasValue && dto.TotalCapacity.Value <= 0)
                return BadRequest("TotalCapacity must be greater than 0.");

            var warehouse = await _context.Warehouses.FindAsync(id);
            if (warehouse == null)
                return NotFound($"Warehouse with ID {id} not found.");

            warehouse.WarehouseName = dto.WarehouseName;
            warehouse.Address = dto.Address;
            warehouse.TotalCapacity = dto.TotalCapacity;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpPatch("warehouses/{id}/status")]
        public async Task<IActionResult> UpdateWarehouseStatus(int id, [FromBody] StatusUpdateDto dto)
        {
            var warehouse = await _context.Warehouses.FindAsync(id);
            if (warehouse == null)
                return NotFound($"Warehouse with ID {id} not found.");

            if (!dto.IsActive)
            {
                var hasInventory = await _context.Inventories
                    .AnyAsync(i => i.Bin.Shelf.Zone.WarehouseId == id && i.Quantity > 0);
                if (hasInventory)
                {
                    return BadRequest("Không thể vô hiệu hóa kho này vì vẫn còn hàng tồn ở các vị trí bên trong.");
                }
            }

            warehouse.IsActive = dto.IsActive;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // ==========================================
        // ZONE CRUD
        // ==========================================

        [HttpGet("warehouses/{warehouseId}/zones")]
        public async Task<ActionResult<List<ZoneDetailDto>>> GetWarehouseZones(int warehouseId)
        {
            var zones = await _context.WarehouseZones
                .AsNoTracking()
                .Where(z => z.WarehouseId == warehouseId)
                .Select(z => new ZoneDetailDto
                {
                    ZoneId = z.ZoneId,
                    WarehouseId = z.WarehouseId,
                    ZoneCode = z.ZoneCode,
                    ZoneName = z.ZoneName,
                    ZoneType = z.ZoneType,
                    Capacity = z.Capacity,
                    IsActive = z.IsActive
                }).ToListAsync();

            return Ok(zones);
        }

        [HttpPost("warehouse-zones")]
        public async Task<ActionResult<ZoneDetailDto>> CreateZone([FromBody] ZoneCreateDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.ZoneCode))
                return BadRequest("ZoneCode is required.");
            if (string.IsNullOrWhiteSpace(dto.ZoneName))
                return BadRequest("ZoneName is required.");
            if (dto.Capacity.HasValue && dto.Capacity.Value <= 0)
                return BadRequest("Capacity must be greater than 0.");

            var warehouseExists = await _context.Warehouses.AnyAsync(w => w.WarehouseId == dto.WarehouseId);
            if (!warehouseExists)
                return NotFound($"Warehouse with ID {dto.WarehouseId} not found.");

            var exists = await _context.WarehouseZones.AnyAsync(z => z.WarehouseId == dto.WarehouseId && z.ZoneCode == dto.ZoneCode);
            if (exists)
                return BadRequest($"Zone with code '{dto.ZoneCode}' already exists in this Warehouse.");

            var zone = new WarehouseZone
            {
                WarehouseId = dto.WarehouseId,
                ZoneCode = dto.ZoneCode,
                ZoneName = dto.ZoneName,
                ZoneType = dto.ZoneType,
                Capacity = dto.Capacity,
                IsActive = true
            };

            _context.WarehouseZones.Add(zone);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetWarehouseZones), new { warehouseId = zone.WarehouseId }, new ZoneDetailDto
            {
                ZoneId = zone.ZoneId,
                WarehouseId = zone.WarehouseId,
                ZoneCode = zone.ZoneCode,
                ZoneName = zone.ZoneName,
                ZoneType = zone.ZoneType,
                Capacity = zone.Capacity,
                IsActive = zone.IsActive
            });
        }

        [HttpPut("warehouse-zones/{id}")]
        public async Task<IActionResult> UpdateZone(int id, [FromBody] ZoneUpdateDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.ZoneName))
                return BadRequest("ZoneName is required.");
            if (dto.Capacity.HasValue && dto.Capacity.Value <= 0)
                return BadRequest("Capacity must be greater than 0.");

            var zone = await _context.WarehouseZones.FindAsync(id);
            if (zone == null)
                return NotFound($"Zone with ID {id} not found.");

            zone.ZoneName = dto.ZoneName;
            zone.ZoneType = dto.ZoneType;
            zone.Capacity = dto.Capacity;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpPatch("warehouse-zones/{id}/status")]
        public async Task<IActionResult> UpdateZoneStatus(int id, [FromBody] StatusUpdateDto dto)
        {
            var zone = await _context.WarehouseZones.FindAsync(id);
            if (zone == null)
                return NotFound($"Zone with ID {id} not found.");

            if (!dto.IsActive)
            {
                var hasInventory = await _context.Inventories
                    .AnyAsync(i => i.Bin.Shelf.ZoneId == id && i.Quantity > 0);
                if (hasInventory)
                {
                    return BadRequest("Không thể vô hiệu hóa khu vực này vì vẫn còn hàng tồn ở các vị trí bên trong.");
                }
            }

            zone.IsActive = dto.IsActive;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // ==========================================
        // SHELF CRUD
        // ==========================================

        [HttpGet("warehouse-zones/{zoneId}/shelves")]
        public async Task<ActionResult<List<ShelfDetailDto>>> GetZoneShelves(int zoneId)
        {
            var shelves = await _context.WarehouseShelves
                .AsNoTracking()
                .Where(s => s.ZoneId == zoneId)
                .Select(s => new ShelfDetailDto
                {
                    ShelfId = s.ShelfId,
                    ZoneId = s.ZoneId,
                    ShelfCode = s.ShelfCode,
                    FloorLevel = s.FloorLevel,
                    MaxWeightKg = s.MaxWeightKg,
                    IsActive = s.IsActive
                }).ToListAsync();

            return Ok(shelves);
        }

        [HttpPost("warehouse-shelves")]
        public async Task<ActionResult<ShelfDetailDto>> CreateShelf([FromBody] ShelfCreateDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.ShelfCode))
                return BadRequest("ShelfCode is required.");
            if (dto.FloorLevel.HasValue && dto.FloorLevel.Value < 1)
                return BadRequest("FloorLevel must be 1 or greater.");
            if (dto.MaxWeightKg.HasValue && dto.MaxWeightKg.Value <= 0)
                return BadRequest("MaxWeightKg must be greater than 0.");

            var zone = await _context.WarehouseZones.FindAsync(dto.ZoneId);
            if (zone == null)
                return NotFound($"Zone with ID {dto.ZoneId} not found.");

            // Business Rule: Shelf load capacity cannot exceed Zone total load capacity
            if (dto.MaxWeightKg.HasValue && zone.Capacity.HasValue && dto.MaxWeightKg.Value > zone.Capacity.Value)
            {
                return BadRequest($"Tải trọng của kệ ({dto.MaxWeightKg.Value} kg) không được vượt quá quy định chịu tải của khu vực ({zone.Capacity.Value} kg).");
            }

            var exists = await _context.WarehouseShelves.AnyAsync(s => s.ZoneId == dto.ZoneId && s.ShelfCode == dto.ShelfCode);
            if (exists)
                return BadRequest($"Shelf with code '{dto.ShelfCode}' already exists in this Zone.");

            var shelf = new WarehouseShelf
            {
                ZoneId = dto.ZoneId,
                ShelfCode = dto.ShelfCode,
                FloorLevel = dto.FloorLevel ?? 1,
                MaxWeightKg = dto.MaxWeightKg,
                IsActive = true
            };

            _context.WarehouseShelves.Add(shelf);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetZoneShelves), new { zoneId = shelf.ZoneId }, new ShelfDetailDto
            {
                ShelfId = shelf.ShelfId,
                ZoneId = shelf.ZoneId,
                ShelfCode = shelf.ShelfCode,
                FloorLevel = shelf.FloorLevel,
                MaxWeightKg = shelf.MaxWeightKg,
                IsActive = shelf.IsActive
            });
        }

        [HttpPut("warehouse-shelves/{id}")]
        public async Task<IActionResult> UpdateShelf(int id, [FromBody] ShelfUpdateDto dto)
        {
            if (dto.FloorLevel.HasValue && dto.FloorLevel.Value < 1)
                return BadRequest("FloorLevel must be 1 or greater.");
            if (dto.MaxWeightKg.HasValue && dto.MaxWeightKg.Value <= 0)
                return BadRequest("MaxWeightKg must be greater than 0.");

            var shelf = await _context.WarehouseShelves.FindAsync(id);
            if (shelf == null)
                return NotFound($"Shelf with ID {id} not found.");

            var zone = await _context.WarehouseZones.FindAsync(shelf.ZoneId);
            if (dto.MaxWeightKg.HasValue && zone != null && zone.Capacity.HasValue && dto.MaxWeightKg.Value > zone.Capacity.Value)
            {
                return BadRequest($"Tải trọng của kệ ({dto.MaxWeightKg.Value} kg) không được vượt quá quy định chịu tải của khu vực ({zone.Capacity.Value} kg).");
            }

            shelf.FloorLevel = dto.FloorLevel ?? 1;
            shelf.MaxWeightKg = dto.MaxWeightKg;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpPatch("warehouse-shelves/{id}/status")]
        public async Task<IActionResult> UpdateShelfStatus(int id, [FromBody] StatusUpdateDto dto)
        {
            var shelf = await _context.WarehouseShelves.FindAsync(id);
            if (shelf == null)
                return NotFound($"Shelf with ID {id} not found.");

            if (!dto.IsActive)
            {
                var hasInventory = await _context.Inventories
                    .AnyAsync(i => i.Bin.ShelfId == id && i.Quantity > 0);
                if (hasInventory)
                {
                    return BadRequest("Không thể vô hiệu hóa kệ này vì vẫn còn hàng tồn ở các vị trí bên trong.");
                }
            }

            shelf.IsActive = dto.IsActive;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // ==========================================
        // BIN CRUD
        // ==========================================

        [HttpGet("warehouse-bins")]
        public async Task<ActionResult<List<BinDetailDto>>> GetAllBins([FromQuery] string? search = null)
        {
            var query = _context.WarehouseBins.AsQueryable();
            if (!string.IsNullOrWhiteSpace(search))
            {
                query = query.Where(b => b.BinCode.Contains(search));
            }

            var bins = await query
                .AsNoTracking()
                .Select(b => new BinDetailDto
                {
                    BinId = b.BinId,
                    ShelfId = b.ShelfId,
                    BinCode = b.BinCode,
                    BinType = b.BinType,
                    CapacityCbm = b.CapacityCbm,
                    MaxWeightKg = b.MaxWeightKg,
                    IsOccupied = b.IsOccupied,
                    IsActive = b.IsActive
                }).ToListAsync();

            return Ok(bins);
        }

        [HttpGet("warehouse-shelves/{shelfId}/bins")]
        public async Task<ActionResult<List<BinDetailDto>>> GetShelfBins(int shelfId)
        {
            var bins = await _context.WarehouseBins
                .AsNoTracking()
                .Where(b => b.ShelfId == shelfId)
                .Select(b => new BinDetailDto
                {
                    BinId = b.BinId,
                    ShelfId = b.ShelfId,
                    BinCode = b.BinCode,
                    BinType = b.BinType,
                    CapacityCbm = b.CapacityCbm,
                    MaxWeightKg = b.MaxWeightKg,
                    IsOccupied = b.IsOccupied,
                    IsActive = b.IsActive
                }).ToListAsync();

            return Ok(bins);
        }

        [HttpPost("warehouse-bins")]
        public async Task<ActionResult<BinDetailDto>> CreateBin([FromBody] BinCreateDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.BinCode))
                return BadRequest("BinCode is required.");
            if (dto.CapacityCbm.HasValue && dto.CapacityCbm.Value <= 0)
                return BadRequest("CapacityCbm must be greater than 0.");
            if (dto.MaxWeightKg.HasValue && dto.MaxWeightKg.Value <= 0)
                return BadRequest("MaxWeightKg must be greater than 0.");

            var shelf = await _context.WarehouseShelves
                .Include(s => s.Zone)
                .FirstOrDefaultAsync(s => s.ShelfId == dto.ShelfId);

            if (shelf == null)
                return NotFound($"Shelf with ID {dto.ShelfId} not found.");

            // Business Rule: Validate BinType against ZoneType
            var zoneType = shelf.Zone.ZoneType?.ToUpper();
            var binType = dto.BinType?.ToUpper();

            if (zoneType == "COLD" && binType != "COLD")
            {
                return BadRequest("Khu vực lạnh chỉ được chứa ô chứa lạnh (BinType = COLD).");
            }
            if (zoneType == "HAZMAT" && binType != "HAZMAT")
            {
                return BadRequest("Khu vực hàng nguy hiểm chỉ được chứa ô chứa nguy hiểm (BinType = HAZMAT).");
            }
            if ((zoneType == "NORMAL" || zoneType == "HEAVY") && binType != "STANDARD")
            {
                return BadRequest("Khu vực này chỉ cho phép ô chứa tiêu chuẩn (BinType = STANDARD).");
            }

            var exists = await _context.WarehouseBins.AnyAsync(b => b.BinCode == dto.BinCode);
            if (exists)
                return BadRequest($"Bin with code '{dto.BinCode}' already exists globally.");

            var bin = new WarehouseBin
            {
                ShelfId = dto.ShelfId,
                BinCode = dto.BinCode,
                BinType = dto.BinType ?? "STANDARD",
                CapacityCbm = dto.CapacityCbm,
                MaxWeightKg = dto.MaxWeightKg,
                IsOccupied = false,
                IsActive = true
            };

            _context.WarehouseBins.Add(bin);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetShelfBins), new { shelfId = bin.ShelfId }, new BinDetailDto
            {
                BinId = bin.BinId,
                ShelfId = bin.ShelfId,
                BinCode = bin.BinCode,
                BinType = bin.BinType,
                CapacityCbm = bin.CapacityCbm,
                MaxWeightKg = bin.MaxWeightKg,
                IsOccupied = bin.IsOccupied,
                IsActive = bin.IsActive
            });
        }

        [HttpPost("warehouse-bins/bulk")]
        public async Task<ActionResult<List<BinDetailDto>>> CreateBinsBulk([FromBody] BulkBinCreateDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Prefix))
                return BadRequest("Prefix is required.");
            if (dto.StartNumber < 0 || dto.EndNumber < dto.StartNumber)
                return BadRequest("Invalid StartNumber or EndNumber range.");
            if (dto.CapacityCbm.HasValue && dto.CapacityCbm.Value <= 0)
                return BadRequest("CapacityCbm must be greater than 0.");
            if (dto.MaxWeightKg.HasValue && dto.MaxWeightKg.Value <= 0)
                return BadRequest("MaxWeightKg must be greater than 0.");

            var shelf = await _context.WarehouseShelves
                .Include(s => s.Zone)
                .FirstOrDefaultAsync(s => s.ShelfId == dto.ShelfId);

            if (shelf == null)
                return NotFound($"Shelf with ID {dto.ShelfId} not found.");

            // Business Rule: Validate BinType against ZoneType
            var zoneType = shelf.Zone.ZoneType?.ToUpper();
            var binType = dto.BinType?.ToUpper() ?? "STANDARD";

            if (zoneType == "COLD" && binType != "COLD")
            {
                return BadRequest("Khu vực lạnh chỉ được chứa ô chứa lạnh (BinType = COLD).");
            }
            if (zoneType == "HAZMAT" && binType != "HAZMAT")
            {
                return BadRequest("Khu vực hàng nguy hiểm chỉ được chứa ô chứa nguy hiểm (BinType = HAZMAT).");
            }
            if ((zoneType == "NORMAL" || zoneType == "HEAVY") && binType != "STANDARD")
            {
                return BadRequest("Khu vực này chỉ cho phép ô chứa tiêu chuẩn (BinType = STANDARD).");
            }

            var createdBins = new List<WarehouseBin>();

            for (int i = dto.StartNumber; i <= dto.EndNumber; i++)
            {
                string codeSuffix = i.ToString("D2");
                string binCode = $"{dto.Prefix}{codeSuffix}";

                var exists = await _context.WarehouseBins.AnyAsync(b => b.BinCode == binCode);
                if (exists)
                {
                    return BadRequest($"Bin with code '{binCode}' already exists globally. Operation aborted to maintain transactional consistency.");
                }

                var bin = new WarehouseBin
                {
                    ShelfId = dto.ShelfId,
                    BinCode = binCode,
                    BinType = binType,
                    CapacityCbm = dto.CapacityCbm,
                    MaxWeightKg = dto.MaxWeightKg,
                    IsOccupied = false,
                    IsActive = true
                };

                createdBins.Add(bin);
            }

            _context.WarehouseBins.AddRange(createdBins);
            await _context.SaveChangesAsync();

            var result = createdBins.Select(b => new BinDetailDto
            {
                BinId = b.BinId,
                ShelfId = b.ShelfId,
                BinCode = b.BinCode,
                BinType = b.BinType,
                CapacityCbm = b.CapacityCbm,
                MaxWeightKg = b.MaxWeightKg,
                IsOccupied = b.IsOccupied,
                IsActive = b.IsActive
            }).ToList();

            return Ok(result);
        }

        [HttpPut("warehouse-bins/{id}")]
        public async Task<IActionResult> UpdateBin(int id, [FromBody] BinUpdateDto dto)
        {
            if (dto.CapacityCbm.HasValue && dto.CapacityCbm.Value <= 0)
                return BadRequest("CapacityCbm must be greater than 0.");
            if (dto.MaxWeightKg.HasValue && dto.MaxWeightKg.Value <= 0)
                return BadRequest("MaxWeightKg must be greater than 0.");

            var bin = await _context.WarehouseBins
                .Include(b => b.Shelf)
                    .ThenInclude(s => s.Zone)
                .FirstOrDefaultAsync(b => b.BinId == id);

            if (bin == null)
                return NotFound($"Bin with ID {id} not found.");

            // Business Rule: Validate BinType against ZoneType if changed
            if (dto.BinType != null)
            {
                var zoneType = bin.Shelf.Zone.ZoneType?.ToUpper();
                var binType = dto.BinType.ToUpper();

                if (zoneType == "COLD" && binType != "COLD")
                {
                    return BadRequest("Khu vực lạnh chỉ được chứa ô chứa lạnh (BinType = COLD).");
                }
                if (zoneType == "HAZMAT" && binType != "HAZMAT")
                {
                    return BadRequest("Khu vực hàng nguy hiểm chỉ được chứa ô chứa nguy hiểm (BinType = HAZMAT).");
                }
                if ((zoneType == "NORMAL" || zoneType == "HEAVY") && binType != "STANDARD")
                {
                    return BadRequest("Khu vực này chỉ cho phép ô chứa tiêu chuẩn (BinType = STANDARD).");
                }

                bin.BinType = dto.BinType;
            }

            bin.CapacityCbm = dto.CapacityCbm;
            bin.MaxWeightKg = dto.MaxWeightKg;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpPatch("warehouse-bins/{id}/status")]
        public async Task<IActionResult> UpdateBinStatus(int id, [FromBody] StatusUpdateDto dto)
        {
            var bin = await _context.WarehouseBins.FindAsync(id);
            if (bin == null)
                return NotFound($"Bin with ID {id} not found.");

            // Business Rule: Do not allow deactivating if there is stock in this Bin
            if (!dto.IsActive)
            {
                var currentStock = await _context.Inventories
                    .Where(i => i.BinId == id)
                    .SumAsync(i => i.Quantity);

                if (currentStock > 0)
                {
                    return BadRequest("Không thể vô hiệu hóa Bin vì vị trí này vẫn còn hàng tồn. Vui lòng chuyển hàng sang Bin khác trước.");
                }
            }

            bin.IsActive = dto.IsActive;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // ==========================================
        // DOCK CRUD
        // ==========================================

        [HttpGet("warehouses/{warehouseId}/docks")]
        public async Task<ActionResult<List<DockDetailDto>>> GetWarehouseDocks(int warehouseId)
        {
            var docks = await _context.Docks
                .AsNoTracking()
                .Where(d => d.WarehouseId == warehouseId)
                .Select(d => new DockDetailDto
                {
                    DockId = d.DockId,
                    WarehouseId = d.WarehouseId,
                    DockCode = d.DockCode,
                    DockName = d.DockName,
                    Status = d.Status,
                    MaxTruckLength = d.MaxTruckLength,
                    IsActive = d.IsActive
                }).ToListAsync();

            return Ok(docks);
        }

        [HttpPost("docks")]
        public async Task<ActionResult<DockDetailDto>> CreateDock([FromBody] DockCreateDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.DockCode))
                return BadRequest("DockCode is required.");
            if (dto.MaxTruckLength.HasValue && dto.MaxTruckLength.Value <= 0)
                return BadRequest("MaxTruckLength must be greater than 0.");

            var warehouseExists = await _context.Warehouses.AnyAsync(w => w.WarehouseId == dto.WarehouseId);
            if (!warehouseExists)
                return NotFound($"Warehouse with ID {dto.WarehouseId} not found.");

            var exists = await _context.Docks.AnyAsync(d => d.DockCode == dto.DockCode);
            if (exists)
                return BadRequest($"Dock with code '{dto.DockCode}' already exists globally.");

            var dock = new Dock
            {
                WarehouseId = dto.WarehouseId,
                DockCode = dto.DockCode,
                DockName = dto.DockName,
                Status = dto.Status ?? "AVAILABLE",
                MaxTruckLength = dto.MaxTruckLength,
                IsActive = true
            };

            _context.Docks.Add(dock);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetWarehouseDocks), new { warehouseId = dock.WarehouseId }, new DockDetailDto
            {
                DockId = dock.DockId,
                WarehouseId = dock.WarehouseId,
                DockCode = dock.DockCode,
                DockName = dock.DockName,
                Status = dock.Status,
                MaxTruckLength = dock.MaxTruckLength,
                IsActive = dock.IsActive
            });
        }

        [HttpPut("docks/{id}")]
        public async Task<IActionResult> UpdateDock(int id, [FromBody] DockUpdateDto dto)
        {
            if (dto.MaxTruckLength.HasValue && dto.MaxTruckLength.Value <= 0)
                return BadRequest("MaxTruckLength must be greater than 0.");

            var dock = await _context.Docks.FindAsync(id);
            if (dock == null)
                return NotFound($"Dock with ID {id} not found.");

            dock.DockName = dto.DockName;
            if (!string.IsNullOrWhiteSpace(dto.Status))
            {
                dock.Status = dto.Status;
            }
            dock.MaxTruckLength = dto.MaxTruckLength;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpPatch("docks/{id}/status")]
        public async Task<IActionResult> UpdateDockActiveStatus(int id, [FromBody] StatusUpdateDto dto)
        {
            var dock = await _context.Docks.FindAsync(id);
            if (dock == null)
                return NotFound($"Dock with ID {id} not found.");

            dock.IsActive = dto.IsActive;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpPatch("docks/{id}/dock-status")]
        public async Task<IActionResult> UpdateDockStatus(int id, [FromBody] DockStatusUpdateDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Status))
                return BadRequest("Status is required.");

            var dock = await _context.Docks.FindAsync(id);
            if (dock == null)
                return NotFound($"Dock with ID {id} not found.");

            var status = dto.Status.ToUpper();
            if (status != "AVAILABLE" && status != "OCCUPIED" && status != "MAINTENANCE")
            {
                return BadRequest("Invalid Status. Allowed: AVAILABLE, OCCUPIED, MAINTENANCE.");
            }

            dock.Status = status;
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // ==========================================
        // 2D LAYOUT MAPS & OBJECTS
        // ==========================================

        [HttpGet("warehouse-layout/maps")]
        public async Task<ActionResult<List<WarehouseLayoutMapDto>>> GetWarehouseLayoutMaps([FromQuery] int warehouseId)
        {
            try
            {
                var maps = await _context.WarehouseLayoutMaps
                    .Where(m => m.WarehouseId == warehouseId && m.IsActive == true)
                    .OrderByDescending(m => m.UpdatedAt)
                    .ThenByDescending(m => m.MapId)
                    .Select(m => new WarehouseLayoutMapDto
                    {
                        MapId = m.MapId,
                        WarehouseId = m.WarehouseId,
                        MapName = m.MapName,
                        CanvasWidth = m.CanvasWidth,
                        CanvasHeight = m.CanvasHeight,
                        BackgroundImageUrl = m.BackgroundImageUrl
                    })
                    .ToListAsync();

                // If no map exists, create a default empty map so user does not experience empty state
                if (maps.Count == 0)
                {
                    var warehouse = await _context.Warehouses.FindAsync(warehouseId);
                    if (warehouse != null)
                    {
                        var defaultMap = new WarehouseLayoutMap
                        {
                            WarehouseId = warehouseId,
                            MapName = $"2D Layout - {warehouse.WarehouseName}",
                            CanvasWidth = 1200,
                            CanvasHeight = 800,
                            IsActive = true,
                            CreatedAt = DateTime.UtcNow,
                            UpdatedAt = DateTime.UtcNow
                        };
                        _context.WarehouseLayoutMaps.Add(defaultMap);
                        await _context.SaveChangesAsync();

                        maps.Add(new WarehouseLayoutMapDto
                        {
                            MapId = defaultMap.MapId,
                            WarehouseId = defaultMap.WarehouseId,
                            MapName = defaultMap.MapName,
                            CanvasWidth = defaultMap.CanvasWidth,
                            CanvasHeight = defaultMap.CanvasHeight
                        });
                    }
                }

                return Ok(maps);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("warehouse-layout/maps/{mapId}/objects")]
        public async Task<ActionResult<object>> GetWarehouseLayoutObjects(int mapId)
        {
            try
            {
                var map = await _context.WarehouseLayoutMaps.FindAsync(mapId);
                if (map == null)
                    return NotFound($"Layout Map with ID {mapId} not found.");

                var objects = await _context.WarehouseLayoutObjects
                    .Where(o => o.MapId == mapId && o.IsActive == true)
                    .ToListAsync();

                // Fetch physical states to compute real-time operational status (RuntimeStatus)
                var binsList = await _context.WarehouseBins.Include(b => b.Inventories).AsNoTracking().ToListAsync();
                var docksList = await _context.Docks.AsNoTracking().ToListAsync();
                var zonesList = await _context.WarehouseZones
                    .Include(z => z.WarehouseShelves)
                        .ThenInclude(s => s.WarehouseBins)
                    .AsNoTracking()
                    .ToListAsync();

                var objectDtos = objects.Select(o =>
                {
                    string? runtimeStatus = null;

                    if (o.ObjectType == "BIN" && o.RefId.HasValue)
                    {
                        var bin = binsList.FirstOrDefault(b => b.BinId == o.RefId.Value);
                        if (bin != null)
                        {
                            if (bin.IsActive == false) runtimeStatus = "INACTIVE";
                            else if (bin.IsOccupied == true || bin.Inventories.Sum(i => i.Quantity) > 0) runtimeStatus = "OCCUPIED";
                            else runtimeStatus = "AVAILABLE";
                        }
                    }
                    else if (o.ObjectType == "DOCK" && o.RefId.HasValue)
                    {
                        var dock = docksList.FirstOrDefault(d => d.DockId == o.RefId.Value);
                        if (dock != null)
                        {
                            runtimeStatus = dock.Status; // AVAILABLE, OCCUPIED, MAINTENANCE
                        }
                    }
                    else if (o.ObjectType == "ZONE" && o.RefId.HasValue)
                    {
                        var zone = zonesList.FirstOrDefault(z => z.ZoneId == o.RefId.Value);
                        if (zone != null)
                        {
                            int totalBins = zone.WarehouseShelves.SelectMany(s => s.WarehouseBins).Count();
                            int occupiedBins = zone.WarehouseShelves.SelectMany(s => s.WarehouseBins)
                                .Count(b => b.IsOccupied == true || b.Inventories.Any());

                            if (totalBins > 0)
                            {
                                double rate = (double)occupiedBins / totalBins;
                                if (rate >= 1.0) runtimeStatus = "FULL";
                                else if (rate >= 0.8) runtimeStatus = "ALMOST_FULL";
                                else runtimeStatus = "NORMAL";
                            }
                        }
                    }

                    return new WarehouseLayoutObjectDto
                    {
                        ObjectId = o.ObjectId,
                        MapId = o.MapId,
                        ObjectType = o.ObjectType,
                        RefType = o.RefType,
                        RefId = o.RefId,
                        Label = o.Label,
                        X = o.X,
                        Y = o.Y,
                        Width = o.Width,
                        Height = o.Height,
                        RotationDeg = o.RotationDeg ?? 0,
                        FillColor = o.FillColor,
                        StrokeColor = o.StrokeColor,
                        ZIndex = o.ZIndex ?? 0,
                        IsLocked = o.IsLocked ?? false,
                        IsActive = o.IsActive ?? true,
                        RuntimeStatus = runtimeStatus
                    };
                }).ToList();

                return Ok(new
                {
                    MapId = map.MapId,
                    WarehouseId = map.WarehouseId,
                    MapName = map.MapName,
                    CanvasWidth = map.CanvasWidth,
                    CanvasHeight = map.CanvasHeight,
                    Objects = objectDtos
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPatch("warehouse-layout/objects/{objectId}/position")]
        public async Task<IActionResult> UpdateLayoutObjectPosition(int objectId, [FromBody] LayoutObjectPositionPatch patch)
        {
            try
            {
                var obj = await _context.WarehouseLayoutObjects.FindAsync(objectId);
                if (obj == null)
                    return NotFound($"Layout Object with ID {objectId} not found.");

                obj.X = patch.X;
                obj.Y = patch.Y;
                obj.Width = patch.Width;
                obj.Height = patch.Height;
                obj.RotationDeg = patch.RotationDeg;
                obj.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost("warehouse-layout/objects")]
        public async Task<ActionResult<WarehouseLayoutObjectDto>> CreateLayoutObject([FromBody] LayoutObjectCreateDto dto)
        {
            try
            {
                var obj = new WarehouseLayoutObject
                {
                    MapId = dto.MapId,
                    ObjectType = dto.ObjectType.ToUpper(),
                    RefType = dto.RefType?.ToUpper(),
                    RefId = dto.RefId,
                    Label = dto.Label,
                    X = dto.X,
                    Y = dto.Y,
                    Width = dto.Width,
                    Height = dto.Height,
                    RotationDeg = dto.RotationDeg,
                    FillColor = dto.FillColor,
                    StrokeColor = dto.StrokeColor,
                    ZIndex = 0,
                    IsLocked = false,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _context.WarehouseLayoutObjects.Add(obj);
                await _context.SaveChangesAsync();

                var resDto = new WarehouseLayoutObjectDto
                {
                    ObjectId = obj.ObjectId,
                    MapId = obj.MapId,
                    ObjectType = obj.ObjectType,
                    RefType = obj.RefType,
                    RefId = obj.RefId,
                    Label = obj.Label,
                    X = obj.X,
                    Y = obj.Y,
                    Width = obj.Width,
                    Height = obj.Height,
                    RotationDeg = obj.RotationDeg ?? 0,
                    FillColor = obj.FillColor,
                    StrokeColor = obj.StrokeColor,
                    ZIndex = obj.ZIndex ?? 0,
                    IsLocked = obj.IsLocked ?? false,
                    IsActive = obj.IsActive ?? true
                };

                return CreatedAtAction(nameof(GetWarehouseLayoutObjects), new { mapId = obj.MapId }, resDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPatch("warehouse-layout/objects/{objectId}/disable")]
        public async Task<IActionResult> DisableLayoutObject(int objectId)
        {
            try
            {
                var obj = await _context.WarehouseLayoutObjects.FindAsync(objectId);
                if (obj == null)
                    return NotFound($"Layout Object with ID {objectId} not found.");

                obj.IsActive = false;
                obj.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost("warehouse-layout/maps/{mapId}/auto-generate")]
        public async Task<IActionResult> AutoGenerateLayout(int mapId)
        {
            try
            {
                var map = await _context.WarehouseLayoutMaps.FindAsync(mapId);
                if (map == null)
                    return NotFound($"Layout Map with ID {mapId} not found.");

                // Delete existing active objects
                var existing = await _context.WarehouseLayoutObjects.Where(o => o.MapId == mapId).ToListAsync();
                _context.WarehouseLayoutObjects.RemoveRange(existing);

                // Fetch physical structures
                var zones = await _context.WarehouseZones
                    .Include(z => z.WarehouseShelves)
                        .ThenInclude(s => s.WarehouseBins)
                    .Where(z => z.WarehouseId == map.WarehouseId && z.IsActive == true)
                    .ToListAsync();

                var docks = await _context.Docks
                    .Where(d => d.WarehouseId == map.WarehouseId && d.IsActive == true)
                    .ToListAsync();

                map.CanvasWidth = 1200;
                map.CanvasHeight = 800;

                void AddLayoutObject(
                    string objectType,
                    string? refType,
                    int? refId,
                    string label,
                    decimal x,
                    decimal y,
                    decimal width,
                    decimal height,
                    string fillColor,
                    string strokeColor,
                    int zIndex,
                    bool isLocked = false)
                {
                    _context.WarehouseLayoutObjects.Add(new WarehouseLayoutObject
                    {
                        MapId = mapId,
                        ObjectType = objectType,
                        RefType = refType,
                        RefId = refId,
                        Label = label,
                        X = x,
                        Y = y,
                        Width = width,
                        Height = height,
                        FillColor = fillColor,
                        StrokeColor = strokeColor,
                        ZIndex = zIndex,
                        IsLocked = isLocked,
                        IsActive = true
                    });
                }

                AddLayoutObject("WALL", null, null, "WAREHOUSE BOUNDARY", 32, 42, 1136, 704, "#FFFFFF", "#172033", 0, true);
                AddLayoutObject("AISLE", null, null, "MAIN AISLE", 500, 108, 44, 560, "#F8FAFC", "#CBD5E1", 2, true);
                AddLayoutObject("AISLE", null, null, "CROSS AISLE", 74, 372, 888, 48, "#F8FAFC", "#CBD5E1", 2, true);
                AddLayoutObject("AISLE", null, null, "DOCK LANE", 974, 108, 34, 560, "#F8FAFC", "#CBD5E1", 2, true);
                AddLayoutObject("GATE", null, null, "ENTRY / EXIT", 928, 696, 190, 38, "#E0E7FF", "#4F46E5", 4, true);

                // Generate a readable 2xN warehouse plan. Left side is storage, right side is dispatch/docks.
                int zoneIdx = 0;
                foreach (var z in zones)
                {
                    int row = zoneIdx / 2;
                    int col = zoneIdx % 2;

                    decimal zX = col == 0 ? 72 : 566;
                    decimal zY = 108 + row * 314;
                    decimal zW = 390;
                    decimal zH = 238;

                    string fillColor = z.ZoneType == "COLD" ? "#E0F7FA" : z.ZoneType == "HAZMAT" ? "#FFE4E6" : z.ZoneType == "HEAVY" ? "#EDE9FE" : "#DBEAFE";
                    string strokeColor = z.ZoneType == "COLD" ? "#06B6D4" : z.ZoneType == "HAZMAT" ? "#F43F5E" : z.ZoneType == "HEAVY" ? "#8B5CF6" : "#3B82F6";

                    AddLayoutObject("ZONE", "ZONE", z.ZoneId, z.ZoneCode, zX, zY, zW, zH, fillColor, strokeColor, 1);

                    var bins = z.WarehouseShelves.SelectMany(s => s.WarehouseBins).ToList();
                    int columns = bins.Count > 12 ? 5 : 4;
                    decimal binW = bins.Count > 12 ? 58 : 66;
                    decimal binH = 42;
                    decimal gap = 12;
                    int binIdx = 0;

                    foreach (var b in bins)
                    {
                        int bCol = binIdx % columns;
                        int bRow = binIdx / columns;
                        decimal bX = zX + 28 + bCol * (binW + gap);
                        decimal bY = zY + 70 + bRow * (binH + gap);

                        if (bY + binH > zY + zH - 18)
                        {
                            bY = zY + zH - binH - 18;
                        }

                        string binFill = b.IsActive == false ? "#E5E7EB" : b.IsOccupied == true ? "#DBEAFE" : b.BinType == "COLD" ? "#CFFAFE" : b.BinType == "HAZMAT" ? "#FECACA" : "#DCFCE7";
                        string binStroke = b.IsActive == false ? "#94A3B8" : b.IsOccupied == true ? "#2563EB" : b.BinType == "COLD" ? "#06B6D4" : b.BinType == "HAZMAT" ? "#F43F5E" : "#16A34A";

                        AddLayoutObject("BIN", "BIN", b.BinId, b.BinCode, bX, bY, binW, binH, binFill, binStroke, 5);
                        binIdx++;
                    }

                    zoneIdx++;
                }

                int dockIdx = 0;
                foreach (var d in docks)
                {
                    decimal dX = 1030;
                    decimal dY = 126 + dockIdx * 92;
                    decimal dW = 108;
                    decimal dH = 58;

                    string dockFill = d.Status == "AVAILABLE" ? "#DCFCE7" : d.Status == "OCCUPIED" ? "#DBEAFE" : "#FEF3C7";
                    string dockStroke = d.Status == "AVAILABLE" ? "#16A34A" : d.Status == "OCCUPIED" ? "#2563EB" : "#F59E0B";

                    AddLayoutObject("DOCK", "DOCK", d.DockId, d.DockCode, dX, dY, dW, dH, dockFill, dockStroke, 4);
                    dockIdx++;
                }
                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}
