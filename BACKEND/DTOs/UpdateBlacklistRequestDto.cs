using System.ComponentModel.DataAnnotations;

namespace BACKEND.DTOs
{
    public class UpdateBlacklistRequestDto
    {
        public bool IsBlacklisted { get; set; }

        public string? BlacklistReason { get; set; }
    }
}
