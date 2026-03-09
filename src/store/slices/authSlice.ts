// src/store/slices/authSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { authApi } from '@/services/api/authApi'
import { User, LoginCredentials, AuthState } from '@/types/auth.types'
import { ApiError } from '@/types/common.types'

// Helper to check if token exists
const getInitialAuthState = (): AuthState => {
  const token = localStorage.getItem('token')
  const refreshToken = localStorage.getItem('refreshToken')

  return {
    user: null,
    token,
    refreshToken,
    isAuthenticated: !!token,
    isLoading: false,
    error: null,
    permissions: [],
  }
}

const initialState: AuthState = getInitialAuthState()

import { normalizeAuthResponse } from '@/types/auth.types'

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await authApi.login(credentials)
      console.log('Login API response:', response.data)

      // Clear any existing tokens first
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')

      const normalizedResponse = normalizeAuthResponse(response.data)

      // Store new tokens
      localStorage.setItem('token', normalizedResponse.token)
      if (normalizedResponse.refreshToken) {
        localStorage.setItem('refreshToken', normalizedResponse.refreshToken)
      }

      console.log('New token stored for user:', normalizedResponse.user.email, 'Role:', normalizedResponse.user.role)

      return normalizedResponse
    } catch (error) {
      console.error('Login API error:', error)
      const apiError = error as ApiError
      return rejectWithValue(apiError.message || 'Login failed')
    }
  }
)

export const logout = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    // Clear localStorage first
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')

    // Try to call logout API
    await authApi.logout().catch(err => {
      console.error('Logout API error (non-critical):', err)
    })

    return true
  } catch (error) {
    console.error('Logout error:', error)
    return true
  }
})

export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { rejectWithValue, getState }) => {
    try {
      const refreshToken = localStorage.getItem('refreshToken')
      if (!refreshToken) {
        throw new Error('No refresh token')
      }

      const response = await authApi.refreshToken(refreshToken)

      const responseData = response.data
      const token = responseData.token || responseData.Token
      const newRefreshToken = responseData.refreshToken || responseData.RefreshToken

      if (!token) {
        throw new Error('No token in refresh response')
      }

      // Update tokens in localStorage
      localStorage.setItem('token', token)
      if (newRefreshToken) {
        localStorage.setItem('refreshToken', newRefreshToken)
      }

      console.log('Token refreshed successfully')

      return {
        token,
        refreshToken: newRefreshToken,
        user: responseData.user || responseData.User,
        permissions: responseData.permissions || responseData.Permissions || [],
      }
    } catch (error) {
      // Clear tokens on refresh failure
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')

      const apiError = error as ApiError
      return rejectWithValue(apiError.message || 'Session expired')
    }
  }
)

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authApi.getCurrentUser()
      return response.data
    } catch (error) {
      const apiError = error as ApiError
      return rejectWithValue(apiError.message || 'Failed to get user')
    }
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload
      state.isAuthenticated = true
    },
    clearError: (state) => {
      state.error = null
    },
    updatePermissions: (state, action: PayloadAction<string[]>) => {
      state.permissions = action.payload
    },
    resetAuth: (state) => {
      state.user = null
      state.token = null
      state.refreshToken = null
      state.isAuthenticated = false
      state.permissions = []
      state.error = null
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false
        state.isAuthenticated = true
        state.token = action.payload.token
        state.refreshToken = action.payload.refreshToken || null
        state.user = action.payload.user
        state.permissions = action.payload.permissions || []

        console.log('Auth state updated - User:', state.user?.email, 'Role:', state.user?.role)
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

      // Logout
      .addCase(logout.pending, (state) => {
        state.isLoading = true
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null
        state.token = null
        state.refreshToken = null
        state.isAuthenticated = false
        state.permissions = []
        state.isLoading = false
      })
      .addCase(logout.rejected, (state) => {
        state.user = null
        state.token = null
        state.refreshToken = null
        state.isAuthenticated = false
        state.permissions = []
        state.isLoading = false
      })

      // Refresh Token
      .addCase(refreshToken.pending, (state) => {
        state.isLoading = true
      })
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.isLoading = false
        state.token = action.payload.token
        state.refreshToken = action.payload.refreshToken || null
        state.isAuthenticated = true
        if (action.payload.user) {
          state.user = action.payload.user
          console.log('Token refreshed - User:', state.user.email, 'Role:', state.user.role)
        }
      })
      .addCase(refreshToken.rejected, (state, action) => {
        state.isLoading = false
        state.user = null
        state.token = null
        state.refreshToken = null
        state.isAuthenticated = false
        state.permissions = []
        state.error = action.payload as string
      })

      // Get Current User
      .addCase(getCurrentUser.pending, (state) => {
        state.isLoading = true
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload
        state.isAuthenticated = true
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  },
})

export const { setUser, clearError, updatePermissions, resetAuth } = authSlice.actions
export default authSlice.reducer