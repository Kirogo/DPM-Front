import React from 'react'
import { SiteVisitReport } from '@/types/report.types'
import { Button } from '@/components/common/Button'
import { formatDistanceToNow } from 'date-fns'

interface ReviewItemProps {
    report: SiteVisitReport
    onAssign?: () => void
    onView: () => void
}

export const ReviewItem: React.FC<ReviewItemProps> = ({ report, onAssign, onView }) => {
    return (
        <div className="flex items-center justify-between p-4 bg-secondary-50 rounded-lg hover:bg-secondary-100 transition-colors">
            <div className="flex items-center space-x-4">
                <div className="h-10 w-10 flex-shrink-0 rounded-full bg-primary-100 flex items-center justify-center">
                    <svg className="h-6 w-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                </div>
                <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-secondary-900 truncate">
                        {report.title}
                    </p>
                    <div className="flex items-center space-x-2 text-xs text-secondary-500">
                        <span>{report.reportNumber}</span>
                        <span>•</span>
                        <span>{report.client?.name}</span>
                        <span>•</span>
                        <span>{formatDistanceToNow(new Date(report.submittedAt || report.visitDate), { addSuffix: true })}</span>
                    </div>
                </div>
            </div>
            <div className="flex space-x-2">
                {onAssign && !report.qsId && (
                    <Button size="sm" variant="outline" onClick={onAssign}>
                        Assign to Me
                    </Button>
                )}
                <Button size="sm" variant="primary" onClick={onView}>
                    Review
                </Button>
            </div>
        </div>
    )
}
