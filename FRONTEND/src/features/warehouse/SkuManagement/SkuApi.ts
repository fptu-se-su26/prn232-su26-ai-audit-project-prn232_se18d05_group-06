import api from '../../../lib/api'
import type {
  CreateSkuRequest,
  SkuDetail,
  SkuListItem,
  SkuPagedResult,
  SkuSearchParams,
  CheckDuplicateResult,
  SkuValidationResult,
  SkuImportResult,
  UpdateSkuRequest,
} from './Sku.types'

// Types for Master Data
export interface CategoryOption {
  categoryId: number
  categoryCode: string
  categoryName: string
  parentId: number | null
}

export interface CustomerOption {
  customerId: number
  customerCode: string
  companyName: string
  tier: string | null
}

export const skuApi = {
  // Get paginated list with filters
  getAll: async (params?: SkuSearchParams): Promise<SkuPagedResult> => {
    const response = await api.get<SkuPagedResult>('/sku', { params })
    return response.data
  },

  // Get single SKU by ID
  getById: async (id: number): Promise<SkuDetail> => {
    const response = await api.get<SkuDetail>(`/sku/${id}`)
    return response.data
  },

  // Create new SKU
  create: async (data: CreateSkuRequest): Promise<SkuDetail> => {
    const response = await api.post<SkuDetail>('/sku', data)
    return response.data
  },

  // Update existing SKU
  update: async (id: number, data: UpdateSkuRequest): Promise<SkuDetail> => {
    const response = await api.put<SkuDetail>(`/sku/${id}`, data)
    return response.data
  },

  // Delete SKU (soft delete)
  delete: async (id: number): Promise<void> => {
    await api.delete(`/sku/${id}`)
  },

  // Search SKU
  search: async (query: string): Promise<SkuListItem[]> => {
    const response = await api.get<SkuListItem[]>('/sku/search', {
      params: { q: query },
    })
    return response.data
  },

  // Get SKU by barcode
  getByBarcode: async (barcode: string): Promise<SkuListItem[]> => {
    const response = await api.get<SkuListItem[]>(`/sku/barcode/${encodeURIComponent(barcode)}`)
    return response.data
  },

  // Get SKU by category
  getByCategory: async (categoryId: number): Promise<SkuListItem[]> => {
    const response = await api.get<SkuListItem[]>(`/sku/category/${categoryId}`)
    return response.data
  },

  // Get SKU by customer
  getByCustomer: async (customerId: number): Promise<SkuListItem[]> => {
    const response = await api.get<SkuListItem[]>(`/sku/customer/${customerId}`)
    return response.data
  },

  // Check duplicate
  checkDuplicate: async (data: {
    skuCode?: string
    barcode?: string
    qrCode?: string
  }): Promise<CheckDuplicateResult> => {
    const response = await api.post<CheckDuplicateResult>('/sku/check-duplicate', data)
    return response.data
  },

  // Generate SKU code
  generateCode: async (categoryPrefix?: string): Promise<string> => {
    const response = await api.post<{ skuCode: string }>('/sku/generate-code', {
      categoryPrefix,
    })
    return response.data.skuCode
  },

  // Validate SKU before creation
  validate: async (data: CreateSkuRequest): Promise<SkuValidationResult> => {
    const response = await api.post<SkuValidationResult>('/sku/validate', data)
    return response.data
  },

  // Get barcode image
  getBarcode: (id: number, width?: number, height?: number): string => {
    const params = new URLSearchParams()
    if (width) params.append('width', width.toString())
    if (height) params.append('height', height.toString())
    const query = params.toString() ? `?${params.toString()}` : ''
    return `http://localhost:5200/api/sku/${id}/barcode${query}`
  },

  // Get QR code image
  getQrCode: (id: number, size?: number): string => {
    const params = size ? `?size=${size}` : ''
    return `http://localhost:5200/api/sku/${id}/qrcode${params}`
  },

  // Import from Excel
  import: async (file: File): Promise<SkuImportResult> => {
    const formData = new FormData()
    formData.append('file', file)
    const response = await api.post<SkuImportResult>('/sku/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  // Export to Excel
  export: async (params?: Partial<SkuSearchParams>): Promise<Blob> => {
    const response = await api.get('/sku/export', {
      params,
      responseType: 'blob',
    })
    return response.data
  },
}

// Master Data APIs
export const masterDataApi = {
  // Get categories
  getCategories: async (): Promise<CategoryOption[]> => {
    const response = await api.get<CategoryOption[]>('/master-data/categories')
    return response.data
  },

  // Get all categories (including inactive)
  getAllCategories: async (): Promise<CategoryOption[]> => {
    const response = await api.get<CategoryOption[]>('/master-data/categories/all')
    return response.data
  },

  // Get customers
  getCustomers: async (): Promise<CustomerOption[]> => {
    const response = await api.get<CustomerOption[]>('/master-data/customers')
    return response.data
  },

  // Get all customers (including inactive)
  getAllCustomers: async (): Promise<CustomerOption[]> => {
    const response = await api.get<CustomerOption[]>('/master-data/customers/all')
    return response.data
  },

  // Get storage temperature options
  getStorageTemps: async (): Promise<string[]> => {
    const response = await api.get<string[]>('/master-data/storage-temps')
    return response.data
  },
}
