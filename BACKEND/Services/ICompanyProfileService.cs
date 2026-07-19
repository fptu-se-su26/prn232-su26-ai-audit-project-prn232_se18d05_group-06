using System.Collections.Generic;
using System.Threading.Tasks;
using BACKEND.DTOs;

namespace BACKEND.Services
{
    public interface ICompanyProfileService
    {
        Task<CompanyProfileDto?> GetCompanyProfileAsync();
        Task<CompanyProfileDto> UpdateCompanyProfileAsync(UpdateCompanyProfileDto dto);
    }
}
