import React from 'react'
import { SiteVisitReport } from '@/types/report.types'
import { ReportViewer } from './ReportViewer'
import { CommentSection } from './CommentSection'
import { DecisionButtons } from './DecisionButtons'

interface ReportDetailProps {
    report: SiteVisitReport
    onDecision?: (decision: any) => void
}

export const ReportDetail: React.FC<ReportDetailProps> = ({ report, onDecision }) => {
    return (
        <div className="space-y-6">
            <ReportViewer report={report} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <CommentSection reportId={report.id} />
                </div>
                <div>
                    {onDecision && (
                        <div className="sticky top-24">
                            <DecisionButtons reportId={report.id} onDecision={onDecision} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
