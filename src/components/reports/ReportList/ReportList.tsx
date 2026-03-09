import React from 'react'
import { SiteVisitReport } from '@/types/report.types'
import { ReportCard } from './ReportCard'
import { Pagination } from '@/components/common/Pagination'

interface ReportListProps {
    reports: SiteVisitReport[]
    isLoading: boolean
    onReportClick: (id: string) => void
    pagination?: {
        currentPage: number
        pageSize: number
        totalCount: number
        onPageChange: (page: number) => void
    }
}

export const ReportList: React.FC<ReportListProps> = ({
    reports,
    isLoading,
    onReportClick,
    pagination,
}) => {
    if (isLoading) {
        return (
            <div className="space-y-4">
                {[...Array(3)].map((_, index) => (
                    <div
                        key={index}
                        className="animate-pulse bg-secondary-100 rounded-lg h-32"
                    />
                ))}
            </div>
        )
    }

    if (reports.length === 0) {
        return (
            <div className="text-center py-12">
                <svg
                    className="mx-auto h-12 w-12 text-secondary-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-secondary-900">No reports found</h3>
                <p className="mt-1 text-sm text-secondary-500">
                    Get started by creating a new report.
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {reports.map((report) => (
                <ReportCard
                    key={report.id}
                    report={report}
                    onClick={() => onReportClick(report.id)}
                />
            ))}

            {pagination && pagination.totalCount > pagination.pageSize && (
                <div className="mt-6">
                    <Pagination
                        currentPage={pagination.currentPage}
                        totalPages={Math.ceil(pagination.totalCount / pagination.pageSize)}
                        onPageChange={pagination.onPageChange}
                    />
                </div>
            )}
        </div>
    )
}
