using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using BACKEND.DTOs;
using BACKEND.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BACKEND.Controllers
{
    [ApiController]
    [Authorize]
    public class CustomerChatbotController : ControllerBase
    {
        private readonly ICustomerChatbotService _chatbotService;

        public CustomerChatbotController(ICustomerChatbotService chatbotService)
        {
            _chatbotService = chatbotService;
        }

        [HttpPost("api/customer/chatbot/ask")]
        public async Task<ActionResult<ChatbotAskResponseDto>> Ask([FromBody] ChatbotAskRequestDto request, CancellationToken cancellationToken)
        {
            var userId = GetCurrentUserId();
            if (userId == null)
            {
                return Unauthorized(new { Message = "Missing or invalid user id claim." });
            }

            var question = request.Question?.Trim();
            if (string.IsNullOrWhiteSpace(question))
            {
                return BadRequest(new { Message = "Vui lòng nhập câu hỏi trước khi gửi." });
            }

            if (question.Length > 1000)
            {
                return BadRequest(new { Message = "Câu hỏi quá dài. Vui lòng nhập dưới 1000 ký tự." });
            }

            var response = await _chatbotService.AskAsync(question, userId.Value, cancellationToken);
            return Ok(response);
        }

        [HttpGet("api/customer/faqs")]
        public async Task<ActionResult<List<CustomerFaqDto>>> GetFaqs([FromQuery] string? keyword, [FromQuery] string? category, CancellationToken cancellationToken)
        {
            var faqs = await _chatbotService.GetFaqsAsync(keyword, category, cancellationToken);
            return Ok(faqs);
        }

        private int? GetCurrentUserId()
        {
            var raw = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value
                ?? User.FindFirst("sub")?.Value;

            return int.TryParse(raw, out var userId) ? userId : null;
        }
    }
}