using System;
using System.Collections.Generic;

namespace BACKEND.Models;

public partial class NotificationConfig
{
    public int ConfigId { get; set; }

    public string EventType { get; set; } = null!;

    public string Channel { get; set; } = null!;

    public string Template { get; set; } = null!;

    public bool? IsActive { get; set; }

    public DateTime? CreatedAt { get; set; }
}
