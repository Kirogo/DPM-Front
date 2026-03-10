// src/services/api/checklistsApi.ts
import { baseApi } from './baseApi'
import { Checklist, CreateChecklistDto, UpdateChecklistDto, LockReportDto, UnlockReportDto } from '@/types/checklist.types'

interface UploadChecklistPhotoResponse {
  message: string
  url: string
  fileName: string
  section?: string
  slot?: number
}

interface UploadChecklistDocumentResponse {
  message: string
  url: string
  fileName: string
  documentType: string
}

interface LockStatusResponse {
  isLocked: boolean
  lockedBy?: {
    id: string
    name: string
    email?: string
  }
  lockedAt?: string
}

export const checklistsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all reports (this already returns ALL reports regardless of RM)
    getAllRmChecklists: builder.query<Checklist[], void>({
      query: () => 'rmChecklist',
      providesTags: ['Checklist'],
    }),
    
    getChecklistById: builder.query<Checklist, string>({
      query: (id) => {
        console.log('Fetching checklist with ID:', id)
        return {
          url: `rmChecklist/${id}`,
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        }
      },
      transformResponse: (response: any) => {
        console.log('Checklist API response:', response)
        return response
      },
      transformErrorResponse: (error: any) => {
        console.error('Checklist API error:', error)
        return error
      },
      providesTags: (result, error, id) => [{ type: 'Checklist', id }],
    }),
    
    createRmChecklist: builder.mutation<{ message: string; checklist: Checklist }, CreateChecklistDto>({
      query: (payload) => ({
        url: 'rmChecklist',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: ['Checklist'],
    }),
    
    updateRmChecklist: builder.mutation<{ message: string; checklist: Checklist }, { id: string; payload: UpdateChecklistDto }>({
      query: ({ id, payload }) => ({
        url: `rmChecklist/${id}`,
        method: 'PUT',
        body: payload,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Checklist', id }],
    }),
    
    // DELETE a report - ADD THIS MUTATION
    deleteRmChecklist: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `rmChecklist/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Checklist'],
    }),
    
    // Lock a report
    lockReport: builder.mutation<{ message: string; lockInfo: LockStatusResponse }, LockReportDto>({
      query: (payload) => ({
        url: `rmChecklist/${payload.reportId}/lock`,
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: (result, error, { reportId }) => [{ type: 'Checklist', id: reportId }],
    }),
    
    // Unlock a report
    unlockReport: builder.mutation<{ message: string }, UnlockReportDto>({
      query: (payload) => ({
        url: `rmChecklist/${payload.reportId}/unlock`,
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: (result, error, { reportId }) => [{ type: 'Checklist', id: reportId }],
    }),
    
    // Check lock status
    getLockStatus: builder.query<LockStatusResponse, string>({
      query: (reportId) => `rmChecklist/${reportId}/lock-status`,
      providesTags: (result, error, reportId) => [{ type: 'Checklist', id: reportId }],
    }),
    
    uploadRmChecklistPhoto: builder.mutation<
      UploadChecklistPhotoResponse,
      { file: File; section: string; slot: number }
    >({
      query: ({ file, section, slot }) => {
        const body = new FormData()
        body.append('file', file)
        body.append('section', section)
        body.append('slot', String(slot))

        return {
          url: 'rmChecklist/photos',
          method: 'POST',
          body,
        }
      },
    }),
    
    uploadRmChecklistDocument: builder.mutation<
      UploadChecklistDocumentResponse,
      { file: File; documentType: string }
    >({
      query: ({ file, documentType }) => {
        const body = new FormData()
        body.append('file', file)
        body.append('documentType', documentType)

        return {
          url: 'rmChecklist/documents',
          method: 'POST',
          body,
        }
      },
    }),
  }),
  overrideExisting: true,
})

export const {
  useGetAllRmChecklistsQuery,
  useGetChecklistByIdQuery,
  useCreateRmChecklistMutation,
  useUpdateRmChecklistMutation,
  useDeleteRmChecklistMutation, // EXPORT THIS
  useLockReportMutation,
  useUnlockReportMutation,
  useGetLockStatusQuery,
  useUploadRmChecklistPhotoMutation,
  useUploadRmChecklistDocumentMutation,
} = checklistsApi