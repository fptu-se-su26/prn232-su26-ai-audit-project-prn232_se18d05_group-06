using System;
using System.Collections.Generic;

namespace BACKEND.Models;

public partial class ApiintegrationLog
{
    public long LogId { get; set; }

    public string Apiname { get; set; } = null!;

    public string? Endpoint { get; set; }

    public string? Method { get; set; }

    public int? StatusCode { get; set; }

    public int? DurationMs { get; set; }

    public bool? IsSuccess { get; set; }

    public string? ErrorMessage { get; set; }

    public DateTime? LoggedAt { get; set; }
}
