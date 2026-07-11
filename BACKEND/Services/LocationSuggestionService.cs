using BACKEND.DTOs;
using Microsoft.Extensions.Configuration;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace BACKEND.Services
{
    public class LocationSuggestionService : ILocationSuggestionService
    {
        private readonly IConfiguration _configuration;
        private readonly HttpClient _httpClient;

        private static readonly List<LocationSuggestionDto> MockAddresses = new()
        {
            new LocationSuggestionDto
            {
                PlaceId = "mock_001",
                MainText = "Kho Tân Bình",
                FullAddress = "18 Cộng Hòa, Phường 4, Tân Bình, TP.HCM",
                Lat = 10.8012345m,
                Lng = 106.6523456m,
                Source = "MOCK"
            },
            new LocationSuggestionDto
            {
                PlaceId = "mock_002",
                MainText = "Cảng Cát Lái",
                FullAddress = "Cảng Cát Lái, TP. Thủ Đức, TP.HCM",
                Lat = 10.7698123m,
                Lng = 106.7891234m,
                Source = "MOCK"
            },
            new LocationSuggestionDto
            {
                PlaceId = "mock_003",
                MainText = "KCN Sóng Thần 2",
                FullAddress = "KCN Sóng Thần 2, Dĩ An, Bình Dương",
                Lat = 10.9045678m,
                Lng = 106.7323456m,
                Source = "MOCK"
            },
            new LocationSuggestionDto
            {
                PlaceId = "mock_004",
                MainText = "Kho lạnh Long An",
                FullAddress = "KCN Đức Hòa 1, Long An",
                Lat = 10.8789012m,
                Lng = 106.4012345m,
                Source = "MOCK"
            },
            new LocationSuggestionDto
            {
                PlaceId = "mock_005",
                MainText = "Nguyễn Văn Trỗi",
                FullAddress = "90 Nguyễn Văn Trỗi, Phú Nhuận, TP.HCM",
                Lat = 10.7973456m,
                Lng = 106.6754321m,
                Source = "MOCK"
            },
            new LocationSuggestionDto
            {
                PlaceId = "mock_006",
                MainText = "Phan Đình Phùng",
                FullAddress = "45 Phan Đình Phùng, Phú Nhuận, TP.HCM",
                Lat = 10.7956789m,
                Lng = 106.6890123m,
                Source = "MOCK"
            }
        };

        public LocationSuggestionService(IConfiguration configuration, HttpClient httpClient)
        {
            _configuration = configuration;
            _httpClient = httpClient;
        }

        public async Task<List<LocationSuggestionDto>> GetSuggestionsAsync(string keyword, string? type)
        {
            if (string.IsNullOrWhiteSpace(keyword) || keyword.Length < 2)
            {
                return new List<LocationSuggestionDto>();
            }

            bool useGoongMaps = _configuration.GetValue<bool>("LocationProvider:UseGoogleMaps"); // Currently false, can be toggled to true

            if (useGoongMaps)
            {
                try
                {
                    return await GetGoongSuggestionsAsync(keyword);
                }
                catch
                {
                    return GetMockSuggestions(keyword);
                }
            }

            return GetMockSuggestions(keyword);
        }

        public async Task<LocationSuggestionDto?> GetPlaceDetailAsync(string placeId)
        {
            var mockPlace = MockAddresses.FirstOrDefault(x => x.PlaceId == placeId);
            if (mockPlace != null) return mockPlace;

            bool useGoongMaps = _configuration.GetValue<bool>("LocationProvider:UseGoogleMaps");
            if (useGoongMaps)
            {
                try
                {
                    var apiKey = _configuration.GetValue<string>("GoongMaps:ApiKey");
                    var url = $"https://rsapi.goong.io/Place/Detail?place_id={placeId}&api_key={apiKey}";
                    var response = await _httpClient.GetAsync(url);
                    response.EnsureSuccessStatusCode();

                    var content = await response.Content.ReadAsStringAsync();
                    using var doc = JsonDocument.Parse(content);
                    var status = doc.RootElement.GetProperty("status").GetString();

                    if (status == "OK")
                    {
                        var result = doc.RootElement.GetProperty("result");
                        return new LocationSuggestionDto
                        {
                            PlaceId = placeId,
                            MainText = result.GetProperty("name").GetString() ?? "",
                            FullAddress = result.GetProperty("formatted_address").GetString() ?? "",
                            Lat = result.GetProperty("geometry").GetProperty("location").GetProperty("lat").GetDecimal(),
                            Lng = result.GetProperty("geometry").GetProperty("location").GetProperty("lng").GetDecimal(),
                            Source = "GOONG"
                        };
                    }
                }
                catch
                {
                    return null;
                }
            }

            return null;
        }

        private async Task<List<LocationSuggestionDto>> GetGoongSuggestionsAsync(string keyword)
        {
            var apiKey = _configuration.GetValue<string>("GoongMaps:ApiKey");
            var limit = _configuration.GetValue<int>("LocationProvider:Limit");
            if (limit <= 0) limit = 10;
            
            var url = $"https://rsapi.goong.io/Place/AutoComplete?api_key={apiKey}&input={System.Uri.EscapeDataString(keyword)}&limit={limit}";

            var response = await _httpClient.GetAsync(url);
            response.EnsureSuccessStatusCode();

            var content = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(content);
            var status = doc.RootElement.GetProperty("status").GetString();

            var list = new List<LocationSuggestionDto>();

            if (status == "OK")
            {
                var predictions = doc.RootElement.GetProperty("predictions");
                foreach (var prediction in predictions.EnumerateArray())
                {
                    var mainText = prediction.GetProperty("structured_formatting").GetProperty("main_text").GetString();
                    list.Add(new LocationSuggestionDto
                    {
                        PlaceId = prediction.GetProperty("place_id").GetString() ?? "",
                        MainText = mainText ?? "",
                        FullAddress = prediction.GetProperty("description").GetString() ?? "",
                        Source = "GOONG"
                    });
                }
            }

            return list;
        }

        private List<LocationSuggestionDto> GetMockSuggestions(string keyword)
        {
            var normalizedKeyword = RemoveVietnameseDiacritics(keyword).ToLower();
            var limit = _configuration.GetValue<int>("LocationProvider:Limit");
            if (limit <= 0) limit = 10;

            return MockAddresses
                .Where(x =>
                    RemoveVietnameseDiacritics(x.MainText).ToLower().Contains(normalizedKeyword)
                    || RemoveVietnameseDiacritics(x.FullAddress).ToLower().Contains(normalizedKeyword))
                .Take(limit)
                .ToList();
        }

        private string RemoveVietnameseDiacritics(string text)
        {
            if (string.IsNullOrWhiteSpace(text)) return string.Empty;

            string[] vietnameseSigns = new string[]
            {
                "aAeEoOuUiIdDyY",
                "áàạảãâấầậẩẫăắằặẳẵ",
                "ÁÀẠẢÃÂẤẦẬẨẪĂẮẰẶẲẴ",
                "éèẹẻẽêếềệểễ",
                "ÉÈẸẺẼÊẾỀỆỂỄ",
                "óòọỏõôốồộổỗơớờợởỡ",
                "ÓÒỌỎÕÔỐỒỘỔỖƠỚỜỢỞỠ",
                "úùụủũưứừựửữ",
                "ÚÙỤỦŨƯỨỪỰỬỮ",
                "íìịỉĩ",
                "ÍÌỊỈĨ",
                "đ",
                "Đ",
                "ýỳỵỷỹ",
                "ÝỲỴỶỸ"
            };

            for (int i = 1; i < vietnameseSigns.Length; i++)
            {
                for (int j = 0; j < vietnameseSigns[i].Length; j++)
                {
                    text = text.Replace(vietnameseSigns[i][j], vietnameseSigns[0][i - 1]);
                }
            }

            return text;
        }
    }
}
