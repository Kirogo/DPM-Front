// src/pages/rm/AllReportsPage.tsx
import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGetAllRmChecklistsQuery } from '@/services/api/checklistsApi'
import { transformChecklistsToReports } from '@/utils/checklistTransform'
import { useAuth } from '@/hooks/useAuth'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { lockService } from '@/services/lockService'
import { 
  FiSearch,
  FiRefreshCw,
  FiAlertCircle,
  FiFilter,
  FiChevronDown,
  FiLock,
  FiUser,
  FiEye,
  FiX
} from 'react-icons/fi'
import toast from 'react-hot-toast'
import { formatNairobiDate } from '@/utils/dateUtils'

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

// Format date for mobile
const formatMobileDate = (dateString?: Date | string) => {
  if (!dateString) return '—'
  try {
    const date = new Date(dateString)
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear().toString().slice(-2)
    return `${day}/${month}/${year}`
  } catch {
    return '—'
  }
}

export const AllReportsPage: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const isMobile = useMediaQuery('(max-width: 768px)')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showFilters, setShowFilters] = useState(false)
  const [lockStatuses, setLockStatuses] = useState<Record<string, any>>({})
  const [isLoadingLocks, setIsLoadingLocks] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  
  const { data: checklists, isLoading, error, refetch } = useGetAllRmChecklistsQuery()

  const allReports = React.useMemo(() => {
    return transformChecklistsToReports(checklists || [])
  }, [checklists])

  // Check lock status for reports
  useEffect(() => {
    if (!allReports.length) return
    
    const checkLocks = async () => {
      setIsLoadingLocks(true)
      const statuses: Record<string, any> = {}
      
      await Promise.all(
        allReports.slice(0, 20).map(async (report) => {
          if (report.id) {
            try {
              const status = await lockService.checkLockStatus(report.id)
              if (status.isLocked) {
                statuses[report.id] = status
              }
            } catch (error) {
              console.error(`Failed to check lock for report ${report.id}:`, error)
            }
          }
        })
      )
      setLockStatuses(statuses)
      setIsLoadingLocks(false)
    }
    
    checkLocks()
    
    const interval = setInterval(checkLocks, 30000)
    
    return () => clearInterval(interval)
  }, [allReports])

  const handleView = async (reportId: string) => {
    const report = allReports.find(r => r.id === reportId)
    if (!report) return
    
    const lockStatus = lockStatuses[reportId] || await lockService.checkLockStatus(reportId)
    
    if (lockStatus.isLocked && lockStatus.lockedBy?.id !== user?.id) {
      toast.error(`This report is being edited by ${lockStatus.lockedBy?.name || 'another user'}`)
      return
    }
    
    if (report.status?.toLowerCase() === 'approved') {
      navigate(`/rm/reports/${reportId}/view`)
    } else {
      navigate(`/rm/checklists/${reportId}`)
    }
  }

  const filteredReports = allReports.filter(report => {
    if (statusFilter !== 'all') {
      const reportStatus = report.status?.toLowerCase() || ''
      if (statusFilter === 'submitted' && reportStatus !== 'submitted') return false
      if (statusFilter === 'rework' && reportStatus !== 'rework') return false
      if (statusFilter === 'approved' && reportStatus !== 'approved') return false
      if (statusFilter === 'draft' && reportStatus !== 'draft') return false
      if (statusFilter === 'pending' && reportStatus !== 'pending') return false
    }
    
    const matchesSearch = searchTerm === '' || 
      report.reportNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.projectName?.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesSearch
  })

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
            <h2 className="text-lg font-bold text-[#1A3636] mb-2">Failed to Load Reports</h2>
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
      {/* Header */}
      <div className="bg-white border-b border-[#D6BD98]/20 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-[#1A3636]">All Reports</h1>
              <p className="text-xs lg:text-sm text-[#677D6A] mt-1">{filteredReports.length} reports found</p>
            </div>
            
            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden flex items-center gap-1 px-3 py-2 bg-[#F5F7F4] rounded-lg text-sm"
            >
              <FiFilter className="w-4 h-4" />
              Filters
              <FiChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Filters */}
          <div className={`mt-4 ${!showFilters ? 'hidden lg:block' : 'block'}`}>
            <div className="flex flex-col lg:flex-row gap-3">
              <div className="flex-1 relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#677D6A] w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search reports..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-[#D6BD98]/30 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#677D6A]/20"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-[#D6BD98]/30 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#677D6A]/20 bg-white"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="pending">Pending</option>
                <option value="submitted">QS Review</option>
                <option value="rework">Rework</option>
                <option value="approved">Approved</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Reports Table - Mobile Responsive */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
        {isMobile ? (
          /* Mobile: Scrollable list with headers */
          <div className="border border-[#D6BD98]/20 rounded-lg overflow-hidden bg-white">
            {/* Mobile Headers */}
            <div className="grid grid-cols-4 gap-1 px-3 py-2 bg-[#F5F7F4] border-b border-[#D6BD98]/20 text-[9px] font-bold text-[#40534C] uppercase tracking-wider">
              <div className="col-span-1">Report</div>
              <div className="col-span-1">Customer</div>
              <div className="col-span-1">Status</div>
              <div className="col-span-1 text-right">Updated</div>
            </div>
            
            {/* Scrollable List */}
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
                filteredReports.map((report) => {
                  const lockStatus = lockStatuses[report.id]
                  const isLockedByOther = lockStatus?.isLocked && lockStatus.lockedBy?.id !== user?.id
                  
                  return (
                    <div
                      key={report.id}
                      onClick={() => !isLockedByOther && handleView(report.id)}
                      className={`p-3 border-b border-[#D6BD98]/10 last:border-0 hover:bg-[#D6BD98]/5 transition-colors cursor-pointer active:bg-[#D6BD98]/10 ${
                        isLockedByOther ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <div className="grid grid-cols-4 gap-1 text-[10px] items-center">
                        <div className="col-span-1 font-bold text-[#1A3636] truncate flex items-center gap-0.5">
                          {lockStatus?.isLocked && (
                            <FiLock className={`w-2.5 h-2.5 flex-shrink-0 ${
                              isLockedByOther ? 'text-amber-500' : 'text-green-500'
                            }`} />
                          )}
                          <span className="truncate">{report.reportNo || '—'}</span>
                        </div>

                        <div className="col-span-1 text-[#40534C] truncate text-[9px]">
                          {report.customerName || report.clientName || '—'}
                        </div>

                        <div className="col-span-1">
                          <StatusBadge status={report.status || 'pending'} />
                        </div>

                        <div className="col-span-1 text-[8px] text-[#677D6A] whitespace-nowrap text-right">
                          {formatMobileDate(report.updatedAt || report.createdAt)}
                        </div>
                      </div>
                      
                      {isLockedByOther && (
                        <div className="mt-1 text-[7px] text-amber-600 truncate">
                          Locked by {lockStatus.lockedBy?.name}
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </div>
        ) : (
          /* Desktop: Full table */
          <div className="border border-[#D6BD98]/20 rounded-lg overflow-hidden bg-white">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-[#F5F7F4] border-b border-[#D6BD98]/20 text-xs font-bold text-[#40534C] uppercase tracking-wider">
              <div className="col-span-2">Report No.</div>
              <div className="col-span-3">Customer</div>
              <div className="col-span-2">Project</div>
              <div className="col-span-2">RM</div>
              <div className="col-span-2">Updated</div>
              <div className="col-span-1">Status</div>
            </div>

            {/* Table Rows */}
            <div className="divide-y divide-[#D6BD98]/10">
              {filteredReports.length === 0 ? (
                <div className="px-4 py-8 text-center text-[#677D6A]">
                  No reports found
                </div>
              ) : (
                filteredReports.map((report) => {
                  const lockStatus = lockStatuses[report.id]
                  const isLockedByOther = lockStatus?.isLocked && lockStatus.lockedBy?.id !== user?.id
                  
                  return (
                    <div
                      key={report.id}
                      onClick={() => !isLockedByOther && handleView(report.id)}
                      className={`grid grid-cols-12 gap-2 px-4 py-3 hover:bg-[#D6BD98]/5 transition-colors cursor-pointer text-sm relative ${
                        isLockedByOther ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      title={isLockedByOther ? `Locked by ${lockStatus.lockedBy?.name}` : ''}
                    >
                      <div className="col-span-2 font-bold text-[#1A3636] flex items-center gap-1 truncate">
                        {lockStatus?.isLocked && (
                          <FiLock className={`w-3 h-3 flex-shrink-0 ${
                            isLockedByOther ? 'text-amber-500' : 'text-green-500'
                          }`} />
                        )}
                        <span className="truncate">{report.reportNo || '—'}</span>
                      </div>

                      <div className="col-span-3 text-[#40534C] truncate">
                        {report.customerName || report.clientName || '—'}
                      </div>

                      <div className="col-span-2 text-[#40534C] truncate">
                        {report.projectName || report.title || '—'}
                      </div>

                      <div className="col-span-2 text-[#677D6A] truncate flex items-center gap-1">
                        <FiUser className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{report.rmName || report.assignedToRM?.name || '—'}</span>
                      </div>

                      <div className="col-span-2 text-[#677D6A] text-xs">
                        {formatNairobiDate(report.updatedAt || report.createdAt)}
                      </div>

                      <div className="col-span-1">
                        <StatusBadge status={report.status || 'pending'} />
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AllReportsPage