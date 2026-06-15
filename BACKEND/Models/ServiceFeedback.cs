using System;
using System.Collections.Generic;

namespace BACKEND.Models;

public partial class ServiceFeedback
{
    public int FeedbackId { get; set; }

    public int CustomerId { get; set; }

    public int? OrderId { get; set; }

    public byte? StarRating { get; set; }

    public string? Comment { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual Customer Customer { get; set; } = null!;

    public virtual ServiceOrder? Order { get; set; }
}
