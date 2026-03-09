import { CreateReportDto } from '@/types/report.types'

export const validateReport = (data: Partial<CreateReportDto>) => {
    const errors: Record<string, string> = {}

    if (!data.title?.trim()) {
        errors.title = 'Report title is required'
    }

    if (!data.clientId) {
        errors.clientId = 'Client is required'
    }

    if (!data.visitDate) {
        errors.visitDate = 'Visit date is required'
    }

    if (!data.siteAddress?.trim()) {
        errors.siteAddress = 'Site address is required'
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors,
    }
}
