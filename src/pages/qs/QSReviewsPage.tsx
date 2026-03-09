// src/pages/qs/QSReviewsPage.tsx (full updated file)
import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { qsApi } from '@/services/api/qsApi'
import axiosInstance from '@/services/api/axiosConfig'
import { transformChecklistsToReports } from '@/utils/checklistTransform'
import { SiteVisitReport } from '@/types/report.types'
import { Button } from '@/components/common/Button'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import {
  FiSearch,
  FiRefreshCw,
  FiCalendar,
  FiChevronRight,
  FiUser,
  FiClock
} from 'react-icons/fi'
import toast from 'react-hot-toast'

type ReviewTab = 'pending' | 'progress' | 'completed'

// Status badge component
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const statusLower = status?.toLowerCase() || 'pending'

  const statusConfig: Record<string, { label: string; color: string; bgColor: string }> = {
    pending: { label: 'Pending', color: 'text-amber-700', bgColor: 'bg-amber-100' },
    submitted: { label: 'Pending', color: 'text-amber-700', bgColor: 'bg-amber-100' },
    pending_qs_review: { label: 'Pending', color: 'text-amber-700', bgColor: 'bg-amber-100' },
    pendingqsreview: { label: 'Pending', color: 'text-amber-700', bgColor: 'bg-amber-100' },
    under_review: { label: 'In Progress', color: 'text-blue-700', bgColor: 'bg-blue-100' },
    underreview: { label: 'In Progress', color: 'text-blue-700', bgColor: 'bg-blue-100' },
    inprogress: { label: 'In Progress', color: 'text-blue-700', bgColor: 'bg-blue-100' },
    rework: { label: 'Rework', color: 'text-orange-700', bgColor: 'bg-orange-100' },
    approved: { label: 'Completed', color: 'text-emerald-700', bgColor: 'bg-emerald-100' },
    completed: { label: 'Completed', color: 'text-emerald-700', bgColor: 'bg-emerald-100' },
  }

  const config = statusConfig[statusLower] || statusConfig.pending

  return (
    <span className={`${config.bgColor} ${config.color} px-2 py-1 rounded-full text-[8px] lg:text-[10px] font-medium whitespace-nowrap`}>
      {config.label}
    </span>
  )
}

// Format date
const formatDate = (dateString?: Date | string) => {
  if (!dateString) return '—'
  try {
    const date = new Date(dateString)
    const options: Intl.DateTimeFormatOptions = {
      timeZone: 'Africa/Nairobi',
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }
    return new Intl.DateTimeFormat('en-KE', options).format(date)
  } catch {
    return '—'
  }
}

export const QSReviewsPage: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const isMobile = useMediaQuery('(max-width: 768px)')

  const [activeTab, setActiveTab] = useState<ReviewTab>(() => {
    const path = location.pathname.split('/').pop()
    if (path === 'progress') return 'progress'
    if (path === 'completed') return 'completed'
    return 'pending'
  })

  const [reports, setReports] = useState<SiteVisitReport[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [stats, setStats] = useState({
    pending: 0,
    progress: 0,
    completed: 0
  })

  // Save current path before navigating to detail
  useEffect(() => {
    sessionStorage.setItem('qsReviewsReturnPath', location.pathname + location.search)
  }, [location])

  useEffect(() => {
    loadReviews()
    loadStats()
  }, [activeTab, page])


  const loadReviews = async () => {
    setIsLoading(true)
    try {
      let response
      switch (activeTab) {
        case 'pending':
          response = await qsApi.getPendingReviews(page, 10)
          break
        case 'progress':
          // This should fetch reports in 'rework' status
          response = await qsApi.getInProgressReviews(page, 10)
          break
        case 'completed':
          response = await qsApi.getCompletedReviews(page, 10)
          break
      }

      // Handle different response structures
      const items = response.data?.items || response.data || []
      setReports(items)
      setTotalPages(response.data?.totalPages || 1)
    } catch (error) {
      console.error('Failed to load reviews:', error)
      toast.error('Failed to load reviews from API')
      await loadReviewsFallback()
    } finally {
      setIsLoading(false)
    }
  }

  const loadReviewsFallback = async () => {
    try {
      console.log('Using fallback: fetching from /rmChecklist')
      const checklistResponse = await axiosInstance.get('/rmChecklist')
      const allReports = transformChecklistsToReports(checklistResponse.data || [])

      let filtered: SiteVisitReport[] = []
      switch (activeTab) {
        case 'pending':
          filtered = allReports.filter(r =>
            r.status === 'submitted' ||
            r.status === 'pending_qs_review' ||
            r.status === 'pendingqsreview'
          )
          break
        case 'progress':
          // Reports in rework status - they stay in QS's In Progress
          filtered = allReports.filter(r =>
            r.status === 'rework' &&
            r.assignedToQS === user?.id
          )
          break
        case 'completed':
          filtered = allReports.filter(r =>
            r.status === 'approved' ||
            r.status === 'completed'
          )
          break
      }

      setReports(filtered)
      setTotalPages(Math.ceil(filtered.length / 10))

      if (filtered.length > 0) {
        toast.success(`Loaded ${filtered.length} reports from fallback`)
      }
    } catch (fallbackError) {
      console.error('Fallback also failed:', fallbackError)
    }
  }

  const loadStats = async () => {
    try {
      const [pending, progress, completed] = await Promise.allSettled([
        qsApi.getPendingReviews(1, 1),
        qsApi.getInProgressReviews(1, 1),
        qsApi.getCompletedReviews(1, 1)
      ])

      setStats({
        pending: pending.status === 'fulfilled' ? pending.value.data?.total || 0 : 0,
        progress: progress.status === 'fulfilled' ? progress.value.data?.total || 0 : 0,
        completed: completed.status === 'fulfilled' ? completed.value.data?.total || 0 : 0
      })
    } catch (error) {
      console.error('Failed to load stats:', error)
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await loadReviews()
    await loadStats()
    setIsRefreshing(false)
    toast.success('Reviews refreshed')
  }

  const handleAssignToMe = async (reportId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await qsApi.assignReport(reportId)
      toast.success('Report assigned to you')
      loadReviews()
      navigate(`/qs/reviews/${reportId}`)
    } catch (error) {
      toast.error('Failed to assign report')
    }
  }

  const handleView = (reportId: string) => {
    navigate(`/qs/reviews/${reportId}`)
  }

  const filteredReports = reports.filter(report =>
    searchTerm === '' ||
    report.reportNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.projectName?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getTabLabel = (tab: ReviewTab) => {
    switch (tab) {
      case 'pending': return 'Pending'
      case 'progress': return 'In Progress (Rework)'
      case 'completed': return 'Completed'
    }
  }

  if (isLoading && reports.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-[#D6BD98]/20 rounded-lg w-1/3"></div>
            <div className="h-64 bg-[#D6BD98]/10 rounded-lg"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-[#D6BD98]/20 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold text-[#1A3636]">Review Reports</h1>
              <p className="text-xs lg:text-sm text-[#677D6A] mt-1">
                Manage and review submitted reports
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/qs/analytics')}
              className="h-8 text-xs w-full sm:w-auto"
            >
              View Analytics
            </Button>
          </div>

          {/* Tabs with Refresh Button */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex gap-4 lg:gap-6 overflow-x-auto scrollbar-hide border-b border-[#D6BD98]/20 flex-1">
              <button
                onClick={() => {
                  setActiveTab('pending')
                  setPage(1)
                  navigate('/qs/reviews/pending')
                }}
                className={`pb-2 text-xs lg:text-sm font-medium whitespace-nowrap ${activeTab === 'pending'
                    ? 'text-[#1A3636] border-b-2 border-[#1A3636]'
                    : 'text-[#677D6A] hover:text-[#40534C]'
                  }`}
              >
                Pending ({stats.pending})
              </button>
              <button
                onClick={() => {
                  setActiveTab('progress')
                  setPage(1)
                  navigate('/qs/reviews/progress')
                }}
                className={`pb-2 text-xs lg:text-sm font-medium whitespace-nowrap ${activeTab === 'progress'
                    ? 'text-[#1A3636] border-b-2 border-[#1A3636]'
                    : 'text-[#677D6A] hover:text-[#40534C]'
                  }`}
              >
                In Progress ({stats.progress})
              </button>
              <button
                onClick={() => {
                  setActiveTab('completed')
                  setPage(1)
                  navigate('/qs/reviews/completed')
                }}
                className={`pb-2 text-xs lg:text-sm font-medium whitespace-nowrap ${activeTab === 'completed'
                    ? 'text-[#1A3636] border-b-2 border-[#1A3636]'
                    : 'text-[#677D6A] hover:text-[#40534C]'
                  }`}
              >
                Completed ({stats.completed})
              </button>
            </div>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="ml-2 p-2 text-[#677D6A] hover:text-[#1A3636] hover:bg-[#D6BD98]/10 rounded-lg transition-all"
              title="Refresh reviews"
            >
              <FiRefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Search */}
          <div className="mt-4">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#677D6A] w-4 h-4" />
              <input
                type="text"
                placeholder={`Search ${getTabLabel(activeTab).toLowerCase()} reports...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-[#D6BD98]/30 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#677D6A]/20"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Reports Table */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
        {isMobile ? (
          /* Mobile view */
          <div className="border border-[#D6BD98]/20 rounded-lg overflow-hidden bg-white">
            <div className="grid grid-cols-3 gap-1 px-3 py-2 bg-[#F5F7F4] border-b border-[#D6BD98]/20 text-[9px] font-medium text-[#40534C] uppercase tracking-wider">
              <div className="col-span-1">Report</div>
              <div className="col-span-1">Customer</div>
              <div className="col-span-1 text-right">Status</div>
            </div>

            <div className="overflow-y-auto max-h-[calc(100vh-280px)] bg-white">
              {filteredReports.length === 0 ? (
                <div className="p-8 text-center">
                  <FiClock className="w-8 h-8 text-[#D6BD98] mx-auto mb-2" />
                  <p className="text-xs text-[#40534C]">No {getTabLabel(activeTab).toLowerCase()} reviews found</p>
                </div>
              ) : (
                filteredReports.map((report) => (
                  <div
                    key={report.id}
                    onClick={() => handleView(report.id)}
                    className="p-3 border-b border-[#D6BD98]/10 last:border-0 hover:bg-[#D6BD98]/5 transition-colors cursor-pointer active:bg-[#D6BD98]/10"
                  >
                    <div className="grid grid-cols-3 gap-1 text-[10px] items-center">
                      <div className="col-span-1 font-medium text-[#1A3636] truncate">
                        {report.reportNo || `CRN-${report.id?.slice(0, 6)}`}
                      </div>

                      <div className="col-span-1 text-[#40534C] truncate text-[9px]">
                        {report.customerName || report.projectName || '—'}
                      </div>

                      <div className="col-span-1 text-right">
                        <StatusBadge status={report.status || 'pending'} />
                      </div>
                    </div>

                    {activeTab === 'pending' && (
                      <div className="mt-2 flex justify-end">
                        <button
                          onClick={(e) => handleAssignToMe(report.id, e)}
                          className="px-2 py-1 text-[8px] font-medium text-[#1A3636] bg-[#D6BD98]/10 rounded hover:bg-[#D6BD98]/20"
                        >
                          Assign to me
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          /* Desktop view */
          <div className="border border-[#D6BD98]/20 rounded-lg overflow-hidden bg-white">
            <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-[#F5F7F4] border-b border-[#D6BD98]/20 text-xs font-medium text-[#40534C] uppercase tracking-wider">
              <div className="col-span-2">Report No.</div>
              <div className="col-span-3">Customer</div>
              <div className="col-span-2">Project</div>
              <div className="col-span-2">Submitted</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-1">Action</div>
            </div>

            <div className="divide-y divide-[#D6BD98]/10">
              {filteredReports.length === 0 ? (
                <div className="px-4 py-8 text-center text-[#677D6A]">
                  No {getTabLabel(activeTab).toLowerCase()} reviews found
                </div>
              ) : (
                filteredReports.map((report) => (
                  <div
                    key={report.id}
                    onClick={() => handleView(report.id)}
                    className="grid grid-cols-12 gap-2 px-4 py-3 hover:bg-[#D6BD98]/5 transition-colors cursor-pointer text-sm"
                  >
                    <div className="col-span-2 font-medium text-[#1A3636] truncate">
                      {report.reportNo || `CRN-${report.id?.slice(0, 8)}`}
                    </div>

                    <div className="col-span-3 text-[#40534C] truncate">
                      {report.customerName || report.clientName || '—'}
                    </div>

                    <div className="col-span-2 text-[#40534C] truncate">
                      {report.projectName || report.title || '—'}
                    </div>

                    <div className="col-span-2 text-[#677D6A] text-xs flex items-center gap-1">
                      <FiCalendar className="w-3 h-3" />
                      {formatDate(report.submittedAt || report.createdAt)}
                    </div>

                    <div className="col-span-2">
                      <StatusBadge status={report.status || 'pending'} />
                    </div>

                    <div className="col-span-1 flex items-center gap-1">
                      {activeTab === 'pending' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleAssignToMe(report.id, e)
                          }}
                          className="px-2 py-1 text-[9px] font-medium text-[#1A3636] bg-[#D6BD98]/10 rounded hover:bg-[#D6BD98]/20 transition-colors"
                        >
                          Assign
                        </button>
                      )}
                      {activeTab !== 'pending' && (
                        <FiChevronRight className="w-4 h-4 text-[#677D6A]" />
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 text-xs text-[#1A3636] bg-white border border-[#D6BD98]/20 rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-xs text-[#677D6A]">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1 text-xs text-[#1A3636] bg-white border border-[#D6BD98]/20 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default QSReviewsPage