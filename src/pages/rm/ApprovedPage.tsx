// src/pages/rm/ApprovedPage.tsx
import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGetAllRmChecklistsQuery } from '@/services/api/checklistsApi'
import { transformChecklistsToReports } from '@/utils/checklistTransform'
import { useAuth } from '@/hooks/useAuth'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { lockService } from '@/services/lockService'
import { 
  FiSearch, 
  FiAlertCircle, 
  FiRefreshCw,
  FiLock,
  FiUser,
  FiEye
} from 'react-icons/fi'
import toast from 'react-hot-toast'

// Status badge component
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  return (
    <span className="bg-[#677D6A] text-white px-2 py-1 rounded-full text-[8px] lg:text-[10px] font-medium whitespace-nowrap">
      Approved
    </span>
  )
}

// Format date for mobile
const formatMobileDate = (dateString?: Date | string) => {
  if (!dateString) return '—'
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-KE', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    }).replace(/\//g, '/')
  } catch {
    return '—'
  }
}

// Format date for desktop
const formatDate = (dateString?: Date | string) => {
  if (!dateString) return '—'
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-KE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  } catch {
    return '—'
  }
}

export const ApprovedPage: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const isMobile = useMediaQuery('(max-width: 768px)')
  const [searchTerm, setSearchTerm] = useState('')
  const [lockStatuses, setLockStatuses] = useState<Record<string, any>>({})
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  
  const { data: checklists, isLoading, error, refetch } = useGetAllRmChecklistsQuery()

  // Transform and filter to only show current RM's approved reports
  const approvedReports = React.useMemo(() => {
    const allReports = transformChecklistsToReports(checklists || [])
    return allReports
      .filter(report => {
        const status = report.status?.toLowerCase()
        return (report.rmId === user?.id || report.assignedToRM?.id === user?.id) && 
               status === 'approved'
      })
      .sort((a, b) => {
        const dateA = new Date(a.updatedAt || a.createdAt || 0).getTime()
        const dateB = new Date(b.updatedAt || b.createdAt || 0).getTime()
        return dateB - dateA
      })
  }, [checklists, user])

  // Check lock status for reports
  useEffect(() => {
    if (!approvedReports.length) return
    
    const checkLocks = async () => {
      const statuses: Record<string, any> = {}
      const reportsToCheck = approvedReports.slice(0, 20)
      
      await Promise.all(
        reportsToCheck.map(async (report) => {
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
    }
    
    checkLocks()
  }, [approvedReports])

  const handleView = async (reportId: string) => {
    const report = approvedReports.find(r => r.id === reportId)
    if (!report) return
    
    const lockStatus = lockStatuses[reportId] || await lockService.checkLockStatus(reportId)
    
    if (lockStatus.isLocked && lockStatus.lockedBy?.id !== user?.id) {
      toast.error(`This report is being edited by ${lockStatus.lockedBy?.name || 'another user'}`)
      return
    }
    
    // Approved reports go to read-only view
    navigate(`/rm/reports/${reportId}/view`)
  }

  // Filter based on search
  const filteredReports = approvedReports.filter(report => {
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
            <h2 className="text-lg font-semibold text-[#1A3636] mb-2">Failed to Load Approved Reports</h2>
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
          <div>
            <h1 className="text-xl font-bold text-[#1A3636]">Approved Reports</h1>
            <p className="text-xs lg:text-sm text-[#677D6A] mt-1">{filteredReports.length} approved {filteredReports.length === 1 ? 'report' : 'reports'}</p>
          </div>

          {/* Search */}
          <div className="mt-4">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#677D6A] w-4 h-4" />
              <input
                type="text"
                placeholder="Search approved reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-[#D6BD98]/30 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#677D6A]/20"
              />
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
            <div className="grid grid-cols-4 gap-1 px-3 py-2 bg-[#F5F7F4] border-b border-[#D6BD98]/20 text-[9px] font-medium text-[#40534C] uppercase tracking-wider">
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
                  <p className="text-xs text-[#40534C]">No approved reports found</p>
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
                        {/* Report No. with lock indicator */}
                        <div className="col-span-1 font-medium text-[#1A3636] truncate flex items-center gap-0.5">
                          {lockStatus?.isLocked && (
                            <FiLock className={`w-2.5 h-2.5 flex-shrink-0 ${
                              isLockedByOther ? 'text-amber-500' : 'text-green-500'
                            }`} />
                          )}
                          <span className="truncate">{report.reportNo || '—'}</span>
                        </div>

                        {/* Customer Name */}
                        <div className="col-span-1 text-[#40534C] truncate text-[9px]">
                          {report.customerName || report.clientName || '—'}
                        </div>

                        {/* Status */}
                        <div className="col-span-1">
                          <StatusBadge status="approved" />
                        </div>

                        {/* Updated Date */}
                        <div className="col-span-1 text-[8px] text-[#677D6A] whitespace-nowrap text-right">
                          {formatMobileDate(report.updatedAt || report.createdAt)}
                        </div>
                      </div>
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
            <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-[#F5F7F4] border-b border-[#D6BD98]/20 text-xs font-medium text-[#40534C] uppercase tracking-wider">
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
                  No approved reports found
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
                    >
                      {/* Report No. with lock indicator */}
                      <div className="col-span-2 font-medium text-[#1A3636] flex items-center gap-1 truncate">
                        {lockStatus?.isLocked && (
                          <FiLock className={`w-3 h-3 flex-shrink-0 ${
                            isLockedByOther ? 'text-amber-500' : 'text-green-500'
                          }`} />
                        )}
                        <span className="truncate">{report.reportNo || '—'}</span>
                      </div>

                      {/* Customer Name */}
                      <div className="col-span-3 text-[#40534C] truncate">
                        {report.customerName || report.clientName || '—'}
                      </div>

                      {/* Project Name */}
                      <div className="col-span-2 text-[#40534C] truncate">
                        {report.projectName || report.title || '—'}
                      </div>

                      {/* RM Name */}
                      <div className="col-span-2 text-[#677D6A] truncate flex items-center gap-1">
                        <FiUser className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{report.rmName || report.assignedToRM?.name || '—'}</span>
                      </div>

                      {/* Updated Date */}
                      <div className="col-span-2 text-[#677D6A] text-xs">
                        {formatDate(report.updatedAt || report.createdAt)}
                      </div>

                      {/* Status */}
                      <div className="col-span-1">
                        <StatusBadge status="approved" />
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

export default ApprovedPage