using System;
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
    [Route("api/vouchers")]
    [Authorize(Roles = "ADMIN")]
    public class VouchersController : ControllerBase
    {
        private readonly SmartLogAiContext _context;

        public VouchersController(SmartLogAiContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<List<VoucherDto>>> GetVouchers([FromQuery] string? tier, [FromQuery] int? customerId)
        {
            var query = _context.Vouchers.AsQueryable();

            if (!string.IsNullOrWhiteSpace(tier))
            {
                var normTier = tier.Trim().ToUpperInvariant();
                query = query.Where(v => v.CustomerTier != null && v.CustomerTier.ToUpper() == normTier);
            }

            if (customerId.HasValue)
            {
                query = query.Where(v => v.CustomerId == customerId.Value);
            }

            var list = await query
                .OrderByDescending(v => v.CreatedAt ?? DateTime.MinValue)
                .ThenByDescending(v => v.VoucherId)
                .Select(v => new VoucherDto
                {
                    VoucherId = v.VoucherId,
                    VoucherCode = v.VoucherCode,
                    CustomerTier = v.CustomerTier,
                    CustomerId = v.CustomerId,
                    DiscountPct = v.DiscountPct,
                    DiscountAmount = v.DiscountAmount,
                    MinOrderValue = v.MinOrderValue,
                    ValidFrom = v.ValidFrom,
                    ValidTo = v.ValidTo,
                    IsUsed = v.IsUsed,
                    UsedAt = v.UsedAt,
                    CreatedAt = v.CreatedAt
                })
                .ToListAsync();

            return Ok(list);
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<VoucherDto>> GetVoucherById(int id)
        {
            var v = await _context.Vouchers.FindAsync(id);
            if (v == null) return NotFound(new { Message = "Không tìm thấy voucher." });

            return Ok(new VoucherDto
            {
                VoucherId = v.VoucherId,
                VoucherCode = v.VoucherCode,
                CustomerTier = v.CustomerTier,
                CustomerId = v.CustomerId,
                DiscountPct = v.DiscountPct,
                DiscountAmount = v.DiscountAmount,
                MinOrderValue = v.MinOrderValue,
                ValidFrom = v.ValidFrom,
                ValidTo = v.ValidTo,
                IsUsed = v.IsUsed,
                UsedAt = v.UsedAt,
                CreatedAt = v.CreatedAt
            });
        }

        [HttpPost]
        public async Task<IActionResult> CreateVoucher([FromBody] CreateVoucherDto dto)
        {
            var validationError = ValidateVoucherInput(dto.VoucherCode, dto.CustomerTier, dto.ValidFrom, dto.ValidTo, dto.DiscountPct, dto.DiscountAmount, dto.MinOrderValue);
            if (validationError != null)
            {
                return BadRequest(new { Message = validationError });
            }

            var normalizedCode = dto.VoucherCode.Trim().ToUpperInvariant();
            var codeExists = await _context.Vouchers.AnyAsync(v => v.VoucherCode.ToUpper() == normalizedCode);
            if (codeExists)
            {
                return BadRequest(new { Message = $"Mã voucher '{normalizedCode}' đã tồn tại trong hệ thống." });
            }

            var voucher = new Voucher
            {
                VoucherCode = normalizedCode,
                CustomerTier = string.IsNullOrWhiteSpace(dto.CustomerTier) ? null : dto.CustomerTier.Trim().ToUpperInvariant(),
                CustomerId = dto.CustomerId,
                DiscountPct = dto.DiscountPct ?? 0m,
                DiscountAmount = dto.DiscountAmount ?? 0m,
                MinOrderValue = dto.MinOrderValue ?? 0m,
                ValidFrom = dto.ValidFrom,
                ValidTo = dto.ValidTo,
                IsUsed = false,
                CreatedAt = DateTime.Now
            };

            _context.Vouchers.Add(voucher);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetVoucherById), new { id = voucher.VoucherId }, new VoucherDto
            {
                VoucherId = voucher.VoucherId,
                VoucherCode = voucher.VoucherCode,
                CustomerTier = voucher.CustomerTier,
                CustomerId = voucher.CustomerId,
                DiscountPct = voucher.DiscountPct,
                DiscountAmount = voucher.DiscountAmount,
                MinOrderValue = voucher.MinOrderValue,
                ValidFrom = voucher.ValidFrom,
                ValidTo = voucher.ValidTo,
                IsUsed = voucher.IsUsed,
                UsedAt = voucher.UsedAt,
                CreatedAt = voucher.CreatedAt
            });
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> UpdateVoucher(int id, [FromBody] UpdateVoucherDto dto)
        {
            var voucher = await _context.Vouchers.FindAsync(id);
            if (voucher == null)
            {
                return NotFound(new { Message = "Không tìm thấy voucher." });
            }

            var validationError = ValidateVoucherInput(dto.VoucherCode, dto.CustomerTier, dto.ValidFrom, dto.ValidTo, dto.DiscountPct, dto.DiscountAmount, dto.MinOrderValue);
            if (validationError != null)
            {
                return BadRequest(new { Message = validationError });
            }

            var normalizedCode = dto.VoucherCode.Trim().ToUpperInvariant();
            var codeExists = await _context.Vouchers.AnyAsync(v => v.VoucherId != id && v.VoucherCode.ToUpper() == normalizedCode);
            if (codeExists)
            {
                return BadRequest(new { Message = $"Mã voucher '{normalizedCode}' đã được sử dụng ở voucher khác." });
            }

            voucher.VoucherCode = normalizedCode;
            voucher.CustomerTier = string.IsNullOrWhiteSpace(dto.CustomerTier) ? null : dto.CustomerTier.Trim().ToUpperInvariant();
            voucher.CustomerId = dto.CustomerId;
            voucher.DiscountPct = dto.DiscountPct ?? 0m;
            voucher.DiscountAmount = dto.DiscountAmount ?? 0m;
            voucher.MinOrderValue = dto.MinOrderValue ?? 0m;
            voucher.ValidFrom = dto.ValidFrom;
            voucher.ValidTo = dto.ValidTo;
            if (dto.IsUsed.HasValue)
            {
                voucher.IsUsed = dto.IsUsed.Value;
            }

            await _context.SaveChangesAsync();

            return Ok(new VoucherDto
            {
                VoucherId = voucher.VoucherId,
                VoucherCode = voucher.VoucherCode,
                CustomerTier = voucher.CustomerTier,
                CustomerId = voucher.CustomerId,
                DiscountPct = voucher.DiscountPct,
                DiscountAmount = voucher.DiscountAmount,
                MinOrderValue = voucher.MinOrderValue,
                ValidFrom = voucher.ValidFrom,
                ValidTo = voucher.ValidTo,
                IsUsed = voucher.IsUsed,
                UsedAt = voucher.UsedAt,
                CreatedAt = voucher.CreatedAt
            });
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> DeleteOrDeactivateVoucher(int id)
        {
            var voucher = await _context.Vouchers
                .Include(v => v.ServiceOrders)
                .FirstOrDefaultAsync(v => v.VoucherId == id);

            if (voucher == null)
            {
                return NotFound(new { Message = "Không tìm thấy voucher." });
            }

            // Safe delete: if referenced by any ServiceOrder, mark as used/deactivated instead of deleting.
            if (voucher.ServiceOrders.Any())
            {
                voucher.IsUsed = true;
                voucher.UsedAt ??= DateTime.Now;
                await _context.SaveChangesAsync();
                return Ok(new { Message = "Voucher đã được liên kết với đơn hàng, hệ thống đã chuyển sang trạng thái đã sử dụng / vô hiệu hóa." });
            }

            _context.Vouchers.Remove(voucher);
            await _context.SaveChangesAsync();
            return Ok(new { Message = "Đã xóa voucher thành công." });
        }

        private static string? ValidateVoucherInput(
            string voucherCode,
            string? customerTier,
            DateOnly validFrom,
            DateOnly validTo,
            decimal? discountPct,
            decimal? discountAmount,
            decimal? minOrderValue)
        {
            if (string.IsNullOrWhiteSpace(voucherCode))
            {
                return "Mã voucher (VoucherCode) là bắt buộc.";
            }

            if (string.IsNullOrWhiteSpace(customerTier))
            {
                return "Hạng khách hàng (CustomerTier) là bắt buộc cho voucher hạng UC030.";
            }

            if (validFrom > validTo)
            {
                return "Ngày bắt đầu (ValidFrom) phải nhỏ hơn hoặc bằng ngày kết thúc (ValidTo).";
            }

            var pct = discountPct ?? 0m;
            var amt = discountAmount ?? 0m;
            if (pct <= 0 && amt <= 0)
            {
                return "Phải nhập ít nhất một giá trị giảm giá lớn hơn 0 (% giảm giá hoặc Số tiền giảm).";
            }

            if (pct < 0 || pct > 100)
            {
                return "% giảm giá phải nằm trong khoảng từ 0 đến 100.";
            }

            if ((minOrderValue ?? 0m) < 0)
            {
                return "Giá trị đơn hàng tối thiểu (MinOrderValue) phải lớn hơn hoặc bằng 0.";
            }

            return null;
        }
    }
}
