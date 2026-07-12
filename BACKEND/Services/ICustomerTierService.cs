using System.Collections.Generic;
using System.Threading.Tasks;
using BACKEND.DTOs.CustomerTier;

namespace BACKEND.Services;

public interface ICustomerTierService
{
    // Tier Config CRUD
    Task<List<TierConfigDto>> GetTierConfigsAsync();
    Task<TierConfigDto> CreateTierConfigAsync(TierConfigDto dto);
    Task<TierConfigDto?> UpdateTierConfigAsync(int id, TierConfigDto dto);
    Task<bool> DeleteTierConfigAsync(int id);
    Task<TierConfigDto?> GetBenefitsAsync(string tierCode);

    // Tier Calculations
    Task<CustomerTierDto?> CalculateAndUpdateCustomerTierAsync(int customerId);
    Task<int> UpdateAllCustomerTiersAsync();

    // Reporting and Lists
    Task<List<CustomerTierSummaryDto>> GetTierSummaryAsync();
    Task<List<CustomerTierDto>> GetCustomersByTierAsync(string? tierCode);
    Task<CustomerTierDto?> GetCustomerTierAsync(int customerId);
}
