// src/services/api/qsApi.ts
import axiosInstance from './axiosConfig'
import { SiteVisitReport, ReviewDecision } from '@/types/report.types'
import { PaginatedResponse } from '@/types/common.types'

export const qsApi = {
  // Get QS dashboard stats
  getDashboardStats: async () => {
    const response = await axiosInstance.get('/qs/dashboard/stats')
    return response
  },

  // Get pending reviews
  getPendingReviews: async (page = 1, pageSize = 10) => {
    const response = await axiosInstance.get<PaginatedResponse<SiteVisitReport>>(
      '/qs/reviews/pending',
      { params: { page, pageSize } }
    )
    return response
  },

  // Get my active reviews - COMMENT OUT if backend doesn't have it
  // getMyActiveReviews: async () => {
  //   const response = await axiosInstance.get<SiteVisitReport[]>('/qs/reviews/my-active')
  //   return response
  // },

  // Get reviews in progress (rework status)
  getInProgressReviews: async (page = 1, pageSize = 10) => {
    try {
      const response = await axiosInstance.get<PaginatedResponse<SiteVisitReport>>(
        '/qs/reviews/in-progress',
        { params: { page, pageSize } }
      )
      return response
    } catch (error) {
      console.log('In-progress endpoint not available yet, using fallback')
      // Return empty paginated response
      return Promise.resolve({
        data: {
          items: [],
          total: 0,
          page: page,
          pageSize: pageSize,
          totalPages: 0
        }
      })
    }
  },

  // Get completed reviews (approved status)
  getCompletedReviews: async (page = 1, pageSize = 10) => {
    try {
      const response = await axiosInstance.get<PaginatedResponse<SiteVisitReport>>(
        '/qs/reviews/completed',
        { params: { page, pageSize } }
      )
      return response
    } catch (error) {
      console.log('Completed endpoint not available yet, using fallback')
      // Return empty paginated response
      return Promise.resolve({
        data: {
          items: [],
          total: 0,
          page: page,
          pageSize: pageSize,
          totalPages: 0
        }
      })
    }
  },

  // Get scheduled site visits
  getScheduledVisits: async (date?: Date) => {
    try {
      const response = await axiosInstance.get('/qs/site-visits/upcoming', {
        params: { date },
      })
      return response
    } catch (error) {
      console.log('Scheduled visits endpoint not available yet')
      // Return empty array
      return Promise.resolve({
        data: []
      })
    }
  },

  // Review report
  reviewReport: async (reportId: string, decision: Partial<ReviewDecision>) => {
    const response = await axiosInstance.post(`/qs/reviews/${reportId}/review`, decision)
    return response
  },

  // Assign report to self
  assignReport: async (reportId: string) => {
    const response = await axiosInstance.post(`/qs/reviews/${reportId}/assign`)
    return response
  },

  // Get review history
  getReviewHistory: async (page = 1, pageSize = 10) => {
    try {
      const response = await axiosInstance.get('/qs/reviews/history', {
        params: { page, pageSize },
      })
      return response
    } catch (error) {
      console.log('Review history endpoint not available yet')
      return Promise.resolve({
        data: []
      })
    }
  },

  // Add comment to review
  addReviewComment: async (reportId: string, comment: string, isInternal = true) => {
    const response = await axiosInstance.post(`/qs/reviews/${reportId}/comments`, {
      comment,
      isInternal,
    })
    return response
  },

  // Request revision (rework)
  requestRevision: async (reportId: string, notes: string, requiredChanges: string[]) => {
    const response = await axiosInstance.post(`/qs/reviews/${reportId}/revision`, {
      notes,
      requiredChanges,
    })
    return response
  },

  // Approve report
  approveReport: async (reportId: string, notes?: string) => {
    const response = await axiosInstance.post(`/qs/reviews/${reportId}/approve`, { notes })
    return response
  },

  // Reject report
  rejectReport: async (reportId: string, reason: string) => {
    const response = await axiosInstance.post(`/qs/reviews/${reportId}/reject`, { reason })
    return response
  },

  // Get report details with comments
  getReportDetails: async (reportId: string) => {
    const response = await axiosInstance.get(`/qs/reviews/${reportId}`)
    return response
  },

  // Get report audit trail
  getReportAuditTrail: async (reportId: string) => {
    try {
      const response = await axiosInstance.get(`/qs/reviews/${reportId}/audit`)
      return response
    } catch (error) {
      console.log('Audit trail endpoint not available yet')
      return Promise.resolve({
        data: []
      })
    }
  }
}