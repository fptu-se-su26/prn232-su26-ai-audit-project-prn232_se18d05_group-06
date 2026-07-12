namespace BACKEND.DTOs;

public class CreateServiceFeedbackRequestDto
{
    public int? StarRating { get; set; }
    public string? Comment { get; set; }
}

public class ServiceFeedbackDto
{
    public int FeedbackId { get; set; }
    public int CustomerId { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public string? CustomerEmail { get; set; }
    public int? OrderId { get; set; }
    public string OrderCode { get; set; } = string.Empty;
    public string OrderStatus { get; set; } = string.Empty;
    public int StarRating { get; set; }
    public string? Comment { get; set; }
    public DateTime CreatedAt { get; set; }
    public bool NeedsFollowUp { get; set; }
    public string FollowUpStatus { get; set; } = string.Empty;
}

public class ServiceFeedbackDashboardDto
{
    public int TotalFeedback { get; set; }
    public decimal AverageRating { get; set; }
    public int LowRatingCount { get; set; }
    public int FollowUpCount { get; set; }
    public Dictionary<int, int> RatingDistribution { get; set; } = new();
    public List<ServiceFeedbackDto> Items { get; set; } = new();
}