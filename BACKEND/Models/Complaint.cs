using System;
using System.Collections.Generic;

namespace BACKEND.Models;

public partial class Complaint
{
    public int ComplaintId { get; set; }

    public string ComplaintCode { get; set; } = null!;

    public int CustomerId { get; set; }

    public int? OrderId { get; set; }

    public string? ComplaintType { get; set; }

    public string? Description { get; set; }

    public string? Status { get; set; }

    public int? AssignedTo { get; set; }

    public DateTime? ResolvedAt { get; set; }

    public string? ResolutionNote { get; set; }

    public DateTime? CreatedAt { get; set; }

    public DateTime? DeadlineAt { get; set; }

    public virtual User? AssignedToNavigation { get; set; }

    public virtual Customer Customer { get; set; } = null!;

    public virtual ServiceOrder? Order { get; set; }
}
