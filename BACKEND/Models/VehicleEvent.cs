using System;
using System.Collections.Generic;

namespace BACKEND.Models
{
    public partial class VehicleEvent
    {
        public int EventId { get; set; }

        public int VehicleId { get; set; }

        public string EventType { get; set; } = null!;

        public DateTime EventTime { get; set; }

        public string? Remarks { get; set; }

        public virtual Vehicle Vehicle { get; set; } = null!;
    }
}
