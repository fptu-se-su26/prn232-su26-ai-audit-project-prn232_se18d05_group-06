using BACKEND.DTOs;
using BACKEND.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BACKEND.Controllers;

[ApiController]
[Authorize]
[Route("api/admin/service-feedback")]
public class ServiceFeedbackController : ControllerBase
{
    private readonly SmartLogAiContext _context;

    public ServiceFeedbackController(SmartLogAiContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<ServiceFeedbackDashboardDto>> GetDashboard(
        [FromQuery] string? rating = null,
        [FromQuery] bool lowOnly = false,
        [FromQuery] string? keyword = null)
    {
        var query = _context.ServiceFeedbacks
            .Include(f => f.Customer)
            .Include(f => f.Order)
            .AsNoTracking()
            .AsQueryable();

        if (lowOnly)
        {
            query = query.Where(f => f.StarRating <= 2);
        }

        if (int.TryParse(rating, out var ratingValue) && ratingValue >= 1 && ratingValue <= 5)
        {
            query = query.Where(f => f.StarRating == ratingValue);
        }

        if (!string.IsNullOrWhiteSpace(keyword))
        {
            var search = keyword.Trim();
            query = query.Where(f =>
                f.Customer.CompanyName.Contains(search) ||
                (f.Customer.Email != null && f.Customer.Email.Contains(search)) ||
                (f.Order != null && f.Order.OrderCode.Contains(search)) ||
                (f.Comment != null && f.Comment.Contains(search)));
        }

        var allFeedback = await _context.ServiceFeedbacks.AsNoTracking().ToListAsync();
        var items = await query
            .OrderByDescending(f => f.CreatedAt)
            .ThenByDescending(f => f.FeedbackId)
            .Take(200)
            .ToListAsync();

        var distribution = Enumerable.Range(1, 5).ToDictionary(
            star => star,
            star => allFeedback.Count(f => f.StarRating == star));

        var total = allFeedback.Count;
        var average = total == 0 ? 0 : Math.Round((decimal)allFeedback.Average(f => f.StarRating ?? 0), 2);
        var lowCount = allFeedback.Count(f => f.StarRating <= 2);

        return Ok(new ServiceFeedbackDashboardDto
        {
            TotalFeedback = total,
            AverageRating = average,
            LowRatingCount = lowCount,
            FollowUpCount = lowCount,
            RatingDistribution = distribution,
            Items = items.Select(MapToDto).ToList()
        });
    }

    private static ServiceFeedbackDto MapToDto(ServiceFeedback feedback)
    {
        var star = feedback.StarRating ?? 0;
        return new ServiceFeedbackDto
        {
            FeedbackId = feedback.FeedbackId,
            CustomerId = feedback.CustomerId,
            CustomerName = feedback.Customer?.CompanyName ?? string.Empty,
            CustomerEmail = feedback.Customer?.Email,
            OrderId = feedback.OrderId,
            OrderCode = feedback.Order?.OrderCode ?? string.Empty,
            OrderStatus = feedback.Order?.Status ?? string.Empty,
            StarRating = star,
            Comment = feedback.Comment,
            CreatedAt = feedback.CreatedAt ?? DateTime.UtcNow,
            NeedsFollowUp = star <= 2,
            FollowUpStatus = star <= 2 ? "NEEDS_FOLLOW_UP" : "NORMAL"
        };
    }
}