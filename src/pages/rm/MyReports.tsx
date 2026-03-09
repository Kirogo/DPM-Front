//src/pages/rm/MyReports.tsx
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useReports } from '@/hooks/useReports'
import { ReportList } from '@/components/reports/ReportList'
import { ReportFilters } from '@/components/reports/ReportList/ReportFilters'
import { Card } from '@/components/common/Card'
import { ReportFilter, ReportStatus } from '@/types/report.types'
import { useSearchParams } from 'react-router-dom'

export const MyReports: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const statusParam = searchParams.get('status') as ReportStatus | null

  const {
    reports,
    isLoading,
    totalCount,
    currentPage,
    pageSize,
    changePage,
    applyFilters,
    filters
  } = useReports()

  // Apply status filter if present in URL
  React.useEffect(() => {
    if (statusParam) {
      applyFilters({ ...filters, status: [statusParam] })
    }
  }, [statusParam])

  const handleFilterChange = (newFilters: ReportFilter) => {
    applyFilters(newFilters)
  }

  const handlePageChange = (page: number) => {
    changePage(page)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">My Reports</h1>
          <p className="mt-1 text-sm text-secondary-600">
            View and manage all your site visit reports.
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card padding="sm">
        <ReportFilters
          filters={filters}
          onFilterChange={handleFilterChange}
        />
      </Card>

      {/* Reports List */}
      <Card>
        <ReportList
          reports={reports}
          isLoading={isLoading}
          onReportClick={(id) => navigate(`/rm/reports/${id}`)}
          pagination={{
            currentPage,
            pageSize,
            totalCount,
            onPageChange: handlePageChange,
          }}
        />
      </Card>
    </div>
  )
}

export default MyReports
