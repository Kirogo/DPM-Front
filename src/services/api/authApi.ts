// src/services/api/authApi.ts
import axiosInstance from './axiosConfig'
import { LoginCredentials, AuthResponse, RegisterDto, ForgotPasswordDto, ResetPasswordDto, User } from '@/types/auth.types'
import { AxiosError } from 'axios'

// Helper to extract error message
const getErrorMessage = (error: unknown): string => {
  if (error instanceof AxiosError) {
    return error.response?.data?.message || error.message || 'Request failed'
  }
  if (error instanceof Error) {
    return error.message
  }
  if (typeof error === 'string') {
    return error
  }
  return 'An unknown error occurred'
}

export const authApi = {
  // Login
  login: async (credentials: LoginCredentials) => {
    try {
      const response = await axiosInstance.post<AuthResponse>('/auth/login', credentials)
      return response
    } catch (error) {
      // Transform error to have a consistent message format
      const message = getErrorMessage(error)
      throw new Error(message)
    }
  },

  // Logout
  logout: async () => {
    try {
      const response = await axiosInstance.post('/auth/logout')
      return response
    } catch (error) {
      console.warn('Logout API error (non-critical):', getErrorMessage(error))
      // Don't throw - logout should succeed even if API fails
      return { data: { success: true } }
    }
  },

  // Refresh token
  refreshToken: async (refreshToken: string) => {
    try {
      const response = await axiosInstance.post<AuthResponse>('/auth/refresh', { refreshToken })
      return response
    } catch (error) {
      const message = getErrorMessage(error)
      throw new Error(message)
    }
  },

  // Register
  register: async (data: RegisterDto) => {
    try {
      const response = await axiosInstance.post<AuthResponse>('/auth/register', data)
      return response
    } catch (error) {
      const message = getErrorMessage(error)
      throw new Error(message)
    }
  },

  // Forgot password
  forgotPassword: async (data: ForgotPasswordDto) => {
    try {
      const response = await axiosInstance.post('/auth/forgot-password', data)
      return response
    } catch (error) {
      const message = getErrorMessage(error)
      throw new Error(message)
    }
  },

  // Reset password
  resetPassword: async (data: ResetPasswordDto) => {
    try {
      const response = await axiosInstance.post('/auth/reset-password', data)
      return response
    } catch (error) {
      const message = getErrorMessage(error)
      throw new Error(message)
    }
  },

  // Get current user
  getCurrentUser: async () => {
    try {
      const response = await axiosInstance.get('/auth/me')
      return response
    } catch (error) {
      const message = getErrorMessage(error)
      throw new Error(message)
    }
  },

  // Verify email
  verifyEmail: async (token: string) => {
    try {
      const response = await axiosInstance.post('/auth/verify-email', { token })
      return response
    } catch (error) {
      const message = getErrorMessage(error)
      throw new Error(message)
    }
  },

  // Update profile
  updateProfile: async (data: Partial<User>) => {
    try {
      const response = await axiosInstance.patch<User>('/auth/profile', data)
      return response
    } catch (error) {
      const message = getErrorMessage(error)
      throw new Error(message)
    }
  },

  // Change password
  changePassword: async (oldPassword: string, newPassword: string) => {
    try {
      const response = await axiosInstance.post('/auth/change-password', { oldPassword, newPassword })
      return response
    } catch (error) {
      const message = getErrorMessage(error)
      throw new Error(message)
    }
  },
}