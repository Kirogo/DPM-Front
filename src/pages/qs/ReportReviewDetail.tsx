import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useReports } from '@/hooks/useReports'
import { useAuth } from '@/hooks/useAuth'
import { qsApi } from '@/services/api/qsApi'
import { SiteVisitReport, ReviewDecision } from '@/types/report.types'
import { ReportViewer } from '@/components/reports/ReportDetail/ReportViewer'
import { DecisionButtons } from '@/components/reports/ReportDetail/DecisionButtons'
import { CommentSection } from '@/components/reports/ReportDetail/CommentSection'
import { DecisionModal } from '@/components/qs/QSDecision/DecisionModal'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { Button } from '@/components/common/Button'
import { Card } from '@/components/common/Card'
import { PDFGenerator } from '@/services/pdf/pdfGenerator'
import { formatDateTime } from '@/utils/formatters/dateFormatter'
import toast from 'react-hot-toast'
import { isStatus } from '@/utils/status'

export const ReportReviewDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { currentReport, loadReport, isLoading } = useReports()
  const [isDecisionModalOpen, setIsDecisionModalOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [decisionHistory, setDecisionHistory] = useState<ReviewDecision[]>([])
  const [isAssigned, setIsAssigned] = useState(false)

  useEffect(() => {
    if (id) {
      loadReport(id)
    }
  }, [id, loadReport])

  useEffect(() => {
    if (currentReport) {
      loadDecisionHistory()
      checkAssignment()
    }
  }, [currentReport])

  const loadDecisionHistory = async () => {
    if (!id) return
    try {
      const response = await qsApi.getReviewHistory(1, 50)
      const reportDecisions = response.data.items.filter((d: any) => d.reportId === id)
      setDecisionHistory(reportDecisions)
    } catch (error) {
      console.error('Failed to load decision history')
    }
  }

  const checkAssignment = () => {
    if (currentReport && user) {
      setIsAssigned(currentReport.qsId === user.id)
    }
  }

  const handleAssignToMe = async () => {
    if (!id) return
    try {
      await qsApi.assignReport(id)
      toast.success('Report assigned to you')
      loadReport(id)
    } catch (error) {
      toast.error('Failed to assign report')
    }
  }

  const handleDecision = async (decision: any) => {
    if (!id) return

    try {
      await qsApi.reviewReport(id, decision)
      toast.success('Decision recorded successfully')
      loadReport(id)
      loadDecisionHistory()
    } catch (error) {
      toast.error('Failed to record decision')
    }
  }

  const handleExportPDF = async () => {
    if (!currentReport) return
    
    setIsExporting(true)
    try {
      await PDFGenerator.downloadReport(currentReport)
      toast.success('PDF downloaded successfully')
    } catch (error) {
      toast.error('Failed to generate PDF')
    } finally {
      setIsExporting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const colors = {
      pending_qs_review: 'bg-warning/10 text-warning',
      under_review: 'bg-info/10 text-info',
      revision_requested: 'bg-error/10 text-error',
      approved: 'bg-success/10 text-success',
      rejected: 'bg-error/10 text-error',
    }
    return colors[status as keyof typeof colors] || 'bg-secondary-100 text-secondary-800'
  }

  if (isLoading || !currentReport) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" label="Loading report..." />
      </div>
    )
  }

  const canReview = isStatus(currentReport.status, 'pending_qs_review') || 
                  (isStatus(currentReport.status, 'under_review') && isAssigned)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold text-secondary-900">
              Review Report
            </h1>
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusBadge(currentReport.status)}`}>
              {currentReport.status.replace(/_/g, ' ').toUpperCase()}
            </span>
          </div>
          <p className="mt-1 text-sm text-secondary-600">
            Report #{currentReport.reportNumber} • Submitted by {currentReport.rm?.name} on{' '}
            {formatDateTime(currentReport.submittedAt || currentReport.createdAt)}
          </p>
        </div>
        <div className="flex space-x-3">
          {!isAssigned && isStatus(currentReport.status, 'pending_qs_review') && (
            <Button
              variant="primary"
              onClick={handleAssignToMe}
              leftIcon={
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              }
            >
              Assign to Me
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => navigate('/qs/reviews')}
            leftIcon={
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            }
          >
            Back to List
          </Button>
          <Button
            variant="outline"
            onClick={handleExportPDF}
            isLoading={isExporting}
            leftIcon={
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
          >
            Export PDF
          </Button>
        </div>
      </div>

      {/* Review Progress */}
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-secondary-900">Review Progress</h3>
            <p className="text-sm text-secondary-600 mt-1">
              {isAssigned 
                ? 'You are reviewing this report'
                : currentReport.qs 
                ? `Being reviewed by ${currentReport.qs.name}`
                : 'Not yet assigned'}
            </p>
          </div>
          {canReview && (
            <Button
              variant="primary"
              size="lg"
              onClick={() => setIsDecisionModalOpen(true)}
            >
              Make Decision
            </Button>
          )}
        </div>
      </Card>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Report Viewer */}
        <div className="lg:col-span-2">
          <ReportViewer report={currentReport} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Assignment Info */}
          <Card>
            <h3 className="text-lg font-medium text-secondary-900 mb-4">
              Assignment Details
            </h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm text-secondary-500">Assigned QS</dt>
                <dd className="text-sm font-medium text-secondary-900">
                  {currentReport.qs?.name || 'Not assigned'}
                </dd>
              </div>
              {currentReport.qs && (
                <div>
                  <dt className="text-sm text-secondary-500">Assigned Since</dt>
                  <dd className="text-sm text-secondary-900">
                    {formatDateTime(currentReport.updatedAt)}
                  </dd>
                </div>
              )}
              <div>
                <dt className="text-sm text-secondary-500">Time in Current Status</dt>
                <dd className="text-sm text-secondary-900">
                  {/* Calculate time in status */}
                  Pending
                </dd>
              </div>
            </dl>
          </Card>

          {/* Decision History */}
          <Card>
            <h3 className="text-lg font-medium text-secondary-900 mb-4">
              Decision History
            </h3>
            <div className="space-y-4">
              {decisionHistory.length === 0 ? (
                <p className="text-sm text-secondary-500 text-center py-2">
                  No decisions yet
                </p>
              ) : (
                decisionHistory.map((decision, index) => (
                  <div key={decision.id} className="border-l-4 border-primary-500 pl-3">
                    <p className="text-sm font-medium text-secondary-900 capitalize">
                      {decision.decision}
                    </p>
                    <p className="text-xs text-secondary-600 mt-1">{decision.comment}</p>
                    <p className="text-xs text-secondary-400 mt-1">
                      By {decision.madeBy} • {formatDateTime(decision.madeAt)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Comments */}
          <Card>
            <h3 className="text-lg font-medium text-secondary-900 mb-4">
              Comments
            </h3>
            <CommentSection reportId={currentReport.id} />
          </Card>
        </div>
      </div>

      {/* Decision Modal */}
      <DecisionModal
        isOpen={isDecisionModalOpen}
        onClose={() => setIsDecisionModalOpen(false)}
        onDecision={handleDecision}
        reportTitle={currentReport.title}
      />
    </div>
  )
}

export default ReportReviewDetail