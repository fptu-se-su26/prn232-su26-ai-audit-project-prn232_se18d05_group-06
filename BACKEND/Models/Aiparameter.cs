using System;
using System.Collections.Generic;

namespace BACKEND.Models;

public partial class Aiparameter
{
    public int ParamId { get; set; }

    public string ParamKey { get; set; } = null!;

    public string ParamValue { get; set; } = null!;

    public string? Description { get; set; }

    public int? UpdatedBy { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public virtual User? UpdatedByNavigation { get; set; }
}
