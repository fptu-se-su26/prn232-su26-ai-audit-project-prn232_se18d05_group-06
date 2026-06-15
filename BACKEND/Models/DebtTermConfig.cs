using System;
using System.Collections.Generic;

namespace BACKEND.Models;

public partial class DebtTermConfig
{
    public int TermId { get; set; }

    public string CustomerTier { get; set; } = null!;

    public int PaymentDays { get; set; }

    public int? ReminderDay1 { get; set; }

    public int? ReminderDay2 { get; set; }

    public bool? IsActive { get; set; }
}
