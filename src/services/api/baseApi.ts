// src/services/api/baseApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { RootState } from '@/store/store'
import { API_CONFIG } from '@/config/api.config'

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: API_CONFIG.BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token
      
      // Add authorization header if token exists
      if (token) {
        headers.set('authorization', `Bearer ${token}`)
      }
      
      // Add content type for JSON requests
      headers.set('Content-Type', 'application/json')
      
      return headers
    },
  }),
  tagTypes: ['Checklist', 'Report', 'User', 'Client', 'Notification'],
  endpoints: () => ({}),
})