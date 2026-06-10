using System.ComponentModel.DataAnnotations;

namespace BACKEND.DTOs
{
    public class OutboundRequestDto
    {
        [Required]
        public int OrderId { get; set; }
    }
}
