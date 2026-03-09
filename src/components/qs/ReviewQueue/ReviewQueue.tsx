// src/components/qs/ReviewQueue/ReviewQueue.tsx
import React from 'react'
import { SiteVisitReport } from '@/types/report.types'
import { FiClock, FiUser, FiCalendar, FiChevronRight } from 'react-icons/fi'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'

interface ReviewQueueProps {
  reports: SiteVisitReport[]
  onAssign: (reportId: string) => void
  onView: (reportId: string) => void
  isLoading?: boolean
}

export const ReviewQueue: React.FC<ReviewQueueProps> = ({
  reports,
  onAssign,
  onView,
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner size="sm" label="Loading reviews..." />
      </div>
    )
  }

  if (reports.length === 0) {
    return (
      <div className="px-3 py-8 text-center">
        <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#D6BD98]/10 mb-2">
          <FiClock className="w-4 h-4 text-[#677D6A]" />
        </div>
        <p className="text-[10px] text-[#677D6A]">
          No pending reviews
        </p>
        <p className="text-[8px] text-[#677D6A] mt-1">
          All caught up! New reports will appear here
        </p>
      </div>
    )
  }

  const getPriorityColor = (priority?: string) => {
    switch (priority?.toLowerCase()) {
      case 'critical':
      case 'high':
        return 'text-red-600 bg-red-50'
      case 'medium':
        return 'text-amber-600 bg-amber-50'
      default:
        return 'text-emerald-600 bg-emerald-50'
    }
  }

  const getTimeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    if (hours < 1) return 'Just now'
    if (hours < 24) return `${hours}h ago`
    return `${Math.floor(hours / 24)}d ago`
  }

  return (
    <div className="divide-y divide-[#D6BD98]/10">
      {reports.map((report) => (
        <div 
          key={report.id}
          className="px-3 py-2 hover:bg-[#F5F7F4] transition-colors group"
        >
          {/* Mobile Layout (stacked) */}
          <div className="block sm:hidden">
            <div className="flex items-start justify-between mb-1">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 mb-0.5">
                  <span className="text-[9px] font-medium text-[#1A3636] truncate">
                    {report.reportNo || `CRN-${report.id.slice(0,8)}`}
                  </span>
                  {report.priority && (
                    <span className={`px-1 py-0.5 rounded-full text-[6px] font-medium ${getPriorityColor(report.priority)}`}>
                      {report.priority}
                    </span>
                  )}
                </div>
                <p className="text-[8px] text-[#677D6A] truncate mb-1">
                  {report.customerName || report.projectName || 'Untitled'}
                </p>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <FiUser className="w-2.5 h-2.5 text-[#677D6A]" />
                    <span className="text-[7px] text-[#677D6A]">
                      {report.rmName || 'Unassigned'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FiCalendar className="w-2.5 h-2.5 text-[#677D6A]" />
                    <span className="text-[7px] text-[#677D6A]">
                      {getTimeAgo(report.submittedAt || report.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => onAssign(report.id)}
                className="px-2 py-1 text-[8px] font-medium text-[#1A3636] bg-[#D6BD98]/10 rounded hover:bg-[#D6BD98]/20 transition-colors"
              >
                Assign
              </button>
            </div>
          </div>

          {/* Desktop Layout (grid) */}
          <div className="hidden sm:grid sm:grid-cols-12 sm:gap-2 sm:items-center">
            {/* Report Info - col-span-4 */}
            <div className="col-span-4">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-medium text-[#1A3636]">
                  {report.reportNo || `CRN-${report.id.slice(0,8)}`}
                </span>
                {report.priority && (
                  <span className={`px-1.5 py-0.5 rounded-full text-[7px] font-medium ${getPriorityColor(report.priority)}`}>
                    {report.priority}
                  </span>
                )}
              </div>
              <p className="text-[9px] text-[#677D6A] truncate mt-0.5">
                {report.customerName || report.projectName || 'Untitled'}
              </p>
            </div>

            {/* RM - col-span-3 */}
            <div className="col-span-3 flex items-center gap-1">
              <FiUser className="w-3 h-3 text-[#677D6A] flex-shrink-0" />
              <span className="text-[9px] text-[#677D6A] truncate">
                {report.rmName || 'Unassigned'}
              </span>
            </div>

            {/* Submitted - col-span-2 */}
            <div className="col-span-2 flex items-center gap-1">
              <FiCalendar className="w-3 h-3 text-[#677D6A] flex-shrink-0" />
              <span className="text-[9px] text-[#677D6A]">
                {getTimeAgo(report.submittedAt || report.createdAt)}
              </span>
            </div>

            {/* Actions - col-span-3 */}
            <div className="col-span-3 flex items-center justify-end gap-1">
              <button
                onClick={() => onAssign(report.id)}
                className="px-2 py-1 text-[8px] font-medium text-[#1A3636] bg-[#D6BD98]/10 rounded hover:bg-[#D6BD98]/20 transition-colors"
              >
                Assign to me
              </button>
              <button
                onClick={() => onView(report.id)}
                className="p-1 text-[#677D6A] hover:text-[#1A3636] transition-colors"
              >
                <FiChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      ))}

      {reports.length > 5 && (
        <div className="px-3 py-2 border-t border-[#D6BD98]/10">
          <button 
            onClick={() => onView('all')}
            className="w-full text-center text-[8px] text-[#1A3636] hover:text-[#40534C] transition-colors"
          >
            View all {reports.length} pending reviews
          </button>
        </div>
      )}
    </div>
  )
}