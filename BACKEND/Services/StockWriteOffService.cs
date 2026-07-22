using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using BACKEND.DTOs;
using BACKEND.Models;
using Microsoft.EntityFrameworkCore;

namespace BACKEND.Services
{
    public class StockWriteOffService : IStockWriteOffService
    {
        private readonly SmartLogAiContext _context;

        public StockWriteOffService(SmartLogAiContext context)
        {
            _context = context;
        }

        private async Task<int?> ResolveUserIdAsync(int userId, string fallbackRole)
        {
            if (userId > 0 && await _context.Users.AnyAsync(u => u.UserId == userId))
            {
                return userId;
            }

            var fallbackUser = await _context.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Role.RoleCode == fallbackRole || u.Username == "admin");

            return fallbackUser?.UserId;
        }

        public async Task<StockWriteOffDto> CreateWriteOffAsync(StockWriteOffCreateRequest request, int userId)
        {
            if (request.Quantity <= 0)
                throw new ArgumentException("Số lượng thanh lý phải lớn hơn 0.");

            if (string.IsNullOrWhiteSpace(request.Reason))
                throw new ArgumentException("Lý do thanh lý không được để trống.");

            // Kiểm tra Bin tồn tại
            var bin = await _context.WarehouseBins.FindAsync(request.BinId);
            if (bin == null)
                throw new Exception("Bin không tồn tại.");

            // Kiểm tra tồn kho thực tế đủ để thanh lý
            var totalStock = await _context.Inventories
                .Where(i => i.BinId == request.BinId && i.Skuid == request.SkuId && i.Quantity > 0)
                .SumAsync(i => i.Quantity);

            if (totalStock < request.Quantity)
                throw new Exception($"Tồn kho không đủ. Hiện tại chỉ còn {totalStock} đơn vị tại Bin này.");

            var dbUserId = await ResolveUserIdAsync(userId, "WF");

            // Tạo phiếu thanh lý, trạng thái PENDING
            var writeOffCode = "WO-" + DateTime.Now.ToString("yyyyMMddHHmmss") + new Random().Next(10, 99);
            var writeOff = new StockWriteOff
            {
                WriteOffCode = writeOffCode,
                Skuid = request.SkuId,
                BinId = request.BinId,
                Quantity = request.Quantity,
                Reason = request.Reason,
                Status = "PENDING",
                CreatedBy = dbUserId,
                CreatedAt = DateTime.Now
            };

            _context.StockWriteOffs.Add(writeOff);
            await _context.SaveChangesAsync();

            return await GetWriteOffByIdAsync(writeOff.WriteOffId);
        }

        public async Task<StockWriteOffDto> ApproveWriteOffAsync(int writeOffId, StockWriteOffApprovalRequest request, int adminId)
        {
            var writeOff = await _context.StockWriteOffs.FindAsync(writeOffId);
            if (writeOff == null)
                throw new Exception("Phiếu thanh lý không tồn tại.");

            if (writeOff.Status != "PENDING")
                throw new Exception("Phiếu này đã được xử lý rồi (không còn ở trạng thái PENDING).");

            var dbAdminId = await ResolveUserIdAsync(adminId, "ADMIN");

            if (request.Approved)
            {
                // === APPROVE: Trừ tồn kho và ghi log ===
                // Must wrap manual transactions with CreateExecutionStrategy when SQL Server retry is enabled
                var strategy = _context.Database.CreateExecutionStrategy();
                await strategy.ExecuteAsync(async () =>
                {
                    using var transaction = await _context.Database.BeginTransactionAsync();
                    try
                    {
                        // Lấy tổng tồn kho trước khi trừ (dùng cho StockLedger)
                        int qtyBefore = await _context.Inventories
                            .Where(i => i.BinId == writeOff.BinId && i.Skuid == writeOff.Skuid && i.Quantity > 0)
                            .SumAsync(i => i.Quantity);

                        if (qtyBefore < writeOff.Quantity)
                            throw new Exception($"Tồn kho hiện tại không đủ ({qtyBefore}) để thanh lý {writeOff.Quantity} đơn vị.");

                        // Trừ tồn kho theo FIFO (ExpiryDate tăng dần)
                        var inventories = await _context.Inventories
                            .Where(i => i.BinId == writeOff.BinId && i.Skuid == writeOff.Skuid && i.Quantity > 0)
                            .OrderBy(i => i.ExpiryDate)
                            .ToListAsync();

                        int remaining = writeOff.Quantity;
                        foreach (var inv in inventories)
                        {
                            if (remaining <= 0) break;
                            int deduct = Math.Min(inv.Quantity, remaining);
                            inv.Quantity -= deduct;
                            remaining -= deduct;
                        }

                        if (remaining > 0)
                            throw new Exception("Không đủ số lượng trong các lô hàng để thanh lý.");

                        // Cập nhật IsOccupied cho Bin nếu hết hàng
                        if (writeOff.BinId.HasValue)
                        {
                            int totalRemaining = await _context.Inventories
                                .Where(i => i.BinId == writeOff.BinId)
                                .SumAsync(i => i.Quantity);

                            var bin = await _context.WarehouseBins.FindAsync(writeOff.BinId.Value);
                            if (bin != null)
                                bin.IsOccupied = totalRemaining > 0;
                        }

                        // Ghi StockLedger - audit trail
                        _context.StockLedgers.Add(new StockLedger
                        {
                            Skuid = writeOff.Skuid,
                            BinId = writeOff.BinId,
                            TxnType = "WRITE_OFF",
                            Qty = writeOff.Quantity,
                            QtyBefore = qtyBefore,
                            QtyAfter = qtyBefore - writeOff.Quantity,
                            RefType = "StockWriteOff",
                            RefId = writeOff.WriteOffId,
                            Note = $"Thanh lý hàng - Phiếu {writeOff.WriteOffCode}: {writeOff.Reason}",
                            CreatedBy = dbAdminId,
                            CreatedAt = DateTime.Now
                        });

                        // Cập nhật trạng thái phiếu
                        writeOff.Status = "APPROVED";
                        writeOff.ApprovedBy = dbAdminId;
                        writeOff.ApprovedAt = DateTime.Now;

                        await _context.SaveChangesAsync();
                        await transaction.CommitAsync();
                    }
                    catch
                    {
                        await transaction.RollbackAsync();
                        throw;
                    }
                });
            }
            else
            {
                // === REJECT: Chỉ đổi trạng thái, không động đến tồn kho ===
                writeOff.Status = "REJECTED";
                writeOff.ApprovedBy = dbAdminId;
                writeOff.ApprovedAt = DateTime.Now;
                // Ghi lý do từ chối vào Reason nếu có
                if (!string.IsNullOrWhiteSpace(request.RejectionNote))
                    writeOff.Reason = writeOff.Reason + $" [Từ chối: {request.RejectionNote}]";

                await _context.SaveChangesAsync();
            }

            return await GetWriteOffByIdAsync(writeOffId);
        }


        public async Task<IEnumerable<StockWriteOffDto>> GetMyWriteOffsAsync(int userId)
        {
            return await BuildWriteOffQuery()
                .Where(w => w.CreatedBy == userId)
                .OrderByDescending(w => w.CreatedAt)
                .Select(w => MapToDto(w))
                .ToListAsync();
        }

        public async Task<IEnumerable<StockWriteOffDto>> GetAllWriteOffsAsync()
        {
            return await BuildWriteOffQuery()
                .OrderByDescending(w => w.CreatedAt)
                .Select(w => MapToDto(w))
                .ToListAsync();
        }

        public async Task<IEnumerable<StockWriteOffDto>> GetPendingWriteOffsAsync()
        {
            return await BuildWriteOffQuery()
                .Where(w => w.Status == "PENDING")
                .OrderBy(w => w.CreatedAt)
                .Select(w => MapToDto(w))
                .ToListAsync();
        }

        // --- Private helpers ---

        private IQueryable<StockWriteOff> BuildWriteOffQuery()
        {
            return _context.StockWriteOffs
                .Include(w => w.Sku)
                .Include(w => w.Bin).ThenInclude(b => b != null ? b.Shelf : null).ThenInclude(s => s != null ? s.Zone : null)
                .Include(w => w.CreatedByNavigation)
                .Include(w => w.ApprovedByNavigation);
        }

        private static StockWriteOffDto MapToDto(StockWriteOff w)
        {
            return new StockWriteOffDto
            {
                WriteOffId = w.WriteOffId,
                WriteOffCode = w.WriteOffCode,
                SkuId = w.Skuid,
                SkuCode = w.Sku.Skucode,
                SkuName = w.Sku.ProductName ?? string.Empty,
                BinId = w.BinId,
                BinCode = w.Bin != null ? w.Bin.BinCode : null,
                ZoneName = w.Bin != null && w.Bin.Shelf != null && w.Bin.Shelf.Zone != null
                    ? w.Bin.Shelf.Zone.ZoneName : null,
                Quantity = w.Quantity,
                Reason = w.Reason,
                Status = w.Status,
                CreatedByName = w.CreatedByNavigation != null ? w.CreatedByNavigation.FullName : (w.CreatedBy == null ? "System Administrator" : null),
                CreatedAt = w.CreatedAt,
                ApprovedByName = w.ApprovedByNavigation != null ? w.ApprovedByNavigation.FullName : (w.ApprovedBy == null && w.Status == "APPROVED" ? "System Administrator" : null),
                ApprovedAt = w.ApprovedAt
            };
        }

        private async Task<StockWriteOffDto> GetWriteOffByIdAsync(int id)
        {
            var w = await BuildWriteOffQuery()
                .FirstOrDefaultAsync(x => x.WriteOffId == id)
                ?? throw new Exception("Không tìm thấy phiếu thanh lý sau khi tạo.");
            return MapToDto(w);
        }
    }
}
