using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.ML.OnnxRuntime;
using Microsoft.ML.OnnxRuntime.Tensors;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text.Json;
using Microsoft.Extensions.Configuration;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.PixelFormats;
using SixLabors.ImageSharp.Processing;

namespace BACKEND.Services
{
    public class LprResult
    {
        public string Text { get; set; } = string.Empty;
        public float Confidence { get; set; }
        public Rectangle BoundingBox { get; set; }
    }

    public interface ILprService
    {
        Task<LprResult> RecognizeLicensePlateAsync(IFormFile imageFile);
    }

    public class LprService : ILprService, IDisposable
    {
        private readonly ILogger<LprService> _logger;
        private readonly InferenceSession _session;
        private readonly string _azureEndpoint;
        private readonly string _azureKey;

        public LprService(ILogger<LprService> logger, IHostEnvironment env, IConfiguration config)
        {
            _logger = logger;
            _azureEndpoint = config["AzureVision:Endpoint"] ?? throw new InvalidOperationException("Missing AzureVision:Endpoint");
            _azureKey = config["AzureVision:Key"] ?? throw new InvalidOperationException("Missing AzureVision:Key");

            // Load ONNX Model
            var modelPath = Path.Combine(env.ContentRootPath, "Models", "license_plate.onnx");
            _session = new InferenceSession(modelPath);
        }

        private static readonly object _syncRoot = new object();

        public async Task<LprResult> RecognizeLicensePlateAsync(IFormFile imageFile)
        {
            using var ms = new MemoryStream();
            await imageFile.CopyToAsync(ms);
            ms.Position = 0;

            using var image = await Image.LoadAsync<Rgb24>(ms);

            // 1. Detect License Plate Bounding Box
            (Rectangle bbox, float conf) = (Rectangle.Empty, 0f);
            lock (_syncRoot)
            {
                (bbox, conf) = DetectLicensePlate(image);
            }

            if (bbox == Rectangle.Empty)
            {
                _logger.LogWarning("No license plate detected in the image.");
                return new LprResult { Text = string.Empty, Confidence = conf, BoundingBox = Rectangle.Empty };
            }

            // 2. Crop the detected region and upscale for better OCR
            using var croppedImage = image.Clone(ctx => {
                ctx.Crop(bbox);
                ctx.Resize(bbox.Width * 2, bbox.Height * 2); // Upscale 2x
            });

            // 3. Extract text using Azure Computer Vision
            using var croppedMs = new MemoryStream();
            await croppedImage.SaveAsJpegAsync(croppedMs);
            croppedMs.Position = 0;
            var imageBytes = croppedMs.ToArray();

            string resultText = string.Empty;
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
                    _logger.LogInformation($"[LPR] Azure Raw JSON: {jsonResponse}");
                    
                    using var doc = JsonDocument.Parse(jsonResponse);
                    if (doc.RootElement.TryGetProperty("readResult", out var readResult))
                    {
                        if (readResult.TryGetProperty("content", out var textContent))
                        {
                            string raw = textContent.GetString() ?? string.Empty;
                            resultText = new string(raw.Where(c => char.IsLetterOrDigit(c)).ToArray()).ToUpper();
                        }
                        else if (readResult.TryGetProperty("blocks", out var blocks))
                        {
                            // Fallback for different API version schemas
                            var lines = blocks.EnumerateArray()
                                .SelectMany(b => b.GetProperty("lines").EnumerateArray())
                                .Select(l => l.GetProperty("text").GetString());
                            string raw = string.Join("", lines);
                            resultText = new string(raw.Where(c => char.IsLetterOrDigit(c)).ToArray()).ToUpper();
                        }
                    }
                }
                else
                {
                    string err = await response.Content.ReadAsStringAsync();
                    _logger.LogError($"[LPR] Azure Vision Error: {response.StatusCode} - {err}");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError($"[LPR] Azure Vision exception: {ex.Message}");
            }

            _logger.LogInformation($"[LPR] OCR Result Text: '{resultText}'");

            return new LprResult { Text = resultText, Confidence = conf, BoundingBox = bbox };
        }

        private (Rectangle, float) DetectLicensePlate(Image<Rgb24> image)
        {
            int targetWidth = 640;
            int targetHeight = 640;

            // Resize image for YOLOv8 (preserve aspect ratio with padding)
            var resizeOptions = new ResizeOptions
            {
                Size = new Size(targetWidth, targetHeight),
                Mode = ResizeMode.Pad,
                PadColor = SixLabors.ImageSharp.Color.FromRgb(114, 114, 114)
            };
            using var resizedImage = image.Clone(ctx => ctx.Resize(resizeOptions));

            var tensor = new DenseTensor<float>(new[] { 1, 3, targetHeight, targetWidth });
            resizedImage.ProcessPixelRows(accessor =>
            {
                for (int y = 0; y < accessor.Height; y++)
                {
                    Span<Rgb24> pixelSpan = accessor.GetRowSpan(y);
                    for (int x = 0; x < accessor.Width; x++)
                    {
                        tensor[0, 0, y, x] = pixelSpan[x].R / 255f;
                        tensor[0, 1, y, x] = pixelSpan[x].G / 255f;
                        tensor[0, 2, y, x] = pixelSpan[x].B / 255f;
                    }
                }
            });

            var inputs = new List<NamedOnnxValue>
            {
                NamedOnnxValue.CreateFromTensor("images", tensor)
            };

            using var results = _session.Run(inputs);
            var output = results.First().AsTensor<float>();

            // Output shape is [1, 9, 8400]
            float maxConfidence = 0;
            int bestIndex = -1;
            int bestIndexClass = -1;

            for (int i = 0; i < 8400; i++)
            {
                for (int c = 4; c < 9; c++) // Check all 5 classes
                {
                    float confidence = output[0, c, i];
                    if (confidence > maxConfidence)
                    {
                        maxConfidence = confidence;
                        bestIndex = i;
                        bestIndexClass = c;
                    }
                }
            }

            if (maxConfidence < 0.15f || bestIndex == -1) // Lowered minimum confidence threshold for phone screens
            {
                return (Rectangle.Empty, maxConfidence);
            }

            // Get bounding box
            float cx = output[0, 0, bestIndex];
            float cy = output[0, 1, bestIndex];
            float w = output[0, 2, bestIndex];
            float h = output[0, 3, bestIndex];

            // Scale back to original image size considering padding
            float scale = Math.Min((float)targetWidth / image.Width, (float)targetHeight / image.Height);
            int padW = (int)Math.Round((targetWidth - image.Width * scale) / 2.0f);
            int padH = (int)Math.Round((targetHeight - image.Height * scale) / 2.0f);

            int x = (int)((cx - w / 2 - padW) / scale);
            int y = (int)((cy - h / 2 - padH) / scale);
            int width = (int)(w / scale);
            int height = (int)(h / scale);

            // Add 5% padding around the bounding box to capture edges better
            int padBoxX = (int)(width * 0.05);
            int padBoxY = (int)(height * 0.05);
            x -= padBoxX;
            y -= padBoxY;
            width += padBoxX * 2;
            height += padBoxY * 2;

            // Clamp values
            x = Math.Max(0, x);
            y = Math.Max(0, y);
            width = Math.Min(image.Width - x, width);
            height = Math.Min(image.Height - y, height);

            if (width <= 0 || height <= 0)
                return (Rectangle.Empty, maxConfidence);

            var bbox = new Rectangle(x, y, width, height);
            
            // Assuming _logger is available. We must be careful since this is a private method without direct access unless we pass it or it's an instance method.
            // Since this is an instance method, we can access _logger.
            _logger.LogInformation($"[YOLO] Detected Plate: class_index={bestIndexClass}, conf={maxConfidence:F2}, bbox={bbox}");

            return (bbox, maxConfidence);
        }

        public void Dispose()
        {
            _session?.Dispose();
        }
    }
}
