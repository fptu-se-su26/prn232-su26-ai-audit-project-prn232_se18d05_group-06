using BACKEND.DTOs;
using BACKEND.Models;

namespace BACKEND.Services;

public interface ISkuService
{
    // CRUD Operations
    Task<SkuPagedResult> GetAllAsync(SkuSearchRequest request);
    Task<SkuDetailDto?> GetByIdAsync(int id);
    Task<SkuDetailDto> CreateAsync(CreateSkuRequest request, int createdBy);
    Task<SkuDetailDto?> UpdateAsync(int id, UpdateSkuRequest request, int updatedBy);
    Task<bool> DeleteAsync(int id);

    // Search Operations
    Task<List<SkuListDto>> SearchAsync(string query);
    Task<List<SkuListDto>> GetByBarcodeAsync(string barcode);
    Task<List<SkuListDto>> GetByCategoryAsync(int categoryId);
    Task<List<SkuListDto>> GetByCustomerAsync(int customerId);

    // Duplicate Check
    Task<CheckDuplicateResult> CheckDuplicateAsync(CheckDuplicateRequest request);

    // Barcode/QR Generation
    Task<byte[]> GenerateBarcodeAsync(int skuId, int? width = null, int? height = null);
    Task<byte[]> GenerateQrCodeAsync(int skuId, int? size = null);

    // Import/Export
    Task<SkuImportResult> ImportFromExcelAsync(IFormFile file, int createdBy);
    Task<byte[]> ExportToExcelAsync(SkuSearchRequest? filter = null);

    // SKU Code Generation
    Task<string> GenerateSkuCodeAsync(string? categoryPrefix = null);

    // Validation
    Task<SkuValidationResult> ValidateAsync(CreateSkuRequest request);
}
