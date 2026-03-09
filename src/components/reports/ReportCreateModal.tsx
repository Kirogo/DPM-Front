import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Modal } from '@/components/common/Modal/Modal'
import { ReportForm } from './ReportForm'
import { useReports } from '@/hooks/useReports'
import { useAuth } from '@/hooks/useAuth'
import { useAppSelector, useAppDispatch } from '@/store/hooks'
import { closeModal } from '@/store/slices/uiSlice'
import { CreateReportDto } from '@/types/report.types'
import toast from 'react-hot-toast'

export const ReportCreateModal: React.FC = () => {
    const navigate = useNavigate()
    const dispatch = useAppDispatch()
    const isOpen = useAppSelector((state) => state.ui.modalState['start-new-report'])
    const { saveReport, uploadPhotos } = useReports()
    const { user } = useAuth()

    const handleClose = () => {
        dispatch(closeModal('start-new-report'))
    }

    const handleSubmit = async (data: CreateReportDto, photos: File[], isDraft?: boolean) => {
        try {
            const reportData = {
                ...data,
                title: data.title || `Report - ${data.ibpsNo || 'New'}`,
                visitDate: data.visitDate || new Date(),
                siteAddress: data.siteAddress || 'Site Location',
                rmId: user?.id,
                status: isDraft ? 'Draft' : 'PendingQsReview',
                workProgress: [],
                issues: []
            }
            const report = await saveReport(reportData as any)

            if (photos.length > 0 && report.id) {
                const geotaggedPhotos = await Promise.all(
                    photos.map(async (file) => {
                        return {
                            id: Math.random().toString(),
                            file,
                            url: URL.createObjectURL(file),
                            geotag: {
                                latitude: 0,
                                longitude: 0,
                                timestamp: new Date(),
                            },
                            uploadedAt: new Date(),
                        }
                    })
                )
                await uploadPhotos(report.id, geotaggedPhotos)
            }

            toast.success('Report created successfully!')
            handleClose()
            navigate(`/rm/reports/${report.id}`)
        } catch (error) {
                        console.error('Modal create report error:', error)
                        const msg = (error as any)?.message || 'Failed to create report'
                        toast.error(msg)
        }
    }

    return (
        <Modal
            isOpen={!!isOpen}
            onClose={handleClose}
            title="Create Site Visit Report"
            size="xl"
            showCloseButton={true}
        >
            <div className="py-2">
                <ReportForm
                    onSubmit={handleSubmit}
                />
            </div>
        </Modal>
    )
}
