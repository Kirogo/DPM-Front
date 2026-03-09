// src/pages/qs/QSReportsPage.tsx
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
// CHANGE THIS LINE - useGetAllRmChecklistsQuery instead of useGetAllChecklistsQuery
import { useGetAllRmChecklistsQuery } from '@/services/api/checklistsApi'
import { transformChecklistsToReports } from '@/utils/checklistTransform'
import { Button } from '@/components/common/Button'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { FiSearch, FiFilter, FiChevronRight, FiEye } from 'react-icons/fi'
import { SiteVisitReport } from '@/types/report.types'

export const QSReportsPage: React.FC = () => {
  const navigate = useNavigate()
  // FIXED: useGetAllRmChecklistsQuery instead of useGetAllChecklistsQuery
  const { data: checklists = [], isLoading } = useGetAllRmChecklistsQuery()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const reports = React.useMemo(() => {
    return transformChecklistsToReports(checklists)
  }, [checklists])

  const filteredReports = reports.filter(report => {
    const matchesSearch = searchTerm === '' || 
      report.reportNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.projectName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.rmName?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'all' || report.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pendingqsreview':
      case 'pending_qs_review':
      case 'submitted':
        return <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-[8px] font-medium rounded-full">Pending Review</span>
      case 'underreview':
      case 'inreview':
        return <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[8px] font-medium rounded-full">In Review</span>
      case 'approved':
        return <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 text-[8px] font-medium rounded-full">Approved</span>
      case 'revisionrequested':
      case 'revision_requested':
        return <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-[8px] font-medium rounded-full">Revision Needed</span>
      default:
        return <span className="px-1.5 py-0.5 bg-gray-100 text-gray-700 text-[8px] font-medium rounded-full">{status}</span>
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F7F4]">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-[#F5F7F4] border-b border-[#D6BD98]/20 px-4 py-2 lg:px-6 lg:py-3">
        <div>
          <h1 className="text-xs lg:text-sm font-semibold text-[#1A3636]">
            All Reports
          </h1>
          <p className="text-[8px] lg:text-xs text-[#677D6A] mt-0.5">
            View and filter all submitted reports
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mt-2 space-y-2">
          <div className="relative">
            <FiSearch className="absolute left-2 top-1/2 transform -translate-y-1/2 text-[#677D6A] w-3 h-3 lg:w-4 lg:h-4" />
            <input
              type="text"
              placeholder="Search reports..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-7 lg:pl-10 pr-2 py-1.5 lg:py-2 text-[10px] lg:text-sm bg-white border border-[#D6BD98]/20 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1A3636]/20"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex-1 px-2 py-1.5 lg:px-3 lg:py-2 text-[9px] lg:text-xs bg-white border border-[#D6BD98]/20 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1A3636]/20"
            >
              <option value="all">All Status</option>
              <option value="pendingqsreview">Pending Review</option>
              <option value="underreview">In Review</option>
              <option value="approved">Approved</option>
              <option value="revisionrequested">Revision Needed</option>
            </select>
            <Button variant="outline" size="sm" className="h-7 lg:h-9 text-[9px] lg:text-xs">
              <FiFilter className="w-2.5 h-2.5 lg:w-3.5 lg:h-3.5 mr-1" />
              Filter
            </Button>
          </div>
        </div>

        {/* Results count */}
        <p className="text-[8px] lg:text-xs text-[#677D6A] mt-2">
          {filteredReports.length} report{filteredReports.length !== 1 ? 's' : ''} found
        </p>
      </div>

      {/* Reports List */}
      <div className="px-4 lg:px-6 py-3">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" label="Loading reports..." />
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#D6BD98]/10 mb-3">
              <FiEye className="w-5 h-5 text-[#677D6A]" />
            </div>
            <p className="text-xs text-[#677D6A]">
              No reports found
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="mt-2 text-[10px] text-[#1A3636] hover:underline"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredReports.map((report) => (
              <div
                key={report.id}
                onClick={() => navigate(`/qs/reviews/${report.id}`)}
                className="bg-white border border-[#D6BD98]/20 rounded-lg p-3 hover:shadow-sm transition-shadow cursor-pointer"
              >
                {/* Mobile Layout */}
                <div className="block lg:hidden">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-1 mb-1">
                        <span className="text-[10px] font-medium text-[#1A3636]">
                          {report.reportNo || `CRN-${report.id.slice(0,8)}`}
                        </span>
                        {getStatusBadge(report.status || '')}
                      </div>
                      <p className="text-[9px] text-[#677D6A]">
                        {report.customerName || report.projectName || 'Untitled'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[7px] text-[#677D6A]">
                        RM: {report.rmName || 'Unassigned'}
                      </span>
                      <span className="text-[7px] text-[#677D6A]">
                        {new Date(report.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <FiChevronRight className="w-3 h-3 text-[#677D6A]" />
                  </div>
                </div>

                {/* Desktop Layout */}
                <div className="hidden lg:grid lg:grid-cols-12 lg:gap-4 lg:items-center">
                  <div className="col-span-3">
                    <span className="text-sm font-medium text-[#1A3636]">
                      {report.reportNo || `CRN-${report.id.slice(0,8)}`}
                    </span>
                  </div>
                  <div className="col-span-3">
                    <p className="text-sm text-[#1A3636] truncate">
                      {report.customerName || report.projectName || 'Untitled'}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-[#677D6A]">{report.rmName || 'Unassigned'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-[#677D6A]">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="col-span-2 flex items-center justify-between">
                    {getStatusBadge(report.status || '')}
                    <FiChevronRight className="w-4 h-4 text-[#677D6A]" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default QSReportsPage