// src/pages/rm/DraftsPage.tsx
import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGetAllRmChecklistsQuery } from '@/services/api/checklistsApi'
import { transformChecklistsToReports } from '@/utils/checklistTransform'
import { useAuth } from '@/hooks/useAuth'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { lockService } from '@/services/lockService'
import { RMChecklistCreator } from './RMChecklistCreator'
import { 
  FiSearch, 
  FiPlus, 
  FiAlertCircle, 
  FiRefreshCw,
  FiEye,
  FiLock
} from 'react-icons/fi'
import toast from 'react-hot-toast'
import { formatNairobiDate } from '@/utils/dateUtils'

// Status badge component
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  return (
    <span className="bg-[#D6BD98]/20 text-[#40534C] px-2 py-1 rounded-full text-[8px] lg:text-[10px] font-medium whitespace-nowrap">
      Draft
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

export const DraftsPage: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const isMobile = useMediaQuery('(max-width: 768px)')
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreatorOpen, setIsCreatorOpen] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lockStatuses, setLockStatuses] = useState<Record<string, any>>({})
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  
  const { data: checklists, isLoading, error, refetch } = useGetAllRmChecklistsQuery()

  // Transform and filter to only show current RM's draft reports
  const draftReports = React.useMemo(() => {
    const allReports = transformChecklistsToReports(checklists || [])
    return allReports
      .filter(report => {
        const status = report.status?.toLowerCase()
        return (report.rmId === user?.id || report.assignedToRM?.id === user?.id) && 
               status === 'draft'
      })
      .sort((a, b) => {
        const dateA = new Date(a.updatedAt || a.createdAt || 0).getTime()
        const dateB = new Date(b.updatedAt || b.createdAt || 0).getTime()
        return dateB - dateA
      })
  }, [checklists, user])

  // Check lock status for reports
  useEffect(() => {
    if (!draftReports.length) return
    
    const checkLocks = async () => {
      const statuses: Record<string, any> = {}
      
      await Promise.all(
        draftReports.slice(0, 20).map(async (report) => {
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
    
    // Set up interval to refresh lock statuses
    const interval = setInterval(checkLocks, 30000) // Every 30 seconds
    
    return () => clearInterval(interval)
  }, [draftReports])

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
    toast.success('Drafts refreshed')
  }

  const handleView = (reportId: string) => {
    sessionStorage.setItem('rmReportsReturnPath', '/rm/drafts')
    navigate(`/rm/checklists/${reportId}`)
  }

  // Filter based on search
  const filteredReports = draftReports.filter(report => {
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
            <h2 className="text-lg font-semibold text-[#1A3636] mb-2">Failed to Load Drafts</h2>
            <p className="text-sm text-[#40534C] mb-4">Unable to fetch drafts. Please try again.</p>
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
              <h1 className="text-xl font-bold text-[#1A3636]">Draft Reports</h1>
              <p className="text-xs lg:text-sm text-[#677D6A] mt-1">{filteredReports.length} draft {filteredReports.length === 1 ? 'report' : 'reports'}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="p-2 text-[#677D6A] hover:text-[#1A3636] hover:bg-[#D6BD98]/10 rounded-lg transition-all"
                title="Refresh drafts"
              >
                <FiRefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={handleCreateNew}
                className="px-4 py-2 bg-gradient-to-r from-[#1A3636] to-[#40534C] text-white rounded-lg flex items-center gap-2 text-sm hover:shadow-lg transition-all"
              >
                <FiPlus className="w-4 h-4" />
                New Report
              </button>
            </div>
          </div>

          <div className="mt-4">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#677D6A] w-4 h-4" />
              <input
                type="text"
                placeholder="Search drafts..."
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
            <div className="grid grid-cols-4 gap-1 px-3 py-2 bg-[#F5F7F4] border-b border-[#D6BD98]/20 text-[9px] font-medium text-[#40534C] uppercase tracking-wider">
              <div className="col-span-1">Report</div>
              <div className="col-span-1">Customer</div>
              <div className="col-span-1">Status</div>
              <div className="col-span-1 text-right">Updated</div>
            </div>
            
            <div 
              ref={scrollContainerRef}
              className="overflow-y-auto max-h-[calc(100vh-280px)] bg-white"
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              {filteredReports.length === 0 ? (
                <div className="p-8 text-center">
                  <FiEye className="w-8 h-8 text-[#D6BD98] mx-auto mb-2" />
                  <p className="text-xs text-[#40534C]">No draft reports found</p>
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
                          <StatusBadge status="draft" />
                        </div>

                        {/* Updated Date */}
                        <div className="col-span-1 text-[8px] text-[#677D6A] whitespace-nowrap text-right">
                          {formatMobileDate(report.updatedAt || report.createdAt)}
                        </div>
                      </div>
                      
                      {/* Show who locked it on hover */}
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
          <div className="border border-[#D6BD98]/20 rounded-lg overflow-hidden bg-white">
            <div className="grid grid-cols-10 gap-2 px-4 py-3 bg-[#F5F7F4] border-b border-[#D6BD98]/20 text-xs font-medium text-[#40534C] uppercase tracking-wider">
              <div className="col-span-2">Report No.</div>
              <div className="col-span-3">Customer</div>
              <div className="col-span-2">Project</div>
              <div className="col-span-2">Updated</div>
              <div className="col-span-1">Status</div>
            </div>

            <div className="divide-y divide-[#D6BD98]/10">
              {filteredReports.length === 0 ? (
                <div className="px-4 py-8 text-center text-[#677D6A]">
                  No draft reports found
                </div>
              ) : (
                filteredReports.map((report) => {
                  const lockStatus = lockStatuses[report.id]
                  const isLockedByOther = lockStatus?.isLocked && lockStatus.lockedBy?.id !== user?.id
                  
                  return (
                    <div
                      key={report.id}
                      onClick={() => !isLockedByOther && handleView(report.id)}
                      className={`grid grid-cols-10 gap-2 px-4 py-3 hover:bg-[#D6BD98]/5 transition-colors cursor-pointer text-sm relative ${
                        isLockedByOther ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      title={isLockedByOther ? `Locked by ${lockStatus.lockedBy?.name}` : ''}
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

                      {/* Updated Date */}
                      <div className="col-span-2 text-[#677D6A] text-xs">
                        {formatNairobiDate(report.updatedAt || report.createdAt)}
                      </div>

                      {/* Status */}
                      <div className="col-span-1">
                        <StatusBadge status="draft" />
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

export default DraftsPage