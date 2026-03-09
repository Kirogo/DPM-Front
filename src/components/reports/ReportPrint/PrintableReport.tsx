import React from 'react'
import { SiteVisitReport } from '@/types/report.types'
import { ReportStatusBadge } from '@/components/reports/ReportList/ReportStatusBadge'
import { format } from 'date-fns'

interface PrintableReportProps {
    report: SiteVisitReport
}

export const PrintableReport: React.FC<PrintableReportProps> = ({ report }) => {
    return (
        <div className="bg-white shadow-lg rounded-lg p-8 print:shadow-none print:p-0">
            {/* Header */}
            <div className="border-b border-secondary-200 pb-6 mb-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold text-secondary-900">{report.title}</h1>
                        <p className="text-lg text-secondary-600 mt-1">{report.reportNumber}</p>
                    </div>
                    <ReportStatusBadge status={report.status} />
                </div>
            </div>

            {/* Report Information */}
            <section className="mb-8">
                <h2 className="text-xl font-semibold text-secondary-900 mb-4">Report Information</h2>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm text-secondary-500">Visit Date</p>
                        <p className="font-medium text-secondary-900">
                            {format(new Date(report.visitDate), 'MMMM dd, yyyy')}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-secondary-500">Client</p>
                        <p className="font-medium text-secondary-900">{report.client?.name || 'N/A'}</p>
                    </div>
                    <div>
                        <p className="text-sm text-secondary-500">Relationship Manager</p>
                        <p className="font-medium text-secondary-900">
                            {report.rm ? `${report.rm.firstName} ${report.rm.lastName}` : 'N/A'}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-secondary-500">Quantity Surveyor</p>
                        <p className="font-medium text-secondary-900">
                            {report.qs ? `${report.qs.firstName} ${report.qs.lastName}` : 'N/A'}
                        </p>
                    </div>
                </div>
                {report.description && (
                    <div className="mt-4">
                        <p className="text-sm text-secondary-500">Description</p>
                        <p className="text-secondary-900 mt-1">{report.description}</p>
                    </div>
                )}
            </section>

            {/* Site Information */}
            <section className="mb-8">
                <h2 className="text-xl font-semibold text-secondary-900 mb-4">Site Information</h2>
                <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                        <p className="text-sm text-secondary-500">Address</p>
                        <p className="font-medium text-secondary-900">{report.siteAddress}</p>
                    </div>
                    {report.siteCoordinates && (
                        <div className="col-span-2">
                            <p className="text-sm text-secondary-500">Coordinates</p>
                            <p className="font-medium text-secondary-900">
                                {report.siteCoordinates.latitude.toFixed(6)}, {report.siteCoordinates.longitude.toFixed(6)}
                            </p>
                        </div>
                    )}
                    {report.weather && (
                        <div>
                            <p className="text-sm text-secondary-500">Weather</p>
                            <p className="font-medium text-secondary-900">{report.weather}</p>
                        </div>
                    )}
                    {report.temperature && (
                        <div>
                            <p className="text-sm text-secondary-500">Temperature</p>
                            <p className="font-medium text-secondary-900">{report.temperature}°C</p>
                        </div>
                    )}
                </div>
            </section>

            {/* Work Progress */}
            {report.workProgress && report.workProgress.length > 0 && (
                <section className="mb-8 page-break-before">
                    <h2 className="text-xl font-semibold text-secondary-900 mb-4">Work Progress</h2>
                    <div className="space-y-4">
                        {report.workProgress.map((item) => (
                            <div key={item.id} className="border border-secondary-200 rounded-lg p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h3 className="font-semibold text-secondary-900">{item.category}</h3>
                                        <p className="text-sm text-secondary-600">{item.description}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-primary-600">{item.percentage}%</p>
                                    </div>
                                </div>
                                {item.notes && (
                                    <p className="text-sm text-secondary-500 mt-2">
                                        <span className="font-medium">Notes:</span> {item.notes}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Issues */}
            {report.issues && report.issues.length > 0 && (
                <section className="mb-8 page-break-before">
                    <h2 className="text-xl font-semibold text-secondary-900 mb-4">Issues</h2>
                    <div className="space-y-4">
                        {report.issues.map((issue) => (
                            <div key={issue.id} className="border border-secondary-200 rounded-lg p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-semibold text-secondary-900">{issue.title}</h3>
                                    <div className="flex gap-2">
                                        <span
                                            className={`px-2 py-1 text-xs font-medium rounded ${issue.severity === 'critical'
                                                    ? 'bg-error/10 text-error'
                                                    : issue.severity === 'high'
                                                        ? 'bg-warning/10 text-warning'
                                                        : issue.severity === 'medium'
                                                            ? 'bg-info/10 text-info'
                                                            : 'bg-secondary-100 text-secondary-700'
                                                }`}
                                        >
                                            {issue.severity.toUpperCase()}
                                        </span>
                                        <span
                                            className={`px-2 py-1 text-xs font-medium rounded ${issue.status === 'resolved'
                                                    ? 'bg-success/10 text-success'
                                                    : issue.status === 'in_progress'
                                                        ? 'bg-info/10 text-info'
                                                        : 'bg-secondary-100 text-secondary-700'
                                                }`}
                                        >
                                            {issue.status.replace('_', ' ').toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                                <p className="text-sm text-secondary-600">{issue.description}</p>
                                {issue.resolvedAt && (
                                    <p className="text-xs text-success mt-2">
                                        Resolved on {format(new Date(issue.resolvedAt), 'MMMM dd, yyyy')}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Photos */}
            {report.photos && report.photos.length > 0 && (
                <section className="mb-8 page-break-before">
                    <h2 className="text-xl font-semibold text-secondary-900 mb-4">
                        Photos ({report.photos.length})
                    </h2>
                    <div className="grid grid-cols-2 gap-4">
                        {report.photos.map((photo) => (
                            <div key={photo.id} className="border border-secondary-200 rounded-lg overflow-hidden">
                                <img
                                    src={photo.url}
                                    alt={photo.caption || 'Report photo'}
                                    className="w-full h-48 object-cover"
                                />
                                {photo.caption && (
                                    <div className="p-2 bg-secondary-50">
                                        <p className="text-sm text-secondary-700">{photo.caption}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Footer */}
            <footer className="mt-12 pt-6 border-t border-secondary-200 text-sm text-secondary-500">
                <div className="flex justify-between">
                    <p>Generated on {format(new Date(), 'MMMM dd, yyyy HH:mm')}</p>
                    <p>Report #{report.reportNumber}</p>
                </div>
            </footer>

            {/* Print Styles */}
            <style>{`
        @media print {
          .page-break-before {
            page-break-before: always;
          }
          @page {
            margin: 2cm;
          }
        }
      `}</style>
        </div>
    )
}
