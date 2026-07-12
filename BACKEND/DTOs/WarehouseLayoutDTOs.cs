using System;
using System.Collections.Generic;

namespace BACKEND.DTOs
{
    // Hierarchical Tree DTOs
    public class WarehouseTreeDto
    {
        public int WarehouseId { get; set; }
        public string WarehouseCode { get; set; } = null!;
        public string WarehouseName { get; set; } = null!;
        public string? Address { get; set; }
        public decimal? TotalCapacity { get; set; }
        public bool? IsActive { get; set; }
        public List<ZoneTreeDto> Zones { get; set; } = new();
        public List<DockTreeDto> Docks { get; set; } = new();
    }

    public class ZoneTreeDto
    {
        public int ZoneId { get; set; }
        public int WarehouseId { get; set; }
        public string ZoneCode { get; set; } = null!;
        public string ZoneName { get; set; } = null!;
        public string? ZoneType { get; set; }
        public decimal? Capacity { get; set; }
        public bool? IsActive { get; set; }
        public List<ShelfTreeDto> Shelves { get; set; } = new();
    }

    public class ShelfTreeDto
    {
        public int ShelfId { get; set; }
        public int ZoneId { get; set; }
        public string ShelfCode { get; set; } = null!;
        public byte? FloorLevel { get; set; }
        public decimal? MaxWeightKg { get; set; }
        public bool? IsActive { get; set; }
        public List<BinTreeDto> Bins { get; set; } = new();
    }

    public class BinTreeDto
    {
        public int BinId { get; set; }
        public int ShelfId { get; set; }
        public string BinCode { get; set; } = null!;
        public string? BinType { get; set; }
        public decimal? CapacityCbm { get; set; }
        public decimal? MaxWeightKg { get; set; }
        public bool? IsOccupied { get; set; }
        public bool? IsActive { get; set; }
        public int CurrentStock { get; set; }
    }

    public class DockTreeDto
    {
        public int DockId { get; set; }
        public int WarehouseId { get; set; }
        public string DockCode { get; set; } = null!;
        public string? DockName { get; set; }
        public string? Status { get; set; }
        public decimal? MaxTruckLength { get; set; }
        public bool? IsActive { get; set; }
    }

    // Individual CRUD DTOs
    public class WarehouseDetailDto
    {
        public int WarehouseId { get; set; }
        public string WarehouseCode { get; set; } = null!;
        public string WarehouseName { get; set; } = null!;
        public string? Address { get; set; }
        public decimal? TotalCapacity { get; set; }
        public bool? IsActive { get; set; }
    }

    public class WarehouseCreateDto
    {
        public string WarehouseCode { get; set; } = null!;
        public string WarehouseName { get; set; } = null!;
        public string? Address { get; set; }
        public decimal? TotalCapacity { get; set; }
    }

    public class WarehouseUpdateDto
    {
        public string WarehouseName { get; set; } = null!;
        public string? Address { get; set; }
        public decimal? TotalCapacity { get; set; }
    }

    public class ZoneDetailDto
    {
        public int ZoneId { get; set; }
        public int WarehouseId { get; set; }
        public string ZoneCode { get; set; } = null!;
        public string ZoneName { get; set; } = null!;
        public string? ZoneType { get; set; }
        public decimal? Capacity { get; set; }
        public bool? IsActive { get; set; }
    }

    public class ZoneCreateDto
    {
        public int WarehouseId { get; set; }
        public string ZoneCode { get; set; } = null!;
        public string ZoneName { get; set; } = null!;
        public string? ZoneType { get; set; } // 'NORMAL','COLD','HAZMAT','HEAVY'
        public decimal? Capacity { get; set; }
    }

    public class ZoneUpdateDto
    {
        public string ZoneName { get; set; } = null!;
        public string? ZoneType { get; set; }
        public decimal? Capacity { get; set; }
    }

    public class ShelfDetailDto
    {
        public int ShelfId { get; set; }
        public int ZoneId { get; set; }
        public string ShelfCode { get; set; } = null!;
        public byte? FloorLevel { get; set; }
        public decimal? MaxWeightKg { get; set; }
        public bool? IsActive { get; set; }
    }

    public class ShelfCreateDto
    {
        public int ZoneId { get; set; }
        public string ShelfCode { get; set; } = null!;
        public byte? FloorLevel { get; set; }
        public decimal? MaxWeightKg { get; set; }
    }

    public class ShelfUpdateDto
    {
        public byte? FloorLevel { get; set; }
        public decimal? MaxWeightKg { get; set; }
    }

    public class BinDetailDto
    {
        public int BinId { get; set; }
        public int ShelfId { get; set; }
        public string BinCode { get; set; } = null!;
        public string? BinType { get; set; }
        public decimal? CapacityCbm { get; set; }
        public decimal? MaxWeightKg { get; set; }
        public bool? IsOccupied { get; set; }
        public bool? IsActive { get; set; }
    }

    public class BinCreateDto
    {
        public int ShelfId { get; set; }
        public string BinCode { get; set; } = null!;
        public string? BinType { get; set; } // 'STANDARD','COLD','HAZMAT'
        public decimal? CapacityCbm { get; set; }
        public decimal? MaxWeightKg { get; set; }
    }

    public class BinUpdateDto
    {
        public string? BinType { get; set; }
        public decimal? CapacityCbm { get; set; }
        public decimal? MaxWeightKg { get; set; }
    }

    public class DockDetailDto
    {
        public int DockId { get; set; }
        public int WarehouseId { get; set; }
        public string DockCode { get; set; } = null!;
        public string? DockName { get; set; }
        public string? Status { get; set; }
        public decimal? MaxTruckLength { get; set; }
        public bool? IsActive { get; set; }
    }

    public class DockCreateDto
    {
        public int WarehouseId { get; set; }
        public string DockCode { get; set; } = null!;
        public string? DockName { get; set; }
        public string? Status { get; set; } // 'AVAILABLE','OCCUPIED','MAINTENANCE'
        public decimal? MaxTruckLength { get; set; }
    }

    public class DockUpdateDto
    {
        public string? DockName { get; set; }
        public string? Status { get; set; }
        public decimal? MaxTruckLength { get; set; }
    }

    public class StatusUpdateDto
    {
        public bool IsActive { get; set; }
    }

    public class DockStatusUpdateDto
    {
        public string Status { get; set; } = null!;
    }

    public class BulkBinCreateDto
    {
        public int ShelfId { get; set; }
        public string Prefix { get; set; } = null!;
        public int StartNumber { get; set; }
        public int EndNumber { get; set; }
        public string? BinType { get; set; }
        public decimal? CapacityCbm { get; set; }
        public decimal? MaxWeightKg { get; set; }
    }
}
