// src/pages/qs/QSSiteVisitsPage.tsx
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import axiosInstance from '@/services/api/axiosConfig'
import { SiteVisitReport } from '@/types/report.types'
import { REPORT_STATUS, STATUS_CONFIG } from '@/constants/reportStatus'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import {
  FiSearch,
  FiRefreshCw,
  FiCalendar,
  FiMapPin,
  FiInfo,
  FiChevronLeft,
  FiChevronRight,
  FiBriefcase,
  FiCreditCard,
  FiClock
} from 'react-icons/fi'
import { formatNairobiDate, formatNairobiDateTime } from '@/utils/dateUtils'
import toast from 'react-hot-toast'

// Status badge component - REDUCED SIZE
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const statusLower = status?.toLowerCase() || 'pending'
  const config = STATUS_CONFIG[statusLower] || STATUS_CONFIG.pending

  return (
    <span className={`${config.bgColor} ${config.color} px-1.5 py-0.5 rounded-full text-[7px] lg:text-[9px] font-medium whitespace-nowrap`}>
      {config.label}
    </span>
  )
}

// Stats Card Component - COMPACT
const StatCard: React.FC<{ label: string; value: number }> = ({ label, value }) => (
  <div className="bg-primary-50 rounded p-2">
    <p className="text-[8px] text-primary-500 uppercase tracking-wider">{label}</p>
    <p className="text-sm font-bold text-primary-800">{value}</p>
  </div>
)

// Pagination component - COMPACT like AllReportsPage
const Pagination: React.FC<{
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}> = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-end gap-0.5 py-1 text-[11px] mt-2">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="w-4 h-4 flex items-center justify-center text-[#1A3636] bg-white border border-[#D6BD98]/20 rounded hover:bg-[#F5F7F4] disabled:opacity-30 disabled:cursor-not-allowed"
      >
        ‹
      </button>
      <span className="px-1 text-[#677D6A]">
        {currentPage}/{totalPages}
      </span>
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="w-4 h-4 flex items-center justify-center text-[#1A3636] bg-white border border-[#D6BD98]/20 rounded hover:bg-[#F5F7F4] disabled:opacity-30 disabled:cursor-not-allowed"
      >
        ›
      </button>
    </div>
  );
};

// Helper function
const getValue = (obj: any, key: string): any => {
  if (!obj) return undefined
  if (obj[key] !== undefined && obj[key] !== null) return obj[key]
  const pascalKey = key.charAt(0).toUpperCase() + key.slice(1)
  if (obj[pascalKey] !== undefined && obj[pascalKey] !== null) return obj[pascalKey]
  return undefined
}

export const QSSiteVisitsPage: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const isMobile = useMediaQuery('(max-width: 768px)')

  const [reports, setReports] = useState<SiteVisitReport[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(15)
  const [totalPages, setTotalPages] = useState(1)
  const [stats, setStats] = useState({
    total: 0,
    today: 0,
    upcoming: 0
  })

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  useEffect(() => {
    sessionStorage.setItem('qsReturnPath', '/qs/site-visits')
  }, [])

  useEffect(() => {
    loadSiteVisits()
    loadStats()
  }, [currentPage])

  const loadSiteVisits = async () => {
    setIsLoading(true)
    try {
      const response = await axiosInstance.get('/qs/reviews/site-visits', {
        params: { page: currentPage, pageSize: itemsPerPage }
      })

      let items = []
      let total = 1

      if (response.data) {
        if (response.data.items) {
          items = response.data.items
          total = response.data.totalPages || 1
        } else if (Array.isArray(response.data)) {
          items = response.data
          total = Math.ceil(items.length / itemsPerPage) || 1
        }
      }

      setReports(items)
      setTotalPages(total)
    } catch (error) {
      console.error('Failed to load site visits:', error)
      toast.error('Failed to load site visits')
    } finally {
      setIsLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const response = await axiosInstance.get('/qs/reviews/site-visits/stats')
      if (response.data) {
        setStats(response.data)
      }
    } catch (error) {
      console.error('Failed to load stats:', error)
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await loadSiteVisits()
    await loadStats()
    setIsRefreshing(false)
    toast.success('Site visits refreshed')
  }

  const handleView = (reportId: string) => {
    sessionStorage.setItem('qsReturnPath', '/qs/site-visits')
    navigate(`/qs/reviews/${reportId}`)
  }

  const handleConfirmVisit = (reportId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    sessionStorage.setItem('qsReturnPath', '/qs/site-visits')
    sessionStorage.setItem('openConfirmModal', 'true')
    navigate(`/qs/reviews/${reportId}`)
  }

  const filteredReports = reports.filter(report => {
    const reportNo = getValue(report, 'reportNo') || getValue(report, 'dclNo') || ''
    const customerName = getValue(report, 'customerName') || ''
    const projectName = getValue(report, 'projectName') || ''
    const ibpsNo = getValue(report, 'ibpsNo') || ''
    const notes = getValue(report, 'siteVisitNotes') || ''

    const searchLower = searchTerm.toLowerCase()
    return searchTerm === '' ||
      reportNo.toLowerCase().includes(searchLower) ||
      customerName.toLowerCase().includes(searchLower) ||
      projectName.toLowerCase().includes(searchLower) ||
      ibpsNo.toLowerCase().includes(searchLower) ||
      notes.toLowerCase().includes(searchLower)
  })

  if (isLoading && reports.length === 0) {
    return (
      <div className="min-h-screen bg-primary-50 flex justify-center items-center py-12">
        <LoadingSpinner size="lg" label="Loading site visits..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-primary-50">
      {/* Header - COMPACT */}
      <div className="sticky top-0 z-20 bg-primary-50 border-b border-accent-200 px-4 lg:px-6 py-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-sm lg:text-base font-semibold text-primary-800">Site Visits</h1>
            <p className="text-[9px] lg:text-xs text-primary-500 mt-0.5 flex items-center gap-1">
              <FiMapPin className="w-3 h-3" />
              Reports requiring physical site visits
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-1.5 rounded-md bg-primary-100 text-primary-600 hover:bg-primary-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Refresh site visits"
            >
              <FiRefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Stats Cards - COMPACT */}
        <div className="grid grid-cols-3 gap-2 mt-3">
          <StatCard label="Total Scheduled" value={stats.total} />
          <StatCard label="Today" value={stats.today} />
          <StatCard label="Upcoming" value={stats.upcoming} />
        </div>

        {/* Search - COMPACT */}
        <div className="mt-3">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-400 w-3.5 h-3.5" />
            <input
              type="text"
              placeholder="Search site visits..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 border border-accent-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-600 bg-white"
            />
          </div>
        </div>
      </div>

      {/* Table - WITH CORRECT COLUMN SIZES */}
      <div className="px-4 lg:px-6 py-3">
        {isMobile ? (
          /* Mobile View - COMPACT */
          <div className="border border-accent-200 rounded-lg overflow-hidden bg-white">
            <div className="grid grid-cols-4 gap-1 px-2 py-1.5 bg-primary-50 border-b border-accent-200 text-[8px] font-bold text-primary-600 uppercase tracking-wider">
              <div className="col-span-1">Report</div>
              <div className="col-span-1">Customer</div>
              <div className="col-span-1">Scheduled</div>
              <div className="col-span-1">Action</div>
            </div>

            <div className="divide-y divide-accent-100">
              {filteredReports.length === 0 ? (
                <div className="p-6 text-center">
                  <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-accent-100 flex items-center justify-center">
                    <FiMapPin className="w-4 h-4 text-primary-500" />
                  </div>
                  <p className="text-xs font-medium text-primary-800">No site visits scheduled</p>
                  <p className="text-[9px] text-primary-500 mt-1">Reports will appear here</p>
                </div>
              ) : (
                filteredReports.map((report) => {
                  const reportNo = getValue(report, 'reportNo') || getValue(report, 'dclNo') || '—'
                  const formattedReportNo = reportNo.replace(/^DCL-/i, 'CRN-')
                  const customerName = getValue(report, 'customerName') || '—'
                  const scheduledDate = getValue(report, 'siteVisitScheduledDate')
                  const notes = getValue(report, 'siteVisitNotes')
                  const ibpsNo = getValue(report, 'ibpsNo')
                  const projectName = getValue(report, 'projectName')

                  return (
                    <div
                      key={report.id}
                      onClick={() => handleView(report.id)}
                      className="p-2 hover:bg-primary-50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-primary-800 text-[11px]">
                          {formattedReportNo}
                        </span>
                        <button
                          onClick={(e) => handleConfirmVisit(report.id, e)}
                          className="px-1.5 py-0.5 text-[8px] font-medium text-primary-600 bg-primary-50 rounded hover:bg-primary-100 border border-accent-200"
                        >
                          Confirm
                        </button>
                      </div>

                      <div className="text-[9px] text-primary-600 mb-1">
                        {customerName}
                      </div>

                      <div className="flex items-center gap-2 text-[8px] text-primary-500 mb-1">
                        <FiCalendar className="w-2.5 h-2.5" />
                        {scheduledDate ? formatNairobiDate(scheduledDate) : '—'}
                      </div>

                      {(ibpsNo || projectName) && (
                        <div className="flex items-center gap-2 text-[8px] text-primary-500 mb-1">
                          {ibpsNo && <span className="flex items-center gap-0.5"><FiCreditCard className="w-2.5 h-2.5" /> {ibpsNo}</span>}
                          {projectName && <span className="flex items-center gap-0.5"><FiBriefcase className="w-2.5 h-2.5" /> {projectName}</span>}
                        </div>
                      )}

                      {notes && (
                        <div className="text-[8px] text-primary-600 bg-primary-50 p-1.5 rounded mt-1 flex items-start gap-1">
                          <FiInfo className="w-2.5 h-2.5 mt-0.5 flex-shrink-0 text-primary-400" />
                          <span>{notes}</span>
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </div>
        ) : (
          /* Desktop View - CORRECT COLUMN SIZES matching AllReportsPage */
          <div className="border border-accent-200 rounded-lg overflow-hidden bg-white">
            {/* Header - 12-column grid with proper spans */}
            <div className="grid grid-cols-12 gap-1 px-3 py-2 bg-primary-50 border-b border-accent-200 text-[9px] font-bold text-primary-600 uppercase tracking-wider">
              <div className="col-span-1">Report</div>
              <div className="col-span-2">Customer</div>
              <div className="col-span-1">IBPS No</div>
              <div className="col-span-3">Project</div>
              <div className="col-span-2">Scheduled Date</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-1">Action</div>
            </div>

            {/* Rows */}
            <div className="divide-y divide-accent-100">
              {filteredReports.length === 0 ? (
                <div className="px-4 py-6 text-center text-primary-500 text-xs">
                  <FiMapPin className="w-6 h-6 mx-auto mb-2 text-accent-400" />
                  <p className="text-xs font-medium text-primary-800">No site visits scheduled</p>
                  <p className="text-[9px] mt-1">Reports will appear here</p>
                </div>
              ) : (
                filteredReports.map((report) => {
                  const reportNo = getValue(report, 'reportNo') || getValue(report, 'dclNo') || '—'
                  const formattedReportNo = reportNo.replace(/^DCL-/i, 'CRN-')
                  const customerName = getValue(report, 'customerName') || '—'
                  const ibpsNo = getValue(report, 'ibpsNo') || '—'
                  const projectName = getValue(report, 'projectName') || '—'
                  const scheduledDate = getValue(report, 'siteVisitScheduledDate')
                  const status = REPORT_STATUS.SITE_VISIT_SCHEDULED

                  return (
                    <div
                      key={report.id}
                      onClick={() => handleView(report.id)}
                      className="grid grid-cols-12 gap-1 px-3 py-2 hover:bg-primary-50 transition-colors cursor-pointer text-xs"
                    >
                      {/* Report No - col-span-1 */}
                      <div className="col-span-1 text-primary-800 font-medium truncate text-[11px]">
                        {formattedReportNo}
                      </div>

                      {/* Customer - col-span-2 */}
                      <div className="col-span-2 text-primary-600 truncate text-[11px]">
                        {customerName}
                      </div>

                      {/* IBPS No - col-span-1 */}
                      <div className="col-span-1 text-primary-500 truncate text-[10px]">
                        {ibpsNo}
                      </div>

                      {/* Project - col-span-3 (wider for project names) */}
                      <div className="col-span-3 text-primary-600 truncate text-[10px]">
                        {projectName}
                      </div>

                      {/* Scheduled Date - col-span-2 */}
                      <div className="col-span-2 text-primary-500 text-[10px]">
                        {scheduledDate ? formatNairobiDate(scheduledDate) : '—'}
                      </div>

                      {/* Status - col-span-2 */}
                      <div className="col-span-2">
                        <StatusBadge status={status} />
                      </div>

                      {/* Action - col-span-1 */}
                      <div className="col-span-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleConfirmVisit(report.id, e)
                          }}
                          className="px-2 py-0.5 text-[9px] font-medium text-primary-600 bg-primary-50 rounded hover:bg-primary-100 border border-accent-200 transition-colors"
                        >
                          Confirm
                        </button>
                      </div>
                    </div>
                  )
                })
              )}
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

export default QSSiteVisitsPage