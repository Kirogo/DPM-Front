// src/pages/qs/QSAnalyticsPage.tsx
import React, { useState, useEffect } from 'react'
import { qsApi } from '@/services/api/qsApi'
import { Card } from '@/components/common/Card'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { FiTrendingUp, FiClock, FiCheckCircle, FiAlertCircle } from 'react-icons/fi'
import toast from 'react-hot-toast'

interface AnalyticsData {
  totalReviews: number
  averageResponseTime: string
  completionRate: number
  qualityScore: number
  reviewsByDay: { date: string; count: number }[]
  topIssues: { issue: string; count: number }[]
  performanceByQS: { name: string; reviews: number; avgTime: string }[]
}

export const QSAnalyticsPage: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [period, setPeriod] = useState<'week' | 'month' | 'quarter'>('week')

  useEffect(() => {
    loadAnalytics()
  }, [period])

  const loadAnalytics = async () => {
    setIsLoading(true)
    try {
      const response = await qsApi.getAnalytics(period)
      setData(response.data)
    } catch (error) {
      toast.error('Failed to load analytics')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F5F7F4] flex justify-center py-12">
        <LoadingSpinner size="lg" label="Loading analytics..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F5F7F4]">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-[#F5F7F4] border-b border-[#D6BD98]/20 px-4 py-2 lg:px-6 lg:py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xs lg:text-sm font-semibold text-[#1A3636]">
              Analytics & Performance
            </h1>
            <p className="text-[8px] lg:text-xs text-[#677D6A] mt-0.5">
              Track your QS team's performance metrics
            </p>
          </div>
          <div className="flex items-center gap-1 bg-white rounded-lg border border-[#D6BD98]/20 p-0.5">
            <button
              onClick={() => setPeriod('week')}
              className={`px-2 py-1 text-[8px] lg:text-xs rounded-md transition-colors ${
                period === 'week' ? 'bg-[#1A3636] text-white' : 'text-[#677D6A]'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setPeriod('month')}
              className={`px-2 py-1 text-[8px] lg:text-xs rounded-md transition-colors ${
                period === 'month' ? 'bg-[#1A3636] text-white' : 'text-[#677D6A]'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setPeriod('quarter')}
              className={`px-2 py-1 text-[8px] lg:text-xs rounded-md transition-colors ${
                period === 'quarter' ? 'bg-[#1A3636] text-white' : 'text-[#677D6A]'
              }`}
            >
              Quarter
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 lg:px-6 py-3">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-3 mb-3 lg:mb-4">
          <Card className="p-2 lg:p-3">
            <div className="flex items-center gap-1 lg:gap-2">
              <div className="p-1 lg:p-1.5 bg-[#D6BD98]/10 rounded">
                <FiTrendingUp className="w-2.5 h-2.5 lg:w-3.5 lg:h-3.5 text-[#1A3636]" />
              </div>
              <div>
                <p className="text-[8px] lg:text-xs text-[#677D6A]">Total Reviews</p>
                <p className="text-[10px] lg:text-sm font-semibold text-[#1A3636]">
                  {data?.totalReviews || 0}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-2 lg:p-3">
            <div className="flex items-center gap-1 lg:gap-2">
              <div className="p-1 lg:p-1.5 bg-[#D6BD98]/10 rounded">
                <FiClock className="w-2.5 h-2.5 lg:w-3.5 lg:h-3.5 text-[#1A3636]" />
              </div>
              <div>
                <p className="text-[8px] lg:text-xs text-[#677D6A]">Avg Response</p>
                <p className="text-[10px] lg:text-sm font-semibold text-[#1A3636]">
                  {data?.averageResponseTime || '0h'}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-2 lg:p-3">
            <div className="flex items-center gap-1 lg:gap-2">
              <div className="p-1 lg:p-1.5 bg-[#D6BD98]/10 rounded">
                <FiCheckCircle className="w-2.5 h-2.5 lg:w-3.5 lg:h-3.5 text-[#1A3636]" />
              </div>
              <div>
                <p className="text-[8px] lg:text-xs text-[#677D6A]">Completion Rate</p>
                <p className="text-[10px] lg:text-sm font-semibold text-[#1A3636]">
                  {data?.completionRate || 0}%
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-2 lg:p-3">
            <div className="flex items-center gap-1 lg:gap-2">
              <div className="p-1 lg:p-1.5 bg-[#D6BD98]/10 rounded">
                <FiAlertCircle className="w-2.5 h-2.5 lg:w-3.5 lg:h-3.5 text-[#1A3636]" />
              </div>
              <div>
                <p className="text-[8px] lg:text-xs text-[#677D6A]">Quality Score</p>
                <p className="text-[10px] lg:text-sm font-semibold text-[#1A3636]">
                  {data?.qualityScore || 0}%
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Charts Section - Placeholder for now */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4">
          <Card className="p-3">
            <h3 className="text-[10px] lg:text-xs font-semibold text-[#1A3636] mb-2 lg:mb-3">
              Reviews Over Time
            </h3>
            <div className="h-32 lg:h-40 bg-[#D6BD98]/5 rounded flex items-center justify-center">
              <span className="text-[8px] lg:text-xs text-[#677D6A]">Chart placeholder</span>
            </div>
          </Card>

          <Card className="p-3">
            <h3 className="text-[10px] lg:text-xs font-semibold text-[#1A3636] mb-2 lg:mb-3">
              Common Issues Found
            </h3>
            <div className="space-y-2">
              {data?.topIssues?.map((issue, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-[8px] lg:text-xs text-[#1A3636]">{issue.issue}</span>
                  <span className="text-[8px] lg:text-xs text-[#677D6A]">{issue.count}</span>
                </div>
              )) || (
                <div className="h-20 bg-[#D6BD98]/5 rounded flex items-center justify-center">
                  <span className="text-[8px] lg:text-xs text-[#677D6A]">No data available</span>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Team Performance */}
        <Card className="mt-3 lg:mt-4 p-3">
          <h3 className="text-[10px] lg:text-xs font-semibold text-[#1A3636] mb-2 lg:mb-3">
            Team Performance
          </h3>
          <div className="space-y-2">
            {data?.performanceByQS?.map((qs, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-[#D6BD98]/5 rounded">
                <div>
                  <p className="text-[9px] lg:text-xs font-medium text-[#1A3636]">{qs.name}</p>
                  <p className="text-[7px] lg:text-[10px] text-[#677D6A]">{qs.reviews} reviews</p>
                </div>
                <span className="text-[8px] lg:text-xs text-[#1A3636]">{qs.avgTime} avg</span>
              </div>
            )) || (
              <div className="text-center py-4">
                <span className="text-[8px] lg:text-xs text-[#677D6A]">No team data available</span>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}

export default QSAnalyticsPage