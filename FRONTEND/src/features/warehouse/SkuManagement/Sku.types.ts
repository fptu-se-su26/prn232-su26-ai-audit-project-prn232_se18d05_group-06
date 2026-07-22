// SKU Types
export interface SkuListItem {
  skuId: number
  skuCode: string
  barcode: string | null
  qrCode: string | null
  productName: string
  categoryName: string | null
  customerName: string | null
  weightKg: number | null
  lengthCm: number | null
  widthCm: number | null
  heightCm: number | null
  volumeCbm: number | null
  storageTemp: string | null
  isFragile: boolean
  isHazmat: boolean
  isHeavy: boolean
  safetyMinQty: number
  expiryDays: number | null
  isActive: boolean
  createdAt: string
  totalStock: string | null
}

export interface SkuDetail extends SkuListItem {
  categoryId: number | null
  customerId: number | null
  safetyDebounceH: number
  createdByName: string | null
}

export interface CreateSkuRequest {
  skuCode: string
  productName: string
  barcode?: string
  qrCode?: string
  categoryId?: number
  customerId?: number
  weightKg?: number
  lengthCm?: number
  widthCm?: number
  heightCm?: number
  storageTemp?: string
  isFragile?: boolean
  isHazmat?: boolean
  isHeavy?: boolean
  safetyMinQty?: number
  safetyDebounceH?: number
  expiryDays?: number
  isActive?: boolean
}

export interface UpdateSkuRequest {
  productName?: string
  barcode?: string
  qrCode?: string
  categoryId?: number
  customerId?: number
  weightKg?: number
  lengthCm?: number
  widthCm?: number
  heightCm?: number
  storageTemp?: string
  isFragile?: boolean
  isHazmat?: boolean
  isHeavy?: boolean
  safetyMinQty?: number
  safetyDebounceH?: number
  expiryDays?: number
  isActive?: boolean
}

export interface SkuSearchParams {
  query?: string
  categoryId?: number
  customerId?: number
  isActive?: boolean
  isFragile?: boolean
  isHazmat?: boolean
  isHeavy?: boolean
  page?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: string
}

export interface SkuPagedResult {
  items: SkuListItem[]
  totalCount: number
  page: number
  pageSize: number
  totalPages: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}

export interface CheckDuplicateResult {
  isDuplicate: boolean
  duplicateField: string
  existingSkuId: number | null
  existingSkuCode: string | null
}

export interface SkuValidationResult {
  isValid: boolean
  errors: string[]
  warningMessage: string | null
}

export interface SkuImportResult {
  totalRows: number
  successCount: number
  errorCount: number
  errors: SkuImportError[]
}

export interface SkuImportError {
  rowNumber: number
  skuCode: string | null
  errorMessage: string
}
