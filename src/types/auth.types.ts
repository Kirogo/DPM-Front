// src/types/auth.types.ts

// Backend returns properties with capital letters (PascalCase)
// Frontend uses camelCase - this interface handles both
export interface User {
    id: string
    Id?: string // Backend might return Id with capital I
    email: string
    Email?: string // Backend might return Email with capital E
    firstName: string
    FirstName?: string // Backend might return FirstName with capital F
    lastName: string
    LastName?: string // Backend might return LastName with capital L
    role: string
    Role?: string // Backend might return Role with capital R
    permissions?: string[]
    Permissions?: string[] // Backend might return Permissions with capital P
    createdAt?: string | Date
    CreatedAt?: string | Date // Backend might return CreatedAt with capital C
    updatedAt?: string | Date
    UpdatedAt?: string | Date // Backend might return UpdatedAt with capital U
}

export interface LoginCredentials {
    email: string
    password: string
}

export interface AuthResponse {
    user: User
    token: string
    Token?: string // Backend might return Token with capital T
    refreshToken: string
    RefreshToken?: string // Backend might return RefreshToken with capital R
    permissions?: string[]
    Permissions?: string[] // Backend might return Permissions with capital P
}

export interface AuthState {
    user: User | null
    token: string | null
    refreshToken: string | null
    isAuthenticated: boolean
    isLoading: boolean
    error: string | null
    permissions: string[]
}

export interface RegisterDto {
    email: string
    password: string
    firstName: string
    lastName: string
    role?: string
}

export interface ForgotPasswordDto {
    email: string
}

export interface ResetPasswordDto {
    token: string
    password: string
}

// Helper function to normalize user object from backend
export function normalizeUser(user: any): User {
    if (!user) return null as any
    
    return {
        id: user.id || user.Id || '',
        email: user.email || user.Email || '',
        firstName: user.firstName || user.FirstName || '',
        lastName: user.lastName || user.LastName || '',
        role: user.role || user.Role || '',
        permissions: user.permissions || user.Permissions || [],
        createdAt: user.createdAt || user.CreatedAt,
        updatedAt: user.updatedAt || user.UpdatedAt
    }
}

// Helper function to normalize auth response from backend
export function normalizeAuthResponse(response: any): AuthResponse {
    return {
        user: normalizeUser(response.user || response.User || {}),
        token: response.token || response.Token || '',
        refreshToken: response.refreshToken || response.RefreshToken || '',
        permissions: response.permissions || response.Permissions || []
    }
}