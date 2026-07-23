using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using BACKEND.DTOs;
using BACKEND.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BACKEND.Controllers
{
    [ApiController]
    [Route("api/stock-writeoff")]
    [Authorize(Roles = "ADMIN,WF")]
    public class StockWriteOffController : ControllerBase
    {
        private readonly IStockWriteOffService _service;

        public StockWriteOffController(IStockWriteOffService service)
        {
            _service = service;
        }

        // Lấy userId từ JWT token
        private int GetUserId()
        {
            var sub = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                   ?? User.FindFirst("sub")?.Value
                   ?? User.FindFirst(ClaimTypes.Name)?.Value;
            return int.TryParse(sub, out int id) ? id : 0;
        }

        // ============================================================
        // WF: Tạo phiếu thanh lý mới
        // POST /api/stock-writeoff
        // ============================================================
        [HttpPost]
        public async Task<ActionResult<StockWriteOffDto>> Create([FromBody] StockWriteOffCreateRequest request)
        {
            try
            {
                int userId = GetUserId();
                var result = await _service.CreateWriteOffAsync(request, userId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // ============================================================
        // WF: Xem phiếu của mình
        // GET /api/stock-writeoff/my
        // ============================================================
        [HttpGet("my")]
        public async Task<ActionResult<IEnumerable<StockWriteOffDto>>> GetMy()
        {
            try
            {
                int userId = GetUserId();
                var result = await _service.GetMyWriteOffsAsync(userId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        // ============================================================
        // ADMIN: Xem tất cả phiếu
        // GET /api/stock-writeoff
        // ============================================================
        [HttpGet]
        [Authorize(Roles = "ADMIN")]
        public async Task<ActionResult<IEnumerable<StockWriteOffDto>>> GetAll()
        {
            try
            {
                var result = await _service.GetAllWriteOffsAsync();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        // ============================================================
        // ADMIN: Xem phiếu đang chờ duyệt
        // GET /api/stock-writeoff/pending
        // ============================================================
        [HttpGet("pending")]
        [Authorize(Roles = "ADMIN")]
        public async Task<ActionResult<IEnumerable<StockWriteOffDto>>> GetPending()
        {
            try
            {
                var result = await _service.GetPendingWriteOffsAsync();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        // ============================================================
        // ADMIN: Duyệt hoặc từ chối phiếu
        // PUT /api/stock-writeoff/{id}/approve
        // ============================================================
        [HttpPut("{id}/approve")]
        [Authorize(Roles = "ADMIN")]
        public async Task<ActionResult<StockWriteOffDto>> Approve(int id, [FromBody] StockWriteOffApprovalRequest request)
        {
            try
            {
                int adminId = GetUserId();
                var result = await _service.ApproveWriteOffAsync(id, request, adminId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
