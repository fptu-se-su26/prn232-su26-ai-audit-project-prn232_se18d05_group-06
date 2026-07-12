using System.Diagnostics;
using System.Globalization;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using BACKEND.DTOs;
using BACKEND.Models;
using Microsoft.EntityFrameworkCore;

namespace BACKEND.Services
{
    public class CustomerChatbotService : ICustomerChatbotService
    {
        private const string GeminiEndpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";
        private readonly SmartLogAiContext _context;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IConfiguration _configuration;
        private readonly ILogger<CustomerChatbotService> _logger;

        public CustomerChatbotService(
            SmartLogAiContext context,
            IHttpClientFactory httpClientFactory,
            IConfiguration configuration,
            ILogger<CustomerChatbotService> logger)
        {
            _context = context;
            _httpClientFactory = httpClientFactory;
            _configuration = configuration;
            _logger = logger;
        }

        public async Task<ChatbotAskResponseDto> AskAsync(string question, int currentUserId, CancellationToken cancellationToken = default)
        {
            var cleanQuestion = question.Trim();
            var orderAnswer = await TryAnswerOrderQuestionAsync(cleanQuestion, currentUserId, cancellationToken);
            if (orderAnswer != null)
            {
                return orderAnswer;
            }

            var intentAnswer = TryAnswerCommonIntent(cleanQuestion);
            if (intentAnswer != null)
            {
                return intentAnswer;
            }

            var faqItems = await LoadFaqItemsAsync(cancellationToken);
            var bestFaq = FindBestFaq(cleanQuestion, faqItems);
            if (bestFaq.Score >= 6)
            {
                return ToFaqResponse(bestFaq.Item, bestFaq.Score, "FAQ");
            }

            var geminiEnabled = _configuration.GetValue("GeminiSettings:Enabled", true);
            var apiKey = _configuration["GeminiSettings:ApiKey"];
            if (geminiEnabled && !string.IsNullOrWhiteSpace(apiKey))
            {
                var geminiAnswer = await TryAskGeminiAsync(cleanQuestion, apiKey, cancellationToken);
                if (!string.IsNullOrWhiteSpace(geminiAnswer))
                {
                    return new ChatbotAskResponseDto
                    {
                        Answer = geminiAnswer.Trim(),
                        Source = "GEMINI",
                        Confidence = 0.72,
                        RespondedAt = DateTime.UtcNow
                    };
                }
            }

            if (bestFaq.Item != null)
            {
                return ToFaqResponse(bestFaq.Item, Math.Max(bestFaq.Score, 1), "FAQ_FALLBACK");
            }

            return new ChatbotAskResponseDto
            {
                Answer = "Xin lỗi, tôi chưa tìm thấy câu trả lời phù hợp. Bạn có thể vào Trung tâm hỗ trợ hoặc tạo khiếu nại để nhân viên SmartLog AI hỗ trợ thêm.",
                Source = "FALLBACK",
                Confidence = 0,
                RespondedAt = DateTime.UtcNow
            };
        }

        public async Task<List<CustomerFaqDto>> GetFaqsAsync(string? keyword, string? category, CancellationToken cancellationToken = default)
        {
            var query = _context.Faqitems
                .AsNoTracking()
                .Where(f => f.IsActive != false);

            if (!string.IsNullOrWhiteSpace(category))
            {
                var categoryValue = category.Trim();
                query = query.Where(f => f.Category != null && f.Category.Contains(categoryValue));
            }

            if (!string.IsNullOrWhiteSpace(keyword))
            {
                var keywordValue = keyword.Trim();
                query = query.Where(f =>
                    f.Question.Contains(keywordValue)
                    || f.Answer.Contains(keywordValue)
                    || (f.Tags != null && f.Tags.Contains(keywordValue))
                    || (f.Category != null && f.Category.Contains(keywordValue)));
            }

            var dbFaqs = await query
                .OrderBy(f => f.Category)
                .ThenBy(f => f.Question)
                .Take(100)
                .Select(f => new CustomerFaqDto
                {
                    FaqId = f.Faqid,
                    Category = f.Category ?? "Hỗ trợ",
                    Question = f.Question,
                    Answer = f.Answer,
                    Tags = f.Tags
                })
                .ToListAsync(cancellationToken);

            if (dbFaqs.Count > 0)
            {
                return dbFaqs;
            }

            return GetBuiltInFaqs()
                .Where(f => string.IsNullOrWhiteSpace(category) || f.Category.Contains(category, StringComparison.OrdinalIgnoreCase))
                .Where(f => string.IsNullOrWhiteSpace(keyword) || MatchesBuiltInKeyword(f, keyword))
                .ToList();
        }

        private async Task<ChatbotAskResponseDto?> TryAnswerOrderQuestionAsync(string question, int currentUserId, CancellationToken cancellationToken)
        {
            var match = Regex.Match(question, @"\b(SO\d{10,}|ORD[-A-Z0-9]+)\b", RegexOptions.IgnoreCase);
            if (!match.Success)
            {
                return null;
            }

            var orderCode = match.Value.ToUpperInvariant();
            var customer = await _context.Customers
                .AsNoTracking()
                .FirstOrDefaultAsync(c => c.UserId == currentUserId && c.IsActive != false, cancellationToken);

            if (customer == null)
            {
                return new ChatbotAskResponseDto
                {
                    Answer = "Tôi chưa tìm thấy hồ sơ khách hàng đang đăng nhập, nên không thể tra cứu đơn hàng cá nhân.",
                    Source = "INTERNAL",
                    Confidence = 0.75,
                    RespondedAt = DateTime.UtcNow
                };
            }

            var order = await _context.ServiceOrders
                .AsNoTracking()
                .Where(o => o.OrderCode == orderCode)
                .Select(o => new
                {
                    o.OrderCode,
                    o.CustomerId,
                    o.Status,
                    o.ServiceType,
                    o.CreatedAt,
                    o.DeliveredAt,
                    o.FinalCost,
                    WarehouseName = o.Warehouse.WarehouseName
                })
                .FirstOrDefaultAsync(cancellationToken);

            if (order == null)
            {
                return new ChatbotAskResponseDto
                {
                    Answer = $"Tôi chưa tìm thấy đơn {orderCode}. Bạn vui lòng kiểm tra lại mã đơn trong mục Đơn hàng của tôi.",
                    Source = "INTERNAL",
                    Confidence = 0.8,
                    RespondedAt = DateTime.UtcNow
                };
            }

            if (order.CustomerId != customer.CustomerId)
            {
                return new ChatbotAskResponseDto
                {
                    Answer = "Bạn không có quyền xem thông tin của đơn hàng này.",
                    Source = "INTERNAL",
                    Confidence = 1,
                    RespondedAt = DateTime.UtcNow
                };
            }

            var status = ToCustomerStatus(order.Status);
            var service = ToCustomerService(order.ServiceType);
            var costText = order.FinalCost.HasValue ? $" Chi phí hiện tại là {order.FinalCost.Value:N0} đ." : string.Empty;
            var dateText = order.DeliveredAt.HasValue
                ? $" Đơn hoàn thành ngày {order.DeliveredAt.Value:dd/MM/yyyy}."
                : order.CreatedAt.HasValue ? $" Đơn được tạo ngày {order.CreatedAt.Value:dd/MM/yyyy}." : string.Empty;

            return new ChatbotAskResponseDto
            {
                Answer = $"Đơn {order.OrderCode} thuộc dịch vụ {service}, kho {order.WarehouseName}, hiện đang ở trạng thái {status}.{dateText}{costText} Bạn có thể xem chi tiết trong mục Đơn hàng của tôi.",
                Source = "INTERNAL",
                MatchedQuestion = order.OrderCode,
                Category = "Đơn hàng",
                Confidence = 1,
                RespondedAt = DateTime.UtcNow
            };
        }

        private async Task<List<CustomerFaqDto>> LoadFaqItemsAsync(CancellationToken cancellationToken)
        {
            var dbFaqs = await _context.Faqitems
                .AsNoTracking()
                .Where(f => f.IsActive != false)
                .Select(f => new CustomerFaqDto
                {
                    FaqId = f.Faqid,
                    Category = f.Category ?? "Hỗ trợ",
                    Question = f.Question,
                    Answer = f.Answer,
                    Tags = f.Tags
                })
                .ToListAsync(cancellationToken);

            var builtInFaqs = GetBuiltInFaqs();
            return dbFaqs
                .Concat(builtInFaqs)
                .GroupBy(f => Normalize($"{f.Category} {f.Question}"))
                .Select(g => g.First())
                .ToList();
        }

        private async Task<string?> TryAskGeminiAsync(string question, string apiKey, CancellationToken cancellationToken)
        {
            var timeoutSeconds = Math.Clamp(_configuration.GetValue("GeminiSettings:TimeoutSeconds", 20), 5, 60);
            var client = _httpClientFactory.CreateClient();
            client.Timeout = TimeSpan.FromSeconds(timeoutSeconds);
            var endpoint = $"{GeminiEndpoint}?key={Uri.EscapeDataString(apiKey)}";
            var prompt = BuildGeminiPrompt(question);
            var payload = new
            {
                contents = new[]
                {
                    new
                    {
                        role = "user",
                        parts = new[] { new { text = prompt } }
                    }
                },
                generationConfig = new
                {
                    temperature = 0.35,
                    maxOutputTokens = 700
                }
            };

            var stopwatch = Stopwatch.StartNew();
            int? statusCode = null;
            string? errorMessage = null;
            try
            {
                using var response = await client.PostAsJsonAsync(endpoint, payload, cancellationToken);
                statusCode = (int)response.StatusCode;
                var json = await response.Content.ReadAsStringAsync(cancellationToken);
                if (!response.IsSuccessStatusCode)
                {
                    errorMessage = json.Length > 900 ? json[..900] : json;
                    return null;
                }

                using var doc = JsonDocument.Parse(json);
                var text = doc.RootElement
                    .GetProperty("candidates")[0]
                    .GetProperty("content")
                    .GetProperty("parts")[0]
                    .GetProperty("text")
                    .GetString();

                return text;
            }
            catch (Exception ex)
            {
                errorMessage = ex.Message;
                _logger.LogWarning(ex, "Gemini chatbot call failed.");
                return null;
            }
            finally
            {
                stopwatch.Stop();
                await LogGeminiCallAsync(statusCode, (int)stopwatch.ElapsedMilliseconds, errorMessage == null, errorMessage);
            }
        }

        private async Task LogGeminiCallAsync(int? statusCode, int durationMs, bool isSuccess, string? errorMessage)
        {
            try
            {
                _context.ApiintegrationLogs.Add(new ApiintegrationLog
                {
                    Apiname = "GEMINI",
                    Endpoint = GeminiEndpoint,
                    Method = "POST",
                    StatusCode = statusCode,
                    DurationMs = durationMs,
                    IsSuccess = isSuccess,
                    ErrorMessage = errorMessage,
                    LoggedAt = DateTime.Now
                });
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Could not write Gemini API integration log.");
            }
        }

        private static (CustomerFaqDto? Item, int Score) FindBestFaq(string question, List<CustomerFaqDto> faqs)
        {
            var normalizedQuestion = Normalize(question);
            var tokens = Tokenize(normalizedQuestion);
            CustomerFaqDto? best = null;
            var bestScore = 0;

            foreach (var faq in faqs)
            {
                var category = Normalize(faq.Category);
                var faqQuestion = Normalize(faq.Question);
                var tags = Normalize(faq.Tags);
                var answer = Normalize(faq.Answer);
                var score = 0;

                foreach (var token in tokens)
                {
                    if (tags.Contains(token)) score += 4;
                    if (faqQuestion.Contains(token)) score += 3;
                    if (category.Contains(token)) score += 2;
                    if (answer.Contains(token)) score += 1;
                }

                if (faqQuestion.Contains(normalizedQuestion) || normalizedQuestion.Contains(faqQuestion))
                {
                    score += 8;
                }

                if (score > bestScore)
                {
                    bestScore = score;
                    best = faq;
                }
            }

            return (best, bestScore);
        }

        private static ChatbotAskResponseDto ToFaqResponse(CustomerFaqDto? faq, int score, string source)
        {
            if (faq == null)
            {
                return new ChatbotAskResponseDto
                {
                    Answer = "Xin lỗi, tôi chưa tìm thấy câu trả lời phù hợp.",
                    Source = "FALLBACK",
                    Confidence = 0,
                    RespondedAt = DateTime.UtcNow
                };
            }

            return new ChatbotAskResponseDto
            {
                Answer = faq.Answer,
                Source = source,
                MatchedQuestion = faq.Question,
                Category = faq.Category,
                Confidence = Math.Min(0.95, 0.35 + score * 0.08),
                RespondedAt = DateTime.UtcNow
            };
        }

        private static ChatbotAskResponseDto? TryAnswerCommonIntent(string question)
        {
            var q = Normalize(question);

            if (HasAny(q, "danh gia", "feedback", "rating", "sao", "star"))
            {
                return new ChatbotAskResponseDto
                {
                    Answer = "Bạn chỉ có thể đánh giá dịch vụ khi đơn hàng đã hoàn thành. Vào mục Đơn hàng của tôi, chọn đơn có trạng thái Hoàn thành rồi bấm Đánh giá để chấm sao và gửi nhận xét.",
                    Source = "FAQ",
                    MatchedQuestion = "Tôi đánh giá dịch vụ ở đâu?",
                    Category = "Feedback",
                    Confidence = 0.98,
                    RespondedAt = DateTime.UtcNow
                };
            }

            if (HasAny(q, "hoa don", "invoice", "pdf", "bill"))
            {
                return new ChatbotAskResponseDto
                {
                    Answer = "Bạn có thể xem hoặc tải hóa đơn PDF trong mục Hóa đơn của tôi hoặc Đơn hàng của tôi. Chọn hóa đơn cần xem rồi bấm PDF hoặc Tải PDF. Nếu đã thanh toán nhưng chưa nhận email, hãy bấm Gửi lại Email trong màn hình hóa đơn.",
                    Source = "FAQ",
                    MatchedQuestion = "Làm sao tải hóa đơn PDF?",
                    Category = "Hóa đơn",
                    Confidence = 0.98,
                    RespondedAt = DateTime.UtcNow
                };
            }

            if (HasAny(q, "khieu nai", "complaint", "hang hong", "giao tre", "bao loi"))
            {
                return new ChatbotAskResponseDto
                {
                    Answer = "Bạn có thể tạo khiếu nại trong mục Khiếu nại hoặc Trung tâm hỗ trợ. Hãy chọn loại khiếu nại, nhập mô tả vấn đề và đính kèm bằng chứng nếu có để nhân viên SmartLog AI xử lý.",
                    Source = "FAQ",
                    MatchedQuestion = "Tôi muốn tạo khiếu nại thì làm thế nào?",
                    Category = "Khiếu nại",
                    Confidence = 0.98,
                    RespondedAt = DateTime.UtcNow
                };
            }

            if (HasAny(q, "voucher", "ma giam", "giam gia", "discount"))
            {
                return new ChatbotAskResponseDto
                {
                    Answer = "Mỗi đơn hàng chỉ được áp dụng một voucher hợp lệ. Voucher cần còn hạn và đáp ứng điều kiện về hạng khách hàng hoặc giá trị đơn tối thiểu.",
                    Source = "FAQ",
                    MatchedQuestion = "Voucher được áp dụng ra sao?",
                    Category = "Voucher",
                    Confidence = 0.98,
                    RespondedAt = DateTime.UtcNow
                };
            }

            if (HasAny(q, "tao don", "dat don", "create order", "create shipment"))
            {
                return new ChatbotAskResponseDto
                {
                    Answer = "Bạn vào Dịch vụ hoặc Tạo đơn mới, nhập địa chỉ lấy/giao hàng, trọng lượng, thể tích và loại dịch vụ. Sau khi xác nhận báo giá, hệ thống sẽ tạo đơn logistics cho bạn.",
                    Source = "FAQ",
                    MatchedQuestion = "Làm sao để tạo đơn hàng?",
                    Category = "Đơn hàng",
                    Confidence = 0.98,
                    RespondedAt = DateTime.UtcNow
                };
            }

            return null;
        }

        private static bool HasAny(string value, params string[] keywords)
        {
            return keywords.Any(value.Contains);
        }

        private static string BuildGeminiPrompt(string question)
        {
            return $"""
Bạn là chatbot hỗ trợ khách hàng của hệ thống SmartLog AI.

Nhiệm vụ:
- Trả lời ngắn gọn, lịch sự bằng tiếng Việt.
- Chỉ trả lời trong phạm vi logistics, đơn hàng, kho, hóa đơn, thanh toán, voucher, feedback và khiếu nại.
- Không bịa dữ liệu đơn hàng, hóa đơn hoặc thanh toán cụ thể.
- Nếu khách hỏi dữ liệu cá nhân, hãy hướng dẫn vào Đơn hàng của tôi hoặc Hóa đơn của tôi.
- Nếu ngoài phạm vi SmartLog AI, hãy từ chối lịch sự.

Câu hỏi của khách hàng: {question}
""";
        }

        private static bool MatchesBuiltInKeyword(CustomerFaqDto faq, string keyword)
        {
            var q = Normalize(keyword);
            return Normalize($"{faq.Category} {faq.Question} {faq.Answer} {faq.Tags}").Contains(q);
        }

        private static string Normalize(string? value)
        {
            if (string.IsNullOrWhiteSpace(value)) return string.Empty;
            var formD = value.Trim().ToLowerInvariant().Normalize(NormalizationForm.FormD);
            var builder = new StringBuilder();
            foreach (var c in formD)
            {
                if (c == 'đ' || c == 'Đ')
                {
                    builder.Append('d');
                    continue;
                }

                if (CharUnicodeInfo.GetUnicodeCategory(c) != UnicodeCategory.NonSpacingMark)
                {
                    builder.Append(c);
                }
            }
            return Regex.Replace(builder.ToString().Normalize(NormalizationForm.FormC), @"\s+", " ");
        }

        private static List<string> Tokenize(string normalized)
        {
            return Regex.Split(normalized, @"[^a-z0-9]+")
                .Where(t => t.Length >= 2)
                .Distinct()
                .ToList();
        }

        private static string ToCustomerStatus(string? status)
        {
            return status?.Trim().ToUpperInvariant() switch
            {
                "PENDING_PAYMENT" => "Chờ thanh toán",
                "PENDING" or "CREATED" => "Đã tạo đơn",
                "CONFIRMED" => "Đã xác nhận",
                "PICKING" => "Đang lấy hàng",
                "IN_STORAGE" => "Đang lưu kho",
                "DISPATCHED" => "Đang vận chuyển",
                "DELIVERED" => "Hoàn thành",
                "CANCELLED" => "Đã hủy",
                _ => status ?? "Chưa có trạng thái"
            };
        }

        private static string ToCustomerService(string? serviceType)
        {
            return serviceType?.Trim().ToUpperInvariant() switch
            {
                "IMPORT" => "Nhập kho",
                "EXPORT" => "Xuất kho",
                "STORAGE" => "Lưu kho",
                "TRANSPORT" => "Vận chuyển",
                _ => serviceType ?? "Dịch vụ logistics"
            };
        }

        private static List<CustomerFaqDto> GetBuiltInFaqs()
        {
            return new List<CustomerFaqDto>
            {
                new() { FaqId = -1, Category = "Đơn hàng", Question = "Làm sao để tạo đơn hàng?", Answer = "Bạn vào Dịch vụ hoặc Tạo đơn mới, nhập địa chỉ lấy/giao hàng, trọng lượng, thể tích và loại dịch vụ. Sau khi xác nhận báo giá, hệ thống sẽ tạo đơn logistics cho bạn.", Tags = "order,create,shipment,don hang" },
                new() { FaqId = -2, Category = "Đơn hàng", Question = "Tôi xem đơn hàng ở đâu?", Answer = "Bạn vào mục Đơn hàng của tôi để xem toàn bộ đơn logistics, trạng thái xử lý, chi phí, hóa đơn và nút đánh giá khi đơn đã hoàn thành.", Tags = "my orders,tracking,status" },
                new() { FaqId = -3, Category = "Hóa đơn", Question = "Làm sao tải hóa đơn PDF?", Answer = "Bạn có thể vào Hóa đơn của tôi hoặc Đơn hàng của tôi, chọn hóa đơn cần xem rồi bấm PDF hoặc Tải PDF để mở hoặc tải file hóa đơn.", Tags = "invoice,pdf,bill,download" },
                new() { FaqId = -4, Category = "Thanh toán", Question = "Thanh toán rồi nhưng chưa nhận email thì sao?", Answer = "Sau khi thanh toán thành công, hệ thống sẽ gửi bill PDF về email tài khoản Customer. Nếu chưa nhận được, bạn có thể vào Hóa đơn của tôi để bấm gửi lại email hoặc kiểm tra thư rác.", Tags = "payment,email,paid" },
                new() { FaqId = -5, Category = "Feedback", Question = "Tôi đánh giá dịch vụ ở đâu?", Answer = "Bạn chỉ có thể đánh giá khi đơn hàng đã hoàn thành. Vào Đơn hàng của tôi, chọn đơn có trạng thái Hoàn thành và bấm Đánh giá.", Tags = "feedback,rating,star,danh gia" },
                new() { FaqId = -6, Category = "Khiếu nại", Question = "Tôi muốn tạo khiếu nại hàng hỏng thì làm thế nào?", Answer = "Bạn vào mục Khiếu nại hoặc Trung tâm hỗ trợ, chọn loại khiếu nại, nhập mô tả vấn đề và đính kèm bằng chứng nếu có.", Tags = "complaint,damage,khoi kien,khieu nai" },
                new() { FaqId = -7, Category = "Voucher", Question = "Voucher được áp dụng ra sao?", Answer = "Mỗi đơn hàng chỉ được áp dụng một voucher hợp lệ. Voucher cần còn hạn và đáp ứng điều kiện về hạng khách hàng hoặc giá trị đơn tối thiểu.", Tags = "voucher,discount,promotion" },
                new() { FaqId = -8, Category = "Đơn hàng", Question = "Tôi có thể hủy đơn khi nào?", Answer = "Bạn chỉ nên hủy đơn khi đơn chưa bước vào giai đoạn xử lý kho hoặc vận chuyển. Nếu đơn đã được xử lý, vui lòng liên hệ hỗ trợ để được kiểm tra.", Tags = "cancel,huy don" }
            };
        }
    }
}