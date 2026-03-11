// src/services/api/axiosConfig.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { store } from '@/store/store'
import { refreshToken, logout } from '@/store/slices/authSlice'
import { ApiError } from '@/types/common.types'

// Use relative path for dev environment (proxied through Vite), absolute URL for production
const API_URL = import.meta.env.PROD ? import.meta.env.VITE_API_URL : '/api'

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
  withCredentials: true,
  // Add transformResponse to ensure dates are handled consistently
  transformResponse: [(data) => {
    if (!data) return data;
    try {
      return JSON.parse(data, (key, value) => {
        // Check if the value looks like a date string (ISO format)
        // This pattern matches: 2024-03-11T12:47:00.000Z or 2024-03-11T12:47:00
        if (typeof value === 'string' && 
            /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/.test(value)) {
          return value; // Keep as string, let dateUtils handle conversion
        }
        return value;
      });
    } catch (error) {
      return data;
    }
  }],
})

let isRefreshing = false
let failedQueue: any[] = []

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

// Helper to check if token is expired
const isTokenExpired = (token: string): boolean => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    
    const { exp } = JSON.parse(jsonPayload);
    if (!exp) return false;
    
    // Add 30 second buffer to prevent edge cases
    return (exp * 1000) - 30000 < Date.now();
  } catch (error) {
    console.error('Failed to decode token:', error);
    return true;
  }
};

// Request interceptor
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = store.getState().auth.token
    if (token) {
      // Check if token is expired before adding to request
      if (isTokenExpired(token)) {
        console.warn('Token expired before request, attempting refresh...');
        // Don't block the request, let the response interceptor handle it
      }
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }
    
    // Handle 401 Unauthorized errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return axiosInstance(originalRequest)
          })
          .catch(err => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const result = await store.dispatch(refreshToken()).unwrap()
        const token = result.token
        
        processQueue(null, token)
        originalRequest.headers.Authorization = `Bearer ${token}`
        
        return axiosInstance(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        store.dispatch(logout())
        
        // Only redirect to login if not already there
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login'
        }
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }
    
    // Log full response body for debugging validation errors
    try {
      console.error('API response error:', originalRequest?.url, error.response?.status)
      console.error('API response error body:', JSON.stringify(error.response?.data))
    } catch (e) {
      console.error('API response error (stringify failed):', error.response?.data)
    }

    const apiError: ApiError = {
      message: error.response?.data?.message || error.message || 'An error occurred',
      statusCode: error.response?.status || 500,
      errors: error.response?.data?.errors || error.response?.data,
    }

    return Promise.reject(apiError)
  }
)

export default axiosInstance