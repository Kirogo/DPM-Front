import React from 'react'
import { ReportStatus } from '@/types/report.types'

interface ReportStatusBadgeProps {
  status: ReportStatus
  size?: 'sm' | 'md'
  showIcon?: boolean
}

export const ReportStatusBadge: React.FC<ReportStatusBadgeProps> = ({
  status,
  size = 'md',
  showIcon = true,
}) => {
  const statusConfig: Record<ReportStatus, { label: string; color: string; icon: JSX.Element }> = {
    draft: {
      label: 'Draft',
      color: 'bg-secondary-100 text-secondary-800',
      icon: (
        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
    },
    pending_qs_review: {
      label: 'Pending Review',
      color: 'bg-warning/10 text-warning',
      icon: (
        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    under_review: {
      label: 'Under Review',
      color: 'bg-info/10 text-info',
      icon: (
        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ),
    },
    revision_requested: {
      label: 'Revision Needed',
      color: 'bg-error/10 text-error',
      icon: (
        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
    },
    site_visit_scheduled: {
      label: 'Site Visit Scheduled',
      color: 'bg-purple-100 text-purple-800',
      icon: (
        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    approved: {
      label: 'Approved',
      color: 'bg-success/10 text-success',
      icon: (
        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    rejected: {
      label: 'Rejected',
      color: 'bg-error/10 text-error',
      icon: (
        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    archived: {
      label: 'Archived',
      color: 'bg-secondary-100 text-secondary-800',
      icon: (
        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
        </svg>
      ),
    },
  }

  const config = statusConfig[status]
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm'

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${sizeClasses} ${config.color}`}
    >
      {showIcon && <span className="mr-1">{config.icon}</span>}
      {config.label}
    </span>
  )
}