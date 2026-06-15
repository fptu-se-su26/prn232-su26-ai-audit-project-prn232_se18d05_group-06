using System;
using System.Collections.Generic;

namespace BACKEND.Models;

public partial class MasterCategory
{
    public int CategoryId { get; set; }

    public string CategoryType { get; set; } = null!;

    public string Code { get; set; } = null!;

    public string NameVn { get; set; } = null!;

    public string? NameEn { get; set; }

    public int? SortOrder { get; set; }

    public bool? IsActive { get; set; }
}
