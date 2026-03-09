import React from 'react'
import { SiteVisitReport } from '@/types/report.types'
import { ReportStatusBadge } from './ReportStatusBadge'
import { format } from 'date-fns'

interface ReportCardProps {
    report: SiteVisitReport
    onClick: () => void
}

export const ReportCard: React.FC<ReportCardProps> = ({ report, onClick }) => {
    const primaryPhoto = report.photos?.find((p) => p.isPrimary) || report.photos?.[0]

    return (
        <div
            onClick={onClick}
            className="card cursor-pointer border border-secondary-200 hover:border-primary-300 transition-all"
        >
            <div className="flex gap-4">
                {/* Thumbnail */}
                {primaryPhoto && (
                    <div className="flex-shrink-0">
                        <img
                            src={primaryPhoto.thumbnailUrl || primaryPhoto.url}
                            alt={primaryPhoto.caption || 'Report photo'}
                            className="w-24 h-24 rounded-lg object-cover"
                        />
                    </div>
                )}

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-lg font-semibold text-secondary-900 truncate">
                                    {report.title}
                                </h3>
                                <ReportStatusBadge status={report.status} size="sm" />
                            </div>
                            <p className="text-sm text-secondary-600 mb-2">
                                {report.reportNumber}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                            <span className="text-secondary-500">Client:</span>
                            <p className="font-medium text-secondary-900 truncate">
                                {report.client?.name || 'N/A'}
                            </p>
                        </div>
                        <div>
                            <span className="text-secondary-500">Visit Date:</span>
                            <p className="font-medium text-secondary-900">
                                {format(new Date(report.visitDate), 'MMM dd, yyyy')}
                            </p>
                        </div>
                        <div>
                            <span className="text-secondary-500">Location:</span>
                            <p className="font-medium text-secondary-900 truncate">
                                {report.siteAddress}
                            </p>
                        </div>
                        <div>
                            <span className="text-secondary-500">Photos:</span>
                            <p className="font-medium text-secondary-900">
                                {report.photos?.length || 0}
                            </p>
                        </div>
                    </div>

                    {report.description && (
                        <p className="mt-2 text-sm text-secondary-600 line-clamp-2">
                            {report.description}
                        </p>
                    )}

                    {report.tags && report.tags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                            {report.tags.slice(0, 3).map((tag) => (
                                <span
                                    key={tag}
                                    className="px-2 py-0.5 text-xs bg-secondary-100 text-secondary-700 rounded"
                                >
                                    {tag}
                                </span>
                            ))}
                            {report.tags.length > 3 && (
                                <span className="px-2 py-0.5 text-xs text-secondary-500">
                                    +{report.tags.length - 3} more
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
