// src/pages/rm/RMChecklistPage.tsx
import React, { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Card } from '@/components/common/Card'
import { useGetAllRmChecklistsQuery } from '@/services/api/checklistsApi'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { RMChecklistCreator } from './RMChecklistCreator'
import { formatNairobiDate } from '@/utils/dateUtils'
import {
  FileText,
  Plus,
  Search,
  RefreshCw,
  XCircle,
  User,
  Briefcase,
  CreditCard,
  Hash,
  Calendar
} from 'lucide-react'

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
    pending_qs_review: { label: 'QS Review', color: 'text-[#1A3636]', bgColor: 'bg-[#D6BD98]/30' },
    pendingqsreview: { label: 'QS Review', color: 'text-[#1A3636]', bgColor: 'bg-[#D6BD98]/30' },
    revision_requested: { label: 'Rework', color: 'text-orange-700', bgColor: 'bg-orange-100' },
    returned: { label: 'Rework', color: 'text-orange-700', bgColor: 'bg-orange-100' },
    completed: { label: 'Approved', color: 'text-white', bgColor: 'bg-[#677D6A]' },
  }

  const config = statusConfig[statusLower] || statusConfig.pending

  return (
    <span className={`${config.bgColor} ${config.color} px-1.5 py-0.5 rounded-full text-[7px] lg:text-[9px] font-medium whitespace-nowrap`}>
      {config.label}
    </span>
  )
}

// Format date for mobile - REDUCED SIZE
const formatMobileDate = (dateString?: string) => {
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

// Helper function to get value from object with case-insensitive property access
const getValue = (obj: any, key: string): string => {
  if (!obj) return '—'
  
  if (obj[key] !== undefined && obj[key] !== null) return obj[key]
  
  const pascalKey = key.charAt(0).toUpperCase() + key.slice(1)
  if (obj[pascalKey] !== undefined && obj[pascalKey] !== null) return obj[pascalKey]
  
  const upperKey = key.toUpperCase()
  if (obj[upperKey] !== undefined && obj[upperKey] !== null) return obj[upperKey]
  
  return '—'
}

// Get page title based on status filter
const getPageTitle = (statusFilter: string | null): string => {
  switch (statusFilter) {
    case 'draft':
      return 'Draft Reports'
    case 'pending':
      return 'Pending Reports'
    case 'submitted':
      return 'QS Review'
    case 'rework':
      return 'Rework Required'
    case 'approved':
      return 'Approved Reports'
    case 'rejected':
      return 'Rejected Reports'
    case 'pending_qs_review':
      return 'QS Review'
    case 'returned':
      return 'Rework Required'
    case 'completed':
      return 'Approved Reports'
    default:
      return 'All Reports'
  }
}

// Get status description
const getStatusDescription = (statusFilter: string | null, count: number): string => {
  if (count === 0) {
    switch (statusFilter) {
      case 'draft': return 'No draft reports'
      case 'pending': return 'No pending reports'
      case 'submitted': return 'No reports pending QS review'
      case 'rework': return 'No reports needing rework'
      case 'approved': return 'No approved reports'
      case 'rejected': return 'No rejected reports'
      default: return 'No reports found'
    }
  }
  
  const reportText = count === 1 ? 'report' : 'reports'
  
  switch (statusFilter) {
    case 'draft':
      return `${count} draft ${reportText}`
    case 'pending':
      return `${count} pending ${reportText}`
    case 'submitted':
      return `${count} ${reportText} pending QS review`
    case 'rework':
      return `${count} ${reportText} marked for rework`
    case 'approved':
      return `${count} approved ${reportText}`
    case 'rejected':
      return `${count} rejected ${reportText}`
    default:
      return `${count} ${reportText} found`
  }
}

// Function to check if a report should be read-only
const isReadOnlyStatus = (status: string): boolean => {
  const lowerStatus = status?.toLowerCase()
  return lowerStatus === 'submitted' || 
         lowerStatus === 'approved' || 
         lowerStatus === 'pending_qs_review' || 
         lowerStatus === 'pendingqsreview' ||
         lowerStatus === 'completed'
}

export const RMChecklistPage: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const isMobile = useMediaQuery('(max-width: 768px)')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isCreatorOpen, setIsCreatorOpen] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  
  const queryParams = new URLSearchParams(location.search)
  const urlStatus = queryParams.get('status')
  
  const { data: checklists, isLoading, error, refetch } = useGetAllRmChecklistsQuery()

  useEffect(() => {
    if (urlStatus) {
      setStatusFilter(urlStatus)
    } else {
      setStatusFilter('all')
    }
  }, [urlStatus])

  const handleCreateNew = () => {
    setIsCreatorOpen(true)
  }

  const handleView = (id: string, status: string) => {
    sessionStorage.setItem('rmReportsReturnPath', location.pathname + location.search)
    
    const normalizedStatus = status?.toLowerCase()
    
    if (isReadOnlyStatus(normalizedStatus)) {
      navigate(`/rm/reports/${id}/view`)
    } else {
      navigate(`/rm/checklists/${id}`)
    }
  }

  const handleRetry = () => {
    refetch()
  }

  const handleCloseCreator = () => {
    setIsCreatorOpen(false)
  }

  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value
    setStatusFilter(newStatus)
    
    if (newStatus === 'all') {
      navigate('/rm/checklists')
    } else {
      navigate(`/rm/checklists?status=${newStatus}`)
    }
  }

  const mapStatusForFilter = (status: string): string => {
    const lowerStatus = status.toLowerCase()
    if (['pending_qs_review', 'pendingqsreview'].includes(lowerStatus)) return 'submitted'
    if (['revision_requested', 'returned'].includes(lowerStatus)) return 'rework'
    if (lowerStatus === 'completed') return 'approved'
    return lowerStatus
  }

  const filteredChecklists = checklists?.filter(checklist => {
    if (urlStatus && urlStatus !== 'all') {
      const checklistStatus = mapStatusForFilter(checklist.status || '')
      if (checklistStatus !== urlStatus) {
        return false
      }
    }
    
    const reportNo = getValue(checklist, 'callReportNo') || getValue(checklist, 'dclNo')
    const customerName = getValue(checklist, 'customerName')
    const projectName = getValue(checklist, 'projectName')
    const customerNumber = getValue(checklist, 'customerNumber')
    const ibpsNo = getValue(checklist, 'ibpsNo')
    
    const matchesSearch = searchTerm === '' || 
      reportNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customerNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ibpsNo.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesSearch
  })

  const pageTitle = getPageTitle(urlStatus)
  const statusDescription = getStatusDescription(urlStatus, filteredChecklists?.length || 0)

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
            <XCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
            <h2 className="text-sm font-semibold text-[#1A3636] mb-1">Failed to Load Reports</h2>
            <p className="text-xs text-[#40534C] mb-4">Unable to fetch reports. Please try again.</p>
            <button
              onClick={handleRetry}
              className="px-3 py-1.5 bg-[#1A3636] text-white rounded text-xs flex items-center gap-1 mx-auto"
            >
              <RefreshCw className="w-3 h-3" />
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
              <h1 className="text-lg font-bold text-[#1A3636]">{pageTitle}</h1>
              <p className="text-[10px] lg:text-xs text-[#677D6A] mt-0.5">{statusDescription}</p>
            </div>
            <button
              onClick={handleCreateNew}
              className="px-3 py-1.5 bg-gradient-to-r from-[#1A3636] to-[#40534C] text-white rounded-lg flex items-center gap-1.5 text-xs hover:shadow-lg transition-all w-full sm:w-auto justify-center h-8"
            >
              <Plus className="w-3.5 h-3.5" />
              New Report
            </button>
          </div>

          {/* Filters - REDUCED SIZE */}
          <div className="mt-3 flex flex-col sm:flex-row gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-[#677D6A]" />
              <input
                type="text"
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 border border-[#D6BD98]/30 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#677D6A]/20 focus:border-[#677D6A]"
              />
            </div>
            <select
              value={statusFilter}
              onChange={handleStatusFilterChange}
              className="px-2 py-1.5 border border-[#D6BD98]/30 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#677D6A]/20 focus:border-[#677D6A] bg-white"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="pending">Pending</option>
              <option value="submitted">QS Review</option>
              <option value="rework">Rework</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table - MongoDB Atlas Style with ADDED COLUMNS */}
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
              className="overflow-y-auto max-h-[calc(100vh-280px)] bg-white"
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              {filteredChecklists?.map((checklist) => {
                const reportNo = getValue(checklist, 'callReportNo') || getValue(checklist, 'dclNo') || '—'
                const formattedReportNo = reportNo.replace(/^DCL-/i, 'CRN-')
                const customerName = getValue(checklist, 'customerName')
                const customerNumber = getValue(checklist, 'customerNumber')
                const projectName = getValue(checklist, 'projectName')
                const ibpsNo = getValue(checklist, 'ibpsNo')
                const status = getValue(checklist, 'status') || 'pending'
                
                return (
                  <div
                    key={checklist._id}
                    onClick={() => handleView(checklist._id, status)}
                    className="p-2 border-b border-[#D6BD98]/10 last:border-0 hover:bg-[#D6BD98]/5 transition-colors cursor-pointer active:bg-[#D6BD98]/10"
                  >
                    <div className="grid grid-cols-4 gap-1 text-[9px] items-center">
                      <div className="col-span-1 font-bold text-[#1A3636] truncate">
                        {formattedReportNo}
                      </div>
                      <div className="col-span-1 text-[#40534C] truncate text-[8px]">
                        {customerName}
                        {customerNumber && <span className="block text-[6px] text-[#677D6A]">#{customerNumber}</span>}
                      </div>
                      <div className="col-span-1">
                        <StatusBadge status={status} />
                      </div>
                      <div className="col-span-1 text-[8px] text-[#677D6A] whitespace-nowrap text-right">
                        {formatMobileDate(getValue(checklist, 'updatedAt') || getValue(checklist, 'createdAt'))}
                      </div>
                    </div>

                    {/* Additional info row for mobile */}
                    {(projectName || ibpsNo) && (
                      <div className="mt-1 flex items-center gap-2 text-[6px] text-[#677D6A]">
                        {projectName && (
                          <span className="flex items-center gap-0.5 truncate">
                            <Briefcase className="w-2 h-2" /> {projectName}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
              {(!filteredChecklists || filteredChecklists.length === 0) && (
                <div className="p-6 text-center">
                  <FileText className="w-6 h-6 text-[#D6BD98] mx-auto mb-1" />
                  <p className="text-[9px] text-[#40534C]">No reports found</p>
                  <button
                    onClick={handleCreateNew}
                    className="mt-2 px-2 py-1 bg-gradient-to-r from-[#1A3636] to-[#40534C] text-white rounded text-[8px] inline-flex items-center gap-1"
                  >
                    <Plus className="w-2.5 h-2.5" />
                    Create First Report
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Desktop: Clean table with ADDED COLUMNS - Customer No, IBPS No, Project, RM */
          <div className="border border-[#D6BD98]/20 rounded-lg overflow-hidden bg-white">
            <div className="grid grid-cols-12 gap-1 px-3 py-2 bg-[#F5F7F4] border-b border-[#D6BD98]/20 text-[9px] font-bold text-[#40534C] uppercase tracking-wider">
              <div className="col-span-1">Report</div>
              <div className="col-span-2">Customer</div>
              <div className="col-span-1">Cus No</div>
              <div className="col-span-1">IBPS No</div>
              <div className="col-span-2">Project</div>
              <div className="col-span-2">RM</div>
              <div className="col-span-1">Updated</div>
              <div className="col-span-1">Status</div>
            </div>

            <div className="divide-y divide-[#D6BD98]/10">
              {filteredChecklists?.map((checklist) => {
                const reportNo = getValue(checklist, 'callReportNo') || getValue(checklist, 'dclNo') || '—'
                const formattedReportNo = reportNo.replace(/^DCL-/i, 'CRN-')
                const customerName = getValue(checklist, 'customerName')
                const customerNumber = getValue(checklist, 'customerNumber')
                const projectName = getValue(checklist, 'projectName')
                const ibpsNo = getValue(checklist, 'ibpsNo')
                const rmName = getValue(checklist, 'rmName') || getValue(checklist, 'assignedToRM') || '—'
                const status = getValue(checklist, 'status') || 'pending'
                
                return (
                  <div
                    key={checklist._id}
                    onClick={() => handleView(checklist._id, status)}
                    className="grid grid-cols-12 gap-1 px-3 py-2 hover:bg-[#D6BD98]/5 transition-colors cursor-pointer text-xs"
                  >
                    <div className="col-span-1 text-[#1A3636] truncate text-[11px]">
                      {formattedReportNo}
                    </div>

                    <div className="col-span-2 text-[#40534C] truncate text-[11px]">
                      {customerName}
                    </div>

                    <div className="col-span-1 text-[#677D6A] truncate text-[10px]">
                      {customerNumber}
                    </div>

                    <div className="col-span-1 text-[#677D6A] truncate text-[10px]">
                      {ibpsNo}
                    </div>

                    <div className="col-span-2 text-[#40534C] truncate text-[10px]">
                      {projectName}
                    </div>

                    <div className="col-span-2 text-[#677D6A] truncate text-[10px] flex items-center gap-1">
                      <User className="w-2.5 h-2.5 flex-shrink-0" />
                      <span className="truncate">{rmName}</span>
                    </div>

                    <div className="col-span-1 text-[#677D6A] text-[9px] flex items-center gap-1">
                      <Calendar className="w-2.5 h-2.5 flex-shrink-0" />
                      {formatNairobiDate(getValue(checklist, 'updatedAt') || getValue(checklist, 'createdAt'))}
                    </div>

                    <div className="col-span-1">
                      <StatusBadge status={status} />
                    </div>
                  </div>
                )
              })}
              {(!filteredChecklists || filteredChecklists.length === 0) && (
                <div className="px-4 py-6 text-center text-[#677D6A] text-xs">
                  <FileText className="w-8 h-8 text-[#D6BD98] mx-auto mb-2" />
                  <p>No reports found</p>
                  <button
                    onClick={handleCreateNew}
                    className="mt-3 px-3 py-1.5 bg-gradient-to-r from-[#1A3636] to-[#40534C] text-white rounded-lg text-xs inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-3 h-3" />
                    Create First Report
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default RMChecklistPage