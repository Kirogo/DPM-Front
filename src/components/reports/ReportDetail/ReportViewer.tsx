import React from 'react'
import { SiteVisitReport } from '@/types/report.types'
import { PrintableReport } from '@/components/reports/ReportPrint/PrintableReport'

interface ReportViewerProps {
    report: SiteVisitReport
}

export const ReportViewer: React.FC<ReportViewerProps> = ({ report }) => {
    return (
        <div className="max-w-5xl mx-auto py-8">
            <PrintableReport report={report} />
        </div>
    )
}
