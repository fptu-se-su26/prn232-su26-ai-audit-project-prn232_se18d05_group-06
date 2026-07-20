using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BACKEND.DTOs;
using BACKEND.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BACKEND.Controllers
{
    [ApiController]
    [Route("api/master-data")]
    [Authorize(Roles = "ADMIN")]
    public class MasterDataController : ControllerBase
    {
        private readonly SmartLogAiContext _context;

        // Supported Category Types Configuration
        private static readonly HashSet<string> EditableTypes = new(System.StringComparer.OrdinalIgnoreCase)
        {
            "UOM",
            "CARGO_TYPE",
            "VEHICLE_TYPE",
            "REGION",
            "SERVICE_TYPE"
        };

        private static readonly HashSet<string> ReadOnlyTypes = new(System.StringComparer.OrdinalIgnoreCase)
        {
            "ORDER_STATUS",
            "VEHICLE_STATUS"
        };

        // Fallback System Reference Data for Read-Only Statuses
        private static readonly List<MasterCategoryDto> OrderStatusReferences = new()
        {
            new MasterCategoryDto { CategoryId = -1, CategoryType = "ORDER_STATUS", Code = "PENDING", NameVn = "Chờ xử lý", NameEn = "Pending", SortOrder = 1, IsActive = true, IsReadOnly = true },
            new MasterCategoryDto { CategoryId = -2, CategoryType = "ORDER_STATUS", Code = "CONFIRMED", NameVn = "Đã xác nhận", NameEn = "Confirmed", SortOrder = 2, IsActive = true, IsReadOnly = true },
            new MasterCategoryDto { CategoryId = -3, CategoryType = "ORDER_STATUS", Code = "DISPATCHED", NameVn = "Đã điều xe", NameEn = "Dispatched", SortOrder = 3, IsActive = true, IsReadOnly = true },
            new MasterCategoryDto { CategoryId = -4, CategoryType = "ORDER_STATUS", Code = "DELIVERED", NameVn = "Đã giao hàng", NameEn = "Delivered", SortOrder = 4, IsActive = true, IsReadOnly = true },
            new MasterCategoryDto { CategoryId = -5, CategoryType = "ORDER_STATUS", Code = "COMPLETED", NameVn = "Hoàn thành", NameEn = "Completed", SortOrder = 5, IsActive = true, IsReadOnly = true },
            new MasterCategoryDto { CategoryId = -6, CategoryType = "ORDER_STATUS", Code = "CANCELLED", NameVn = "Đã hủy", NameEn = "Cancelled", SortOrder = 6, IsActive = true, IsReadOnly = true },
        };

        private static readonly List<MasterCategoryDto> VehicleStatusReferences = new()
        {
            new MasterCategoryDto { CategoryId = -10, CategoryType = "VEHICLE_STATUS", Code = "AVAILABLE", NameVn = "Sẵn sàng", NameEn = "Available", SortOrder = 1, IsActive = true, IsReadOnly = true },
            new MasterCategoryDto { CategoryId = -11, CategoryType = "VEHICLE_STATUS", Code = "IN_TRANSIT", NameVn = "Đang vận chuyển", NameEn = "In Transit", SortOrder = 2, IsActive = true, IsReadOnly = true },
            new MasterCategoryDto { CategoryId = -12, CategoryType = "VEHICLE_STATUS", Code = "MAINTENANCE", NameVn = "Bảo trì", NameEn = "Maintenance", SortOrder = 3, IsActive = true, IsReadOnly = true },
            new MasterCategoryDto { CategoryId = -13, CategoryType = "VEHICLE_STATUS", Code = "OFFLINE", NameVn = "Ngưng hoạt động", NameEn = "Offline", SortOrder = 4, IsActive = true, IsReadOnly = true },
        };

        public MasterDataController(SmartLogAiContext context)
        {
            _context = context;
        }

        /// <summary>
        /// GET /api/master-data/types
        /// Returns all supported master category types and their safety mode.
        /// </summary>
        [HttpGet("types")]
        public async Task<IActionResult> GetCategoryTypes()
        {
            var dbCategoryCounts = await _context.MasterCategories
                .GroupBy(mc => mc.CategoryType)
                .Select(g => new { Type = g.Key.ToUpper(), Count = g.Count() })
                .ToDictionaryAsync(g => g.Type, g => g.Count);

            var types = new List<MasterDataTypeDto>
            {
                new MasterDataTypeDto
                {
                    CategoryType = "UOM",
                    DisplayNameVn = "Đơn vị đo",
                    DisplayNameEn = "Units of Measure",
                    Description = "Quản lý đơn vị tính dùng cho hàng hóa và tính giá cước.",
                    IsReadOnly = false,
                    ItemCount = dbCategoryCounts.GetValueOrDefault("UOM", 0)
                },
                new MasterDataTypeDto
                {
                    CategoryType = "CARGO_TYPE",
                    DisplayNameVn = "Loại hàng",
                    DisplayNameEn = "Cargo / Item Types",
                    Description = "Phân loại hàng hóa và đặc tính bảo quản kho vận.",
                    IsReadOnly = false,
                    ItemCount = dbCategoryCounts.GetValueOrDefault("CARGO_TYPE", 0)
                },
                new MasterDataTypeDto
                {
                    CategoryType = "VEHICLE_TYPE",
                    DisplayNameVn = "Loại phương tiện",
                    DisplayNameEn = "Vehicle Types",
                    Description = "Phân loại xe vận tải, tải trọng và dung tích.",
                    IsReadOnly = false,
                    ItemCount = dbCategoryCounts.GetValueOrDefault("VEHICLE_TYPE", 0)
                },
                new MasterDataTypeDto
                {
                    CategoryType = "REGION",
                    DisplayNameVn = "Khu vực",
                    DisplayNameEn = "Areas / Regions",
                    Description = "Vùng địa lý và phân khu tính phí vận chuyển.",
                    IsReadOnly = false,
                    ItemCount = dbCategoryCounts.GetValueOrDefault("REGION", 0)
                },
                new MasterDataTypeDto
                {
                    CategoryType = "SERVICE_TYPE",
                    DisplayNameVn = "Loại dịch vụ",
                    DisplayNameEn = "Service Types",
                    Description = "Danh mục các dịch vụ logistics và kho vận.",
                    IsReadOnly = false,
                    ItemCount = dbCategoryCounts.GetValueOrDefault("SERVICE_TYPE", 0)
                },
                new MasterDataTypeDto
                {
                    CategoryType = "ORDER_STATUS",
                    DisplayNameVn = "Trạng thái đơn hàng",
                    DisplayNameEn = "Order Statuses",
                    Description = "Trạng thái quy trình xử lý đơn hàng (Chỉ đọc - Hệ thống).",
                    IsReadOnly = true,
                    ItemCount = dbCategoryCounts.GetValueOrDefault("ORDER_STATUS", OrderStatusReferences.Count)
                },
                new MasterDataTypeDto
                {
                    CategoryType = "VEHICLE_STATUS",
                    DisplayNameVn = "Trạng thái xe",
                    DisplayNameEn = "Vehicle Statuses",
                    Description = "Trạng thái vận hành phương tiện & dock (Chỉ đọc - Hệ thống).",
                    IsReadOnly = true,
                    ItemCount = dbCategoryCounts.GetValueOrDefault("VEHICLE_STATUS", VehicleStatusReferences.Count)
                }
            };

            return Ok(types);
        }

        /// <summary>
        /// GET /api/master-data?categoryType=...&activeOnly=false
        /// Lists master data categories.
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetMasterCategories([FromQuery] string? categoryType = null, [FromQuery] bool activeOnly = false)
        {
            var normalizedType = categoryType?.Trim().ToUpper();

            // Handle Read-Only status types with fallback system reference data if DB is empty
            if (normalizedType == "ORDER_STATUS")
            {
                var dbItems = await GetDbItemsAsync("ORDER_STATUS", activeOnly, isReadOnly: true);
                if (dbItems.Any()) return Ok(dbItems);
                var items = activeOnly ? OrderStatusReferences.Where(i => i.IsActive == true).ToList() : OrderStatusReferences;
                return Ok(items);
            }

            if (normalizedType == "VEHICLE_STATUS")
            {
                var dbItems = await GetDbItemsAsync("VEHICLE_STATUS", activeOnly, isReadOnly: true);
                if (dbItems.Any()) return Ok(dbItems);
                var items = activeOnly ? VehicleStatusReferences.Where(i => i.IsActive == true).ToList() : VehicleStatusReferences;
                return Ok(items);
            }

            var query = _context.MasterCategories.AsQueryable();

            if (!string.IsNullOrWhiteSpace(normalizedType))
            {
                query = query.Where(mc => mc.CategoryType.ToUpper() == normalizedType);
            }

            if (activeOnly)
            {
                query = query.Where(mc => mc.IsActive == true);
            }

            var results = await query
                .OrderBy(mc => mc.CategoryType)
                .ThenBy(mc => mc.SortOrder)
                .ThenBy(mc => mc.Code)
                .Select(mc => new MasterCategoryDto
                {
                    CategoryId = mc.CategoryId,
                    CategoryType = mc.CategoryType,
                    Code = mc.Code,
                    NameVn = mc.NameVn,
                    NameEn = mc.NameEn,
                    SortOrder = mc.SortOrder ?? 0,
                    IsActive = mc.IsActive ?? true,
                    IsReadOnly = ReadOnlyTypes.Contains(mc.CategoryType)
                })
                .ToListAsync();

            return Ok(results);
        }

        /// <summary>
        /// POST /api/master-data
        /// Create a new master category record for editable types.
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> CreateMasterCategory([FromBody] CreateMasterCategoryDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var categoryType = dto.CategoryType.Trim().ToUpper();
            var code = dto.Code.Trim().ToUpper();

            if (ReadOnlyTypes.Contains(categoryType))
            {
                return BadRequest(new { Message = $"Danh mục '{categoryType}' là danh mục trạng thái hệ thống Read-Only và không thể tạo mới." });
            }

            if (!EditableTypes.Contains(categoryType))
            {
                return BadRequest(new { Message = $"Loại danh mục '{categoryType}' không hợp lệ hoặc không được hỗ trợ." });
            }

            if (string.IsNullOrWhiteSpace(dto.NameVn))
            {
                return BadRequest(new { Message = "Tên tiếng Việt (NameVn) không được để trống." });
            }

            var exists = await _context.MasterCategories
                .AnyAsync(mc => mc.CategoryType.ToUpper() == categoryType && mc.Code.ToUpper() == code);

            if (exists)
            {
                return BadRequest(new { Message = $"Mã '{code}' đã tồn tại trong danh mục '{categoryType}'." });
            }

            var entity = new MasterCategory
            {
                CategoryType = categoryType,
                Code = code,
                NameVn = dto.NameVn.Trim(),
                NameEn = dto.NameEn?.Trim(),
                SortOrder = dto.SortOrder ?? 0,
                IsActive = dto.IsActive ?? true
            };

            _context.MasterCategories.Add(entity);
            await _context.SaveChangesAsync();

            var result = new MasterCategoryDto
            {
                CategoryId = entity.CategoryId,
                CategoryType = entity.CategoryType,
                Code = entity.Code,
                NameVn = entity.NameVn,
                NameEn = entity.NameEn,
                SortOrder = entity.SortOrder ?? 0,
                IsActive = entity.IsActive ?? true,
                IsReadOnly = false
            };

            return Ok(result);
        }

        /// <summary>
        /// PUT /api/master-data/{id}
        /// Updates an existing editable master category record.
        /// </summary>
        [HttpPut("{id:int}")]
        public async Task<IActionResult> UpdateMasterCategory(int id, [FromBody] UpdateMasterCategoryDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var entity = await _context.MasterCategories.FindAsync(id);
            if (entity == null)
            {
                return NotFound(new { Message = $"Không tìm thấy danh mục với ID = {id}." });
            }

            if (ReadOnlyTypes.Contains(entity.CategoryType))
            {
                return BadRequest(new { Message = $"Danh mục '{entity.CategoryType}' là danh mục Read-Only của hệ thống và không thể sửa." });
            }

            if (string.IsNullOrWhiteSpace(dto.NameVn))
            {
                return BadRequest(new { Message = "Tên tiếng Việt (NameVn) không được để trống." });
            }

            entity.NameVn = dto.NameVn.Trim();
            entity.NameEn = dto.NameEn?.Trim();
            entity.SortOrder = dto.SortOrder ?? 0;
            if (dto.IsActive.HasValue)
            {
                entity.IsActive = dto.IsActive.Value;
            }

            await _context.SaveChangesAsync();

            var result = new MasterCategoryDto
            {
                CategoryId = entity.CategoryId,
                CategoryType = entity.CategoryType,
                Code = entity.Code,
                NameVn = entity.NameVn,
                NameEn = entity.NameEn,
                SortOrder = entity.SortOrder ?? 0,
                IsActive = entity.IsActive ?? true,
                IsReadOnly = false
            };

            return Ok(result);
        }

        /// <summary>
        /// PATCH /api/master-data/{id}/status
        /// Toggles active status of an editable master category record.
        /// </summary>
        [HttpPatch("{id:int}/status")]
        public async Task<IActionResult> UpdateMasterCategoryStatus(int id, [FromBody] UpdateMasterCategoryStatusDto dto)
        {
            var entity = await _context.MasterCategories.FindAsync(id);
            if (entity == null)
            {
                return NotFound(new { Message = $"Không tìm thấy danh mục với ID = {id}." });
            }

            if (ReadOnlyTypes.Contains(entity.CategoryType))
            {
                return BadRequest(new { Message = $"Danh mục '{entity.CategoryType}' là danh mục Read-Only của hệ thống và không thể thay đổi trạng thái." });
            }

            entity.IsActive = dto.IsActive;
            await _context.SaveChangesAsync();

            var result = new MasterCategoryDto
            {
                CategoryId = entity.CategoryId,
                CategoryType = entity.CategoryType,
                Code = entity.Code,
                NameVn = entity.NameVn,
                NameEn = entity.NameEn,
                SortOrder = entity.SortOrder ?? 0,
                IsActive = entity.IsActive ?? true,
                IsReadOnly = false
            };

            return Ok(result);
        }

        private async Task<List<MasterCategoryDto>> GetDbItemsAsync(string categoryType, bool activeOnly, bool isReadOnly)
        {
            var query = _context.MasterCategories
                .Where(mc => mc.CategoryType.ToUpper() == categoryType.ToUpper());

            if (activeOnly)
            {
                query = query.Where(mc => mc.IsActive == true);
            }

            return await query
                .OrderBy(mc => mc.SortOrder)
                .ThenBy(mc => mc.Code)
                .Select(mc => new MasterCategoryDto
                {
                    CategoryId = mc.CategoryId,
                    CategoryType = mc.CategoryType,
                    Code = mc.Code,
                    NameVn = mc.NameVn,
                    NameEn = mc.NameEn,
                    SortOrder = mc.SortOrder ?? 0,
                    IsActive = mc.IsActive ?? true,
                    IsReadOnly = isReadOnly
                })
                .ToListAsync();
        }
    }
}
