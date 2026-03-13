// src/pages/rm/RMReportsPage.tsx
import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGetAllRmChecklistsQuery } from '@/services/api/checklistsApi'
import { transformChecklistsToReports } from '@/utils/checklistTransform'
import { useAuth } from '@/hooks/useAuth'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { RMChecklistCreator } from './RMChecklistCreator'
import { formatNairobiDate } from '@/utils/dateUtils'
import { 
  FiPlus,
  FiSearch,
  FiRefreshCw,
  FiAlertCircle,
  FiEye,
  FiUser,
  FiBriefcase,
  FiCreditCard,
  FiCalendar,
  FiChevronLeft,
  FiChevronRight
} from 'react-icons/fi'
import toast from 'react-hot-toast'

type TabType = 'new' | 'qs-review' | 'rework'

// Status badge component - REDUCED SIZE
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const statusLower = status?.toLowerCase() || 'pending'
  
  const statusConfig: Record<string, { label: string; color: string; bgColor: string }> = {
    pending: { label: 'Pending', color: 'text-[#677D6A]', bgColor: 'bg-[#677D6A]/10' },
    draft: { label: 'Draft', color: 'text-[#40534C]', bgColor: 'bg-[#D6BD98]/20' },
    submitted: { label: 'QS Review', color: 'text-[#1A3636]', bgColor: 'bg-[#D6BD98]/30' },
    rework: { label: 'Rework', color: 'text-orange-700', bgColor: 'bg-orange-100' },
    approved: { label: 'Approved', color: 'text-white', bgColor: 'bg-[#677D6A]' },
    rejected: { label: 'Rejected', color: 'text-red-600', bgColor: 'bg-red-100' },
  }

  const config = statusConfig[statusLower] || statusConfig.pending

  return (
    <span className={`${config.bgColor} ${config.color} px-1.5 py-0.5 rounded-full text-[7px] lg:text-[9px] font-medium whitespace-nowrap`}>
      {config.label}
    </span>
  )
}

// Pagination component
const Pagination: React.FC<{
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}> = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;
  
  return (
    <div className="flex items-center justify-between mt-3 px-1">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex items-center gap-1 px-2 py-1 text-[10px] text-[#1A3636] bg-white border border-[#D6BD98]/20 rounded disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#F5F7F4] transition-colors"
      >
        <FiChevronLeft className="w-3 h-3" />
        Previous
      </button>
      <span className="text-[10px] text-[#677D6A]">
        Page {currentPage} of {totalPages}
      </span>
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex items-center gap-1 px-2 py-1 text-[10px] text-[#1A3636] bg-white border border-[#D6BD98]/20 rounded disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#F5F7F4] transition-colors"
      >
        Next
        <FiChevronRight className="w-3 h-3" />
      </button>
    </div>
  );
};

export const RMReportsPage: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const isMobile = useMediaQuery('(max-width: 768px)')
  const previousPathRef = useRef<string>('/rm/reports')
  
  const [activeTab, setActiveTab] = useState<TabType>('new')
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreatorOpen, setIsCreatorOpen] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(15)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  
  const { data: checklists, isLoading, error, refetch } = useGetAllRmChecklistsQuery()

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [activeTab, searchTerm])

  // Save current path before navigating to detail
  useEffect(() => {
    previousPathRef.current = location.pathname + location.search
  }, [location])

  // Transform and filter reports to only show current RM's reports (excluding draft)
  const myReports = React.useMemo(() => {
    const allReports = transformChecklistsToReports(checklists || [])
    return allReports
      .filter(report => {
        const isMyReport = report.rmId === user?.id || report.assignedToRM?.id === user?.id
        const isNotDraft = report.status?.toLowerCase() !== 'draft'
        return isMyReport && isNotDraft
      })
      .sort((a, b) => {
        const dateA = new Date(a.updatedAt || a.createdAt || 0).getTime()
        const dateB = new Date(b.updatedAt || b.createdAt || 0).getTime()
        return dateB - dateA
      })
  }, [checklists, user])

  const handleCreateNew = () => {
    setIsCreatorOpen(true)
  }

  const handleCloseCreator = () => {
    setIsCreatorOpen(false)
    refetch()
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refetch()
    setIsRefreshing(false)
    toast.success('Reports refreshed')
  }

  const handleView = (reportId: string) => {
    sessionStorage.setItem('rmReportsReturnPath', '/rm/reports')
    navigate(`/rm/checklists/${reportId}`)
  }

  // Filter reports based on active tab and search
  const filteredReports = myReports.filter(report => {
    const status = report.status?.toLowerCase() || ''
    
    if (activeTab === 'new' && status !== 'pending') return false
    if (activeTab === 'qs-review' && status !== 'submitted') return false
    if (activeTab === 'rework' && status !== 'rework') return false
    
    const matchesSearch = searchTerm === '' || 
      report.reportNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.projectName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.customerNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.ibpsNo?.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesSearch
  })

  // Pagination
  const totalPages = Math.ceil(filteredReports.length / itemsPerPage)
  const paginatedReports = filteredReports.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const tabCounts = {
    new: myReports.filter(r => r.status?.toLowerCase() === 'pending').length,
    'qs-review': myReports.filter(r => r.status?.toLowerCase() === 'submitted').length,
    rework: myReports.filter(r => r.status?.toLowerCase() === 'rework').length
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-[#D6BD98]/20 rounded w-1/4"></div>
            <div className="h-48 bg-[#D6BD98]/10 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center py-8">
            <FiAlertCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
            <h2 className="text-sm font-semibold text-[#1A3636] mb-1">Failed to Load Reports</h2>
            <p className="text-xs text-[#40534C] mb-4">Unable to fetch reports. Please try again.</p>
            <button
              onClick={() => refetch()}
              className="px-3 py-1.5 bg-[#1A3636] text-white rounded text-xs flex items-center gap-1 mx-auto"
            >
              <FiRefreshCw className="w-3 h-3" />
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <RMChecklistCreator
        open={isCreatorOpen}
        checklist={null}
        onClose={handleCloseCreator}
      />

      {/* Header - REDUCED SIZE */}
      <div className="bg-white border-b border-[#D6BD98]/20 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h1 className="text-lg font-bold text-[#1A3636]">My Reports</h1>
              <p className="text-[10px] lg:text-xs text-[#677D6A] mt-0.5">
                {filteredReports.length} report{filteredReports.length !== 1 ? 's' : ''} found
              </p>
            </div>
            <button
              onClick={handleCreateNew}
              className="px-3 py-1.5 bg-gradient-to-r from-[#1A3636] to-[#40534C] text-white rounded-lg flex items-center gap-1.5 text-xs hover:shadow-lg transition-all w-full sm:w-auto justify-center h-8"
            >
              <FiPlus className="w-3.5 h-3.5" />
              New Report
            </button>
          </div>

          {/* Tabs with Refresh Button - REDUCED SIZE */}
          <div className="flex items-center justify-between mt-3">
            <div className="flex gap-3 lg:gap-4 overflow-x-auto scrollbar-hide border-b border-[#D6BD98]/20 flex-1">
              <button
                onClick={() => setActiveTab('new')}
                className={`pb-1.5 text-[12px] lg:text-xs whitespace-nowrap ${
                  activeTab === 'new'
                    ? 'text-[#1A3636] border-b-2 border-[#1A3636]'
                    : 'text-[#677D6A] hover:text-[#40534C]'
                }`}
              >
                New ({tabCounts.new})
              </button>
              <button
                onClick={() => setActiveTab('qs-review')}
                className={`pb-1.5 text-[12px] lg:text-xs whitespace-nowrap ${
                  activeTab === 'qs-review'
                    ? 'text-[#1A3636] border-b-2 border-[#1A3636]'
                    : 'text-[#677D6A] hover:text-[#40534C]'
                }`}
              >
                QS Review ({tabCounts['qs-review']})
              </button>
              <button
                onClick={() => setActiveTab('rework')}
                className={`pb-1.5 text-[12px] lg:text-xs whitespace-nowrap ${
                  activeTab === 'rework'
                    ? 'text-[#1A3636] border-b-2 border-[#1A3636]'
                    : 'text-[#677D6A] hover:text-[#40534C]'
                }`}
              >
                Rework ({tabCounts.rework})
              </button>
            </div>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="ml-2 p-1.5 text-[#677D6A] hover:text-[#1A3636] hover:bg-[#D6BD98]/10 rounded-lg transition-all"
              title="Refresh reports"
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
                placeholder={`Search ${activeTab} reports...`}
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
          /* Mobile view - ENHANCED with more fields */
          <div className="border border-[#D6BD98]/20 rounded-lg overflow-hidden bg-white">
            <div className="grid grid-cols-4 gap-1 px-2 py-1.5 bg-[#F5F7F4] border-b border-[#D6BD98]/20 text-[8px] font-bold text-[#40534C] uppercase tracking-wider">
              <div className="col-span-1">Report</div>
              <div className="col-span-1">Customer</div>
              <div className="col-span-1">Status</div>
              <div className="col-span-1 text-right">Updated</div>
            </div>
            
            <div 
              ref={scrollContainerRef}
              className="overflow-y-auto max-h-[calc(100vh-350px)] bg-white"
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              {paginatedReports.length === 0 ? (
                <div className="p-6 text-center">
                  <FiEye className="w-6 h-6 text-[#D6BD98] mx-auto mb-1" />
                  <p className="text-[9px] text-[#40534C]">No reports found</p>
                </div>
              ) : (
                paginatedReports.map((report) => (
                  <div
                    key={report.id}
                    onClick={() => handleView(report.id)}
                    className="p-2 border-b border-[#D6BD98]/10 last:border-0 hover:bg-[#D6BD98]/5 transition-colors cursor-pointer active:bg-[#D6BD98]/10"
                  >
                    <div className="grid grid-cols-4 gap-1 text-[9px] items-center">
                      <div className="col-span-1 text-[#1A3636] truncate">
                        {report.reportNo || '—'}
                      </div>

                      <div className="col-span-1 text-[#40534C] truncate text-[9px]">
                        {report.customerName || report.clientName || '—'}
                      </div>

                      <div className="col-span-1">
                        <StatusBadge status={report.status || 'pending'} />
                      </div>

                      <div className="col-span-1 text-[8px] text-[#677D6A] whitespace-nowrap text-right">
                        {formatNairobiDate(report.updatedAt || report.createdAt)}
                      </div>
                    </div>

                    {/* Additional info row for mobile */}
                    {(report.ibpsNo || report.projectName) && (
                      <div className="mt-1 flex items-center gap-2 text-[6px] text-[#677D6A]">
                        {report.projectName && (
                          <span className="flex items-center gap-0.5 truncate">
                           {report.projectName}
                          </span>
                        )}
                      
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          /* Desktop view - ADDED COLUMNS */
          <div className="border border-[#D6BD98]/20 rounded-lg overflow-hidden bg-white">
            <div className="grid grid-cols-12 gap-1 px-3 py-2 bg-[#F5F7F4] border-b border-[#D6BD98]/20 text-[9px] font-bold text-[#40534C] uppercase tracking-wider">
              <div className="col-span-2">Report</div>
              <div className="col-span-3">Customer</div>
              <div className="col-span-1">Cus No</div>
              <div className="col-span-1">IBPS No</div>
              <div className="col-span-3">Project</div>
              <div className="col-span-1">Updated</div>
              <div className="col-span-1">Status</div>
            </div>

            <div className="overflow-y-auto max-h-[calc(100vh-350px)]">
              <div className="divide-y divide-[#D6BD98]/10">
                {paginatedReports.length === 0 ? (
                  <div className="px-4 py-6 text-center text-[#677D6A] text-xs">
                    No reports found
                  </div>
                ) : (
                  paginatedReports.map((report) => (
                    <div
                      key={report.id}
                      onClick={() => handleView(report.id)}
                      className="grid grid-cols-12 gap-1 px-3 py-2 hover:bg-[#D6BD98]/5 transition-colors cursor-pointer text-xs"
                    >
                      <div className="col-span-2 text-[#1A3636] truncate text-[11px] italic">
                        {report.reportNo || '—'}
                      </div>

                      <div className="col-span-3 text-[#40534C] truncate text-[11px]">
                        {report.customerName || report.clientName || '—'}
                      </div>

                      <div className="col-span-1 text-[#677D6A] truncate text-[10px]">
                        {report.customerNumber || '—'}
                      </div>

                      <div className="col-span-1 text-[#677D6A] truncate text-[10px]">
                        {report.ibpsNo || '—'}
                      </div>

                      <div className="col-span-3 text-[#40534C] truncate text-[10px]">
                        {report.projectName || report.title || '—'}
                      </div>

                      <div className="col-span-1 text-[#677D6A] text-[9px]">
                        {formatNairobiDate(report.updatedAt || report.createdAt)}
                      </div>

                      <div className="col-span-1">
                        <StatusBadge status={report.status || 'pending'} />
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

export default RMReportsPage