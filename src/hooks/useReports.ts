import { useCallback, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  fetchReports,
  fetchMyReports,
  fetchReportById,
  createReport,
  updateReport,
  submitReport,
  uploadPhoto,
  setFilters,
  clearFilters,
  setCurrentPage,
  addToUploadQueue,
  removeFromUploadQueue,
  clearUploadQueue,
} from '@/store/slices/reportSlice'
import { CreateReportDto, UpdateReportDto, ReportFilter } from '@/types/report.types'
import { GeotaggedPhoto } from '@/types/geotag.types'
import { reportsApi } from '@/services/api/reportsApi'
import toast from 'react-hot-toast'

export const useReports = () => {
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.auth)
  const {
    reports,
    currentReport,
    filters,
    isLoading,
    error,
    totalCount,
    currentPage,
    pageSize,
    uploadQueue,
    uploadProgress,
  } = useAppSelector((state) => state.reports)

  // Load reports on mount and when filters/page change
  useEffect(() => {
    if (user?.role?.toLowerCase() === 'rm') {
      dispatch(fetchMyReports({ page: currentPage, pageSize, filters }))
    } else {
      dispatch(fetchReports({ page: currentPage, pageSize, filters }))
    }
  }, [dispatch, currentPage, pageSize, filters, user?.role])

  const loadReport = useCallback(
    async (id: string) => {
      try {
        await dispatch(fetchReportById(id)).unwrap()
      } catch (error) {
        toast.error('Failed to load report')
        throw error
      }
    },
    [dispatch]
  )

  const saveReport = useCallback(
    async (data: CreateReportDto | UpdateReportDto) => {
      try {
        if ('id' in data) {
          const result = await dispatch(updateReport(data as UpdateReportDto)).unwrap()
          toast.success('Report updated successfully')
          return result
        } else {
          const result = await dispatch(createReport(data as CreateReportDto)).unwrap()
          toast.success('Report created successfully')
          return result
        }
      } catch (error) {
        console.error('Save report error:', error)
        const msg = (error as any)?.message || 'Failed to save report'
        toast.error(msg)
        throw error
      }
    },
    [dispatch]
  )

  const handleSubmitReport = useCallback(
    async (reportId: string, notes?: string) => {
      try {
        await dispatch(submitReport({ reportId, notes })).unwrap()
        toast.success('Report submitted for review')
      } catch (error) {
        toast.error('Failed to submit report')
        throw error
      }
    },
    [dispatch]
  )

  const handleUploadPhotos = useCallback(
    async (reportId: string, photos: GeotaggedPhoto[]) => {
      // Add photos to queue
      photos.forEach(photo => {
        dispatch(addToUploadQueue(photo))
      })

      // Upload each photo
      for (const photo of photos) {
        try {
          await dispatch(
            uploadPhoto({
              reportId,
              photo,
              onProgress: (progress) => {
                // Update progress in store
                console.log(`Upload progress for ${photo.id}: ${progress}%`)
              },
            })
          ).unwrap()

          // Remove from queue on success
          dispatch(removeFromUploadQueue(photo.id))
        } catch (error) {
          toast.error(`Failed to upload ${photo.file.name}`)
        }
      }

      toast.success('Photos uploaded successfully')
    },
    [dispatch]
  )

  const handleDeleteReport = useCallback(
    async (reportId: string) => {
      try {
        await reportsApi.deleteReport(reportId)
        // Refresh the list
        dispatch(fetchReports({ page: currentPage, pageSize, filters }))
        toast.success('Report deleted successfully')
      } catch (error) {
        toast.error('Failed to delete report')
        throw error
      }
    },
    [dispatch, currentPage, pageSize, filters]
  )

  const handleDecision = useCallback(
    async (reportId: string, decision: any) => {
      try {
        await reportsApi.makeDecision(reportId, decision)
        await dispatch(fetchReportById(reportId)).unwrap()
        toast.success('Decision recorded successfully')
      } catch (error) {
        toast.error('Failed to record decision')
        throw error
      }
    },
    [dispatch]
  )

  const applyFilters = useCallback(
    (newFilters: ReportFilter) => {
      dispatch(setFilters(newFilters))
      dispatch(setCurrentPage(1)) // Reset to first page when filters change
    },
    [dispatch]
  )

  const resetFilters = useCallback(() => {
    dispatch(clearFilters())
    dispatch(setCurrentPage(1))
  }, [dispatch])

  const changePage = useCallback(
    (page: number) => {
      dispatch(setCurrentPage(page))
    },
    [dispatch]
  )

  return {
    // State
    reports,
    currentReport,
    filters,
    isLoading,
    error,
    totalCount,
    currentPage,
    pageSize,
    uploadQueue,
    uploadProgress,

    // Actions
    loadReport,
    saveReport,
    submitReport: handleSubmitReport,
    uploadPhotos: handleUploadPhotos,
    deleteReport: handleDeleteReport,
    makeDecision: handleDecision,
    applyFilters,
    resetFilters,
    changePage,
    clearUploadQueue: () => dispatch(clearUploadQueue()),
  }
}