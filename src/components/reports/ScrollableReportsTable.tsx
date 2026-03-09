// src/components/reports/ScrollableReportsTable.tsx
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { SiteVisitReport } from '@/types/report.types'
import { FiClock, FiCheckCircle, FiAlertCircle, FiEye, FiLock, FiUser } from 'react-icons/fi'

interface ScrollableReportsTableProps {
  reports: SiteVisitReport[]
  onRowClick?: (report: SiteVisitReport) => void
  showLockStatus?: boolean
  maxHeight?: string
}

// Helper function to get value with case-insensitive access
const getValue = (obj: any, key: string): string => {
  if (!obj) return '—'
  if (obj[key] !== undefined && obj[key] !== null && obj[key] !== '') return obj[key]
  const pascalKey = key.charAt(0).toUpperCase() + key.slice(1)
  if (obj[pascalKey] !== undefined && obj[pascalKey] !== null && obj[pascalKey] !== '') return obj[pascalKey]
  return '—'
}

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
    <span className={`${config.bgColor} ${config.color} px-2 py-1 rounded-full text-[9px] font-medium whitespace-nowrap`}>
      {config.label}
    </span>
  )
}

const formatDate = (dateString?: string) => {
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

export const ScrollableReportsTable: React.FC<ScrollableReportsTableProps> = ({
  reports,
  onRowClick,
  showLockStatus = false,
  maxHeight = 'calc(100vh - 250px)'
}) => {
  const navigate = useNavigate()

  const handleClick = (report: SiteVisitReport) => {
    if (onRowClick) {
      onRowClick(report)
    } else if (report.id) {
      navigate(`/rm/checklists/${report.id}`)
    }
  }

  if (reports.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-12 h-12 rounded-full bg-[#D6BD98]/10 flex items-center justify-center mb-3">
          <FiEye className="w-5 h-5 text-[#677D6A]" />
        </div>
        <p className="text-sm text-[#40534C]">No reports found</p>
      </div>
    )
  }

  return (
    <div 
      className="overflow-y-auto border border-[#D6BD98]/20 rounded-lg bg-white"
      style={{ maxHeight }}
    >
      {/* Table Header - Sticky */}
      <div className="sticky top-0 z-10 grid grid-cols-12 gap-2 px-4 py-2 bg-[#F5F7F4] border-b border-[#D6BD98]/20 text-[9px] font-medium text-[#40534C] uppercase tracking-wider">
        <div className="col-span-2">Report No.</div>
        <div className="col-span-3">Customer</div>
        <div className="col-span-2">Project</div>
        <div className="col-span-2">RM</div>
        <div className="col-span-2">Updated</div>
        <div className="col-span-1">Status</div>
      </div>

      {/* Scrollable Rows */}
      <div className="divide-y divide-[#D6BD98]/10">
        {reports.map((report) => {
          const isRework = report.status === 'rework' || report.status === 'returned' || report.status === 'revision_requested'
          
          return (
            <div
              key={report.id}
              onClick={() => handleClick(report)}
              className="grid grid-cols-12 gap-2 px-4 py-2.5 hover:bg-[#D6BD98]/5 transition-colors cursor-pointer text-[11px] group"
            >
              {/* Report No. with lock indicator */}
              <div className="col-span-2 font-medium text-[#1A3636] flex items-center gap-1 truncate">
                {showLockStatus && report.isLocked && (
                  <FiLock className="w-2.5 h-2.5 text-amber-500 flex-shrink-0" />
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
                <FiUser className="w-2.5 h-2.5 flex-shrink-0" />
                <span className="truncate">{report.rmName || report.assignedToRM?.name || '—'}</span>
              </div>

              {/* Updated Date */}
              <div className="col-span-2 text-[#677D6A] text-[10px]">
                {formatDate(report.updatedAt || report.createdAt)}
              </div>

              {/* Status */}
              <div className="col-span-1">
                <StatusBadge status={report.status || 'pending'} />
              </div>

              {/* Hover indicator */}
              <div className="absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <FiEye className="w-3 h-3 text-[#677D6A]" />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}