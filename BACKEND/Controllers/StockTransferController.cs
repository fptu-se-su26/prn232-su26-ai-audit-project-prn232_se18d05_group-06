using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BACKEND.Services;
using BACKEND.DTOs;

namespace BACKEND.Controllers
{
    [ApiController]
    [Route("api/stock-transfer")]
    [Authorize(Roles = "ADMIN,WF")]
    public class StockTransferController : ControllerBase
    {
        private readonly IStockTransferService _transferService;

        public StockTransferController(IStockTransferService transferService)
        {
            _transferService = transferService;
        }

        [HttpPost]
        public async Task<ActionResult<StockTransferDto>> CreateTransfer([FromBody] StockTransferCreateRequest request)
        {
            if (request == null)
                return BadRequest("Invalid request body.");

            try
            {
                int userId = 1; // Fallback
                var subClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                               ?? User.FindFirst("sub")?.Value 
                               ?? User.FindFirst(ClaimTypes.Name)?.Value;

                if (int.TryParse(subClaim, out int parsedId))
                {
                    userId = parsedId;
                }

                var result = await _transferService.CreateTransferAsync(request, userId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<StockTransferDto>>> GetTransfers()
        {
            try
            {
                var result = await _transferService.GetTransfersAsync();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = ex.Message });
            }
        }

        [HttpGet("bins/{binId}/inventory")]
        public async Task<ActionResult<IEnumerable<BinInventoryDto>>> GetBinInventory(int binId)
        {
            try
            {
                var result = await _transferService.GetBinInventoryAsync(binId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = ex.Message });
            }
        }
    }
}
