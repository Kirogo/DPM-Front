export interface ApiResponse<T = any> {
    data: T
    status: number
    message?: string
}

export interface ApiError {
    message: string
    code?: string
    details?: any
}

export interface QueryParams {
    page?: number
    pageSize?: number
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
    [key: string]: any
}
