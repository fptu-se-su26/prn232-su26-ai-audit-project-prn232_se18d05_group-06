using System;

namespace BACKEND.DTOs
{
    public class GateCheckPlateRequestDto
    {
        public string DetectedPlate { get; set; } = null!;
        public int WarehouseId { get; set; }
        public string? CameraId { get; set; }
        public decimal? AlprConfidence { get; set; }
        public string? GateCameraSnap { get; set; }
    }
}
