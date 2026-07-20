using System.ComponentModel.DataAnnotations;

namespace BACKEND.DTOs
{
    public class MasterCategoryDto
    {
        public int CategoryId { get; set; }
        public string CategoryType { get; set; } = null!;
        public string Code { get; set; } = null!;
        public string NameVn { get; set; } = null!;
        public string? NameEn { get; set; }
        public int? SortOrder { get; set; }
        public bool? IsActive { get; set; }
        public bool IsReadOnly { get; set; }
    }

    public class CreateMasterCategoryDto
    {
        [Required(ErrorMessage = "CategoryType là bắt buộc.")]
        public string CategoryType { get; set; } = null!;

        [Required(ErrorMessage = "Code là bắt buộc.")]
        public string Code { get; set; } = null!;

        [Required(ErrorMessage = "Tên tiếng Việt là bắt buộc.")]
        public string NameVn { get; set; } = null!;

        public string? NameEn { get; set; }

        [Range(0, int.MaxValue, ErrorMessage = "SortOrder phải lớn hơn hoặc bằng 0.")]
        public int? SortOrder { get; set; } = 0;

        public bool? IsActive { get; set; } = true;
    }

    public class UpdateMasterCategoryDto
    {
        [Required(ErrorMessage = "Tên tiếng Việt là bắt buộc.")]
        public string NameVn { get; set; } = null!;

        public string? NameEn { get; set; }

        [Range(0, int.MaxValue, ErrorMessage = "SortOrder phải lớn hơn hoặc bằng 0.")]
        public int? SortOrder { get; set; } = 0;

        public bool? IsActive { get; set; } = true;
    }

    public class UpdateMasterCategoryStatusDto
    {
        public bool IsActive { get; set; }
    }

    public class MasterDataTypeDto
    {
        public string CategoryType { get; set; } = null!;
        public string DisplayNameVn { get; set; } = null!;
        public string DisplayNameEn { get; set; } = null!;
        public string Description { get; set; } = null!;
        public bool IsReadOnly { get; set; }
        public int ItemCount { get; set; }
    }
}
