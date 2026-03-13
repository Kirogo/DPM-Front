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
  FiEye,
  FiBriefcase,
  FiCreditCard,
  FiCalendar,
  FiChevronLeft,
  FiChevronRight
} from 'react-icons/fi'
import toast from 'react-hot-toast'
import { formatNairobiDate } from '@/utils/dateUtils'

// Status badge component - REDUCED SIZE
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  return (
    <span className="bg-[#677D6A] text-white px-1.5 py-0.5 rounded-full text-[7px] lg:text-[9px] font-medium whitespace-nowrap">
      Approved
    </span>
  )
}

// Format date for mobile - NUMERIC ONLY
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

export const ApprovedPage: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const isMobile = useMediaQuery('(max-width: 768px)')
  const [searchTerm, setSearchTerm] = useState('')
  const [lockStatuses, setLockStatuses] = useState<Record<string, any>>({})
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(15)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  
  const { data: checklists, isLoading, error, refetch } = useGetAllRmChecklistsQuery()

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

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
    
    navigate(`/rm/reports/${reportId}/view`)
  }

  // Filter based on search - ENHANCED
  const filteredReports = approvedReports.filter(report => {
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
            <h2 className="text-sm font-semibold text-[#1A3636] mb-1">Failed to Load Approved Reports</h2>
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
      {/* Header - REDUCED SIZE */}
      <div className="bg-white border-b border-[#D6BD98]/20 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div>
            <h1 className="text-lg font-bold text-[#1A3636]">Approved Reports</h1>
            <p className="text-[10px] lg:text-xs text-[#677D6A] mt-0.5">
              {filteredReports.length} approved {filteredReports.length === 1 ? 'report' : 'reports'}
            </p>
          </div>

          {/* Search - REDUCED SIZE */}
          <div className="mt-3">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#677D6A] w-3.5 h-3.5" />
              <input
                type="text"
                placeholder="Search approved reports..."
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
          /* Mobile view - ENHANCED */
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
                  <p className="text-[9px] text-[#40534C]">No approved reports found</p>
                </div>
              ) : (
                paginatedReports.map((report) => {
                  const lockStatus = lockStatuses[report.id]
                  const isLockedByOther = lockStatus?.isLocked && lockStatus.lockedBy?.id !== user?.id
                  
                  return (
                    <div
                      key={report.id}
                      onClick={() => !isLockedByOther && handleView(report.id)}
                      className={`p-2 border-b border-[#D6BD98]/10 last:border-0 hover:bg-[#D6BD98]/5 transition-colors cursor-pointer active:bg-[#D6BD98]/10 ${
                        isLockedByOther ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <div className="grid grid-cols-4 gap-1 text-[9px] items-center">
                        <div className="col-span-1 font-bold text-[#1A3636] truncate flex items-center gap-0.5">
                          {lockStatus?.isLocked && (
                            <FiLock className={`w-2 h-2 flex-shrink-0 ${
                              isLockedByOther ? 'text-amber-500' : 'text-green-500'
                            }`} />
                          )}
                          <span className="truncate">{report.reportNo || '—'}</span>
                        </div>

                        <div className="col-span-1 text-[#40534C] truncate text-[8px]">
                          {report.customerName || report.clientName || '—'}
                          {report.customerNumber && <span className="block text-[6px] text-[#677D6A]">#{report.customerNumber}</span>}
                        </div>

                        <div className="col-span-1">
                          <StatusBadge status="approved" />
                        </div>

                        <div className="col-span-1 text-[7px] text-[#677D6A] whitespace-nowrap text-right">
                          {formatMobileDate(report.updatedAt || report.createdAt)}
                        </div>
                      </div>

                      {/* Additional info row for mobile */}
                      {(report.ibpsNo || report.projectName || report.rmName) && (
                        <div className="mt-1 flex items-center gap-2 text-[6px] text-[#677D6A]">
                          {report.projectName && (
                            <span className="flex items-center gap-0.5 truncate">
                              <FiBriefcase className="w-2 h-2" /> {report.projectName}
                            </span>
                          )}
                          {report.ibpsNo && (
                            <span className="flex items-center gap-0.5">
                              <FiCreditCard className="w-2 h-2" /> {report.ibpsNo}
                            </span>
                          )}
                          {report.rmName && (
                            <span className="flex items-center gap-0.5">
                              <FiUser className="w-2 h-2" /> {report.rmName}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </div>
        ) : (
          /* Desktop: Full table with OPTIMIZED COLUMN SPACING */
          <div className="border border-[#D6BD98]/20 rounded-lg overflow-hidden bg-white">
            <div className="grid grid-cols-12 gap-1 px-3 py-2 bg-[#F5F7F4] border-b border-[#D6BD98]/20 text-[9px] font-bold text-[#40534C] uppercase tracking-wider">
              <div className="col-span-1">Report</div>
              <div className="col-span-2">Customer</div>
              <div className="col-span-1">Cus No</div>
              <div className="col-span-1">IBPS No</div>
              <div className="col-span-3">Project</div>
              <div className="col-span-2">RM</div>
              <div className="col-span-1">Updated</div>
              <div className="col-span-1">Status</div>
            </div>

            <div className="overflow-y-auto max-h-[calc(100vh-350px)]">
              <div className="divide-y divide-[#D6BD98]/10">
                {paginatedReports.length === 0 ? (
                  <div className="px-4 py-6 text-center text-[#677D6A] text-xs">
                    No approved reports found
                  </div>
                ) : (
                  paginatedReports.map((report) => {
                    const lockStatus = lockStatuses[report.id]
                    const isLockedByOther = lockStatus?.isLocked && lockStatus.lockedBy?.id !== user?.id
                    
                    return (
                      <div
                        key={report.id}
                        onClick={() => !isLockedByOther && handleView(report.id)}
                        className={`grid grid-cols-12 gap-1 px-3 py-2 hover:bg-[#D6BD98]/5 transition-colors cursor-pointer text-xs relative ${
                          isLockedByOther ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        title={isLockedByOther ? `Locked by ${lockStatus.lockedBy?.name}` : ''}
                      >
                        <div className="col-span-1 text-[#1A3636] truncate text-[11px] italic flex items-center gap-1">
                          {lockStatus?.isLocked && (
                            <FiLock className={`w-2.5 h-2.5 flex-shrink-0 ${
                              isLockedByOther ? 'text-amber-500' : 'text-green-500'
                            }`} />
                          )}
                          <span className="truncate">{report.reportNo || '—'}</span>
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

                        <div className="col-span-3 text-[#40534C] truncate text-[10px] font-medium">
                          {report.projectName || report.title || '—'}
                        </div>

                        <div className="col-span-2 text-[#677D6A] truncate text-[10px]">
                          {report.rmName || report.assignedToRM?.name?.split(' ')[0] || '—'}
                        </div>

                        <div className="col-span-1 text-[#677D6A] text-[9px]">
                          {formatNairobiDate(report.updatedAt || report.createdAt)}
                        </div>

                        <div className="col-span-1">
                          <StatusBadge status="approved" />
                        </div>
                      </div>
                    )
                  })
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

export default ApprovedPage