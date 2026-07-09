using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BACKEND.DTOs.CustomerTier;
using BACKEND.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace BACKEND.Services;

public class CustomerTierService : ICustomerTierService
{
    private readonly SmartLogAiContext _context;
    private readonly ILogger<CustomerTierService> _logger;

    public CustomerTierService(SmartLogAiContext context, ILogger<CustomerTierService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<List<TierConfigDto>> GetTierConfigsAsync()
    {
        await EnsureTierConfigsTableAsync();
        return await _context.TierConfigs
            .Select(t => new TierConfigDto
            {
                TierId = t.TierId,
                TierName = t.TierName,
                TierCode = t.TierCode,
                MinOrders = t.MinOrders,
                MinRevenue = t.MinRevenue,
                DiscountPercent = t.DiscountPercent,
                IsActive = t.IsActive
            })
            .OrderByDescending(t => t.MinRevenue)
            .ToListAsync();
    }

    public async Task<TierConfigDto> CreateTierConfigAsync(TierConfigDto dto)
    {
        await EnsureTierConfigsTableAsync();
        var entity = new TierConfig
        {
            TierName = dto.TierName,
            TierCode = dto.TierCode,
            MinOrders = dto.MinOrders,
            MinRevenue = dto.MinRevenue,
            DiscountPercent = dto.DiscountPercent,
            IsActive = dto.IsActive
        };

        _context.TierConfigs.Add(entity);
        await _context.SaveChangesAsync();

        dto.TierId = entity.TierId;
        return dto;
    }

    public async Task<TierConfigDto?> UpdateTierConfigAsync(int id, TierConfigDto dto)
    {
        await EnsureTierConfigsTableAsync();
        var entity = await _context.TierConfigs.FindAsync(id);
        if (entity == null) return null;

        entity.TierName = dto.TierName;
        entity.TierCode = dto.TierCode;
        entity.MinOrders = dto.MinOrders;
        entity.MinRevenue = dto.MinRevenue;
        entity.DiscountPercent = dto.DiscountPercent;
        entity.IsActive = dto.IsActive;

        await _context.SaveChangesAsync();
        dto.TierId = entity.TierId;
        return dto;
    }

    public async Task<bool> DeleteTierConfigAsync(int id)
    {
        await EnsureTierConfigsTableAsync();
        var entity = await _context.TierConfigs.FindAsync(id);
        if (entity == null) return false;

        _context.TierConfigs.Remove(entity);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<TierConfigDto?> GetBenefitsAsync(string tierCode)
    {
        await EnsureTierConfigsTableAsync();
        var config = await _context.TierConfigs
            .FirstOrDefaultAsync(t => t.TierCode == tierCode && t.IsActive);
            
        if (config == null) return null;

        return new TierConfigDto
        {
            TierId = config.TierId,
            TierName = config.TierName,
            TierCode = config.TierCode,
            MinOrders = config.MinOrders,
            MinRevenue = config.MinRevenue,
            DiscountPercent = config.DiscountPercent,
            IsActive = config.IsActive
        };
    }

    public async Task<CustomerTierDto?> CalculateAndUpdateCustomerTierAsync(int customerId)
    {
        await EnsureTierConfigsTableAsync();
        var customer = await _context.Customers.FindAsync(customerId);
        if (customer == null) return null;

        var twelveMonthsAgo = DateTime.UtcNow.AddMonths(-12);

        // Get orders for the last 12 months, excluding CANCELLED
        var recentOrders = await _context.ServiceOrders
            .Where(o => o.CustomerId == customerId && o.CreatedAt >= twelveMonthsAgo && o.Status != "CANCELLED")
            .ToListAsync();

        int totalOrders = recentOrders.Count;
        decimal totalRevenue = recentOrders.Sum(o => o.FinalCost ?? o.EstimatedCost ?? 0m);

        // Get active tier configs sorted by requirement descending
        var tierConfigs = await _context.TierConfigs
            .Where(t => t.IsActive)
            .OrderByDescending(t => t.MinRevenue)
            .ThenByDescending(t => t.MinOrders)
            .ToListAsync();

        string assignedTierCode = "BRONZE"; // Default fallback
        foreach (var tier in tierConfigs)
        {
            if (totalOrders >= tier.MinOrders && totalRevenue >= tier.MinRevenue)
            {
                assignedTierCode = tier.TierCode;
                break; // Because it's sorted descending, the first match is the highest eligible tier
            }
        }

        // Update customer
        customer.Tier = assignedTierCode;
        customer.TierUpdatedAt = DateOnly.FromDateTime(DateTime.UtcNow);
        customer.TotalOrders12M = totalOrders;

        await _context.SaveChangesAsync();

        return new CustomerTierDto
        {
            CustomerId = customer.CustomerId,
            CustomerCode = customer.CustomerCode,
            CompanyName = customer.CompanyName,
            Tier = customer.Tier,
            TierUpdatedAt = customer.TierUpdatedAt,
            TotalOrders12M = customer.TotalOrders12M,
            TotalRevenue12M = totalRevenue
        };
    }

    public async Task<int> UpdateAllCustomerTiersAsync()
    {
        await EnsureTierConfigsTableAsync();
        var customerIds = await _context.Customers.Select(c => c.CustomerId).ToListAsync();
        int updateCount = 0;

        foreach (var id in customerIds)
        {
            var result = await CalculateAndUpdateCustomerTierAsync(id);
            if (result != null) updateCount++;
        }

        _logger.LogInformation($"Batch updated tiers for {updateCount} customers.");
        return updateCount;
    }

    public async Task<List<CustomerTierSummaryDto>> GetTierSummaryAsync()
    {
        await EnsureTierConfigsTableAsync();
        var tierConfigs = await _context.TierConfigs.Where(t => t.IsActive).ToListAsync();
        var customerTiers = await _context.Customers.GroupBy(c => c.Tier).Select(g => new { Tier = g.Key, Count = g.Count() }).ToListAsync();

        var summary = new List<CustomerTierSummaryDto>();

        foreach (var config in tierConfigs)
        {
            var count = customerTiers.FirstOrDefault(c => c.Tier == config.TierCode)?.Count ?? 0;
            summary.Add(new CustomerTierSummaryDto
            {
                TierCode = config.TierCode,
                TierName = config.TierName,
                DiscountPercent = config.DiscountPercent,
                CustomerCount = count
            });
        }

        // Add "Unknown" or not categorized if any exist
        var knownTiers = tierConfigs.Select(t => t.TierCode).ToList();
        var unknownCount = customerTiers.Where(c => c.Tier == null || !knownTiers.Contains(c.Tier)).Sum(c => c.Count);
        if (unknownCount > 0)
        {
            summary.Add(new CustomerTierSummaryDto
            {
                TierCode = "UNKNOWN",
                TierName = "Chưa phân hạng",
                DiscountPercent = 0,
                CustomerCount = unknownCount
            });
        }

        return summary.OrderByDescending(s => s.DiscountPercent).ToList();
    }

    public async Task<List<CustomerTierDto>> GetCustomersByTierAsync(string? tierCode)
    {
        var query = _context.Customers.AsQueryable();

        if (!string.IsNullOrEmpty(tierCode))
        {
            query = query.Where(c => c.Tier == tierCode);
        }

        // Need to calculate 12M revenue on the fly for the list, or just use a group join.
        var twelveMonthsAgo = DateTime.UtcNow.AddMonths(-12);
        
        var customers = await query.Select(c => new
        {
            c.CustomerId,
            c.CustomerCode,
            c.CompanyName,
            c.Tier,
            c.TierUpdatedAt,
            c.TotalOrders12M,
            TotalRevenue12M = _context.ServiceOrders
                .Where(o => o.CustomerId == c.CustomerId && o.CreatedAt >= twelveMonthsAgo && o.Status != "CANCELLED")
                .Sum(o => o.FinalCost ?? o.EstimatedCost ?? 0m)
        }).ToListAsync();

        return customers.Select(c => new CustomerTierDto
        {
            CustomerId = c.CustomerId,
            CustomerCode = c.CustomerCode,
            CompanyName = c.CompanyName,
            Tier = c.Tier,
            TierUpdatedAt = c.TierUpdatedAt,
            TotalOrders12M = c.TotalOrders12M,
            TotalRevenue12M = c.TotalRevenue12M
        }).ToList();
    }

    public async Task<CustomerTierDto?> GetCustomerTierAsync(int customerId)
    {
        var c = await _context.Customers.FindAsync(customerId);
        if (c == null) return null;

        var twelveMonthsAgo = DateTime.UtcNow.AddMonths(-12);
        var totalRevenue = await _context.ServiceOrders
            .Where(o => o.CustomerId == customerId && o.CreatedAt >= twelveMonthsAgo && o.Status != "CANCELLED")
            .SumAsync(o => o.FinalCost ?? o.EstimatedCost ?? 0m);

        return new CustomerTierDto
        {
            CustomerId = c.CustomerId,
            CustomerCode = c.CustomerCode,
            CompanyName = c.CompanyName,
            Tier = c.Tier,
            TierUpdatedAt = c.TierUpdatedAt,
            TotalOrders12M = c.TotalOrders12M,
            TotalRevenue12M = totalRevenue
        };
    }
    private async Task EnsureTierConfigsTableAsync()
    {
        const string sql = @"
IF OBJECT_ID('dbo.TierConfigs', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.TierConfigs (
        TierID          INT IDENTITY(1,1) PRIMARY KEY,
        TierName        NVARCHAR(100) NOT NULL,
        TierCode        VARCHAR(50)   NOT NULL,
        MinOrders       INT           NOT NULL,
        MinRevenue      DECIMAL(18,2) NOT NULL,
        DiscountPercent DECIMAL(5,2)  NOT NULL,
        IsActive        BIT           NOT NULL CONSTRAINT DF_TierConfigs_IsActive DEFAULT 1
    );

    CREATE UNIQUE INDEX IX_TierConfigs_TierCode ON dbo.TierConfigs(TierCode);
END;

IF NOT EXISTS (SELECT 1 FROM dbo.TierConfigs)
BEGIN
    INSERT INTO dbo.TierConfigs (TierName, TierCode, MinOrders, MinRevenue, DiscountPercent, IsActive)
    VALUES
        (N'Đồng', 'BRONZE', 0, 0, 0, 1),
        (N'Bạc', 'SILVER', 50, 50000000, 5, 1),
        (N'Vàng', 'GOLD', 100, 100000000, 10, 1);
END;";

        await _context.Database.ExecuteSqlRawAsync(sql);
    }
}
