using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using BACKEND.Models;
using BACKEND.DTOs;

namespace BACKEND.Services
{
    public class CompanyProfileService : ICompanyProfileService
    {
        private readonly SmartLogAiContext _context;

        public CompanyProfileService(SmartLogAiContext context)
        {
            _context = context;
        }

        public async Task<CompanyProfileDto?> GetCompanyProfileAsync()
        {
            var profile = await _context.CompanyProfiles.FirstOrDefaultAsync();
            if (profile == null)
            {
                return null;
            }
            return MapToDto(profile);
        }

        public async Task<CompanyProfileDto> UpdateCompanyProfileAsync(UpdateCompanyProfileDto dto)
        {
            var profile = await _context.CompanyProfiles.FirstOrDefaultAsync();
            
            if (profile == null)
            {
                profile = new CompanyProfile
                {
                    CompanyName = dto.CompanyName,
                    TaxCode = dto.TaxCode,
                    Address = dto.Address,
                    Phone = dto.Phone,
                    Email = dto.Email,
                    Website = dto.Website,
                    LogoUrl = dto.LogoUrl,
                    DigitalSignPath = dto.DigitalSignPath,
                    CreatedAt = DateTime.UtcNow
                };
                _context.CompanyProfiles.Add(profile);
            }
            else
            {
                profile.CompanyName = dto.CompanyName;
                profile.TaxCode = dto.TaxCode;
                profile.Address = dto.Address;
                profile.Phone = dto.Phone;
                profile.Email = dto.Email;
                profile.Website = dto.Website;
                profile.LogoUrl = dto.LogoUrl;
                profile.DigitalSignPath = dto.DigitalSignPath;
                profile.UpdatedAt = DateTime.UtcNow;
                _context.CompanyProfiles.Update(profile);
            }

            await _context.SaveChangesAsync();
            return MapToDto(profile);
        }

        private static CompanyProfileDto MapToDto(CompanyProfile profile)
        {
            return new CompanyProfileDto
            {
                CompanyId = profile.CompanyId,
                CompanyName = profile.CompanyName,
                TaxCode = profile.TaxCode,
                Address = profile.Address,
                Phone = profile.Phone,
                Email = profile.Email,
                Website = profile.Website,
                LogoUrl = profile.LogoUrl,
                DigitalSignPath = profile.DigitalSignPath,
                CreatedAt = profile.CreatedAt,
                UpdatedAt = profile.UpdatedAt
            };
        }
    }
}
