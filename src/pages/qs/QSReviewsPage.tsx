// src/pages/qs/QSReviewsPage.tsx
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
  FiClock,
  FiHash,
  FiCreditCard,
  FiBriefcase,
  FiChevronLeft,
  FiChevronRight as FiChevronRightIcon
} from 'react-icons/fi'
import toast from 'react-hot-toast'
import { formatNairobiDate } from '@/utils/dateUtils'

type ReviewTab = 'pending' | 'progress' | 'completed'

// Status badge component - REDUCED SIZE
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const statusLower = status?.toLowerCase() || 'pending'

  const statusConfig: Record<string, { label: string; color: string; bgColor: string }> = {
    pending: { label: 'Pending', color: 'text-amber-700', bgColor: 'bg-amber-100' },
    submitted: { label: 'Pending', color: 'text-amber-700', bgColor: 'bg-amber-100' },
    pending_qs_review: { label: 'Pending', color: 'text-amber-700', bgColor: 'bg-amber-100' },
    pendingqsreview: { label: 'Pending', color: 'text-amber-700', bgColor: 'bg-amber-100' },
    under_review: { label: 'Under Review', color: 'text-blue-700', bgColor: 'bg-blue-100' },
    underreview: { label: 'Under Review', color: 'text-blue-700', bgColor: 'bg-blue-100' },
    inprogress: { label: 'In Progress', color: 'text-blue-700', bgColor: 'bg-blue-100' },
    rework: { label: 'Rework', color: 'text-orange-700', bgColor: 'bg-orange-100' },
    revision_requested: { label: 'Rework', color: 'text-orange-700', bgColor: 'bg-orange-100' },
    returned: { label: 'Rework', color: 'text-orange-700', bgColor: 'bg-orange-100' },
    approved: { label: 'Approved', color: 'text-emerald-700', bgColor: 'bg-emerald-100' },
    completed: { label: 'Completed', color: 'text-emerald-700', bgColor: 'bg-emerald-100' },
    rejected: { label: 'Rejected', color: 'text-red-700', bgColor: 'bg-red-100' },
  }

  const config = statusConfig[statusLower] || statusConfig.pending

  return (
    <span className={`${config.bgColor} ${config.color} px-1.5 py-0.5 rounded-full text-[7px] lg:text-[9px] font-medium whitespace-nowrap`}>
      {config.label}
    </span>
  )
}

// Pagination component - REDUCED SIZE
const Pagination: React.FC<{
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}> = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;
  
  return (
    <div className="flex items-center justify-between mt-2 px-1">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex items-center gap-1 px-1.5 py-0.5 text-[9px] text-[#1A3636] bg-white border border-[#D6BD98]/20 rounded disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#F5F7F4] transition-colors"
      >
        <FiChevronLeft className="w-2.5 h-2.5" />
        Prev
      </button>
      <span className="text-[9px] text-[#677D6A]">
        {currentPage} / {totalPages}
      </span>
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex items-center gap-1 px-1.5 py-0.5 text-[9px] text-[#1A3636] bg-white border border-[#D6BD98]/20 rounded disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#F5F7F4] transition-colors"
      >
        Next
        <FiChevronRight className="w-2.5 h-2.5" />
      </button>
    </div>
  );
};

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
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(15)
  const [totalPages, setTotalPages] = useState(1)
  const [stats, setStats] = useState({
    pending: 0,
    progress: 0,
    completed: 0
  })

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [activeTab, searchTerm])

  // Save current path before navigating to detail
  useEffect(() => {
    sessionStorage.setItem('qsReviewsReturnPath', location.pathname + location.search)
  }, [location])

  useEffect(() => {
    loadReviews()
    loadStats()
  }, [activeTab, currentPage])

  const loadReviews = async () => {
    setIsLoading(true)
    try {
      let response
      console.log(`Loading ${activeTab} reviews, page ${currentPage}`)
      
      switch (activeTab) {
        case 'pending':
          response = await qsApi.getPendingReviews(currentPage, itemsPerPage)
          break
        case 'progress':
          response = await qsApi.getInProgressReviews(currentPage, itemsPerPage)
          break
        case 'completed':
          response = await qsApi.getCompletedReviews(currentPage, itemsPerPage)
          break
      }

      let items = []
      let total = 1
      
      if (response.data) {
        if (Array.isArray(response.data)) {
          items = response.data
          total = Math.ceil(items.length / itemsPerPage) || 1
        } else if (response.data.items) {
          items = response.data.items
          total = response.data.totalPages || Math.ceil(response.data.total / itemsPerPage) || 1
        } else if (response.data.data) {
          items = response.data.data
          total = response.data.totalPages || 1
        }
      }
      
      setReports(items)
      setTotalPages(total)
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
          filtered = allReports.filter(r =>
            r.status === 'rework' ||
            r.status === 'revision_requested' ||
            r.status === 'returned'
          )
          break
        case 'completed':
          filtered = allReports.filter(r =>
            r.status === 'approved' ||
            r.status === 'completed'
          )
          break
      }

      // Manual pagination for fallback
      const start = (currentPage - 1) * itemsPerPage
      const paginated = filtered.slice(start, start + itemsPerPage)
      setReports(paginated)
      setTotalPages(Math.ceil(filtered.length / itemsPerPage))
    } catch (fallbackError) {
      console.error('Fallback also failed:', fallbackError)
    }
  }

  const loadStats = async () => {
    try {
      const [pendingRes, progressRes, completedRes] = await Promise.allSettled([
        qsApi.getPendingReviews(1, 1),
        qsApi.getInProgressReviews(1, 1),
        qsApi.getCompletedReviews(1, 1)
      ])

      let pendingCount = 0
      let progressCount = 0
      let completedCount = 0

      if (pendingRes.status === 'fulfilled') {
        const data = pendingRes.value.data
        pendingCount = data?.total || (Array.isArray(data) ? data.length : 0)
      }
      
      if (progressRes.status === 'fulfilled') {
        const data = progressRes.value.data
        progressCount = data?.total || (Array.isArray(data) ? data.length : 0)
      }
      
      if (completedRes.status === 'fulfilled') {
        const data = completedRes.value.data
        completedCount = data?.total || (Array.isArray(data) ? data.length : 0)
      }

      setStats({
        pending: pendingCount,
        progress: progressCount,
        completed: completedCount
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

  // Filter reports based on search
  const filteredReports = reports.filter(report =>
    searchTerm === '' ||
    (report.reportNo?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (report.customerName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (report.projectName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (report.customerNumber?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (report.ibpsNo?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (report.rmName?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  )

  const getTabLabel = (tab: ReviewTab) => {
    switch (tab) {
      case 'pending': return 'Pending'
      case 'progress': return 'In Progress'
      case 'completed': return 'Completed'
    }
  }

  const getTabDescription = (tab: ReviewTab) => {
    switch (tab) {
      case 'pending': return 'Reports waiting for QS review'
      case 'progress': return 'Reports returned to RM for rework'
      case 'completed': return 'Reports that have been approved'
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
      {/* Header - REDUCED SIZE */}
      <div className="bg-white border-b border-[#D6BD98]/20 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h1 className="text-lg font-bold text-[#1A3636]">Review Reports</h1>
              <p className="text-[10px] lg:text-xs text-[#677D6A] mt-0.5">
                {getTabDescription(activeTab)}
              </p>
            </div>
          </div>

          {/* Tabs with Refresh Button - REDUCED SIZE */}
          <div className="flex items-center justify-between mt-3">
            <div className="flex gap-3 lg:gap-4 overflow-x-auto scrollbar-hide border-b border-[#D6BD98]/20 flex-1">
              <button
                onClick={() => {
                  setActiveTab('pending')
                  setCurrentPage(1)
                  navigate('/qs/reviews/pending')
                }}
                className={`pb-1.5 text-[10px] lg:text-xs font-medium whitespace-nowrap ${activeTab === 'pending'
                    ? 'text-[#1A3636] border-b-2 border-[#1A3636]'
                    : 'text-[#677D6A] hover:text-[#40534C]'
                  }`}
              >
                Pending ({stats.pending})
              </button>
              <button
                onClick={() => {
                  setActiveTab('progress')
                  setCurrentPage(1)
                  navigate('/qs/reviews/progress')
                }}
                className={`pb-1.5 text-[10px] lg:text-xs font-medium whitespace-nowrap ${activeTab === 'progress'
                    ? 'text-[#1A3636] border-b-2 border-[#1A3636]'
                    : 'text-[#677D6A] hover:text-[#40534C]'
                  }`}
              >
                In Progress ({stats.progress})
              </button>
              <button
                onClick={() => {
                  setActiveTab('completed')
                  setCurrentPage(1)
                  navigate('/qs/reviews/completed')
                }}
                className={`pb-1.5 text-[10px] lg:text-xs font-medium whitespace-nowrap ${activeTab === 'completed'
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
              className="ml-2 p-1.5 text-[#677D6A] hover:text-[#1A3636] hover:bg-[#D6BD98]/10 rounded-lg transition-all"
              title="Refresh reviews"
            >
              <FiRefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Search - REDUCED SIZE */}
          <div className="mt-3">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#677D6A] w-3.5 h-3.5" />
              <input
                type="text"
                placeholder={`Search ${getTabLabel(activeTab).toLowerCase()} reports...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 border border-[#D6BD98]/30 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#677D6A]/20"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Reports Table */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 lg:py-4">
        {isMobile ? (
          /* Mobile view - REDUCED SIZE with additional fields */
          <div className="border border-[#D6BD98]/20 rounded-lg overflow-hidden bg-white">
            <div className="grid grid-cols-4 gap-1 px-2 py-1.5 bg-[#F5F7F4] border-b border-[#D6BD98]/20 text-[8px] font-bold text-[#40534C] uppercase tracking-wider">
              <div className="col-span-1">Report</div>
              <div className="col-span-1">Customer</div>
              <div className="col-span-1">Status</div>
              <div className="col-span-1 text-right">RM</div>
            </div>

            <div className="overflow-y-auto max-h-[calc(100vh-350px)] bg-white">
              {filteredReports.length === 0 ? (
                <div className="p-6 text-center">
                  <FiClock className="w-6 h-6 text-[#D6BD98] mx-auto mb-1" />
                  <p className="text-[9px] text-[#40534C]">No {getTabLabel(activeTab).toLowerCase()} reviews found</p>
                </div>
              ) : (
                filteredReports.map((report) => (
                  <div
                    key={report.id}
                    onClick={() => handleView(report.id)}
                    className="p-2 border-b border-[#D6BD98]/10 last:border-0 hover:bg-[#D6BD98]/5 transition-colors cursor-pointer active:bg-[#D6BD98]/10"
                  >
                    <div className="grid grid-cols-4 gap-1 text-[9px] items-center">
                      <div className="col-span-1 font-bold text-[#1A3636] truncate">
                        {report.reportNo || `CRN-${report.id?.slice(0, 5)}`}
                      </div>

                      <div className="col-span-1 text-[#40534C] truncate text-[8px]">
                        {report.customerName || '—'}
                        {report.customerNumber && <span className="block text-[6px] text-[#677D6A]">#{report.customerNumber}</span>}
                      </div>

                      <div className="col-span-1">
                        <StatusBadge status={report.status || 'pending'} />
                      </div>

                      <div className="col-span-1 text-right text-[8px] text-[#677D6A] truncate">
                        {report.rmName || '—'}
                      </div>
                    </div>

                    {/* Additional info row for mobile */}
                    {(report.ibpsNo || report.projectName) && (
                      <div className="mt-1 flex items-center gap-2 text-[6px] text-[#677D6A]">
                        {report.ibpsNo && (
                          <span className="flex items-center gap-0.5">
                            <FiCreditCard className="w-2 h-2" /> {report.ibpsNo}
                          </span>
                        )}
                        {report.projectName && (
                          <span className="flex items-center gap-0.5 truncate">
                            <FiBriefcase className="w-2 h-2" /> {report.projectName}
                          </span>
                        )}
                      </div>
                    )}

                    {activeTab === 'pending' && (
                      <div className="mt-1.5 flex justify-end">
                        <button
                          onClick={(e) => handleAssignToMe(report.id, e)}
                          className="px-1.5 py-0.5 text-[7px] font-medium text-[#1A3636] bg-[#D6BD98]/10 rounded hover:bg-[#D6BD98]/20"
                        >
                          Assign
                        </button>
                      </div>
                    )}
                    
                    {activeTab === 'progress' && report.status === 'rework' && (
                      <div className="mt-1 text-[7px] text-orange-600 text-right">
                        Returned for changes
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          /* Desktop view - ADDED 3 COLUMNS, REDUCED SIZE */
          <div className="border border-[#D6BD98]/20 rounded-lg overflow-hidden bg-white">
            <div className="grid grid-cols-12 gap-1 px-3 py-2 bg-[#F5F7F4] border-b border-[#D6BD98]/20 text-[9px] font-bold text-[#40534C] uppercase tracking-wider">
              <div className="col-span-1">Report</div>
              <div className="col-span-2">Customer</div>
              <div className="col-span-1">Cus No</div>
              <div className="col-span-1">IBPS No</div>
              <div className="col-span-2">Project</div>
              <div className="col-span-2">RM</div>
              <div className="col-span-1">Submitted</div>
              <div className="col-span-1">Status</div>
              <div className="col-span-1">Action</div>
            </div>

            <div className="overflow-y-auto max-h-[calc(100vh-350px)]">
              <div className="divide-y divide-[#D6BD98]/10">
                {filteredReports.length === 0 ? (
                  <div className="px-4 py-6 text-center text-[#677D6A] text-xs">
                    No {getTabLabel(activeTab).toLowerCase()} reviews found
                  </div>
                ) : (
                  filteredReports.map((report) => (
                    <div
                      key={report.id}
                      onClick={() => handleView(report.id)}
                      className="grid grid-cols-12 gap-1 px-3 py-2 hover:bg-[#D6BD98]/5 transition-colors cursor-pointer text-xs"
                    >
                      <div className="col-span-1 text-[#1A3636] truncate text-[11px]">
                        {report.reportNo || `CRN-${report.id?.slice(0, 6)}`}
                      </div>

                      <div className="col-span-2 text-[#40534C] truncate text-[11px]">
                        {report.customerName || report.clientName || '—'}
                      </div>

                      <div className="col-span-1 text-[#677D6A] truncate text-[10px]">
                        {report.customerNumber || '—'}
                      </div>

                      <div className="col-span-1 text-[#677D6A] truncate text-[10px]">
                        {report.ibpsNo || '—'}
                      </div>

                      <div className="col-span-2 text-[#40534C] truncate text-[10px]">
                        {report.projectName || report.title || '—'}
                      </div>

                      <div className="col-span-2 text-[#677D6A] truncate text-[10px]">
                        {report.rmName || '—'}
                      </div>

                      <div className="col-span-1 text-[#677D6A] text-[9px]">
                        {formatNairobiDate(report.submittedAt || report.createdAt)}
                      </div>

                      <div className="col-span-1">
                        <StatusBadge status={report.status || 'pending'} />
                      </div>

                      <div className="col-span-1 flex items-center">
                        {activeTab === 'pending' ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleAssignToMe(report.id, e)
                            }}
                            className="px-1.5 py-0.5 text-[8px] font-bold text-[#1A3636] bg-[#D6BD98]/10 rounded hover:bg-[#D6BD98]/20 transition-colors"
                          >
                            Assign
                          </button>
                        ) : (
                          <FiChevronRight className="w-3 h-3 text-[#677D6A]" />
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  )
}

export default QSReviewsPage