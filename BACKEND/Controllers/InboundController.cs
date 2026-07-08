using BACKEND.DTOs;
using BACKEND.Models;
using BACKEND.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BACKEND.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class InboundController : ControllerBase
    {
        private const int DamagedMinPhotos = 2;
        private static readonly string[] AllowedContentTypes =
            { "image/jpeg", "image/png", "image/webp", "image/gif" };
        private const long MaxFileSizeBytes = 10 * 1024 * 1024; // 10 MB

        private readonly SmartLogAiContext _context;
        private readonly IS3StorageService _storage;

        public InboundController(SmartLogAiContext context, IS3StorageService storage)
        {
            _context = context;
            _storage = storage;
        }

        // GET: api/inbound
        [HttpGet]
        public async Task<ActionResult<List<InboundOrderDto>>> GetInboundOrders()
        {
            try
            {
                var orders = await _context.InboundOrders
                    .Include(o => o.Customer)
                    .Include(o => o.Warehouse)
                    .Include(o => o.InboundOrderLines).ThenInclude(l => l.Sku)
                    .Include(o => o.InboundOrderLines).ThenInclude(l => l.Bin)
                    .Include(o => o.InboundOrderLines).ThenInclude(l => l.CargoPhotos)
                    .OrderByDescending(o => o.InboundId)
                    .ToListAsync();

                var result = orders.Select(MapOrder).ToList();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // GET: api/inbound/{id}/lines
        [HttpGet("{id}/lines")]
        public async Task<ActionResult<List<InboundLineDto>>> GetLines(int id)
        {
            try
            {
                var orderExists = await _context.InboundOrders.AnyAsync(o => o.InboundId == id);
                if (!orderExists)
                {
                    return NotFound($"Inbound order {id} not found.");
                }

                var lines = await _context.InboundOrderLines
                    .Where(l => l.InboundId == id)
                    .Include(l => l.Sku)
                    .Include(l => l.Bin)
                    .Include(l => l.CargoPhotos)
                    .OrderBy(l => l.LineId)
                    .ToListAsync();

                return Ok(lines.Select(MapLine).ToList());
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // GET: api/inbound/lines/{lineId}/photos
        [HttpGet("lines/{lineId}/photos")]
        public async Task<ActionResult<List<CargoPhotoDto>>> GetPhotos(int lineId)
        {
            try
            {
                var lineExists = await _context.InboundOrderLines.AnyAsync(l => l.LineId == lineId);
                if (!lineExists)
                {
                    return NotFound($"Inbound line {lineId} not found.");
                }

                var photos = await _context.CargoPhotos
                    .Where(p => p.LineId == lineId)
                    .OrderBy(p => p.PhotoId)
                    .ToListAsync();

                return Ok(photos.Select(MapPhoto).ToList());
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // POST: api/inbound/lines/{lineId}/photos
        [HttpPost("lines/{lineId}/photos")]
        public async Task<ActionResult<CargoPhotoDto>> UploadPhoto(
            int lineId,
            [FromForm] IFormFile file,
            [FromForm] string? photoAngle,
            [FromForm] bool isDamaged = false,
            [FromForm] int? takenBy = null)
        {
            try
            {
                var line = await _context.InboundOrderLines.FirstOrDefaultAsync(l => l.LineId == lineId);
                if (line == null)
                {
                    return NotFound($"Inbound line {lineId} not found.");
                }

                if (file == null || file.Length == 0)
                {
                    return BadRequest("File is required.");
                }

                if (file.Length > MaxFileSizeBytes)
                {
                    return BadRequest("File exceeds the 10 MB size limit.");
                }

                if (!AllowedContentTypes.Contains(file.ContentType))
                {
                    return BadRequest("Only image files (jpeg, png, webp, gif) are allowed.");
                }

                string photoUrl;
                await using (var stream = file.OpenReadStream())
                {
                    photoUrl = await _storage.UploadAsync(stream, file.FileName, file.ContentType, "cargo-photos");
                }

                var photo = new CargoPhoto
                {
                    LineId = lineId,
                    PhotoUrl = photoUrl,
                    PhotoAngle = photoAngle,
                    IsDamaged = isDamaged,
                    TakenBy = takenBy,
                    TakenAt = DateTime.Now
                };

                _context.CargoPhotos.Add(photo);
                await _context.SaveChangesAsync();

                return Ok(MapPhoto(photo));
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // ---- mapping helpers ----

        private static InboundOrderDto MapOrder(InboundOrder o) => new()
        {
            InboundId = o.InboundId,
            InboundCode = o.InboundCode,
            CustomerName = o.Customer?.CompanyName,
            WarehouseName = o.Warehouse?.WarehouseName,
            Status = o.Status,
            ActualDate = o.ActualDate,
            Lines = o.InboundOrderLines.OrderBy(l => l.LineId).Select(MapLine).ToList()
        };

        private static InboundLineDto MapLine(InboundOrderLine l)
        {
            var isDamaged = string.Equals(l.ConditionStatus, "DAMAGED", StringComparison.OrdinalIgnoreCase);
            return new InboundLineDto
            {
                LineId = l.LineId,
                Skucode = l.Sku?.Skucode,
                ProductName = l.Sku?.ProductName,
                ExpectedQty = l.ExpectedQty,
                ReceivedQty = l.ReceivedQty,
                ConditionStatus = l.ConditionStatus,
                BinCode = l.Bin?.BinCode,
                PhotoCount = l.CargoPhotos.Count,
                RequiresMinPhotos = isDamaged,
                MinPhotos = isDamaged ? DamagedMinPhotos : 0,
                Photos = l.CargoPhotos.OrderBy(p => p.PhotoId).Select(MapPhoto).ToList()
            };
        }

        private static CargoPhotoDto MapPhoto(CargoPhoto p) => new()
        {
            PhotoId = p.PhotoId,
            PhotoUrl = p.PhotoUrl,
            PhotoAngle = p.PhotoAngle,
            IsDamaged = p.IsDamaged ?? false,
            TakenAt = p.TakenAt
        };
    }
}
