// src/pages/rm/TestReportsPage.tsx
import React, { useMemo, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useGetAllRmChecklistsQuery } from '@/services/api/checklistsApi'
import { Checklist } from '@/types/checklist.types'
import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'
import { 
  FiPlus, 
  FiFileText, 
  FiClock, 
  FiCheckCircle, 
  FiRefreshCw, 
  FiSearch, 
  FiFilter, 
  FiX, 
  FiChevronLeft, 
  FiChevronRight,
  FiEye,
  FiEyeOff,
  FiTable
} from 'react-icons/fi'

export const TestReportsPage: React.FC = () => {
  const navigate = useNavigate()
  const [showTestTable, setShowTestTable] = useState(false)
  const { data: checklists = [], isLoading, error } = useGetAllRmChecklistsQuery()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  useEffect(() => {
    if (error) {
      toast.error('Failed to load checklists')
    }
  }, [error])

  // Get status badge color and label
  const getStatusInfo = (status: string = 'pending') => {
    const statusLower = status.toLowerCase()
    
    const statusMap: Record<string, { label: string; color: string; bgColor: string; icon: React.ElementType }> = {
      draft: { 
        label: 'Draft', 
        color: 'text-[#40534C]', 
        bgColor: 'bg-[#D6BD98]/20',
        icon: FiFileText
      },
      pending: { 
        label: 'Pending', 
        color: 'text-[#677D6A]', 
        bgColor: 'bg-[#677D6A]/10',
        icon: FiClock
      },
      pending_qs_review: { 
        label: 'Pending Review', 
        color: 'text-[#1A3636]', 
        bgColor: 'bg-[#D6BD98]/30',
        icon: FiRefreshCw
      },
      pendingqsreview: { 
        label: 'Pending Review', 
        color: 'text-[#1A3636]', 
        bgColor: 'bg-[#D6BD98]/30',
        icon: FiRefreshCw
      },
      submitted: { 
        label: 'Submitted', 
        color: 'text-[#677D6A]', 
        bgColor: 'bg-[#677D6A]/10',
        icon: FiCheckCircle
      },
      approved: { 
        label: 'Approved', 
        color: 'text-white', 
        bgColor: 'bg-[#677D6A]',
        icon: FiCheckCircle
      },
      co_creator_review: { 
        label: 'Co-Creator Review', 
        color: 'text-[#1A3636]', 
        bgColor: 'bg-[#D6BD98]/40',
        icon: FiRefreshCw
      },
      default: { 
        label: status || 'Pending', 
        color: 'text-[#40534C]', 
        bgColor: 'bg-[#D6BD98]/20',
        icon: FiClock
      }
    }
    
    return statusMap[statusLower] || statusMap.default
  }

  const filteredChecklists = useMemo(() => {
    let filtered = checklists

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(checklist => 
        (checklist.status || '').toLowerCase() === statusFilter.toLowerCase()
      )
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(checklist => 
        (checklist.callReportNo?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (checklist.dclNo?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (checklist.customerName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (checklist.customerNumber?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (checklist.ibpsNo?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (checklist.projectName?.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    return filtered
  }, [checklists, statusFilter, searchTerm])

  // Pagination
  const totalPages = Math.ceil(filteredChecklists.length / pageSize)
  const paginatedChecklists = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    const end = start + pageSize
    return filteredChecklists.slice(start, end)
  }, [filteredChecklists, currentPage, pageSize])

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, statusFilter])

  // Get unique statuses for filter dropdown
  const uniqueStatuses = useMemo(() => {
    const statuses = checklists.map(c => c.status || 'pending').map(s => s.toLowerCase())
    return ['all', ...new Set(statuses)]
  }, [checklists])

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const handleReportClick = (reportId: string) => {
    navigate(`/rm/test-reports/${reportId}`)
  }

  return (
    <div className="min-h-screen bg-[#F5F7F4] p-4 sm:p-6">
      {/* Header with Toggle Switch */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1A3636]">Test Reports Page</h1>
          <p className="text-sm text-[#677D6A] mt-1">Testing the step-by-step interface</p>
        </div>
        
        {/* Toggle Switch */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-[#677D6A]">Show Test Table</span>
          <button
            onClick={() => setShowTestTable(!showTestTable)}
            className={`
              relative inline-flex h-6 w-11 items-center rounded-full transition-colors
              ${showTestTable ? 'bg-[#1A3636]' : 'bg-[#D6BD98]/30'}
            `}
          >
            <span
              className={`
                inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                ${showTestTable ? 'translate-x-6' : 'translate-x-1'}
              `}
            />
          </button>
          {showTestTable ? (
            <FiEye className="w-5 h-5 text-[#1A3636]" />
          ) : (
            <FiEyeOff className="w-5 h-5 text-[#677D6A]" />
          )}
        </div>
      </div>

      {/* Original Table (Always Visible) */}
      <Card className="mb-8 border border-[#D6BD98]/20">
        <div className="p-4 border-b border-[#D6BD98]/20 bg-[#F5F7F4]">
          <h2 className="text-lg font-semibold text-[#1A3636]">Original Reports</h2>
        </div>
        <div className="p-4">
          <p className="text-sm text-[#677D6A]">Your original reports appear here</p>
          {/* Add your original table content here if needed */}
        </div>
      </Card>

      {/* Test Table (Toggleable) */}
      {showTestTable && (
        <Card className="border border-[#D6BD98]/20">
          <div className="p-4 border-b border-[#D6BD98]/20 bg-[#F5F7F4] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FiTable className="w-5 h-5 text-[#1A3636]" />
              <h2 className="text-lg font-semibold text-[#1A3636]">Test Reports Table</h2>
            </div>
            <span className="text-xs bg-[#1A3636] text-white px-2 py-1 rounded-full">
              Test Mode
            </span>
          </div>

          {/* Search and Filter */}
          <div className="p-4 border-b border-[#D6BD98]/20">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#677D6A]" />
                <input
                  type="text"
                  placeholder="Search test reports..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm border border-[#D6BD98]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#677D6A]"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-sm border border-[#D6BD98]/20 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#677D6A]"
              >
                {uniqueStatuses.map(status => (
                  <option key={status} value={status}>
                    {status === 'all' ? 'All Statuses' : status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#F5F7F4] border-b border-[#D6BD98]/20">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#1A3636] uppercase">Report No</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#1A3636] uppercase">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#1A3636] uppercase">Project</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#1A3636] uppercase">Last Updated</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#1A3636] uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-[#1A3636] uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D6BD98]/10">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1A3636]"></div>
                      </div>
                    </td>
                  </tr>
                ) : paginatedChecklists.length > 0 ? (
                  paginatedChecklists.map((checklist) => {
                    const statusInfo = getStatusInfo(checklist.status)
                    const StatusIcon = statusInfo.icon
                    const displayValue = (checklist.callReportNo || checklist.dclNo || '-').replace(/^DCL-/i, 'CRN-')
                    
                    return (
                      <tr key={checklist._id} className="hover:bg-[#D6BD98]/5">
                        <td className="px-4 py-3">
                          <span className="text-sm font-medium text-[#1A3636]">{displayValue}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-[#40534C]">{checklist.customerName || '-'}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-[#40534C]">{checklist.projectName || checklist.loanType || '-'}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs text-[#677D6A]">{formatDate(checklist.updatedAt || checklist.createdAt)}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs ${statusInfo.bgColor} ${statusInfo.color}`}>
                            <StatusIcon className="w-3 h-3" />
                            {statusInfo.label}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleReportClick(checklist._id)}
                            className="px-3 py-1 bg-gradient-to-r from-[#1A3636] to-[#40534C] text-white rounded-lg text-xs hover:shadow-md transition-shadow"
                          >
                            Test Step View
                          </button>
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-sm text-[#677D6A]">
                      No test reports found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredChecklists.length > 0 && (
            <div className="px-4 py-3 border-t border-[#D6BD98]/20 bg-[#F5F7F4] flex items-center justify-between">
              <span className="text-xs text-[#677D6A]">
                Showing {Math.min((currentPage - 1) * pageSize + 1, filteredChecklists.length)} to{' '}
                {Math.min(currentPage * pageSize, filteredChecklists.length)} of{' '}
                {filteredChecklists.length} reports
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1 rounded border border-[#D6BD98]/20 text-[#40534C] hover:bg-[#D6BD98]/10 disabled:opacity-50"
                >
                  <FiChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs text-[#1A3636]">
                  Page {currentPage} of {totalPages || 1}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="p-1 rounded border border-[#D6BD98]/20 text-[#40534C] hover:bg-[#D6BD98]/10 disabled:opacity-50"
                >
                  <FiChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  )
}

export default TestReportsPage