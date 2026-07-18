namespace BACKEND.DTOs
{
    public class UpdateCompanyProfileDto
    {
        public string CompanyName { get; set; } = string.Empty;
        public string TaxCode { get; set; } = string.Empty;
        public string? Address { get; set; }
        public string? Phone { get; set; }
        public string? Email { get; set; }
        public string? Website { get; set; }
        public string? LogoUrl { get; set; }
        public string? DigitalSignPath { get; set; }
    }
}
