using System;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text.Json;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace BACKEND.Services
{
    public class InvoiceOcrService : IInvoiceOcrService
    {
        private readonly ILogger<InvoiceOcrService> _logger;
        private readonly string _azureEndpoint;
        private readonly string _azureKey;

        public InvoiceOcrService(ILogger<InvoiceOcrService> logger, IConfiguration config)
        {
            _logger = logger;
            _azureEndpoint = config["AzureComputerVision:Endpoint"] ?? throw new InvalidOperationException("Missing AzureComputerVision:Endpoint");
            _azureKey = config["AzureComputerVision:ApiKey"] ?? throw new InvalidOperationException("Missing AzureComputerVision:ApiKey");
        }

        public async Task<InvoiceOcrResultDto> ScanInvoiceAsync(IFormFile imageFile)
        {
            using var ms = new MemoryStream();
            await imageFile.CopyToAsync(ms);
            var imageBytes = ms.ToArray();

            var result = new InvoiceOcrResultDto();
            try
            {
                using var client = new HttpClient();
                client.DefaultRequestHeaders.Add("Ocp-Apim-Subscription-Key", _azureKey);
                
                string url = $"{_azureEndpoint.TrimEnd('/')}/computervision/imageanalysis:analyze?api-version=2023-10-01&features=read";
                
                using var content = new ByteArrayContent(imageBytes);
                content.Headers.ContentType = new MediaTypeHeaderValue("application/octet-stream");
                
                var response = await client.PostAsync(url, content);
                if (response.IsSuccessStatusCode)
                {
                    string jsonResponse = await response.Content.ReadAsStringAsync();
                    using var doc = JsonDocument.Parse(jsonResponse);
                    
                    var allLines = string.Empty;

                    if (doc.RootElement.TryGetProperty("readResult", out var readResult))
                    {
                        if (readResult.TryGetProperty("blocks", out var blocks))
                        {
                            var lines = blocks.EnumerateArray()
                                .SelectMany(b => b.GetProperty("lines").EnumerateArray())
                                .Select(l => l.GetProperty("text").GetString())
                                .Where(s => !string.IsNullOrWhiteSpace(s));
                            allLines = string.Join("\n", lines);
                        }
                        else if (readResult.TryGetProperty("content", out var textContent))
                        {
                            allLines = textContent.GetString() ?? string.Empty;
                        }
                    }

                    result.RawText = allLines;
                    ParseOcrText(allLines, result);
                }
                else
                {
                    string err = await response.Content.ReadAsStringAsync();
                    _logger.LogError($"[OCR] Azure Vision Error: {response.StatusCode} - {err}");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError($"[OCR] Exception: {ex.Message}");
            }

            return result;
        }

        private void ParseOcrText(string text, InvoiceOcrResultDto result)
        {
            _logger.LogInformation("RAW OCR TEXT: \n" + text);
            var textLower = text.ToLower();
            var keywords = new[] { "hóa đơn", "hoa don", "hàng hóa", "hang hoa", "người gửi", "nguoi gui", "người nhận", "nguoi nhan", "địa chỉ", "dia chi", "invoice", "bill", "ship", "vận đơn", "van don", "giao hàng", "giao hang" };
            
            if (!keywords.Any(k => textLower.Contains(k)))
            {
                result.IsInvoice = false;
                result.Message = "Hình ảnh này dường như không phải là hóa đơn hoặc vận đơn hợp lệ.";
                return;
            }

            var lines = text.Split(new[] { '\n', '\r' }, StringSplitOptions.RemoveEmptyEntries).Select(l => l.Trim()).ToArray();
            
            var names = new List<string>();
            var phones = new List<string>();
            var addresses = new List<string>();

            for (int i = 0; i < lines.Length; i++)
            {
                var lowerLine = lines[i].ToLower();
                
                // Name
                if (lowerLine == "họ tên:" || lowerLine == "họ tên" || lowerLine == "ho ten:" || lowerLine == "ho ten")
                {
                    if (i + 1 < lines.Length) names.Add(lines[i + 1]);
                }
                else if (lowerLine.StartsWith("họ tên:") && lowerLine.Length > 8)
                {
                    names.Add(lines[i].Substring(lines[i].IndexOf(':') + 1).Trim());
                }

                // Phone
                if (lowerLine == "điện thoại:" || lowerLine == "điện thoại" || lowerLine == "dien thoai:" || lowerLine == "dien thoai")
                {
                    if (i + 1 < lines.Length) phones.Add(lines[i + 1]);
                }
                else if (lowerLine.StartsWith("điện thoại:") && lowerLine.Length > 12)
                {
                    phones.Add(lines[i].Substring(lines[i].IndexOf(':') + 1).Trim());
                }

                // Address
                if (lowerLine == "địa chỉ:" || lowerLine == "địa chỉ" || lowerLine == "dia chi:" || lowerLine == "dia chi")
                {
                    if (i + 1 < lines.Length) 
                    {
                        var addr = lines[i + 1];
                        
                        // Handle column mixing from Azure OCR: 
                        // Sometimes it reads "District 1 (Sender)" right below "Address (Receiver)".
                        // To avoid mixing, we will only append i+2 if it clearly belongs to this address
                        // Actually, it's safer to just rely on the first line of the address and let autocomplete handle the rest.
                        
                        addresses.Add(addr);
                    }
                }
                else if (lowerLine.StartsWith("địa chỉ:") && lowerLine.Length > 9)
                {
                    addresses.Add(lines[i].Substring(lines[i].IndexOf(':') + 1).Trim());
                }
                
                // Weight
                if (lowerLine.Contains("khối lượng") || lowerLine.Contains("khoi luong") || lowerLine.Contains("trọng lượng") || lowerLine.Contains("trong luong") || lowerLine.Contains("weight"))
                {
                    // Usually weight is on the same line or next line
                    var wText = lowerLine;
                    if (lowerLine == "khối lượng:" || lowerLine == "khối lượng" || lowerLine.StartsWith("trọng lượng"))
                    {
                        if (i + 1 < lines.Length) wText = lines[i + 1].ToLower();
                    }
                    
                    var wMatch = Regex.Match(wText, @"(\d+[\.,]?\d*)");
                    if (wMatch.Success)
                    {
                        if (double.TryParse(wMatch.Groups[1].Value.Replace(',', '.'), out double w))
                        {
                            result.WeightKg = w;
                        }
                    }
                }
                
                // Delivery Speed
                if (lowerLine.Contains("hỏa tốc") || lowerLine.Contains("nhanh") || lowerLine.Contains("express"))
                {
                    result.DeliverySpeed = "EXPRESS";
                }
                else if (lowerLine.Contains("tiết kiệm") || lowerLine.Contains("standard") || lowerLine.Contains("thường"))
                {
                    result.DeliverySpeed = "STANDARD";
                }

                // Item Name (guess based on "hàng hóa:", "nội dung:", "tên hàng:", "sản phẩm:")
                if (string.IsNullOrEmpty(result.ItemName))
                {
                    if (lowerLine == "nội dung:" || lowerLine == "nội dung" || lowerLine == "hàng hóa:" || lowerLine == "hàng hóa" || lowerLine == "tên hàng:" || lowerLine == "tên hàng" || lowerLine == "sản phẩm:" || lowerLine == "sản phẩm")
                    {
                        if (i + 1 < lines.Length) result.ItemName = lines[i + 1].Trim('.', ' ');
                    }
                    else if (lowerLine.StartsWith("nội dung:") || (lowerLine.StartsWith("hàng hóa:") && !lowerLine.Contains("giá trị")) || lowerLine.StartsWith("tên hàng:") || lowerLine.StartsWith("sản phẩm:"))
                    {
                        result.ItemName = ExtractAfterColon(lines[i]).Trim('.', ' ');
                    }
                }

                // Item Value
                if (lowerLine == "giá trị:" || lowerLine == "giá trị hàng hóa:" || lowerLine == "giá trị" || lowerLine == "trị giá:" || lowerLine == "trị giá" || lowerLine == "giá tiền:" || lowerLine == "giá tiền" || lowerLine == "số tiền:" || lowerLine == "số tiền" || lowerLine == "tổng tiền:" || lowerLine == "tổng tiền")
                {
                    if (i + 1 < lines.Length)
                    {
                        var valMatch = Regex.Match(lines[i + 1], @"(\d+[\.,]?\d*)");
                        if (valMatch.Success)
                        {
                            if (double.TryParse(valMatch.Groups[1].Value.Replace(".", "").Replace(",", ""), out double v)) result.ItemValue = v;
                        }
                    }
                }
                else if (lowerLine.Contains("giá trị") || lowerLine.Contains("trị giá") || lowerLine.Contains("giá tiền") || lowerLine.Contains("số tiền") || lowerLine.Contains("tổng tiền"))
                {
                    var valMatch = Regex.Match(lowerLine, @"(\d+[\.,\s]*\d+[\.,\s]*\d*)");
                    if (valMatch.Success)
                    {
                        if (double.TryParse(valMatch.Groups[1].Value.Replace(".", "").Replace(",", "").Replace(" ", ""), out double v))
                        {
                            result.ItemValue = v;
                        }
                    }
                }

                // Notes
                if (lowerLine == "ghi chú:" || lowerLine == "ghi chú" || lowerLine.Contains("nội dung/ghi chú"))
                {
                    if (i + 1 < lines.Length) result.Notes = ExtractAfterColon(lines[i + 1]).Trim('.', ' ');
                }
                else if (lowerLine.Contains("ghi chú"))
                {
                    result.Notes = ExtractAfterColon(lines[i]).Trim('.', ' ');
                }
            }

            _logger.LogInformation($"[OCR PARSED] ItemName: {result.ItemName}, ItemValue: {result.ItemValue}, Notes: {result.Notes}, SenderPhone: {result.SenderPhone}, ReceiverPhone: {result.ReceiverPhone}");
            
            // Assign extracted lists to Sender (0) and Receiver (1)
            if (names.Count >= 1) result.SenderName = names[0];
            if (names.Count >= 2) result.ReceiverName = names[1];

            if (phones.Count >= 1) result.SenderPhone = phones[0].Replace(".", "").Replace(" ", "");
            if (phones.Count >= 2) result.ReceiverPhone = phones[1].Replace(".", "").Replace(" ", "");

            if (addresses.Count >= 1) 
            {
                if (addresses.Count >= 2)
                {
                    result.SenderAddress = addresses[0];
                    result.Address = addresses[1];
                }
                else
                {
                    result.Address = addresses[0]; // Fallback if only 1 address found
                }
            }
        }

        private string ExtractAfterColon(string line)
        {
            int idx = line.IndexOf(':');
            if (idx >= 0 && idx < line.Length - 1)
            {
                return line.Substring(idx + 1).Trim();
            }
            return string.Empty;
        }
    }
}
