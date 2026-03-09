import axiosInstance from './axiosConfig'
import { Attachment } from '@/types/attachment.types'

export const attachmentsApi = {
    // Upload attachment
    upload: async (file: File, reportId?: string) => {
        const formData = new FormData()
        formData.append('file', file)
        if (reportId) formData.append('reportId', reportId)

        const response = await axiosInstance.post<Attachment>('/attachments', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        })
        return response
    },

    // Delete attachment
    delete: async (id: string) => {
        await axiosInstance.delete(`/attachments/${id}`)
    },

    // Get attachment details
    getDetails: async (id: string) => {
        const response = await axiosInstance.get<Attachment>(`/attachments/${id}`)
        return response
    },

    // Download attachment
    download: async (id: string) => {
        window.open(`${import.meta.env.VITE_API_URL}/attachments/${id}/download`, '_blank')
    }
}
