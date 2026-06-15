using System;
using System.Collections.Generic;

namespace BACKEND.Models;

public partial class Faqitem
{
    public int Faqid { get; set; }

    public string? Category { get; set; }

    public string Question { get; set; } = null!;

    public string Answer { get; set; } = null!;

    public string? Tags { get; set; }

    public bool? IsActive { get; set; }

    public int? CreatedBy { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual User? CreatedByNavigation { get; set; }
}
