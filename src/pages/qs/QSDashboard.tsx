// src/pages/qs/QSDashboard.tsx
import React, { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useGetAllRmChecklistsQuery } from '@/services/api/checklistsApi'
import { transformChecklistsToReports } from '@/utils/checklistTransform'
import { StatsCards } from '@/components/dashboard/StatsCards'
import { Button } from '@/components/common/Button'
import { SiteVisitReport, Comment } from '@/types/report.types'
import { commentApi } from '@/services/api/commentApi'
import { 
  FiBarChart2, 
  FiClock, 
  FiMessageSquare,
  FiUser,
  FiCalendar,
  FiRefreshCw,
  FiArrowRight,
  FiSend,
  FiThumbsUp,
  FiRefreshCw as FiRework,
  FiXCircle,
  FiMapPin,
  FiHome,
  FiFileText
} from 'react-icons/fi'

interface ActivityItem {
  id: string
  type: 'submitted' | 'approved' | 'rework' | 'commented' | 'rejected'
  reportId: string
  reportNo: string
  customerName: string
  projectName?: string  // Added projectName field
  rmName: string
  rmId?: string
  qsName?: string
  timestamp: string
  comment?: string
  commentId?: string
  isInternal?: boolean
}

interface ScheduledVisit {
  id: string
  reportId: string
  reportNo: string
  customerName: string
  siteAddress: string
  scheduledDate: string
  scheduledTime: string
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled'
  rmName: string
}

export const QSDashboard: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const { data: checklists = [], isLoading, error, refetch } = useGetAllRmChecklistsQuery()
  const [activityItems, setActivityItems] = useState<ActivityItem[]>([])
  const [scheduledVisits, setScheduledVisits] = useState<ScheduledVisit[]>([])
  const [isLoadingComments, setIsLoadingComments] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const statsScrollRef = useRef<HTMLDivElement>(null)

  const allReports = useMemo(() => {
    return transformChecklistsToReports(checklists)
  }, [checklists])

  const overallStats = {
    totalReports: allReports?.length || 0,
    pendingReviews: allReports?.filter(r => 
      r.status === 'submitted' || 
      r.status === 'pending_qs_review' || 
      r.status === 'pendingqsreview'
    ).length || 0,
    approved: allReports?.filter(r => 
      r.status === 'approved' || 
      r.status === 'completed'
    ).length || 0,
    revisions: allReports?.filter(r => 
      r.status === 'rework' || 
      r.status === 'returned' || 
      r.status === 'revision_requested'
    ).length || 0,
  }

  useEffect(() => {
    const fetchAllComments = async () => {
      if (allReports.length === 0) return
      
      setIsLoadingComments(true)
      const allActivities: ActivityItem[] = []
      const processedCommentIds = new Set<string>()
      
      for (const report of allReports.slice(0, 20)) {
        try {
          const reportNo = report.reportNo || report.dclNo || 'Unknown'
          const customerName = report.customerName || report.clientName || 'Unknown Customer'
          const projectName = report.projectName || report.loanType || ''  // Get project name
          const rmName = report.rmName || report.assignedToRM?.name || 'Unknown RM'
          
          const comments = await commentApi.getComments(report.id)
          
          comments.forEach((comment: Comment) => {
            if (!comment.id || processedCommentIds.has(comment.id)) return
            processedCommentIds.add(comment.id)
            
            let timestamp = new Date().toISOString()
            if (comment.createdAt) {
              timestamp = typeof comment.createdAt === 'string' 
                ? comment.createdAt 
                : comment.createdAt instanceof Date 
                  ? comment.createdAt.toISOString() 
                  : new Date().toISOString()
            }
            
            const isQS = comment.userRole?.toLowerCase() === 'qs'
            
            if (comment.content || comment.text) {
              allActivities.push({
                id: comment.id,
                type: 'commented',
                reportId: report.id,
                reportNo,
                customerName,
                projectName,  // Include project name
                rmName: rmName,
                qsName: isQS ? comment.userName : undefined,
                timestamp: timestamp,
                comment: comment.content || comment.text || '',
                commentId: comment.id,
                isInternal: comment.isInternal || false
              })
            }
          })
          
        } catch (err) {
          console.log(`Could not process report ${report.id}:`, err)
        }
      }
      
      allActivities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      setActivityItems(allActivities)
      setIsLoadingComments(false)
    }

    fetchAllComments()
  }, [allReports, user])

  useEffect(() => {
    // Mock data for March 2026
    const mockScheduledVisits: ScheduledVisit[] = [
      {
        id: '1',
        reportId: '123',
        reportNo: 'CRN-001',
        customerName: 'John Doe Construction',
        siteAddress: 'Plot 123, Industrial Area, Nairobi',
        scheduledDate: '2026-03-15',
        scheduledTime: '10:00 AM',
        status: 'scheduled',
        rmName: 'Michael Mwai'
      },
      {
        id: '2',
        reportId: '124',
        reportNo: 'CRN-002',
        customerName: 'ABC Developers',
        siteAddress: 'Westlands, Nairobi',
        scheduledDate: '2026-03-17',
        scheduledTime: '2:30 PM',
        status: 'scheduled',
        rmName: 'Sarah Kimani'
      },
      {
        id: '3',
        reportId: '125',
        reportNo: 'CRN-003',
        customerName: 'XYZ Properties',
        siteAddress: 'Kilimani, Nairobi',
        scheduledDate: '2026-03-18',
        scheduledTime: '11:00 AM',
        status: 'scheduled',
        rmName: 'James Otieno'
      },
      {
        id: '4',
        reportId: '126',
        reportNo: 'CRN-004',
        customerName: 'Pinnacle Developers',
        siteAddress: 'Karen, Nairobi',
        scheduledDate: '2026-03-19',
        scheduledTime: '9:30 AM',
        status: 'scheduled',
        rmName: 'Lucy Wanjiku'
      }
    ]
    setScheduledVisits(mockScheduledVisits)
  }, [])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await refetch()
      // Also refresh comments
      const allActivities: ActivityItem[] = []
      const processedCommentIds = new Set<string>()
      
      for (const report of allReports.slice(0, 20)) {
        try {
          const reportNo = report.reportNo || report.dclNo || 'Unknown'
          const customerName = report.customerName || report.clientName || 'Unknown Customer'
          const projectName = report.projectName || report.loanType || ''  // Get project name
          const rmName = report.rmName || report.assignedToRM?.name || 'Unknown RM'
          
          const comments = await commentApi.getComments(report.id)
          
          comments.forEach((comment: Comment) => {
            if (!comment.id || processedCommentIds.has(comment.id)) return
            processedCommentIds.add(comment.id)
            
            let timestamp = new Date().toISOString()
            if (comment.createdAt) {
              timestamp = typeof comment.createdAt === 'string' 
                ? comment.createdAt 
                : comment.createdAt instanceof Date 
                  ? comment.createdAt.toISOString() 
                  : new Date().toISOString()
            }
            
            const isQS = comment.userRole?.toLowerCase() === 'qs'
            
            if (comment.content || comment.text) {
              allActivities.push({
                id: comment.id,
                type: 'commented',
                reportId: report.id,
                reportNo,
                customerName,
                projectName,  // Include project name
                rmName: rmName,
                qsName: isQS ? comment.userName : undefined,
                timestamp: timestamp,
                comment: comment.content || comment.text || '',
                commentId: comment.id,
                isInternal: comment.isInternal || false
              })
            }
          })
        } catch (err) {
          console.log(`Could not process report ${report.id}:`, err)
        }
      }
      
      allActivities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      setActivityItems(allActivities)
    } catch (error) {
      console.error('Refresh failed:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    const scrollContainer = statsScrollRef.current
    if (!scrollContainer) return

    const handleWheel = (e: WheelEvent) => {
      if (window.innerWidth < 768) {
        e.preventDefault()
        scrollContainer.scrollLeft += e.deltaY
      }
    }

    scrollContainer.addEventListener('wheel', handleWheel, { passive: false })
    return () => scrollContainer.removeEventListener('wheel', handleWheel)
  }, [])

  const formatDate = (timestamp: string) => {
    try {
      const date = new Date(timestamp)
      if (isNaN(date.getTime())) return 'Unknown'
      return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
    } catch { return 'Unknown' }
  }

  const formatVisitDate = (date: string, time: string) => {
    const visitDate = new Date(date)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    if (visitDate.toDateString() === today.toDateString()) return `Today at ${time}`
    if (visitDate.toDateString() === tomorrow.toDateString()) return `Tomorrow at ${time}`
    return visitDate.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ` at ${time}`
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'submitted': return <FiSend className="w-3.5 h-3.5 text-primary-500" />
      case 'approved': return <FiThumbsUp className="w-3.5 h-3.5 text-primary-500" />
      case 'rework': return <FiRework className="w-3.5 h-3.5 text-accent-500" />
      case 'commented': return <FiMessageSquare className="w-3.5 h-3.5 text-primary-600" />
      case 'rejected': return <FiXCircle className="w-3.5 h-3.5 text-accent-500" />
      default: return <FiMessageSquare className="w-3.5 h-3.5 text-primary-600" />
    }
  }

  // FIXED CALENDAR LOGIC - CORRECTED
  const getCalendarDays = () => {
    const today = new Date()
    const currentYear = today.getFullYear()
    const currentMonth = today.getMonth()
    
    // 1. Get the first day of the month
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1)
    // .getDay() returns 0 for Sunday, 1 for Monday...
    const startDayIndex = firstDayOfMonth.getDay() 
    
    // 2. Get total days in current month
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0)
    const totalDaysInMonth = lastDayOfMonth.getDate()
    
    const days = []
    
    // 3. Add empty cells for padding before the 1st
    for (let i = 0; i < startDayIndex; i++) {
      days.push({ day: '', isCurrentMonth: false, isToday: false, hasVisit: false, date: null })
    }
    
    // 4. Add actual days
    for (let d = 1; d <= totalDaysInMonth; d++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      const isToday = d === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear()
      
      const hasVisit = scheduledVisits.some(v => v.scheduledDate === dateStr)
      
      days.push({
        day: d,
        isCurrentMonth: true,
        isToday,
        hasVisit,
        date: new Date(currentYear, currentMonth, d)
      })
    }
    
    // 5. Pad the end to keep grid consistent (optional but cleaner)
    while (days.length % 7 !== 0 || days.length < 35) {
        days.push({ day: '', isCurrentMonth: false, isToday: false, hasVisit: false, date: null })
    }
    
    return days
  }

  if (error) {
    return (
      <div className="min-h-screen bg-primary-50 flex items-center justify-center">
        <div className="text-center p-6">
          <FiXCircle className="w-12 h-12 mx-auto mb-3 text-primary-600" />
          <h3 className="text-sm font-medium text-primary-800 mb-1">Failed to load dashboard</h3>
          <Button size="sm" onClick={handleRefresh}>Retry</Button>
        </div>
      </div>
    )
  }

  const displayActivities = activityItems.slice(0, 10)
  const calendarDays = getCalendarDays()

  return (
    <div className="min-h-screen bg-primary-50">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-primary-50 border-b border-accent-200 px-4 lg:px-6 py-2 lg:py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-sm lg:text-base font-semibold text-primary-800">QS Dashboard</h1>
            <p className="text-[9px] lg:text-xs text-primary-500 mt-0.5 flex items-center gap-1">
              <FiClock className="w-3 h-3" />
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleRefresh} 
              disabled={isRefreshing} 
              className="p-1.5 rounded-md bg-primary-100 text-primary-600 hover:bg-primary-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Refresh dashboard"
            >
              <FiRefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
            <Button variant="primary" size="sm" onClick={() => navigate('/qs/reviews/pending')} className="h-8 text-xs">
              <FiBarChart2 className="w-3.5 h-3.5 mr-1.5" />
              Review Queue ({overallStats.pendingReviews})
            </Button>
          </div>
        </div>
      </div>

      <div className="px-4 lg:px-6 py-3 lg:py-4">
        {/* Stats Cards with horizontal scroll on mobile */}
        <div className="relative -mx-4 lg:mx-0 mb-4 lg:mb-5">
          <div 
            ref={statsScrollRef}
            className="overflow-x-auto scrollbar-hide px-4 lg:px-0"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            <div className="flex lg:grid lg:grid-cols-4 gap-2 min-w-max lg:min-w-0">
              <StatsCards stats={overallStats} role="qs" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-4">
          {/* Left Column - Activity Trail (70%) */}
          <div className="lg:col-span-8">
            <div className="border border-accent-200 rounded-lg bg-white overflow-hidden h-full flex flex-col">
              <div className="px-3 py-2 border-b border-accent-200 bg-primary-50 flex-shrink-0">
                <h2 className="text-xs font-semibold text-primary-800 flex items-center gap-1.5">
                  <FiMessageSquare className="w-3.5 h-3.5" /> Activity Trail
                  <span className="ml-1 text-[8px] font-normal text-primary-500">
                    ({displayActivities.length} comments)
                  </span>
                </h2>
              </div>

              {/* Loading State */}
              {(isLoading || isLoadingComments) && (
                <div className="p-4 space-y-3 flex-grow">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="animate-pulse">
                      <div className="h-3 bg-primary-100 rounded w-3/4 mb-2"></div>
                      <div className="h-2 bg-primary-50 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              )}

              {/* Activity Items */}
              {!isLoading && !isLoadingComments && (
                <div className="divide-y divide-accent-100 overflow-y-auto flex-grow" style={{ maxHeight: '400px' }}>
                  {displayActivities.length > 0 ? (
                    displayActivities.map((item) => (
                      <div 
                        key={item.id} 
                        onClick={() => navigate(`/qs/reports/${item.reportId}/review`)} 
                        className="p-3 hover:bg-primary-50 transition-colors cursor-pointer group"
                      >
                        <div className="flex items-start justify-between gap-2">
                          {/* Left side - Icon and Content */}
                          <div className="flex gap-2 min-w-0 flex-1">
                            <div className="flex-shrink-0 mt-0.5">
                              {getActivityIcon(item.type)}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-[11px] font-semibold text-primary-800">
                                {item.reportNo} 
                                <span className="font-normal text-primary-500">
                                   - {item.customerName}  • {item.projectName} 
                                </span>
                              </div>
                              <div className="text-[10px] text-primary-700 bg-primary-50 p-2 mt-1 rounded border-l-2 border-accent-400">
                                "{item.comment}"
                              </div>
                            </div>
                          </div>
                          
                          {/* Right side - Date and RM Name */}
                          <div className="text-right text-[8px] text-primary-500 whitespace-nowrap flex-shrink-0 ml-4">
                            {formatDate(item.timestamp)}
                            <div className="flex items-center gap-0.5 justify-end mt-1">
                              <FiUser className="w-2.5 h-2.5" /> {item.rmName}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center">
                      <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-accent-100 flex items-center justify-center">
                        <FiMessageSquare className="w-4 h-4 text-primary-500" />
                      </div>
                      <p className="text-xs font-medium text-primary-800">No comments yet</p>
                      <p className="text-[9px] text-primary-500 mt-1">
                        Comments from QS reviews will appear here
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Footer with view all link */}
              {displayActivities.length > 0 && (
                <div className="px-3 py-2 border-t border-accent-200 bg-primary-50 flex-shrink-0">
                  <button
                    onClick={() => navigate('/qs/activity')}
                    className="text-[9px] text-primary-600 hover:text-primary-800 flex items-center gap-1"
                  >
                    View all activity
                    <FiArrowRight className="w-2.5 h-2.5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Scheduled Visits (30%) */}
          <div className="lg:col-span-4">
            <div className="border border-accent-200 rounded-lg bg-white overflow-hidden h-full flex flex-col">
              <div className="px-3 py-2 border-b border-accent-200 bg-primary-50 flex-shrink-0">
                <h2 className="text-xs font-semibold text-primary-800 flex items-center gap-1.5">
                  <FiCalendar className="w-3.5 h-3.5" /> Scheduled Visits
                  <span className="ml-1 text-[8px] font-normal text-primary-500">
                    ({scheduledVisits.length})
                  </span>
                </h2>
              </div>

              {/* Calendar Grid - FIXED with Sunday first */}
              <div className="p-3 border-b border-accent-100 flex-shrink-0">
                <div className="text-[9px] font-medium text-primary-800 mb-2">
                  {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-[7px] mb-1">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
                    <div key={day} className="text-primary-400 font-medium">{day}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-[8px]">
                  {calendarDays.map((dayData, index) => (
                    <div
                      key={index}
                      className={`
                        p-1 rounded-full relative
                        ${dayData.isToday ? 'bg-primary-600 text-white font-medium' : 
                          dayData.isCurrentMonth ? 'text-primary-700' : 'text-primary-300'}
                        ${dayData.hasVisit && !dayData.isToday && dayData.isCurrentMonth ? 
                          'bg-accent-100 text-primary-800' : ''}
                      `}
                    >
                      {dayData.day}
                      {dayData.hasVisit && dayData.isCurrentMonth && (
                        <span className={`absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full ${dayData.isToday ? 'bg-white' : 'bg-accent-500'}`}></span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Visits List */}
              <div className="divide-y divide-accent-100 overflow-y-auto flex-grow" style={{ maxHeight: '220px' }}>
                {scheduledVisits.length > 0 ? (
                  scheduledVisits.map((visit) => (
                    <div 
                      key={visit.id} 
                      onClick={() => navigate(`/qs/reports/${visit.reportId}/review`)}
                      className="p-3 hover:bg-primary-50 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-start gap-2">
                        <FiMapPin className="w-3.5 h-3.5 text-accent-500 flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="text-[10px] font-semibold text-primary-800">{visit.reportNo}</span>
                            <span className="text-[8px] text-primary-500">•</span>
                            <span className="text-[9px] text-primary-600 truncate">{visit.customerName}</span>
                          </div>
                          <div className="flex items-start gap-1 mb-1">
                            <FiHome className="w-2.5 h-2.5 text-primary-400 flex-shrink-0 mt-0.5" />
                            <span className="text-[8px] text-primary-500 line-clamp-1">{visit.siteAddress}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[7px] text-primary-500 flex items-center gap-0.5">
                              <FiCalendar className="w-2 h-2" />
                              {formatVisitDate(visit.scheduledDate, visit.scheduledTime)}
                            </span>
                            <span className="text-[7px] text-primary-500 flex items-center gap-0.5">
                              <FiUser className="w-2 h-2" />
                              {visit.rmName}
                            </span>
                          </div>
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                          <FiArrowRight className="w-3 h-3 text-primary-500" />
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center">
                    <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-accent-100 flex items-center justify-center">
                      <FiCalendar className="w-3.5 h-3.5 text-primary-500" />
                    </div>
                    <p className="text-[10px] font-medium text-primary-800">No scheduled visits</p>
                    <p className="text-[8px] text-primary-500 mt-1">
                      Upcoming site visits will appear here
                    </p>
                  </div>
                )}
              </div>

              {/* Footer with schedule button */}
              <div className="px-3 py-2 border-t border-accent-200 bg-primary-50 flex-shrink-0">
                <button
                  onClick={() => navigate('/qs/site-visits/schedule')}
                  className="text-[9px] text-primary-600 hover:text-primary-800 flex items-center gap-1"
                >
                  Schedule new visit
                  <FiArrowRight className="w-2.5 h-2.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default QSDashboard