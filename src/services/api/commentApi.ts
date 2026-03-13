// src/services/api/commentApi.ts
import axiosInstance from './axiosConfig'
import { Comment } from '@/types/report.types'

export const commentApi = {
  // Get comments for a report - With correct field mapping
  getComments: async (reportId: string): Promise<Comment[]> => {
    try {
      console.log(`Fetching comments for report: ${reportId}`);
      const response = await axiosInstance.get(`/Qs/reviews/${reportId}/comments`)
      
      console.log('Comments API response:', response.data);
      
      // Handle the response - your backend returns the array directly
      if (Array.isArray(response.data)) {
        // Log each comment to see the actual structure
        response.data.forEach((comment: any, index: number) => {
          console.log(`Raw comment ${index}:`, comment);
        });

        // Map backend fields to frontend Comment interface
        return response.data.map((comment: any) => ({
          id: comment.id || comment.Id,                    // Try both camelCase and PascalCase
          reportId: comment.reportId || comment.ReportId,
          content: comment.text || comment.Text,
          text: comment.text || comment.Text,
          createdBy: comment.userId || comment.UserId,
          createdAt: comment.createdAt || comment.CreatedAt,
          userId: comment.userId || comment.UserId,
          userName: comment.userName || comment.UserName,
          userRole: comment.userRole || comment.UserRole,
          isInternal: comment.isInternal || comment.IsInternal || false
        }))
      }
      
      return []
    } catch (error) {
      console.log('Error fetching comments:', error)
      return []
    }
  },

  // Add a comment to a report
  addComment: async (
    reportId: string, 
    data: { 
      content: string; 
      isInternal?: boolean 
    }
  ): Promise<Comment | null> => {
    try {
      console.log(`Adding comment to report ${reportId}:`, data.content);
      
      const response = await axiosInstance.post(`/Qs/reviews/${reportId}/comments`, {
        comment: data.content,
        isInternal: data.isInternal || false
      })
      
      console.log('Add comment response:', response.data);
      
      const comment = response.data
      return {
        id: comment.id || comment.Id,
        reportId: comment.reportId || comment.ReportId,
        content: comment.text || comment.Text,
        text: comment.text || comment.Text,
        createdBy: comment.userId || comment.UserId,
        createdAt: comment.createdAt || comment.CreatedAt,
        userId: comment.userId || comment.UserId,
        userName: comment.userName || comment.UserName,
        userRole: comment.userRole || comment.UserRole,
        isInternal: comment.isInternal || comment.IsInternal || false
      }
    } catch (error) {
      console.error('Error adding comment:', error)
      return null
    }
  }
}