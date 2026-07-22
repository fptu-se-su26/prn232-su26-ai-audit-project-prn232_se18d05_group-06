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
        private readonly ISlottingService _slottingService;
        private readonly IInboundReceivingService _inboundReceivingService;

        public InboundController(SmartLogAiContext context, IS3StorageService storage, ISlottingService slottingService, IInboundReceivingService inboundReceivingService)
        {
            _context = context;
            _storage = storage;
            _slottingService = slottingService;
            _inboundReceivingService = inboundReceivingService;
        }

        [HttpPost("scan-code")]
        public async Task<ActionResult<ApiResponse>> ScanCode([FromBody] ScanInboundCodeRequest request)
        {
            var userId = 1; // Giả lập user ID hoặc lấy từ Token
            var result = await _inboundReceivingService.CreateInboundFromCodeAsync(request, userId);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpPost("ocr")]
        public async Task<ActionResult<ApiResponse>> Ocr([FromForm] IFormFile file, [FromForm] int warehouseId, [FromForm] int customerId)
        {
            var userId = 1; // Giả lập
            var result = await _inboundReceivingService.CreateInboundFromOcrAsync(file, warehouseId, customerId, userId);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpGet("{inboundId}/ocr-review")]
        public async Task<ActionResult<ApiResponse>> GetOcrReview(int inboundId)
        {
            var result = await _inboundReceivingService.GetOcrReviewAsync(inboundId);
            return result.Success ? Ok(result) : NotFound(result);
        }

        [HttpPost("{inboundId}/confirm-ocr-review")]
        public async Task<ActionResult<ApiResponse>> ConfirmOcrReview(int inboundId, [FromBody] ConfirmOcrReviewRequest request)
        {
            var userId = 1; // Giả lập
            var result = await _inboundReceivingService.ConfirmOcrReviewAsync(inboundId, request, userId);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpPost("{inboundId}/confirm-receiving")]
        public async Task<ActionResult<ApiResponse>> ConfirmReceiving(int inboundId, [FromBody] ConfirmReceivingRequest request)
        {
            var userId = 1; // Giả lập
            var result = await _inboundReceivingService.ConfirmReceivingAsync(inboundId, request, userId);
            return result.Success ? Ok(result) : BadRequest(result);
        }


        [HttpGet]
        public async Task<ActionResult<List<InboundOrderDto>>> GetInboundOrders([FromQuery] string[]? statuses = null)
        {
            try
            {
                var query = _context.InboundOrders.AsNoTracking().AsQueryable();

                if (statuses != null && statuses.Length > 0)
                {
                    query = query.Where(o => statuses.Contains(o.Status));
                }

                var orders = await query
                    .OrderByDescending(o => o.InboundId)
                    .Select(o => new InboundOrderDto
                    {
                        InboundId = o.InboundId,
                        InboundCode = o.InboundCode,
                        CustomerName = o.Customer != null ? o.Customer.CompanyName : null,
                        WarehouseName = o.Warehouse != null ? o.Warehouse.WarehouseName : null,
                        Status = o.Status,
                        ActualDate = o.ActualDate,
                        Lines = o.InboundOrderLines
                            .OrderBy(l => l.LineId)
                            .Select(l => new InboundLineDto
                            {
                                LineId = l.LineId,
                                Skucode = l.Sku != null ? l.Sku.Skucode : null,
                                ProductName = l.Sku != null ? l.Sku.ProductName : null,
                                ExpectedQty = l.ExpectedQty,
                                ReceivedQty = l.ReceivedQty,
                                ConditionStatus = l.ConditionStatus,
                                BinCode = l.Bin != null ? l.Bin.BinCode : null,
                                AiSlottedBinCode = l.AislottedBin != null ? l.AislottedBin.BinCode : null,
                                PhotoCount = l.CargoPhotos.Count,
                                RequiresMinPhotos = l.ConditionStatus != null && l.ConditionStatus.ToUpper() == "DAMAGED",
                                MinPhotos = l.ConditionStatus != null && l.ConditionStatus.ToUpper() == "DAMAGED" ? DamagedMinPhotos : 0,
                                Photos = l.CargoPhotos
                                    .OrderBy(p => p.PhotoId)
                                    .Select(p => new CargoPhotoDto
                                    {
                                        PhotoId = p.PhotoId,
                                        PhotoUrl = p.PhotoUrl,
                                        PhotoAngle = p.PhotoAngle,
                                        IsDamaged = p.IsDamaged ?? false,
                                        TakenAt = p.TakenAt
                                    })
                                    .ToList()
                            })
                            .ToList()
                    })
                    .ToListAsync();

                return Ok(orders);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("{id}/lines")]
        public async Task<ActionResult<List<InboundLineDto>>> GetLines(int id)
        {
            try
            {
                var orderExists = await _context.InboundOrders
                    .AsNoTracking()
                    .AnyAsync(o => o.InboundId == id);

                if (!orderExists)
                {
                    return NotFound($"Inbound order {id} not found.");
                }

                var lines = await _context.InboundOrderLines
                    .AsNoTracking()
                    .Where(l => l.InboundId == id)
                    .OrderBy(l => l.LineId)
                    .Select(l => new InboundLineDto
                    {
                        LineId = l.LineId,
                        Skucode = l.Sku != null ? l.Sku.Skucode : null,
                        ProductName = l.Sku != null ? l.Sku.ProductName : null,
                        ExpectedQty = l.ExpectedQty,
                        ReceivedQty = l.ReceivedQty,
                        ConditionStatus = l.ConditionStatus,
                        BinCode = l.Bin != null ? l.Bin.BinCode : null,
                        AiSlottedBinCode = l.AislottedBin != null ? l.AislottedBin.BinCode : null,
                        PhotoCount = l.CargoPhotos.Count,
                        RequiresMinPhotos = l.ConditionStatus != null && l.ConditionStatus.ToUpper() == "DAMAGED",
                        MinPhotos = l.ConditionStatus != null && l.ConditionStatus.ToUpper() == "DAMAGED" ? DamagedMinPhotos : 0,
                        Photos = l.CargoPhotos
                            .OrderBy(p => p.PhotoId)
                            .Select(p => new CargoPhotoDto
                            {
                                PhotoId = p.PhotoId,
                                PhotoUrl = p.PhotoUrl,
                                PhotoAngle = p.PhotoAngle,
                                IsDamaged = p.IsDamaged ?? false,
                                TakenAt = p.TakenAt
                            })
                            .ToList()
                    })
                    .ToListAsync();

                return Ok(lines);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("lines/{lineId}/photos")]
        public async Task<ActionResult<List<CargoPhotoDto>>> GetPhotos(int lineId)
        {
            try
            {
                var lineExists = await _context.InboundOrderLines
                    .AsNoTracking()
                    .AnyAsync(l => l.LineId == lineId);

                if (!lineExists)
                {
                    return NotFound($"Inbound line {lineId} not found.");
                }

                var photos = await _context.CargoPhotos
                    .AsNoTracking()
                    .Where(p => p.LineId == lineId)
                    .OrderBy(p => p.PhotoId)
                    .Select(p => new CargoPhotoDto
                    {
                        PhotoId = p.PhotoId,
                        PhotoUrl = p.PhotoUrl,
                        PhotoAngle = p.PhotoAngle,
                        IsDamaged = p.IsDamaged ?? false,
                        TakenAt = p.TakenAt
                    })
                    .ToListAsync();

                return Ok(photos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("lines/{lineId}/slotting-suggestions")]
        public async Task<ActionResult<SlottingSuggestionResponseDto>> GetSlottingSuggestions(int lineId)
        {
            try
            {
                var result = await _slottingService.GetSuggestionsAsync(lineId);
                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost("lines/{lineId}/confirm-slot")]
        public async Task<ActionResult<ConfirmSlottingResponseDto>> ConfirmSlot(int lineId, [FromBody] ConfirmSlottingRequestDto request)
        {
            try
            {
                var result = await _slottingService.ConfirmSlotAsync(lineId, request);
                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        public class UploadPhotoDto
        {
            public IFormFile File { get; set; }
            public string? PhotoAngle { get; set; }
            public bool IsDamaged { get; set; } = false;
            public int? TakenBy { get; set; }
        }

        [HttpPost("lines/{lineId}/photos")]
        public async Task<ActionResult<CargoPhotoDto>> UploadPhoto(
            int lineId,
            IFormFile file,
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

                return Ok(new CargoPhotoDto
                {
                    PhotoId = photo.PhotoId,
                    PhotoUrl = photo.PhotoUrl,
                    PhotoAngle = photo.PhotoAngle,
                    IsDamaged = photo.IsDamaged ?? false,
                    TakenAt = photo.TakenAt
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}
