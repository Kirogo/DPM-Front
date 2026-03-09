export interface BaseEntity {
  id: string
  createdAt: Date
  updatedAt: Date
  createdBy?: string
  updatedBy?: string
}

export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
  timestamp: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface ApiError {
  message: string
  statusCode: number
  errors?: Record<string, string[]>
}

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface BreadcrumbItem {
  label: string
  path?: string
  icon?: React.ReactNode
}

export interface MenuItem {
  key: string
  label: string
  icon?: React.ReactNode
  path?: string
  children?: MenuItem[]
  permissions?: string[]
}

export type Status = 'idle' | 'loading' | 'succeeded' | 'failed'

export interface DateRange {
  startDate: Date
  endDate: Date
}

export interface Coordinates {
  lat: number
  lng: number
}

export interface Address {
  street?: string
  city?: string
  state?: string
  country?: string
  postalCode?: string
  formatted?: string
}

export interface FileInfo {
  name: string
  size: number
  type: string
  lastModified: Date
  url?: string
}