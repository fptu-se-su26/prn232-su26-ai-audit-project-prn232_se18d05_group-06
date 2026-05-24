// Authentication types
export interface AuthUser {
  id: string
  email: string
  name: string
  role: 'admin' | 'customer' | 'driver' | 'warehouse'
  avatar?: string
}

export interface AuthState {
  user: AuthUser | null
  isLoading: boolean
  error: string | null
}

// API Response types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Pagination
export interface PaginationParams {
  page: number
  limit: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}
