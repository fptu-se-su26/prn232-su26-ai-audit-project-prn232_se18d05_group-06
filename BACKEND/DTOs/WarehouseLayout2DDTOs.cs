using System;

namespace BACKEND.DTOs
{
    public class WarehouseLayoutMapDto
    {
        public int MapId { get; set; }
        public int WarehouseId { get; set; }
        public string MapName { get; set; } = null!;
        public int CanvasWidth { get; set; }
        public int CanvasHeight { get; set; }
        public string? BackgroundImageUrl { get; set; }
    }

    public class WarehouseLayoutObjectDto
    {
        public int ObjectId { get; set; }
        public int MapId { get; set; }
        public string ObjectType { get; set; } = null!; // 'ZONE','SHELF','BIN','DOCK','AISLE','WALL','GATE','LABEL'
        public string? RefType { get; set; }            // 'ZONE','SHELF','BIN','DOCK'
        public int? RefId { get; set; }
        public string? Label { get; set; }
        public decimal X { get; set; }
        public decimal Y { get; set; }
        public decimal Width { get; set; }
        public decimal Height { get; set; }
        public decimal RotationDeg { get; set; }
        public string? FillColor { get; set; }
        public string? StrokeColor { get; set; }
        public int ZIndex { get; set; }
        public bool IsLocked { get; set; }
        public bool IsActive { get; set; }
        public string? RuntimeStatus { get; set; } // Real-time operational status (e.g. AVAILABLE, OCCUPIED, MAINTENANCE, etc.)
    }

    public class LayoutObjectPositionPatch
    {
        public decimal X { get; set; }
        public decimal Y { get; set; }
        public decimal Width { get; set; }
        public decimal Height { get; set; }
        public decimal RotationDeg { get; set; }
    }

    public class LayoutObjectCreateDto
    {
        public int MapId { get; set; }
        public string ObjectType { get; set; } = null!;
        public string? RefType { get; set; }
        public int? RefId { get; set; }
        public string? Label { get; set; }
        public decimal X { get; set; }
        public decimal Y { get; set; }
        public decimal Width { get; set; }
        public decimal Height { get; set; }
        public decimal RotationDeg { get; set; }
        public string? FillColor { get; set; }
        public string? StrokeColor { get; set; }
    }
}
