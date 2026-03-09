// src/services/api/clientsApi.ts
import axiosInstance from './axiosConfig'
import { baseApi } from './baseApi'
import { Client, CreateClientDto, UpdateClientDto } from '@/types/client.types'
import { PaginatedResponse } from '@/types/common.types'

export const clientsApiSlice = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getClients: builder.query<PaginatedResponse<Client>, { search?: string; page?: number; pageSize?: number } | void>({
      query: (params) => ({
        url: 'clients',
        params,
      }),
      providesTags: ['Client'],
    }),
    getClientById: builder.query<Client, string>({
      query: (id) => `clients/${id}`,
      providesTags: ['Client'],
    }),
    getClientByCustomerNumber: builder.query<Client, string>({
      query: (customerNumber) => `clients/customer/${encodeURIComponent(customerNumber)}`,
      providesTags: (result, error, customerNumber) => [{ type: 'Client', id: customerNumber }],
    }),
    searchClients: builder.query<Client[], string>({
      query: (q) => ({
        url: 'clients/search',
        params: { q },
      }),
      providesTags: ['Client'],
    }),
    createClient: builder.mutation<Client, CreateClientDto>({
      query: (payload) => ({
        url: 'clients',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['Client'],
    }),
    updateClient: builder.mutation<Client, { id: string; payload: UpdateClientDto }>({
      query: ({ id, payload }) => ({
        url: `clients/${id}`,
        method: 'PUT',
        body: payload,
      }),
      invalidatesTags: ['Client'],
    }),
    deleteClient: builder.mutation<void, string>({
      query: (id) => ({
        url: `clients/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Client'],
    }),
  }),
  overrideExisting: true,
})

// Export all hooks
export const {
  useGetClientsQuery,
  useGetClientByIdQuery,
  useGetClientByCustomerNumberQuery, // This is correct
  useSearchClientsQuery,
  useCreateClientMutation,
  useUpdateClientMutation,
  useDeleteClientMutation,
} = clientsApiSlice

// Regular axios-based API for non-RTK Query usage
export const clientsApi = {
  // Get all clients
  getClients: async (params?: any) => {
    const response = await axiosInstance.get<PaginatedResponse<Client>>('/clients', { params })
    return response
  },

  // Get client by ID
  getClientById: async (id: string) => {
    const response = await axiosInstance.get<Client>(`/clients/${id}`)
    return response
  },

  // Get client by customer number (for autopopulate)
  getClientByCustomerNumber: async (customerNumber: string) => {
    const response = await axiosInstance.get<Client>(`/clients/customer/${encodeURIComponent(customerNumber)}`)
    return response
  },

  // Search clients
  searchClients: async (query: string) => {
    const response = await axiosInstance.get<Client[]>('/clients/search', {
      params: { q: query },
    })
    return response
  },

  // Create new client
  createClient: async (data: CreateClientDto) => {
    const response = await axiosInstance.post<Client>('/clients', data)
    return response
  },

  // Update client
  updateClient: async (id: string, data: UpdateClientDto) => {
    const response = await axiosInstance.put<Client>(`/clients/${id}`, data)
    return response
  },

  // Delete client
  deleteClient: async (id: string) => {
    const response = await axiosInstance.delete(`/clients/${id}`)
    return response
  },

  // Get client projects
  getClientProjects: async (clientId: string) => {
    const response = await axiosInstance.get(`/clients/${clientId}/projects`)
    return response
  },

  // Get client reports
  getClientReports: async (clientId: string, page = 1, pageSize = 10) => {
    const response = await axiosInstance.get(`/clients/${clientId}/reports`, {
      params: { page, pageSize },
    })
    return response
  },
}