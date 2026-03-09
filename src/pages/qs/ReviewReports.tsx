import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { qsApi } from '@/services/api/qsApi'
import { SiteVisitReport, ReportFilter } from '@/types/report.types'
import { ReviewQueue } from '@/components/qs/ReviewQueue/ReviewQueue'
import { ReportFilters } from '@/components/reports/ReportList/ReportFilters'
import { Card } from '@/components/common/Card'
import { Button } from '@/components/common/Button'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { ReviewItem } from '@/components/qs/ReviewQueue/ReviewItem'
import { DecisionModal } from '@/components/qs/QSDecision/DecisionModal'
import toast from 'react-hot-toast'
import { isStatus } from '@/utils/status'

export const ReviewReports: React.FC = () => {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)
  const [reports, setReports] = useState<SiteVisitReport[]>([])
  const [filteredReports, setFilteredReports] = useState<SiteVisitReport[]>([])
  const [filters, setFilters] = useState<ReportFilter>({})
  const [selectedReport, setSelectedReport] = useState<SiteVisitReport | null>(null)
  const [isDecisionModalOpen, setIsDecisionModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'pending' | 'in-progress' | 'completed'>('pending')

  useEffect(() => {
    loadReports()
  }, [activeTab])

  useEffect(() => {
    applyFilters()
  }, [reports, filters])

  const loadReports = async () => {
    setIsLoading(true)
    try {
      let response
      switch (activeTab) {
        case 'pending':
          response = await qsApi.getPendingReviews(1, 50)
          break
        case 'in-progress':
          response = await qsApi.getInProgressReviews(1, 50)
          break
        case 'completed':
          response = await qsApi.getCompletedReviews(1, 50)
          break
      }
      setReports(response?.data.items || [])
    } catch (error) {
      toast.error('Failed to load reports')
    } finally {
      setIsLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...reports]

    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(r =>
        r.title.toLowerCase().includes(searchLower) ||
        r.description?.toLowerCase().includes(searchLower) ||
        r.client?.name.toLowerCase().includes(searchLower)
      )
    }

    if (filters.status && filters.status.length > 0) {
      filtered = filtered.filter(r => filters.status?.includes(r.status))
    }

    if (filters.startDate) {
      filtered = filtered.filter(r => new Date(r.createdAt) >= new Date(filters.startDate!))
    }

    if (filters.endDate) {
      filtered = filtered.filter(r => new Date(r.createdAt) <= new Date(filters.endDate!))
    }

    setFilteredReports(filtered)
  }

  const handleAssignToMe = async (reportId: string) => {
    try {
      await qsApi.assignReport(reportId)
      toast.success('Report assigned to you')
      loadReports()
      navigate(`/qs/reviews/${reportId}`)
    } catch (error) {
      toast.error('Failed to assign report')
    }
  }

  const handleQuickDecision = (report: SiteVisitReport) => {
    setSelectedReport(report)
    setIsDecisionModalOpen(true)
  }

  const handleDecision = async (decision: any) => {
    if (!selectedReport) return

    try {
      await qsApi.reviewReport(selectedReport.id, decision)
      toast.success('Decision recorded successfully')
      setIsDecisionModalOpen(false)
      loadReports()
    } catch (error) {
      toast.error('Failed to record decision')
    }
  }

  const getTabCount = (tab: string) => {
    switch (tab) {
      case 'pending':
        return reports.filter(r => isStatus(r.status, 'pending_qs_review')).length
      case 'in-progress':
        return reports.filter(r => isStatus(r.status, 'under_review')).length
      case 'completed':
        return reports.filter(r => ['approved', 'rejected'].includes(r.status)).length
      default:
        return 0
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">Review Reports</h1>
        <p className="mt-1 text-sm text-secondary-600">
          Review and process site visit reports submitted by RMs
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-secondary-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('pending')}
            className={`
              py-2 px-1 border-b-2 font-medium text-sm
              ${
                activeTab === 'pending'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
              }
            `}
          >
            Pending Review ({getTabCount('pending')})
          </button>
          <button
            onClick={() => setActiveTab('in-progress')}
            className={`
              py-2 px-1 border-b-2 font-medium text-sm
              ${
                activeTab === 'in-progress'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
              }
            `}
          >
            In Progress ({getTabCount('in-progress')})
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`
              py-2 px-1 border-b-2 font-medium text-sm
              ${
                activeTab === 'completed'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
              }
            `}
          >
            Completed ({getTabCount('completed')})
          </button>
        </nav>
      </div>

      {/* Filters */}
      <Card padding="sm">
        <ReportFilters
          filters={filters}
          onFilterChange={setFilters}
        />
      </Card>

      {/* Reports List */}
      <Card>
        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" label="Loading reports..." />
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="text-center py-12">
            <div className="flex justify-center">
              <svg
                className="h-12 w-12 text-secondary-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-medium text-secondary-900">No reports found</h3>
            <p className="mt-2 text-sm text-secondary-500">
              {activeTab === 'pending' 
                ? 'No pending reports to review at this time.'
                : activeTab === 'in-progress'
                ? 'You have no reports in progress.'
                : 'No completed reports found.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReports.map((report) => (
              <ReviewItem
                key={report.id}
                report={report}
                onAssign={activeTab === 'pending' ? () => handleAssignToMe(report.id) : undefined}
                onView={() => navigate(`/qs/reviews/${report.id}`)}
                onQuickDecision={activeTab === 'pending' ? () => handleQuickDecision(report) : undefined}
              />
            ))}
          </div>
        )}
      </Card>

      {/* Decision Modal */}
      {selectedReport && (
        <DecisionModal
          isOpen={isDecisionModalOpen}
          onClose={() => {
            setIsDecisionModalOpen(false)
            setSelectedReport(null)
          }}
          onDecision={handleDecision}
          reportTitle={selectedReport.title}
        />
      )}
    </div>
  )
}

export default ReviewReports