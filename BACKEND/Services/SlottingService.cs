using BACKEND.DTOs;
using BACKEND.Models;
using Microsoft.EntityFrameworkCore;

namespace BACKEND.Services
{
    public class SlottingService : ISlottingService
    {
        private const int MaxSuggestions = 5;
        private readonly SmartLogAiContext _context;

        public SlottingService(SmartLogAiContext context)
        {
            _context = context;
        }

        public async Task<SlottingSuggestionResponseDto> GetSuggestionsAsync(int lineId)
        {
            var line = await LoadLineAsync(lineId);
            var response = CreateBaseResponse(line);

            var candidates = await BuildCandidatesAsync(line);
            if (candidates.Count == 0)
            {
                response.StatusCode = "NO_COMPATIBLE_BIN";
                response.Message = "Không tìm thấy vị trí phù hợp với điều kiện bảo quản của hàng hóa.";
                return response;
            }

            response.Suggestions = candidates
                .OrderByDescending(c => c.Score)
                .ThenBy(c => c.FloorLevel ?? byte.MaxValue)
                .ThenBy(c => c.BinCode)
                .Take(MaxSuggestions)
                .Select((c, index) =>
                {
                    c.Rank = index + 1;
                    return c;
                })
                .ToList();

            var top = response.Suggestions.First();
            response.StatusCode = "SLOTTING_RECOMMENDED";
            response.Message = $"AI đề xuất vị trí {top.BinCode} vì {string.Join(", ", top.Reasons.Take(3)).ToLower()}.";
            return response;
        }

        public async Task<ConfirmSlottingResponseDto> ConfirmSlotAsync(int lineId, ConfirmSlottingRequestDto request)
        {
            var line = await LoadLineAsync(lineId);
            var candidates = await BuildCandidatesAsync(line, request.BinId);
            var selected = candidates.FirstOrDefault(c => c.BinId == request.BinId);

            if (selected == null)
            {
                throw new InvalidOperationException("Vị trí được chọn không phù hợp với điều kiện bảo quản hoặc không đủ sức chứa.");
            }

            line.AislottedBinId = request.IsAiSuggestion ? selected.BinId : line.AislottedBinId;
            line.BinId = selected.BinId;

            var ledger = new StockLedger
            {
                Skuid = line.Skuid,
                BinId = selected.BinId,
                TxnType = "INBOUND",
                Qty = line.ReceivedQty ?? line.ExpectedQty,
                QtyBefore = 0, // Inbound usually means new stock entering the bin, we can query existing but typically 0 or ignored for inbound if we don't know the exact batch yet. Wait, we should get QtyBefore from inventory.
                QtyAfter = line.ReceivedQty ?? line.ExpectedQty, // This will be adjusted when actual inventory is updated, for now we log it based on line.
                RefType = "InboundOrder",
                RefId = line.InboundId,
                Note = $"Nhập kho vào vị trí {selected.BinCode}",
                CreatedBy = 1, // Fallback
                CreatedAt = DateTime.Now
            };
            _context.StockLedgers.Add(ledger);

            await _context.SaveChangesAsync();

            return new ConfirmSlottingResponseDto
            {
                LineId = line.LineId,
                BinId = selected.BinId,
                BinCode = selected.BinCode,
                StatusCode = request.IsAiSuggestion ? "SLOTTING_CONFIRMED" : "MANUAL_BIN_SELECTED",
                Message = $"Đã xác nhận vị trí lưu kho {selected.BinCode} cho dòng hàng {line.LineId}."
            };
        }

        private async Task<InboundOrderLine> LoadLineAsync(int lineId)
        {
            var line = await _context.InboundOrderLines
                .Include(l => l.Inbound)
                .Include(l => l.Sku)
                .FirstOrDefaultAsync(l => l.LineId == lineId);

            return line ?? throw new KeyNotFoundException($"Inbound line {lineId} not found.");
        }

        private SlottingSuggestionResponseDto CreateBaseResponse(InboundOrderLine line)
        {
            return new SlottingSuggestionResponseDto
            {
                LineId = line.LineId,
                InboundId = line.InboundId,
                WarehouseId = line.Inbound.WarehouseId,
                SkuCode = line.Sku.Skucode,
                ProductName = line.Sku.ProductName,
                QuantityToSlot = GetQuantityToSlot(line),
                Message = "AI đã phân tích điều kiện SKU và sức chứa kho."
            };
        }

        private async Task<List<SlottingSuggestionDto>> BuildCandidatesAsync(InboundOrderLine line, int? onlyBinId = null)
        {
            var sku = line.Sku;
            var qty = GetQuantityToSlot(line);
            var requiredWeight = (sku.WeightKg ?? 0) * qty;
            var requiredVolume = (sku.VolumeCbm ?? 0) * qty;
            var movementCount = await CountOutboundMovesAsync(sku.Skuid);
            var movementClass = ClassifyMovement(movementCount);

            var bins = await _context.WarehouseBins
                .AsNoTracking()
                .Include(b => b.Shelf)
                    .ThenInclude(s => s.Zone)
                .Include(b => b.Inventories)
                    .ThenInclude(i => i.Sku)
                .Where(b => b.IsActive == true
                    && b.Shelf.IsActive == true
                    && b.Shelf.Zone.IsActive == true
                    && b.Shelf.Zone.WarehouseId == line.Inbound.WarehouseId
                    && (onlyBinId == null || b.BinId == onlyBinId))
                .ToListAsync();

            var result = new List<SlottingSuggestionDto>();
            foreach (var bin in bins)
            {
                var currentWeight = bin.Inventories.Sum(i => (i.Sku.WeightKg ?? 0) * i.Quantity);
                var currentVolume = bin.Inventories.Sum(i => (i.Sku.VolumeCbm ?? 0) * i.Quantity);
                var maxWeight = bin.MaxWeightKg ?? decimal.MaxValue;
                var capacity = bin.CapacityCbm ?? decimal.MaxValue;

                if (currentWeight + requiredWeight > maxWeight)
                {
                    continue;
                }

                if (currentVolume + requiredVolume > capacity)
                {
                    continue;
                }

                if (!IsStorageCompatible(sku, bin))
                {
                    continue;
                }

                result.Add(ScoreCandidate(bin, line, currentWeight, currentVolume, requiredWeight, requiredVolume, movementClass));
            }

            return result;
        }

        private SlottingSuggestionDto ScoreCandidate(
            WarehouseBin bin,
            InboundOrderLine line,
            decimal currentWeight,
            decimal currentVolume,
            decimal requiredWeight,
            decimal requiredVolume,
            string movementClass)
        {
            var sku = line.Sku;
            var reasons = new List<string>();
            var score = 0;

            score += 30;
            reasons.Add("đúng điều kiện bảo quản");

            score += 20;
            reasons.Add("còn đủ tải trọng và dung tích");

            if (bin.Inventories.Any(i => i.Skuid == sku.Skuid))
            {
                score += 15;
                reasons.Add("đang có cùng SKU để gom hàng");
            }

            if (movementClass == "FAST")
            {
                score += 10;
                reasons.Add("SKU xuất thường xuyên, ưu tiên vị trí dễ lấy");
            }

            if ((bin.Shelf.FloorLevel ?? 9) <= 1)
            {
                score += 5;
                reasons.Add("tầng thấp, thao tác nhanh");
            }

            if (IsHeavyFriendly(sku, bin))
            {
                score += 8;
                reasons.Add("phù hợp hàng nặng");
            }

            if (sku.IsFragile == true && (bin.Shelf.FloorLevel ?? 9) <= 2)
            {
                score += 7;
                reasons.Add("hạn chế di chuyển cho hàng dễ vỡ");
            }

            var capacity = bin.CapacityCbm ?? 0;
            if (capacity > 0)
            {
                var usedAfter = currentVolume + requiredVolume;
                var utilizationAfter = usedAfter / capacity;
                if (utilizationAfter >= 0.65m && utilizationAfter <= 0.95m)
                {
                    score += 10;
                    reasons.Add("tối ưu khoảng trống sau khi đặt");
                }
            }

            return new SlottingSuggestionDto
            {
                BinId = bin.BinId,
                BinCode = bin.BinCode,
                BinType = bin.BinType,
                ShelfCode = bin.Shelf.ShelfCode,
                FloorLevel = bin.Shelf.FloorLevel,
                ZoneCode = bin.Shelf.Zone.ZoneCode,
                ZoneName = bin.Shelf.Zone.ZoneName,
                ZoneType = bin.Shelf.Zone.ZoneType,
                CapacityCbm = bin.CapacityCbm ?? 0,
                MaxWeightKg = bin.MaxWeightKg ?? 0,
                CurrentVolumeCbm = currentVolume,
                CurrentWeightKg = currentWeight,
                RequiredVolumeCbm = requiredVolume,
                RequiredWeightKg = requiredWeight,
                RemainingVolumeCbm = Math.Max(0, (bin.CapacityCbm ?? 0) - currentVolume - requiredVolume),
                RemainingWeightKg = Math.Max(0, (bin.MaxWeightKg ?? 0) - currentWeight - requiredWeight),
                Score = Math.Min(score, 100),
                MovementClass = movementClass,
                Reasons = reasons
            };
        }

        private async Task<int> CountOutboundMovesAsync(int skuId)
        {
            var cutoff = DateTime.Now.AddDays(-90);
            return await _context.OutboundLines
                .AsNoTracking()
                .Where(l => l.Skuid == skuId && l.Outbound.CreatedAt >= cutoff)
                .CountAsync();
        }

        private static int GetQuantityToSlot(InboundOrderLine line)
        {
            var received = line.ReceivedQty.GetValueOrDefault();
            return received > 0 ? received : Math.Max(1, line.ExpectedQty);
        }

        private static string ClassifyMovement(int outboundMoves)
        {
            if (outboundMoves >= 10) return "FAST";
            if (outboundMoves >= 3) return "MEDIUM";
            return "SLOW";
        }

        private static bool IsStorageCompatible(Sku sku, WarehouseBin bin)
        {
            var zoneType = Normalize(bin.Shelf.Zone.ZoneType);
            var binType = Normalize(bin.BinType);
            var storageTemp = Normalize(sku.StorageTemp);

            if (sku.IsHazmat == true)
            {
                return zoneType == "HAZMAT" || binType == "HAZMAT";
            }

            if (storageTemp == "COLD")
            {
                return zoneType == "COLD" || binType == "COLD";
            }

            if (storageTemp == "FROZEN")
            {
                return zoneType == "FROZEN" || binType == "FROZEN" || zoneType == "COLD" || binType == "COLD";
            }

            if (storageTemp == "AMBIENT" || storageTemp == "NORMAL" || storageTemp == "")
            {
                return zoneType is "" or "NORMAL" or "AMBIENT" or "DRY" || binType is "" or "NORMAL" or "AMBIENT" or "DRY";
            }

            return true;
        }

        private static bool IsHeavyFriendly(Sku sku, WarehouseBin bin)
        {
            if (sku.IsHeavy != true)
            {
                return false;
            }

            var zoneType = Normalize(bin.Shelf.Zone.ZoneType);
            var binType = Normalize(bin.BinType);
            return zoneType == "HEAVY" || binType == "HEAVY" || (bin.Shelf.FloorLevel ?? 9) <= 1;
        }

        private static string Normalize(string? value)
        {
            return (value ?? string.Empty).Trim().ToUpperInvariant();
        }
    }
}
