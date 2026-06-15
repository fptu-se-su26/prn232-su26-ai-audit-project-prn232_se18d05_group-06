using System;
using System.Collections.Generic;

namespace BACKEND.Models;

public partial class ProductCategory
{
    public int CategoryId { get; set; }

    public int? ParentId { get; set; }

    public string CategoryCode { get; set; } = null!;

    public string CategoryName { get; set; } = null!;

    public bool? IsActive { get; set; }

    public virtual ICollection<ProductCategory> InverseParent { get; set; } = new List<ProductCategory>();

    public virtual ProductCategory? Parent { get; set; }

    public virtual ICollection<Sku> Skus { get; set; } = new List<Sku>();
}
