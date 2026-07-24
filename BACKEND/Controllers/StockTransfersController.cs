using BACKEND.DTOs;
using BACKEND.Services;
using Microsoft.AspNetCore.Mvc;

namespace BACKEND.Controllers;

[ApiController]
[Route("api/[controller]")]
public class StockTransfersController : ControllerBase
{
    private readonly IStockTransferService _service;
    private readonly ILogger<StockTransfersController> _logger;

    public StockTransfersController(IStockTransferService service, ILogger<StockTransfersController> logger)
    {
        _service = service;
        _logger = logger;
    }

    [HttpGet("options")]
    public async Task<ActionResult<StockTransferOptionsDto>> GetOptions()
    {
        try
        {
            var options = await _service.GetOptionsAsync();
            return Ok(options);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting stock transfer options.");
            return StatusCode(500, new { message = "Internal server error", detail = ex.Message });
        }
    }

    [HttpGet]
    public async Task<ActionResult<StockTransferPagedResultDto>> GetHistory([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        try
        {
            var history = await _service.GetTransferHistoryAsync(page, pageSize);
            return Ok(history);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting stock transfer history.");
            return StatusCode(500, new { message = "Internal server error", detail = ex.Message });
        }
    }

    [HttpPost]
    public async Task<ActionResult<StockTransferResponseDto>> CreateTransfer([FromBody] CreateStockTransferRequestDto request)
    {
        try
        {
            // Note: In a real app, user ID is extracted from User.Identity
            int? userId = 1; 
            var result = await _service.CreateTransferAsync(request, userId);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating stock transfer.");
            return BadRequest(new { message = ex.Message });
        }
    }
}
