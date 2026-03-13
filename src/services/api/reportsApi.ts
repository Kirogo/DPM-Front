// src/services/api/reportsApi.ts (update the getComments method)
import axiosInstance from './axiosConfig'
import {
  SiteVisitReport,
  CreateReportDto,
  UpdateReportDto,
  SubmitReportDto,
  ReviewDecision,
  Comment
} from '@/types/report.types'
import { GeotaggedPhoto } from '@/types/geotag.types'
import { PaginatedResponse } from '@/types/common.types'
import { qsApi } from './qsApi'

export const reportsApi = {
  // Helper: normalize various status string formats to backend enum names
  _mapStatusToServer: (status?: string) => {
    if (!status) return status
    const s = status.toString().toLowerCase()
    switch (s) {
      case 'draft':
        return 'draft'
      case 'pending':
      case 'pending_qs_review':
      case 'pendingqsreview':
      case 'pendingqs_review':
      case 'pending_qsreview':
        return 'pending_qs_review'
      case 'under_review':
      case 'underreview':
        return 'under_review'
      case 'revision_requested':
      case 'revisionrequested':
        return 'revision_requested'
      case 'site_visit_scheduled':
      case 'sitevisitscheduled':
        return 'site_visit_scheduled'
      case 'approved':
        return 'approved'
      case 'rejected':
        return 'rejected'
      case 'archived':
        return 'archived'
      case 'submitted':
        return 'submitted'
      default:
        return status
    }
  },

  // Get all reports with pagination and filters
  getReports: async (params: any) => {
    try {
      const response = await axiosInstance.get('/rmChecklist', { params })
      return {
        data: {
          items: response.data || [],
          total: response.data?.length || 0,
          page: params?.page || 1,
          pageSize: params?.pageSize || 10,
          totalPages: Math.ceil((response.data?.length || 0) / (params?.pageSize || 10))
        }
      }
    } catch (error) {
      console.error('Error fetching reports:', error)
      throw error
    }
  },

  // Get single report by ID
  getReportById: async (id: string) => {
    try {
      const response = await axiosInstance.get(`/rmChecklist/${id}`)
      return response
    } catch (error) {
      console.error(`Error fetching report ${id}:`, error)
      throw error
    }
  },

  // Create new report
  createReport: async (data: CreateReportDto) => {
    try {
      const { photos, attachments, ...reportData } = data
      
      if (reportData.status) {
        reportData.status = reportsApi._mapStatusToServer(reportData.status)
      }
      
      const response = await axiosInstance.post('/rmChecklist', reportData)
      return response
    } catch (error) {
      console.error('Error creating report:', error)
      throw error
    }
  },

  // Update report
  updateReport: async (id: string, data: UpdateReportDto) => {
    try {
      const payload = { ...data }
      if (payload.status) {
        payload.status = reportsApi._mapStatusToServer(payload.status)
      }
      const response = await axiosInstance.put(`/rmChecklist/${id}`, payload)
      return response
    } catch (error) {
      console.error(`Error updating report ${id}:`, error)
      throw error
    }
  },

  // Delete report
  deleteReport: async (id: string) => {
    console.warn('Delete report not implemented in backend')
    throw new Error('Delete not implemented')
  },

  // Submit report for review
  submitReport: async (id: string, data: SubmitReportDto) => {
    try {
      const response = await axiosInstance.post(`/rmChecklist/${id}/submit`, data)
      return response
    } catch (error) {
      console.error(`Error submitting report ${id}:`, error)
      throw error
    }
  },

  // Upload photo to report
  uploadPhoto: async (reportId: string, photo: GeotaggedPhoto, onProgress?: (progress: number) => void) => {
    try {
      const formData = new FormData()
      formData.append('file', photo.file)
      formData.append('section', photo.metadata?.section || 'general')
      formData.append('slot', String(photo.metadata?.slot || 0))

      const response = await axiosInstance.post('/rmChecklist/photos', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            onProgress(percentCompleted)
          }
        },
      })
      return response
    } catch (error) {
      console.error('Error uploading photo:', error)
      throw error
    }
  },

  // Delete photo from report
  deletePhoto: async (reportId: string, photoId: string) => {
    console.warn('Delete photo not implemented in backend')
    throw new Error('Delete photo not implemented')
  },

  // Add comment to report - UPDATED to use qsApi
  addComment: async (reportId: string, comment: Partial<Comment>) => {
    try {
      const response = await qsApi.addReviewComment(
        reportId, 
        comment.text || comment.content || '', 
        comment.isInternal || false
      )
      return response
    } catch (error) {
      console.error('Error adding comment:', error)
      throw error
    }
  },

  // Get report comments - UPDATED to use qsApi
  getComments: async (reportId: string): Promise<{ data: Comment[] }> => {
    try {
      const response = await qsApi.getReportComments(reportId)
      return response
    } catch (error) {
      console.error('Error fetching comments:', error)
      return { data: [] }
    }
  },

  // Make decision on report (QS only)
  makeDecision: async (reportId: string, decision: Partial<ReviewDecision>) => {
    try {
      if (decision.action === 'approve') {
        return await qsApi.approveReport(reportId, decision.notes)
      } else if (decision.action === 'revision') {
        return await qsApi.requestRevision(reportId, decision.notes || '', decision.requiredChanges || [])
      } else if (decision.action === 'reject') {
        return await qsApi.rejectReport(reportId, decision.notes || '')
      }
      throw new Error('Invalid decision action')
    } catch (error) {
      console.error('Error making decision:', error)
      throw error
    }
  },

  // Get report history/audit trail
  getReportHistory: async (reportId: string) => {
    try {
      return await qsApi.getReportAuditTrail(reportId)
    } catch (error) {
      console.error('Error fetching history:', error)
      return { data: [] }
    }
  },

  // Export report as PDF
  exportReportPDF: async (reportId: string) => {
    console.warn('PDF export not implemented')
    throw new Error('PDF export not implemented')
  },

  // Get reports by status
  getReportsByStatus: async (status: string, page = 1, pageSize = 10) => {
    try {
      const response = await axiosInstance.get('/rmChecklist')
      const filtered = (response.data || []).filter((r: any) => 
        r.status?.toLowerCase() === status.toLowerCase()
      )
      
      return {
        data: {
          items: filtered,
          total: filtered.length,
          page,
          pageSize,
          totalPages: Math.ceil(filtered.length / pageSize)
        }
      }
    } catch (error) {
      console.error('Error fetching reports by status:', error)
      throw error
    }
  },

  // Get reports assigned to current user
  getMyReports: async (page = 1, pageSize = 10, filters = {}) => {
    try {
      const response = await axiosInstance.get('/rmChecklist')
      return {
        data: {
          items: response.data || [],
          total: response.data?.length || 0,
          page,
          pageSize,
          totalPages: Math.ceil((response.data?.length || 0) / pageSize)
        }
      }
    } catch (error) {
      console.error('Error fetching my reports:', error)
      throw error
    }
  },

  // Get reports pending review (for QS)
  getPendingReviews: async (page = 1, pageSize = 10) => {
    try {
      return await qsApi.getPendingReviews(page, pageSize)
    } catch (error) {
      console.error('Error fetching pending reviews:', error)
      return { data: { items: [], total: 0, page, pageSize, totalPages: 0 } }
    }
  },

  // Schedule site visit (QS)
  scheduleSiteVisit: async (reportId: string, scheduledDate: Date, notes?: string) => {
    console.warn('Site visit scheduling not implemented')
    throw new Error('Site visit scheduling not implemented')
  },

  // Get my pending reports
  getMyPendingReports: async () => {
    try {
      const response = await axiosInstance.get('/rmChecklist')
      const pending = (response.data || []).filter((r: any) => 
        r.status === 'pending' || r.status === 'draft'
      )
      return { data: pending }
    } catch (error) {
      console.error('Error fetching my pending reports:', error)
      throw error
    }
  },
}