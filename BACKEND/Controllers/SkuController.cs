using System;
using System.Collections.Generic;
using System.IO;
using System.Security.Claims;
using System.Threading.Tasks;
using BACKEND.DTOs;
using BACKEND.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BACKEND.Controllers
{
    [ApiController]
    [Route("api/sku")]
    [Authorize(Roles = "ADMIN,WF")]
    public class SkuController : ControllerBase
    {
        private readonly ISkuService _service;

        public SkuController(ISkuService service)
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
        // GET /api/sku - Danh sách SKU với filter và phân trang
        // ============================================================
        [HttpGet]
        public async Task<ActionResult<SkuPagedResult>> GetAll(
            [FromQuery] string? query = null,
            [FromQuery] int? categoryId = null,
            [FromQuery] int? customerId = null,
            [FromQuery] bool? isActive = null,
            [FromQuery] bool? isFragile = null,
            [FromQuery] bool? isHazmat = null,
            [FromQuery] bool? isHeavy = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20,
            [FromQuery] string? sortBy = "CreatedAt",
            [FromQuery] string? sortOrder = "desc")
        {
            try
            {
                var request = new SkuSearchRequest
                {
                    Query = query,
                    CategoryId = categoryId,
                    CustomerId = customerId,
                    IsActive = isActive,
                    IsFragile = isFragile,
                    IsHazmat = isHazmat,
                    IsHeavy = isHeavy,
                    Page = page,
                    PageSize = Math.Min(pageSize, 100),
                    SortBy = sortBy,
                    SortOrder = sortOrder
                };

                var result = await _service.GetAllAsync(request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        // ============================================================
        // GET /api/sku/{id} - Chi tiết SKU
        // ============================================================
        [HttpGet("{id}")]
        public async Task<ActionResult<SkuDetailDto>> GetById(int id)
        {
            try
            {
                var result = await _service.GetByIdAsync(id);
                if (result == null)
                    return NotFound(new { message = $"SKU with ID {id} not found" });

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        // ============================================================
        // POST /api/sku - Tạo SKU mới
        // ============================================================
        [HttpPost]
        public async Task<ActionResult<SkuDetailDto>> Create([FromBody] CreateSkuRequest request)
        {
            try
            {
                int userId = GetUserId();
                var result = await _service.CreateAsync(request, userId);
                return CreatedAtAction(nameof(GetById), new { id = result.SkuId }, result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        // ============================================================
        // PUT /api/sku/{id} - Cập nhật SKU
        // ============================================================
        [HttpPut("{id}")]
        public async Task<ActionResult<SkuDetailDto>> Update(int id, [FromBody] UpdateSkuRequest request)
        {
            try
            {
                int userId = GetUserId();
                var result = await _service.UpdateAsync(id, request, userId);
                if (result == null)
                    return NotFound(new { message = $"SKU with ID {id} not found" });

                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        // ============================================================
        // DELETE /api/sku/{id} - Xóa SKU (soft delete)
        // ============================================================
        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(int id)
        {
            try
            {
                var result = await _service.DeleteAsync(id);
                if (!result)
                    return NotFound(new { message = $"SKU with ID {id} not found" });

                return Ok(new { message = "SKU deleted successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        // ============================================================
        // GET /api/sku/search?q= - Tìm kiếm SKU
        // ============================================================
        [HttpGet("search")]
        public async Task<ActionResult<List<SkuListDto>>> Search([FromQuery] string q)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(q))
                    return BadRequest(new { message = "Search query is required" });

                var result = await _service.SearchAsync(q);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        // ============================================================
        // GET /api/sku/barcode/{barcode} - Tìm SKU theo Barcode/QR
        // ============================================================
        [HttpGet("barcode/{barcode}")]
        public async Task<ActionResult<List<SkuListDto>>> GetByBarcode(string barcode)
        {
            try
            {
                var result = await _service.GetByBarcodeAsync(barcode);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        // ============================================================
        // GET /api/sku/category/{categoryId} - Lấy SKU theo Category
        // ============================================================
        [HttpGet("category/{categoryId}")]
        public async Task<ActionResult<List<SkuListDto>>> GetByCategory(int categoryId)
        {
            try
            {
                var result = await _service.GetByCategoryAsync(categoryId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        // ============================================================
        // GET /api/sku/customer/{customerId} - Lấy SKU theo Customer
        // ============================================================
        [HttpGet("customer/{customerId}")]
        public async Task<ActionResult<List<SkuListDto>>> GetByCustomer(int customerId)
        {
            try
            {
                var result = await _service.GetByCustomerAsync(customerId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        // ============================================================
        // POST /api/sku/check-duplicate - Kiểm tra trùng lặp
        // ============================================================
        [HttpPost("check-duplicate")]
        public async Task<ActionResult<CheckDuplicateResult>> CheckDuplicate([FromBody] CheckDuplicateRequest request)
        {
            try
            {
                var result = await _service.CheckDuplicateAsync(request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        // ============================================================
        // POST /api/sku/generate-code - Sinh mã SKU tự động
        // ============================================================
        [HttpPost("generate-code")]
        public async Task<ActionResult<string>> GenerateCode([FromBody] GenerateCodeRequest? request = null)
        {
            try
            {
                var result = await _service.GenerateSkuCodeAsync(request?.CategoryPrefix);
                return Ok(new { skuCode = result });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        // ============================================================
        // GET /api/sku/{id}/barcode - Lấy hình Barcode
        // ============================================================
        [HttpGet("{id}/barcode")]
        public async Task<ActionResult> GetBarcode(int id, [FromQuery] int? width = null, [FromQuery] int? height = null)
        {
            try
            {
                var bytes = await _service.GenerateBarcodeAsync(id, width, height);
                return File(bytes, "image/png");
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        // ============================================================
        // GET /api/sku/{id}/qrcode - Lấy hình QR Code
        // ============================================================
        [HttpGet("{id}/qrcode")]
        public async Task<ActionResult> GetQrCode(int id, [FromQuery] int? size = null)
        {
            try
            {
                var bytes = await _service.GenerateQrCodeAsync(id, size);
                return File(bytes, "image/png");
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        // ============================================================
        // POST /api/sku/import - Import SKU từ Excel
        // ============================================================
        [HttpPost("import")]
        public async Task<ActionResult<SkuImportResult>> Import(IFormFile file)
        {
            try
            {
                if (file == null || file.Length == 0)
                    return BadRequest(new { message = "File is required" });

                if (!file.FileName.EndsWith(".xlsx") && !file.FileName.EndsWith(".xls"))
                    return BadRequest(new { message = "Only Excel files (.xlsx, .xls) are allowed" });

                int userId = GetUserId();
                var result = await _service.ImportFromExcelAsync(file, userId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        // ============================================================
        // GET /api/sku/export - Export SKU ra Excel
        // ============================================================
        [HttpGet("export")]
        public async Task<ActionResult> Export(
            [FromQuery] string? query = null,
            [FromQuery] int? categoryId = null,
            [FromQuery] int? customerId = null,
            [FromQuery] bool? isActive = null)
        {
            try
            {
                var filter = new SkuSearchRequest
                {
                    Query = query,
                    CategoryId = categoryId,
                    CustomerId = customerId,
                    IsActive = isActive
                };

                var bytes = await _service.ExportToExcelAsync(filter);
                var fileName = $"SKUs_Export_{DateTime.Now:yyyyMMdd_HHmmss}.xlsx";
                return File(bytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        // ============================================================
        // POST /api/sku/validate - Validate SKU trước khi tạo
        // ============================================================
        [HttpPost("validate")]
        public async Task<ActionResult<SkuValidationResult>> Validate([FromBody] CreateSkuRequest request)
        {
            try
            {
                var result = await _service.ValidateAsync(request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }
    }

    public class GenerateCodeRequest
    {
        public string? CategoryPrefix { get; set; }
    }
}
