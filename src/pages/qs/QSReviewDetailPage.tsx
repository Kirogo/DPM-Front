// src/pages/qs/QSReviewDetailPage.tsx
import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { qsApi } from '@/services/api/qsApi'
import axiosInstance from '@/services/api/axiosConfig'
import { SiteVisitReport, Comment } from '@/types/report.types'
import { REPORT_STATUS, STATUS_CONFIG } from '@/constants/reportStatus'
import { Button } from '@/components/common/Button'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import {
  FiArrowLeft,
  FiUser,
  FiCalendar,
  FiMapPin,
  FiCamera,
  FiFileText,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiMessageSquare,
  FiDollarSign,
  FiBriefcase,
  FiClipboard,
  FiImage,
  FiFile,
  FiDownload,
  FiMessageCircle,
  FiInfo,
  FiSend,
  FiClock,
  FiList
} from 'react-icons/fi'
import toast from 'react-hot-toast'
import { formatDistanceToNow } from 'date-fns'
import { formatNairobiDateTime, formatCompactNairobiDateTime } from '@/utils/dateUtils'

interface ReviewState {
  report: SiteVisitReport | null
  comments: Comment[]
  isLoading: boolean
  isSubmitting: boolean
  isLocked: boolean
  lockedBy: { id: string; name: string } | null
  lockedAt: string | null
  activeTab: 'customer-info' | 'site-visit' | 'project-info' | 'documents' | 'photos' | 'audit'
  showReworkModal: boolean
  showApproveModal: boolean
  showCommentModal: boolean
  reworkComment: string
  approveComment: string
  newComment: string
  showScheduleVisitModal: boolean
  showConfirmVisitModal: boolean
  scheduleVisitDate: string
  scheduleVisitNotes: string
  confirmVisitFindings: string
  scheduledVisitData: {
    date: string
    notes: string
  } | null
}

// Tab configuration - EXACTLY matching RM steps
const tabs = [
  { id: 'customer-info', label: 'Customer Info', icon: FiUser, rmStep: 1 },
  { id: 'site-visit', label: 'Site Visit', icon: FiMapPin, rmStep: 2 },
  { id: 'project-info', label: 'Project Info', icon: FiBriefcase, rmStep: 3 },
  { id: 'documents', label: 'Documents', icon: FiFileText, rmStep: 4 },
  { id: 'photos', label: 'Photos', icon: FiCamera, rmStep: 5 },
]

// Helper function to transform comment data
const transformComment = (comment: any): Comment => ({
  id: comment.id || comment._id || '',
  reportId: comment.reportId || comment.ReportId || '',
  userId: comment.userId || comment.UserId || '',
  userName: comment.userName || comment.UserName || 'Unknown',
  userRole: comment.userRole || comment.UserRole || 'QS',
  text: comment.text || comment.Text || '',
  content: comment.text || comment.Text || '',
  isInternal: comment.isInternal || comment.IsInternal || false,
  createdAt: comment.createdAt || comment.CreatedAt || new Date().toISOString()
})

// Helper function to get value with case-insensitive access
const getValue = (obj: any, key: string): any => {
  if (!obj) return undefined

  if (obj[key] !== undefined && obj[key] !== null) return obj[key]

  const pascalKey = key.charAt(0).toUpperCase() + key.slice(1)
  if (obj[pascalKey] !== undefined && obj[pascalKey] !== null) return obj[pascalKey]

  const upperKey = key.toUpperCase()
  if (obj[upperKey] !== undefined && obj[upperKey] !== null) return obj[upperKey]

  return undefined
}

export const QSReviewDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()

  const [state, setState] = useState<ReviewState>({
    report: null,
    comments: [],
    isLoading: true,
    isSubmitting: false,
    isLocked: false,
    lockedBy: null,
    lockedAt: null,
    activeTab: 'customer-info',
    showReworkModal: false,
    showApproveModal: false,
    showCommentModal: false,
    reworkComment: '',
    approveComment: '',
    newComment: '',
    showScheduleVisitModal: false,
    showConfirmVisitModal: false,
    scheduleVisitDate: '',
    scheduleVisitNotes: '',
    confirmVisitFindings: '',
    scheduledVisitData: null
  })

  const commentsContainerRef = useRef<HTMLDivElement>(null)

  // Main effect - load data directly
  useEffect(() => {
    if (authLoading) {
      return
    }

    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    if (!id || !user) return

    const isValidGuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)

    if (!isValidGuid) {
      toast.error('Invalid report ID')
      navigate('/qs/reviews')
      return
    }

    loadReportData()
  }, [id, user, isAuthenticated, authLoading])

  // Scroll comments to top when new comments added
  useEffect(() => {
    if (commentsContainerRef.current) {
      commentsContainerRef.current.scrollTop = 0
    }
  }, [state.comments])

  // Check if we should open confirm modal automatically (coming from site visits page)
  useEffect(() => {
    const shouldOpenConfirm = sessionStorage.getItem('openConfirmModal')
    if (shouldOpenConfirm === 'true' && state.report?.status === REPORT_STATUS.SITE_VISIT_SCHEDULED) {
      setState(prev => ({ ...prev, showConfirmVisitModal: true }))
      sessionStorage.removeItem('openConfirmModal')
    }
  }, [state.report])

  const loadReportData = async () => {
    if (!id) return

    setState(prev => ({ ...prev, isLoading: true }))

    try {
      const response = await qsApi.getReportDetails(id!)
      const reportData = response.data

      // Load scheduled visit data if it exists
      const scheduledDate = getValue(reportData, 'siteVisitScheduledDate')
      const scheduledNotes = getValue(reportData, 'siteVisitNotes')

      await loadComments()

      setState(prev => ({
        ...prev,
        report: reportData,
        scheduledVisitData: scheduledDate ? {
          date: scheduledDate,
          notes: scheduledNotes || ''
        } : null,
        isLoading: false
      }))

    } catch (error: any) {
      toast.error('Failed to load report details')
      navigate('/qs/reviews')
    }
  }

  const loadComments = async () => {
    try {
      const commentsResponse = await axiosInstance.get(`/qs/reviews/${id}/comments`)

      if (commentsResponse.data && Array.isArray(commentsResponse.data)) {
        const mappedComments = commentsResponse.data.map(transformComment)

        // Sort newest first
        mappedComments.sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )

        setState(prev => ({
          ...prev,
          comments: mappedComments
        }))
      } else {
        setState(prev => ({ ...prev, comments: [] }))
      }
    } catch (commentError: any) {
      setState(prev => ({ ...prev, comments: [] }))
    }
  }

  const handleAddComment = async () => {
    if (!id || !state.newComment.trim()) return

    setState(prev => ({ ...prev, isSubmitting: true }))
    try {
      const response = await axiosInstance.post(`/qs/reviews/${id}/comments`, {
        comment: state.newComment.trim(),
        isInternal: false
      })

      const newComment = transformComment(response.data)

      setState(prev => ({
        ...prev,
        comments: [newComment, ...prev.comments],
        newComment: '',
        isSubmitting: false
      }))

      toast.success('Comment added')
    } catch (error: any) {
      toast.error('Failed to add comment')
      setState(prev => ({ ...prev, isSubmitting: false }))
    }
  }

  const handleRework = async () => {
    if (!id) return
    if (!state.reworkComment.trim()) {
      toast.error('Please provide comments for rework')
      return
    }

    setState(prev => ({ ...prev, isSubmitting: true }))
    try {
      await qsApi.requestRevision(id, state.reworkComment, [])
      toast.success('Report returned for rework')

      // Navigate back to the appropriate page
      const returnPath = sessionStorage.getItem('qsReturnPath') || '/qs/reviews/progress'
      navigate(returnPath)
    } catch (error) {
      toast.error('Failed to process rework request')
    } finally {
      setState(prev => ({ ...prev, isSubmitting: false }))
    }
  }

  const handleApprove = async () => {
    if (!id) return

    setState(prev => ({ ...prev, isSubmitting: true }))
    try {
      await qsApi.approveReport(id, state.approveComment)
      toast.success('Report approved successfully')

      // Navigate back to the appropriate page
      const returnPath = sessionStorage.getItem('qsReturnPath') || '/qs/reviews/completed'
      navigate(returnPath)
    } catch (error) {
      toast.error('Failed to approve report')
    } finally {
      setState(prev => ({ ...prev, isSubmitting: false }))
    }
  }

  const handleScheduleSiteVisit = async () => {
    if (!id) return
    if (!state.scheduleVisitDate) {
      toast.error('Please select a date for the site visit')
      return
    }

    setState(prev => ({ ...prev, isSubmitting: true }))
    try {
      console.log('Scheduling site visit for report:', id);
      console.log('Payload:', {
        scheduledDate: state.scheduleVisitDate,
        notes: state.scheduleVisitNotes
      });

      // IMPORTANT: Use the exact URL from Swagger
      const response = await axiosInstance.post(`/qs/reviews/${id}/schedule-site-visit`, {
        scheduledDate: state.scheduleVisitDate,
        notes: state.scheduleVisitNotes
      });

      console.log('Response:', response.data);

      toast.success('Site visit scheduled successfully')

      setState(prev => ({
        ...prev,
        showScheduleVisitModal: false,
        scheduleVisitDate: '',
        scheduleVisitNotes: '',
        scheduledVisitData: {
          date: prev.scheduleVisitDate,
          notes: prev.scheduleVisitNotes
        }
      }))

      await loadReportData()
    } catch (error: any) {
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url
      });

      toast.error(error.response?.data?.message || 'Failed to schedule site visit')
    } finally {
      setState(prev => ({ ...prev, isSubmitting: false }))
    }
  }

  const handleConfirmSiteVisit = async () => {
    if (!id) return
    if (!state.confirmVisitFindings.trim()) {
      toast.error('Please enter your site visit findings')
      return
    }

    setState(prev => ({ ...prev, isSubmitting: true }))
    try {
      await axiosInstance.post(`/qs/reviews/${id}/confirm-site-visit`, {
        findings: state.confirmVisitFindings
      })

      toast.success('Site visit confirmed')
      setState(prev => ({
        ...prev,
        showConfirmVisitModal: false,
        confirmVisitFindings: ''
      }))

      // Refresh report data
      await loadReportData()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to confirm site visit')
    } finally {
      setState(prev => ({ ...prev, isSubmitting: false }))
    }
  }

  const formatCurrency = (value?: string) => {
    if (!value) return '—'
    const num = parseFloat(value)
    if (isNaN(num)) return value
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(num)
  }

  // ==================== RENDER FUNCTIONS FOR TABS ====================
  const renderCustomerInfoTab = (report: SiteVisitReport, form: any) => (
    <div className="space-y-4">
      {/* Customer Information */}
      <div>
        <h3 className="text-[10px] font-bold text-[#1A3636] uppercase tracking-wider mb-2">Customer Information</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-[9px] text-[#677D6A]">Customer Name</p>
            <p className="text-xs font-medium text-[#1A3636] mt-0.5">{report.customerName || '—'}</p>
          </div>
          <div>
            <p className="text-[9px] text-[#677D6A]">Customer Number</p>
            <p className="text-xs text-[#40534C] mt-0.5">{report.customerNumber || '—'}</p>
          </div>
          <div>
            <p className="text-[9px] text-[#677D6A]">Email</p>
            <p className="text-xs text-[#40534C] truncate mt-0.5">{report.customerEmail || '—'}</p>
          </div>
          <div>
            <p className="text-[9px] text-[#677D6A]">IBPS Number</p>
            <p className="text-xs text-[#40534C] mt-0.5">{report.ibpsNo || '—'}</p>
          </div>
        </div>
      </div>

      <div className="border-t border-[#D6BD98]/10"></div>

      {/* Project Details */}
      <div>
        <h3 className="text-[10px] font-bold text-[#1A3636] uppercase tracking-wider mb-2">Project Details</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-[9px] text-[#677D6A]">Project Name</p>
            <p className="text-xs text-[#40534C] mt-0.5">{report.projectName || '—'}</p>
          </div>
          <div>
            <p className="text-[9px] text-[#677D6A]">RM</p>
            <p className="text-xs text-[#40534C] mt-0.5">{report.rmName || '—'}</p>
          </div>
        </div>
      </div>

      <div className="border-t border-[#D6BD98]/10"></div>

      {/* Timeline */}
      <div>
        <h3 className="text-[10px] font-bold text-[#1A3636] uppercase tracking-wider mb-2">Timeline</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-[9px] text-[#677D6A]">Submitted</p>
            <p className="text-xs text-[#40534C] mt-0.5">{formatNairobiDateTime(report.submittedAt)}</p>
          </div>
          <div>
            <p className="text-[9px] text-[#677D6A]">Last Updated</p>
            <p className="text-xs text-[#40534C] mt-0.5">{formatNairobiDateTime(report.updatedAt)}</p>
          </div>
        </div>
      </div>
    </div>
  )

  const renderSiteVisitTab = (form: any) => (
    <div className="space-y-4">
      {/* Visit Details */}
      <div>
        <h3 className="text-[10px] font-bold text-[#1A3636] uppercase tracking-wider mb-2 flex items-center gap-1">
          <FiMapPin className="w-3 h-3" />
          Visit Details
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-[9px] text-[#677D6A]">Date & Time</p>
            <p className="text-xs text-[#40534C] mt-0.5">{formatNairobiDateTime(form?.siteVisitDateTime)}</p>
          </div>
          <div>
            <p className="text-[9px] text-[#677D6A]">Person Met</p>
            <p className="text-xs text-[#40534C] mt-0.5">{form?.personMetAtSite || '—'}</p>
          </div>
          <div className="col-span-2">
            <p className="text-[9px] text-[#677D6A]">Exact Location</p>
            <p className="text-xs text-[#40534C] mt-0.5">{form?.siteExactLocation || '—'}</p>
          </div>
          <div>
            <p className="text-[9px] text-[#677D6A]">Plot/LR No.</p>
            <p className="text-xs text-[#40534C] mt-0.5">{form?.plotLrNo || '—'}</p>
          </div>
          <div>
            <p className="text-[9px] text-[#677D6A]">House Located Along</p>
            <p className="text-xs text-[#40534C] mt-0.5">{form?.houseLocatedAlong || '—'}</p>
          </div>
          <div>
            <p className="text-[9px] text-[#677D6A]">Site PIN</p>
            <p className="text-xs text-[#40534C] mt-0.5">{form?.sitePin || '—'}</p>
          </div>
          <div className="col-span-2">
            <p className="text-[9px] text-[#677D6A]">Security Details</p>
            <p className="text-xs text-[#40534C] mt-0.5">{form?.securityDetails || '—'}</p>
          </div>
        </div>
      </div>

      <div className="border-t border-[#D6BD98]/10"></div>

      {/* Amounts Breakdown */}
      <div>
        <h3 className="text-[10px] font-bold text-[#1A3636] uppercase tracking-wider mb-2">Amounts Breakdown</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-[9px] text-[#677D6A]">BQ Amount</p>
            <p className="text-sm font-semibold text-[#1A3636] mt-0.5">{formatCurrency(form?.bqAmount)}</p>
          </div>
          <div>
            <p className="text-[9px] text-[#677D6A]">Construction Loan</p>
            <p className="text-sm font-semibold text-[#1A3636] mt-0.5">{formatCurrency(form?.constructionLoanAmount)}</p>
          </div>
          <div>
            <p className="text-[9px] text-[#677D6A]">Customer Contribution</p>
            <p className="text-xs text-[#40534C] mt-0.5">{formatCurrency(form?.customerContribution)}</p>
          </div>
        </div>
      </div>

      <div className="border-t border-[#D6BD98]/10"></div>

      {/* Drawdown Funds */}
      <div>
        <h3 className="text-[10px] font-bold text-[#1A3636] uppercase tracking-wider mb-2 flex items-center gap-1">
          <FiList className="w-3 h-3" />
          Drawdown Funds
        </h3>
        <div className="space-y-2">
          {form?.drawdowns && form.drawdowns.length > 0 ? (
            form.drawdowns.map((drawdown: any, index: number) => (
              <div key={drawdown.id || index} className="grid grid-cols-2 gap-3 bg-[#F5F7F4] p-2 rounded mb-2">
                <div>
                  <p className="text-[8px] text-[#677D6A]">Drawdown {index + 1}</p>
                  <p className="text-xs font-medium text-[#1A3636] mt-0.5">{formatCurrency(drawdown.amount)}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-[#40534C]">No drawdowns recorded</p>
          )}
          <div className="grid grid-cols-2 gap-3 mt-2 pt-2 border-t border-[#D6BD98]/10">
            <div>
              <p className="text-[9px] font-semibold text-[#1A3636]">Subtotal Drawn</p>
              <p className="text-sm font-bold text-[#1A3636] mt-0.5">{formatCurrency(form?.drawnFundsSubtotal)}</p>
            </div>
            <div>
              <p className="text-[9px] font-semibold text-[#1A3636]">Undrawn Funds</p>
              <p className="text-sm font-bold text-[#1A3636] mt-0.5">{formatCurrency(form?.undrawnFundsToDate)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderProjectInfoTab = (form: any) => (
    <div className="space-y-4">
      {/* Site Visit Objectives */}
      <div>
        <h3 className="text-[10px] font-bold text-[#1A3636] uppercase tracking-wider mb-2">Site Visit Objectives</h3>
        <div className="space-y-2">
          <div className="bg-[#F5F7F4] p-2 rounded">
            <p className="text-[9px] text-[#677D6A] mb-0.5">Objective 1: Confirm progress</p>
            <p className="text-xs text-[#40534C]">{form?.siteVisitObjective1 || 'Not specified'}</p>
          </div>
          <div className="bg-[#F5F7F4] p-2 rounded">
            <p className="text-[9px] text-[#677D6A] mb-0.5">Objective 2: Check defects</p>
            <p className="text-xs text-[#40534C]">{form?.siteVisitObjective2 || 'Not specified'}</p>
          </div>
          <div className="bg-[#F5F7F4] p-2 rounded">
            <p className="text-[9px] text-[#677D6A] mb-0.5">Objective 3: Note materials</p>
            <p className="text-xs text-[#40534C]">{form?.siteVisitObjective3 || 'Not specified'}</p>
          </div>
        </div>
      </div>

      <div className="border-t border-[#D6BD98]/10"></div>

      {/* Works Progress */}
      <div>
        <h3 className="text-[10px] font-bold text-[#1A3636] uppercase tracking-wider mb-2">Works Progress</h3>
        <div className="space-y-2">
          <div>
            <p className="text-[9px] text-[#677D6A] mb-0.5">Works Complete</p>
            <div className="bg-[#F5F7F4] p-2 rounded">
              <p className="text-xs text-[#40534C]">{form?.worksComplete || 'Not specified'}</p>
            </div>
          </div>
          <div>
            <p className="text-[9px] text-[#677D6A] mb-0.5">Works Ongoing</p>
            <div className="bg-[#F5F7F4] p-2 rounded">
              <p className="text-xs text-[#40534C]">{form?.worksOngoing || 'Not specified'}</p>
            </div>
          </div>
          <div>
            <p className="text-[9px] text-[#677D6A] mb-0.5">Materials Found</p>
            <div className="bg-[#F5F7F4] p-2 rounded">
              <p className="text-xs text-[#40534C]">{form?.materialsFoundOnSite || 'Not specified'}</p>
            </div>
          </div>
          <div>
            <p className="text-[9px] text-[#677D6A] mb-0.5">Defects Noted</p>
            <div className="bg-[#F5F7F4] p-2 rounded border-l-2 border-amber-400">
              <p className="text-xs text-[#40534C]">{form?.defectsNotedOnSite || 'No defects noted'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-[#D6BD98]/10"></div>

      {/* Drawdown Request */}
      <div>
        <h3 className="text-[10px] font-bold text-[#1A3636] uppercase tracking-wider mb-2">Drawdown Request</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-[9px] text-[#677D6A]">Request Number</p>
            <p className="text-xs text-[#40534C] mt-0.5">{form?.drawdownRequestNo || '—'}</p>
          </div>
          <div>
            <p className="text-[9px] text-[#677D6A]">Amount Requested</p>
            <p className="text-sm font-semibold text-[#1A3636] mt-0.5">{formatCurrency(form?.drawdownKesAmount)}</p>
          </div>
        </div>
      </div>
    </div>
  )

  const renderDocumentsTab = (report: SiteVisitReport, form: any) => {
    const submittedDocs = form?.documentsSubmitted || {}

    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-[10px] font-bold text-[#1A3636] uppercase tracking-wider mb-2">Submitted Documents</h3>
          <div className="space-y-2">
            {[
              { key: 'qsValuation', label: 'QS Valuation' },
              { key: 'interimCertificate', label: 'Interim Certificate' },
              { key: 'customerInstructionLetter', label: 'Customer Instructions' },
              { key: 'contractorProgressReport', label: "Contractor's Progress" },
              { key: 'contractorInvoice', label: "Contractor's Invoice" },
            ].map((doc) => {
              const status = submittedDocs[doc.key]
              const fileUrl = submittedDocs[`${doc.key}File`]
              const reason = submittedDocs[`${doc.key}Reason`]

              return (
                <div key={doc.key} className="py-1.5 border-b border-[#D6BD98]/10 last:border-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#40534C]">{doc.label}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-medium ${status === 'Yes' ? 'bg-emerald-100 text-emerald-700' :
                      status === 'No' ? 'bg-amber-100 text-amber-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                      {status || '—'}
                    </span>
                  </div>

                  {status === 'Yes' && fileUrl && (
                    <div className="mt-1 flex items-center gap-1">
                      <FiFile className="w-2.5 h-2.5 text-[#677D6A]" />
                      <a
                        href={fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-blue-600 hover:underline"
                      >
                        View
                      </a>
                    </div>
                  )}

                  {status === 'No' && reason && (
                    <p className="mt-1 text-[9px] text-[#677D6A]">{reason}</p>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <div className="border-t border-[#D6BD98]/10"></div>

        <div>
          <h3 className="text-[10px] font-bold text-[#1A3636] uppercase tracking-wider mb-2">Sign-off</h3>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <p className="text-[9px] text-[#677D6A]">Prepared By</p>
              <p className="text-xs text-[#40534C] mt-0.5">{form?.preparedBy || '—'}</p>
            </div>
            <div>
              <p className="text-[9px] text-[#677D6A]">Signature</p>
              <p className="text-xs text-[#40534C] mt-0.5">{form?.signature || '—'}</p>
            </div>
            <div>
              <p className="text-[9px] text-[#677D6A]">Date</p>
              <p className="text-xs text-[#40534C] mt-0.5">{form?.preparedDate ? formatNairobiDateTime(form.preparedDate) : '—'}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderPhotosTab = (form: any) => {
    const photoSections = [
      { key: 'progressPhotosPage3', title: 'Progress Photos' },
      { key: 'materialsOnSitePhotos', title: 'Materials on Site' },
      { key: 'defectsNotedPhotos', title: 'Defects Noted' },
    ]

    return (
      <div className="space-y-4">
        {photoSections.map((section, idx) => {
          const photos = form?.[section.key] || []
          const validPhotos = photos.filter((url: string) => url && url.trim() !== '')

          return (
            <div key={`${section.key}-${idx}`}>
              {idx > 0 && <div className="border-t border-[#D6BD98]/10 my-3"></div>}
              <h3 className="text-[10px] font-bold text-[#1A3636] uppercase tracking-wider mb-2">{section.title}</h3>
              {validPhotos.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {validPhotos.map((url: string, index: number) => (
                    <a
                      key={`${section.key}-${index}`}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative aspect-square rounded border border-[#D6BD98]/20 hover:border-[#677D6A] transition-all overflow-hidden"
                    >
                      <img
                        src={url}
                        alt={`${section.title} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </a>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 border border-dashed border-[#D6BD98]/20 rounded">
                  <FiImage className="w-5 h-5 text-[#D6BD98] mx-auto mb-1" />
                  <p className="text-[10px] text-[#677D6A]">No photos</p>
                </div>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  // ==================== END RENDER FUNCTIONS ====================

  if (state.isLoading && authLoading) {
    return (
      <div className="min-h-screen bg-white flex justify-center py-12">
        <LoadingSpinner size="lg" label="Loading report details..." />
      </div>
    )
  }

  if (!state.report) {
    return (
      <div className="min-h-screen bg-white flex justify-center py-12">
        <div className="text-center">
          <FiAlertCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
          <p className="text-xs text-[#677D6A]">Report not found</p>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              const returnPath = sessionStorage.getItem('qsReturnPath') || '/qs/reviews'
              navigate(returnPath)
            }}
            className="mt-3 text-xs"
          >
            Back to Reviews
          </Button>
        </div>
      </div>
    )
  }

  const report = state.report
  const form = report.siteVisitForm as any

  return (
    <div className="min-h-screen bg-white">
      {/* Site Visit Scheduled Banner - Updated */}
      {state.scheduledVisitData && (
        <div className="bg-accent-200 border-b border-accent-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
            <div className="flex items-center gap-2">
              <FiMapPin className="w-3 h-3 text-primary-600" />
              <span className="text-[9px] text-primary-600 font-medium">
                Site Visit Scheduled -  {state.scheduledVisitData.notes && (
                <span className="text-[8px] text-primary-600 font-medium" >
                  Notes: {state.scheduledVisitData.notes}
                </span>
              )}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Site Visit Findings Banner - Updated */}
      {getValue(report, 'siteVisitFindings') && (
        <div className="bg-primary-50 border-b border-primary-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
            <div className="flex items-center gap-2">
              <FiCheckCircle className="w-3 h-3 text-primary-600" />
              <span className="text-[9px] text-primary-800 font-medium">
                Site Visit Completed
              </span>
              <span className="text-[8px] text-primary-600 truncate">
                {getValue(report, 'siteVisitFindings')}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="sticky top-0 z-20 bg-white border-b border-[#D6BD98]/10 shadow-sm">
        <div className="px-3 lg:px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const returnPath = sessionStorage.getItem('qsReturnPath') || '/qs/reviews'
                  navigate(returnPath)
                }}
                className="p-1 hover:bg-[#D6BD98]/10 rounded transition-colors"
              >
                <FiArrowLeft className="w-4 h-4 text-[#40534C]" />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-sm font-semibold text-[#1A3636]">
                    {report.reportNo || `CRN-${report.id?.slice(0, 8)}`}
                  </h1>
                </div>
                <p className="text-[9px] text-[#677D6A]">
                  {report.customerName}
                </p>
              </div>
            </div>

            {/* Action Buttons - Updated with theme colors */}
            <div className="flex items-center gap-1.5">
              {report.status === REPORT_STATUS.SITE_VISIT_SCHEDULED ? (
                <>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setState(prev => ({ ...prev, showConfirmVisitModal: true }))}
                    className="bg-primary-600 hover:bg-primary-700 text-white text-[9px] h-6 px-2"
                  >
                    <FiCheckCircle className="w-2.5 h-2.5 mr-1" />
                    Confirm Visit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setState(prev => ({ ...prev, showReworkModal: true }))}
                    className="border-accent-500 text-primary-600 hover:bg-accent-100 text-[9px] h-6 px-2"
                  >
                    <FiXCircle className="w-2.5 h-2.5 mr-1" />
                    Rework
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setState(prev => ({ ...prev, showApproveModal: true }))}
                    className="bg-primary-600 hover:bg-primary-700 text-white text-[9px] h-6 px-2"
                  >
                    <FiCheckCircle className="w-2.5 h-2.5 mr-1" />
                    Approve
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setState(prev => ({ ...prev, showScheduleVisitModal: true }))}
                    className="border-accent-500 text-primary-600 hover:bg-accent-100 text-[9px] h-6 px-2"
                  >
                    <FiMapPin className="w-2.5 h-2.5 mr-1" />
                    Schedule Visit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setState(prev => ({ ...prev, showReworkModal: true }))}
                    className="border-accent-500 text-primary-600 hover:bg-accent-100 text-[9px] h-6 px-2"
                  >
                    <FiXCircle className="w-2.5 h-2.5 mr-1" />
                    Rework
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setState(prev => ({ ...prev, showApproveModal: true }))}
                    className="bg-primary-600 hover:bg-primary-700 text-white text-[9px] h-6 px-2"
                  >
                    <FiCheckCircle className="w-2.5 h-2.5 mr-1" />
                    Approve
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-3 lg:px-4 border-t border-[#D6BD98]/10">
          <div className="flex gap-1 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = state.activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setState(prev => ({ ...prev, activeTab: tab.id as any }))}
                  className={`
                    flex items-center gap-1 px-3 py-1.5 text-[9px] font-medium whitespace-nowrap
                    border-b transition-all
                    ${isActive
                      ? 'border-[#1A3636] text-[#1A3636] font-semibold'
                      : 'border-transparent text-[#677D6A] hover:text-[#40534C]'
                    }
                  `}
                >
                  <Icon className="w-3 h-3" />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Main Content - 70/30 Split */}
      <div className="flex flex-col lg:flex-row">
        {/* Left Column - Main Content (70%) */}
        <div className="lg:w-[70%] px-3 lg:px-4 py-3 bg-white">
          {state.activeTab === 'customer-info' && renderCustomerInfoTab(report, form)}
          {state.activeTab === 'site-visit' && renderSiteVisitTab(form)}
          {state.activeTab === 'project-info' && renderProjectInfoTab(form)}
          {state.activeTab === 'documents' && renderDocumentsTab(report, form)}
          {state.activeTab === 'photos' && renderPhotosTab(form)}
        </div>

        {/* Right Column - Comments Sidebar (30%) */}
        <div className="lg:w-[30%] bg-white border-l border-[#D6BD98]/10">
          <div className="sticky top-[90px] h-[calc(100vh-90px)] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="px-3 py-2 border-b border-[#D6BD98]/10 bg-white">
              <div className="flex items-center justify-between">
                <h3 className="text-[9px] font-bold text-[#1A3636] uppercase tracking-wider">
                  Comments
                </h3>
                <span className="text-[8px] text-[#677D6A] bg-[#F5F7F4] px-1.5 py-0.5 rounded">
                  {state.comments.length}
                </span>
              </div>
            </div>

            {/* Scrollable Comments Container */}
            <div
              ref={commentsContainerRef}
              className="flex-1 overflow-y-auto bg-white"
            >
              {state.comments.length === 0 ? (
                <div className="text-center py-8">
                  <FiMessageSquare className="w-4 h-4 text-[#D6BD98] mx-auto mb-1" />
                  <p className="text-[9px] text-[#677D6A]">No comments</p>
                </div>
              ) : (
                <div className="divide-y divide-[#D6BD98]/5">
                  {state.comments.map((comment, index) => {
                    const isCurrentUser = comment.userId === user?.id
                    const isLatest = index === 0

                    return (
                      <div
                        key={comment.id || `comment-${index}`}
                        className={`px-3 py-2 hover:bg-[#F5F7F4]/30 transition-colors ${isLatest ? 'bg-[#F5F7F4]/50' : ''
                          }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-1.5">
                            <span className={`text-[9px] font-bold ${isCurrentUser ? 'text-[#1A3636]' : 'text-[#40534C]'
                              }`}>
                              {comment.userName}
                            </span>
                            <span className="text-[7px] font-medium text-[#677D6A] bg-white px-1 py-0.5 rounded border border-[#D6BD98]/10">
                              {comment.userRole}
                            </span>
                            {isLatest && (
                              <span className="text-[6px] font-medium text-emerald-600 bg-emerald-50 px-1 py-0.5 rounded">
                                New
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-0.5 text-[#677D6A]">
                            <FiClock className="w-2 h-2" />
                            <span className="text-[7px] whitespace-nowrap">
                              {formatCompactNairobiDateTime(comment.createdAt)}
                            </span>
                          </div>
                        </div>

                        <p className="text-[9px] text-[#40534C] leading-relaxed">
                          {comment.text}
                        </p>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Schedule Site Visit Modal */}
      {state.showScheduleVisitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30">
          <div className="bg-white rounded max-w-sm w-full p-4">
            <h3 className="text-sm font-bold text-primary-800 mb-3">Schedule Site Visit</h3>

            <div className="mb-3">
              <label className="block text-[9px] font-medium text-primary-500 mb-1">
                Visit Date & Time *
              </label>
              <input
                type="datetime-local"
                value={state.scheduleVisitDate}
                onChange={(e) => setState(prev => ({ ...prev, scheduleVisitDate: e.target.value }))}
                className="w-full px-2 py-1.5 text-xs border border-accent-300 rounded focus:outline-none focus:border-primary-600 focus:ring-1 focus:ring-primary-200"
                min={new Date().toISOString().slice(0, 16)}
                required
              />
            </div>

            <div className="mb-3">
              <label className="block text-[9px] font-medium text-primary-500 mb-1">
                Notes / Special Instructions
              </label>
              <textarea
                value={state.scheduleVisitNotes}
                onChange={(e) => setState(prev => ({ ...prev, scheduleVisitNotes: e.target.value }))}
                rows={3}
                className="w-full px-2 py-1.5 text-xs border border-accent-300 rounded focus:outline-none focus:border-primary-600 focus:ring-1 focus:ring-primary-200"
                placeholder="Add any notes about the site visit..."
              />
            </div>

            <div className="bg-accent-100 p-2 rounded mb-3">
              <p className="text-[8px] text-primary-600 flex items-start gap-1">
                <FiInfo className="w-2.5 h-2.5 mt-0.5 flex-shrink-0" />
                <span>This will mark the report for site visit. You can confirm the visit after completion.</span>
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={handleScheduleSiteVisit}
                disabled={!state.scheduleVisitDate || state.isSubmitting}
                className="flex-1 bg-primary-600 hover:bg-primary-700 text-white text-xs py-1"
              >
                {state.isSubmitting ? 'Scheduling...' : 'Schedule Visit'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setState(prev => ({ ...prev, showScheduleVisitModal: false, scheduleVisitDate: '', scheduleVisitNotes: '' }))}
                className="flex-1 border border-accent-400 text-primary-600 hover:bg-accent-100 text-xs py-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Site Visit Modal */}
      {state.showConfirmVisitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30">
          <div className="bg-white rounded max-w-sm w-full p-4">
            <h3 className="text-sm font-bold text-primary-800 mb-3">Confirm Site Visit</h3>

            <div className="mb-3">
              <label className="block text-[9px] font-medium text-primary-500 mb-1">
                Site Visit Findings *
              </label>
              <textarea
                value={state.confirmVisitFindings}
                onChange={(e) => setState(prev => ({ ...prev, confirmVisitFindings: e.target.value }))}
                rows={5}
                className="w-full px-2 py-1.5 text-xs border border-accent-300 rounded focus:outline-none focus:border-primary-600 focus:ring-1 focus:ring-primary-200"
                placeholder="Describe what you observed during the site visit. Does it match the report? Any issues found?"
                autoFocus
              />
            </div>

            <div className="bg-accent-100 p-2 rounded mb-3">
              <p className="text-[8px] text-primary-600 flex items-start gap-1">
                <FiCheckCircle className="w-2.5 h-2.5 mt-0.5 flex-shrink-0" />
                <span>After confirming, you can either approve the report or request rework based on your findings.</span>
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={handleConfirmSiteVisit}
                disabled={!state.confirmVisitFindings.trim() || state.isSubmitting}
                className="flex-1 bg-primary-600 hover:bg-primary-700 text-white text-xs py-1"
              >
                {state.isSubmitting ? 'Confirming...' : 'Confirm Visit'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setState(prev => ({ ...prev, showConfirmVisitModal: false, confirmVisitFindings: '' }))}
                className="flex-1 border border-accent-400 text-primary-600 hover:bg-accent-100 text-xs py-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Rework Modal */}
      {state.showReworkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30">
          <div className="bg-white rounded max-w-sm w-full p-4">
            <h3 className="text-sm font-bold text-primary-800 mb-3">Return for Rework</h3>
            <textarea
              value={state.reworkComment}
              onChange={(e) => setState(prev => ({ ...prev, reworkComment: e.target.value }))}
              rows={3}
              className="w-full px-2 py-1.5 text-xs border border-accent-300 rounded focus:outline-none focus:border-primary-600 focus:ring-1 focus:ring-primary-200 mb-3"
              placeholder="Explain what needs to be changed..."
              autoFocus
            />
            <div className="flex gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={handleRework}
                disabled={!state.reworkComment.trim() || state.isSubmitting}
                className="flex-1 bg-primary-600 hover:bg-primary-700 text-white text-xs py-1"
              >
                {state.isSubmitting ? '...' : 'Rework'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setState(prev => ({ ...prev, showReworkModal: false, reworkComment: '' }))}
                className="flex-1 border border-accent-400 text-primary-600 hover:bg-accent-100 text-xs py-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Approve Modal */}
      {state.showApproveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30">
          <div className="bg-white rounded max-w-sm w-full p-4">
            <h3 className="text-sm font-bold text-primary-800 mb-3">Approve Report</h3>
            <textarea
              value={state.approveComment}
              onChange={(e) => setState(prev => ({ ...prev, approveComment: e.target.value }))}
              rows={2}
              className="w-full px-2 py-1.5 text-xs border border-accent-300 rounded focus:outline-none focus:border-primary-600 focus:ring-1 focus:ring-primary-200 mb-3"
              placeholder="Add notes (optional)"
            />
            <div className="flex gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={handleApprove}
                disabled={state.isSubmitting}
                className="flex-1 bg-primary-600 hover:bg-primary-700 text-white text-xs py-1"
              >
                {state.isSubmitting ? '...' : 'Approve'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setState(prev => ({ ...prev, showApproveModal: false, approveComment: '' }))}
                className="flex-1 border border-accent-400 text-primary-600 hover:bg-accent-100 text-xs py-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default QSReviewDetailPage