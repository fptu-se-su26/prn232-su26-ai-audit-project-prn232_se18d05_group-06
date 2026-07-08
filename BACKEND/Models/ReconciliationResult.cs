using System;
using System.Collections.Generic;
using BACKEND.DTOs;

namespace BACKEND.Models
{
    public class ReconciliationResult
    {
        public byte[] ExcelReport { get; set; } = Array.Empty<byte>();
        public string FileName { get; set; } = "ReconciliationReport.xlsx";
        public List<DiscrepancyDto> CriticalDiffs { get; set; } = new();
    }
}
