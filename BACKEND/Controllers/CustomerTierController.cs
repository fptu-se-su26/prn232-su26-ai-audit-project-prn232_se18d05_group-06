using System.Collections.Generic;
using System.Threading.Tasks;
using BACKEND.DTOs.CustomerTier;
using BACKEND.Services;
using Microsoft.AspNetCore.Mvc;

namespace BACKEND.Controllers;

[ApiController]
[Route("api/customer-tier")]
public class CustomerTierController : ControllerBase
{
    private readonly ICustomerTierService _customerTierService;

    public CustomerTierController(ICustomerTierService customerTierService)
    {
        _customerTierService = customerTierService;
    }

    [HttpGet("config")]
    public async Task<IActionResult> GetConfigs()
    {
        return Ok(await _customerTierService.GetTierConfigsAsync());
    }

    [HttpPost("config")]
    public async Task<IActionResult> CreateConfig([FromBody] TierConfigDto dto)
    {
        var result = await _customerTierService.CreateTierConfigAsync(dto);
        return Ok(result);
    }

    [HttpPut("config/{id}")]
    public async Task<IActionResult> UpdateConfig(int id, [FromBody] TierConfigDto dto)
    {
        var result = await _customerTierService.UpdateTierConfigAsync(id, dto);
        if (result == null) return NotFound("Tier configuration not found.");
        return Ok(result);
    }

    [HttpDelete("config/{id}")]
    public async Task<IActionResult> DeleteConfig(int id)
    {
        var success = await _customerTierService.DeleteTierConfigAsync(id);
        if (!success) return NotFound("Tier configuration not found.");
        return NoContent();
    }

    [HttpPost("recalculate/{customerId}")]
    public async Task<IActionResult> RecalculateCustomer(int customerId)
    {
        var result = await _customerTierService.CalculateAndUpdateCustomerTierAsync(customerId);
        if (result == null) return NotFound("Customer not found.");
        return Ok(result);
    }

    [HttpPost("recalculate-all")]
    public async Task<IActionResult> RecalculateAll()
    {
        var count = await _customerTierService.UpdateAllCustomerTiersAsync();
        return Ok(new { Message = $"Recalculated tiers for {count} customers." });
    }

    [HttpGet("benefits/{tierCode}")]
    public async Task<IActionResult> GetBenefits(string tierCode)
    {
        var benefits = await _customerTierService.GetBenefitsAsync(tierCode);
        if (benefits == null) return NotFound("Tier benefits not found.");
        return Ok(benefits);
    }

    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary()
    {
        return Ok(await _customerTierService.GetTierSummaryAsync());
    }

    [HttpGet("customers")]
    public async Task<IActionResult> GetCustomers([FromQuery] string? tierCode)
    {
        return Ok(await _customerTierService.GetCustomersByTierAsync(tierCode));
    }

    [HttpGet("customer/{id}")]
    public async Task<IActionResult> GetCustomerTier(int id)
    {
        var result = await _customerTierService.GetCustomerTierAsync(id);
        if (result == null) return NotFound("Customer not found.");
        return Ok(result);
    }
}
