// src/pages/rm/RMReportsPage.tsx
import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGetAllRmChecklistsQuery } from '@/services/api/checklistsApi'
import { transformChecklistsToReports } from '@/utils/checklistTransform'
import { useAuth } from '@/hooks/useAuth'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { RMChecklistCreator } from './RMChecklistCreator'
import { formatNairobiDate, formatCompactNairobiDateTime } from '@/utils/dateUtils'
import { 
  FiPlus,
  FiSearch,
  FiRefreshCw,
  FiAlertCircle,
  FiEye
} from 'react-icons/fi'
import toast from 'react-hot-toast'

type TabType = 'new' | 'qs-review' | 'rework'

// Status badge component
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
    <span className={`${config.bgColor} ${config.color} px-2 py-1 rounded-full text-[8px] lg:text-[10px] font-medium whitespace-nowrap`}>
      {config.label}
    </span>
  )
}

export const RMReportsPage: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const isMobile = useMediaQuery('(max-width: 768px)')
  const previousPathRef = useRef<string>('/rm/reports')
  
  const [activeTab, setActiveTab] = useState<TabType>('new')
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreatorOpen, setIsCreatorOpen] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  
  const { data: checklists, isLoading, error, refetch } = useGetAllRmChecklistsQuery()

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
      report.projectName?.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesSearch
  })

  const tabCounts = {
    new: myReports.filter(r => r.status?.toLowerCase() === 'pending').length,
    'qs-review': myReports.filter(r => r.status?.toLowerCase() === 'submitted').length,
    rework: myReports.filter(r => r.status?.toLowerCase() === 'rework').length
  }

  if (isLoading) {
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

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <FiAlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-[#1A3636] mb-2">Failed to Load Reports</h2>
            <p className="text-sm text-[#40534C] mb-4">Unable to fetch reports. Please try again.</p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-gradient-to-r from-[#1A3636] to-[#40534C] text-white rounded-lg text-sm flex items-center gap-2 mx-auto"
            >
              <FiRefreshCw className="w-4 h-4" />
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

      <div className="bg-white border-b border-[#D6BD98]/20 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold text-[#1A3636]">My Reports</h1>
              <p className="text-xs lg:text-sm text-[#677D6A] mt-1">
                {filteredReports.length} report{filteredReports.length !== 1 ? 's' : ''} found
              </p>
            </div>
            <button
              onClick={handleCreateNew}
              className="px-4 py-2 bg-gradient-to-r from-[#1A3636] to-[#40534C] text-white rounded-lg flex items-center gap-2 text-sm hover:shadow-lg transition-all w-full sm:w-auto justify-center"
            >
              <FiPlus className="w-4 h-4" />
              New Report
            </button>
          </div>

          {/* Tabs with Refresh Button */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex gap-4 lg:gap-6 overflow-x-auto scrollbar-hide border-b border-[#D6BD98]/20 flex-1">
              <button
                onClick={() => setActiveTab('new')}
                className={`pb-2 text-xs lg:text-sm font-medium whitespace-nowrap ${
                  activeTab === 'new'
                    ? 'text-[#1A3636] border-b-2 border-[#1A3636]'
                    : 'text-[#677D6A] hover:text-[#40534C]'
                }`}
              >
                New ({tabCounts.new})
              </button>
              <button
                onClick={() => setActiveTab('qs-review')}
                className={`pb-2 text-xs lg:text-sm font-medium whitespace-nowrap ${
                  activeTab === 'qs-review'
                    ? 'text-[#1A3636] border-b-2 border-[#1A3636]'
                    : 'text-[#677D6A] hover:text-[#40534C]'
                }`}
              >
                QS Review ({tabCounts['qs-review']})
              </button>
              <button
                onClick={() => setActiveTab('rework')}
                className={`pb-2 text-xs lg:text-sm font-medium whitespace-nowrap ${
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
              className="ml-2 p-2 text-[#677D6A] hover:text-[#1A3636] hover:bg-[#D6BD98]/10 rounded-lg transition-all"
              title="Refresh reports"
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
                placeholder={`Search ${activeTab} reports...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-[#D6BD98]/30 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#677D6A]/20"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
        {isMobile ? (
          <div className="border border-[#D6BD98]/20 rounded-lg overflow-hidden bg-white">
            <div className="grid grid-cols-3 gap-1 px-3 py-2 bg-[#F5F7F4] border-b border-[#D6BD98]/20 text-[9px] font-medium text-[#40534C] uppercase tracking-wider">
              <div className="col-span-1">Report</div>
              <div className="col-span-1">Customer</div>
              <div className="col-span-1 text-right">Status</div>
            </div>
            
            <div 
              ref={scrollContainerRef}
              className="overflow-y-auto max-h-[calc(100vh-280px)] bg-white"
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              {filteredReports.length === 0 ? (
                <div className="p-8 text-center">
                  <FiEye className="w-8 h-8 text-[#D6BD98] mx-auto mb-2" />
                  <p className="text-xs text-[#40534C]">No reports found</p>
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
                        {report.reportNo || '—'}
                      </div>
                      <div className="col-span-1 text-[#40534C] truncate text-[9px]">
                        {report.customerName || report.clientName || '—'}
                      </div>
                      <div className="col-span-1 text-right">
                        <StatusBadge status={report.status || 'pending'} />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          <div className="border border-[#D6BD98]/20 rounded-lg overflow-hidden bg-white">
            <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-[#F5F7F4] border-b border-[#D6BD98]/20 text-xs font-medium text-[#40534C] uppercase tracking-wider">
              <div className="col-span-2">Report No.</div>
              <div className="col-span-3">Customer</div>
              <div className="col-span-2">Project</div>
              <div className="col-span-2">Updated</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-1">Action</div>
            </div>

            <div className="divide-y divide-[#D6BD98]/10">
              {filteredReports.length === 0 ? (
                <div className="px-4 py-8 text-center text-[#677D6A]">
                  No reports found
                </div>
              ) : (
                filteredReports.map((report) => (
                  <div
                    key={report.id}
                    onClick={() => handleView(report.id)}
                    className="grid grid-cols-12 gap-2 px-4 py-3 hover:bg-[#D6BD98]/5 transition-colors cursor-pointer text-sm"
                  >
                    <div className="col-span-2 font-medium text-[#1A3636] truncate">
                      {report.reportNo || '—'}
                    </div>
                    <div className="col-span-3 text-[#40534C] truncate">
                      {report.customerName || report.clientName || '—'}
                    </div>
                    <div className="col-span-2 text-[#40534C] truncate">
                      {report.projectName || report.title || '—'}
                    </div>
                    <div className="col-span-2 text-[#677D6A] text-xs">
                      {formatNairobiDate(report.updatedAt || report.createdAt)}
                    </div>
                    <div className="col-span-2">
                      <StatusBadge status={report.status || 'pending'} />
                    </div>
                    <div className="col-span-1 flex items-center">
                      <span className="text-[#677D6A] text-xs">View</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default RMReportsPage