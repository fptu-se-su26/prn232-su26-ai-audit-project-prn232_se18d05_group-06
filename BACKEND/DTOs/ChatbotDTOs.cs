namespace BACKEND.DTOs
{
    public class ChatbotAskRequestDto
    {
        public string? Question { get; set; }
    }

    public class ChatbotAskResponseDto
    {
        public string Answer { get; set; } = string.Empty;
        public string Source { get; set; } = "FAQ";
        public string? MatchedQuestion { get; set; }
        public string? Category { get; set; }
        public double Confidence { get; set; }
        public DateTime RespondedAt { get; set; } = DateTime.UtcNow;
    }

    public class CustomerFaqDto
    {
        public int FaqId { get; set; }
        public string Category { get; set; } = string.Empty;
        public string Question { get; set; } = string.Empty;
        public string Answer { get; set; } = string.Empty;
        public string? Tags { get; set; }
    }
}