// src/pages/rm/ReportViewPage.tsx
import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useGetChecklistByIdQuery } from '@/services/api/checklistsApi'
import { useAuth } from '@/hooks/useAuth'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { generateSiteVisitReportPDF } from '@/utils/pdfGenerator'
import { Button } from '@/components/common/Button'
import toast from 'react-hot-toast'
import { REPORT_STATUS } from '@/constants/reportStatus'
import axiosInstance from '@/services/api/axiosConfig'
import { Comment } from '@/types/report.types'
import {
  FiArrowLeft,
  FiUser,
  FiMapPin,
  FiBriefcase,
  FiFileText,
  FiImage,
  FiAlertCircle,
  FiCheckCircle,
  FiHome,
  FiDownload,
  FiTarget,
  FiFileSignature,
  FiEye,
  FiInfo,
  FiClipboard,
  FiList,
  FiClock,
  FiMessageSquare
} from 'react-icons/fi'
import { formatNairobiDateTime, formatCompactNairobiDateTime } from '@/utils/dateUtils'
// IMPORT THE LOGO DIRECTLY
import ncbaLogo from '@/assets/NCBALogo.png'

// Helper function to deep clone an object
const deepClone = <T,>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj))
}

// Helper function to get value with case-insensitive access
const getValue = (obj: any, key: string): any => {
  if (!obj) return undefined

  if (obj[key] !== undefined && obj[key] !== null) return obj[key]

  const pascalKey = key.charAt(0).toUpperCase() + key.slice(1)
  if (obj[pascalKey] !== undefined && obj[pascalKey] !== null) return obj[pascalKey]

  return undefined
}

// Helper to convert image to base64
const getBase64ImageFromUrl = async (imageUrl: string): Promise<string> => {
  try {
    const response = await fetch(imageUrl)
    const blob = await response.blob()
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  } catch (error) {
    console.error('Failed to load image:', error)
    return ''
  }
}

// Helper function to transform comment data
const transformComment = (comment: any): Comment => ({
  id: comment.id || comment._id || '',
  reportId: comment.reportId || comment.ReportId || '',
  userId: comment.userId || comment.UserId || '',
  userName: comment.userName || comment.UserName || 'Unknown',
  userRole: comment.userRole || comment.UserRole || '',
  text: comment.text || comment.Text || '',
  content: comment.text || comment.Text || '',
  isInternal: comment.isInternal || comment.IsInternal || false,
  createdAt: comment.createdAt || comment.CreatedAt || new Date().toISOString()
})

// Direct status extractor
const getReportStatus = (checklist: any): string => {
  if (!checklist) return 'pending'

  if (checklist.status) return checklist.status.toLowerCase()
  if (checklist.Status) return checklist.Status.toLowerCase()

  const status = getValue(checklist, 'status')
  if (status) return status.toLowerCase()

  return 'pending'
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

// Status Badge Component
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const statusLower = status?.toLowerCase() || 'pending'

  const statusConfig: Record<string, { label: string; color: string; bgColor: string }> = {
    pending: { label: 'Pending', color: 'text-[#677D6A]', bgColor: 'bg-[#677D6A]/10' },
    draft: { label: 'Draft', color: 'text-[#40534C]', bgColor: 'bg-[#D6BD98]/20' },
    submitted: { label: 'QS Review', color: 'text-[#1A3636]', bgColor: 'bg-[#D6BD98]/30' },
    rework: { label: 'Rework', color: 'text-orange-700', bgColor: 'bg-orange-100' },
    [REPORT_STATUS.SITE_VISIT_SCHEDULED]: {
      label: 'Site Visit Scheduled',
      color: 'text-[#40534C]',
      bgColor: 'bg-[#F0E2CC]'
    },
    approved: { label: 'Approved', color: 'text-white', bgColor: 'bg-[#677D6A]' },
    rejected: { label: 'Rejected', color: 'text-red-600', bgColor: 'bg-red-100' },
  }

  const config = statusConfig[statusLower] || statusConfig.pending

  return (
    <span className={`${config.bgColor} ${config.color} px-2 py-0.5 rounded-full text-[9px] font-medium whitespace-nowrap`}>
      {config.label}
    </span>
  )
}

// Tab configuration
const tabs = [
  { id: 'customer-info', label: 'Customer Info', icon: FiUser },
  { id: 'site-visit', label: 'Site Visit', icon: FiMapPin },
  { id: 'project-info', label: 'Project Info', icon: FiHome },
  { id: 'financial', label: 'Financial', icon: FiBriefcase },
  { id: 'documents', label: 'Documents', icon: FiFileText },
  { id: 'photos', label: 'Photos', icon: FiImage },
]

export const ReportViewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('customer-info')
  const [isDownloading, setIsDownloading] = useState(false)
  const [logoBase64, setLogoBase64] = useState<string>('')
  const [comments, setComments] = useState<Comment[]>([])
  const [isLoadingComments, setIsLoadingComments] = useState(false)

  const commentsContainerRef = useRef<HTMLDivElement>(null)

  const { data: checklist, isLoading, error, refetch } = useGetChecklistByIdQuery(id!, {
    skip: !id,
    refetchOnMountOrArgChange: true
  })

  // Load logo when component mounts
  useEffect(() => {
    const loadLogo = async () => {
      try {
        const base64 = await getBase64ImageFromUrl(ncbaLogo)
        if (base64) {
          setLogoBase64(base64)
          console.log('Logo loaded successfully')
        }
      } catch (error) {
        console.error('Failed to load logo:', error)
      }
    }

    loadLogo()
  }, [])

  // Fetch comments
  useEffect(() => {
    if (id) {
      fetchComments()
    }
  }, [id])

  // Scroll comments to top when new comments added
  useEffect(() => {
    if (commentsContainerRef.current) {
      commentsContainerRef.current.scrollTop = 0
    }
  }, [comments])

  const fetchComments = async () => {
    setIsLoadingComments(true)
    try {
      const response = await axiosInstance.get(`/qs/reviews/${id}/comments`)
      const fetchedComments = (response.data || []).map(transformComment)
      fetchedComments.sort((a: Comment, b: Comment) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      setComments(fetchedComments)
    } catch (error) {
      console.log('No comments available')
    } finally {
      setIsLoadingComments(false)
    }
  }

  useEffect(() => {
    const returnPath = sessionStorage.getItem('rmReportsReturnPath') || '/rm/reports'
    return () => {
      sessionStorage.removeItem('rmReportsReturnPath')
    }
  }, [])

  const handleGoBack = () => {
    const returnPath = sessionStorage.getItem('rmReportsReturnPath') || '/rm/reports'
    navigate(returnPath)
  }

  const handleDownloadPDF = async () => {
    if (!checklist) return

    setIsDownloading(true)
    try {
      let formData: any = {}
      if (checklist.siteVisitForm && typeof checklist.siteVisitForm === 'object') {
        formData = deepClone(checklist.siteVisitForm)
      } else if (checklist.SiteVisitForm && typeof checklist.SiteVisitForm === 'object') {
        formData = deepClone(checklist.SiteVisitForm)
      } else if (checklist.siteVisitFormJson) {
        try {
          formData = JSON.parse(checklist.siteVisitFormJson)
        } catch (e) {
          console.error('Failed to parse siteVisitFormJson:', e)
          formData = {}
        }
      }

      formData = {
        ...formData,
        progressPhotosPage3: formData.progressPhotosPage3 || [],
        materialsOnSitePhotos: formData.materialsOnSitePhotos || [],
        defectsNotedPhotos: formData.defectsNotedPhotos || [],
        documentsSubmitted: formData.documentsSubmitted || {}
      }

      const reportNumber = (getValue(checklist, 'callReportNo') || getValue(checklist, 'dclNo') || 'CRN-000').replace(/^DCL-/i, 'CRN-')
      const customerNumber = getValue(checklist, 'customerNumber') || '—'
      const reportStatus = getReportStatus(checklist)

      formData = {
        ...formData,
        customerNumber: customerNumber,
        customerName: getValue(checklist, 'customerName'),
        customerEmail: getValue(checklist, 'customerEmail'),
        projectName: getValue(checklist, 'projectName'),
        ibpsNo: getValue(checklist, 'ibpsNo'),
        callReportNo: reportNumber
      }

      const doc = generateSiteVisitReportPDF(
        formData,
        reportNumber,
        logoBase64,
        reportStatus,
        undefined
      )

      doc.save(`Site_Visit_Report_${reportNumber}_${new Date().toISOString().split('T')[0]}.pdf`)
      toast.success('PDF downloaded successfully!')
    } catch (error) {
      console.error('PDF generation error:', error)
      toast.error('Failed to generate PDF')
    } finally {
      setIsDownloading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex justify-center items-center py-12">
        <LoadingSpinner size="lg" label="Loading report..." />
      </div>
    )
  }

  if (error || !checklist) {
    return (
      <div className="min-h-screen bg-white flex justify-center items-center py-12">
        <div className="text-center max-w-md mx-auto">
          <FiAlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
          <h2 className="text-sm font-semibold text-[#1A3636] mb-1">Report Not Found</h2>
          <p className="text-[10px] text-[#677D6A] mb-3">The requested report could not be found.</p>
          <button
            onClick={handleGoBack}
            className="px-3 py-1.5 bg-[#1A3636] text-white rounded text-[10px]"
          >
            Back to Reports
          </button>
        </div>
      </div>
    )
  }

  const status = getReportStatus(checklist)

  let form: any = {}
  if (checklist.siteVisitForm && typeof checklist.siteVisitForm === 'object') {
    form = deepClone(checklist.siteVisitForm)
  } else if (checklist.SiteVisitForm && typeof checklist.SiteVisitForm === 'object') {
    form = deepClone(checklist.SiteVisitForm)
  } else if (checklist.siteVisitFormJson) {
    try {
      form = JSON.parse(checklist.siteVisitFormJson)
    } catch (e) {
      console.error('Failed to parse siteVisitFormJson:', e)
    }
  }

  const reportNumber = (getValue(checklist, 'callReportNo') || getValue(checklist, 'dclNo') || 'CRN-000').replace(/^DCL-/i, 'CRN-')
  const customerName = getValue(checklist, 'customerName') || 'Unknown Customer'
  const customerNumber = getValue(checklist, 'customerNumber') || '—'

  // Render functions for each tab
  const renderCustomerInfoTab = () => (
    <div className="space-y-4">
      <div>
        <h3 className="text-[10px] font-bold text-[#1A3636] uppercase tracking-wider mb-2">Customer Information</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-[9px] text-[#677D6A]">Report No.</p>
            <p className="text-xs font-medium text-[#1A3636] mt-0.5">{reportNumber}</p>
          </div>
          <div>
            <p className="text-[9px] text-[#677D6A]">Customer No.</p>
            <p className="text-xs text-[#40534C] mt-0.5">{customerNumber}</p>
          </div>
          <div>
            <p className="text-[9px] text-[#677D6A]">Customer Name</p>
            <p className="text-xs text-[#40534C] mt-0.5">{getValue(checklist, 'customerName') || '—'}</p>
          </div>
          <div>
            <p className="text-[9px] text-[#677D6A]">Customer Type</p>
            <p className="text-xs text-[#40534C] mt-0.5">{form?.customerType || '—'}</p>
          </div>
          <div>
            <p className="text-[9px] text-[#677D6A]">Email</p>
            <p className="text-xs text-[#40534C] truncate mt-0.5">{getValue(checklist, 'customerEmail') || '—'}</p>
          </div>
          <div>
            <p className="text-[9px] text-[#677D6A]">IBPS Number</p>
            <p className="text-xs text-[#40534C] mt-0.5">{getValue(checklist, 'ibpsNo') || '—'}</p>
          </div>
          <div className="col-span-2">
            <p className="text-[9px] text-[#677D6A]">Brief Profile</p>
            <p className="text-xs text-[#40534C] mt-0.5">{form?.briefProfile || '—'}</p>
          </div>
        </div>
      </div>

      <div className="border-t border-[#D6BD98]/10"></div>

      <div>
        <h3 className="text-[10px] font-bold text-[#1A3636] uppercase tracking-wider mb-2">Project Details</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-[9px] text-[#677D6A]">Project Name</p>
            <p className="text-xs text-[#40534C] mt-0.5">{getValue(checklist, 'projectName') || '—'}</p>
          </div>
          <div>
            <p className="text-[9px] text-[#677D6A]">RM</p>
            <p className="text-xs text-[#40534C] mt-0.5">{getValue(checklist, 'rmName') || '—'}</p>
          </div>
        </div>
      </div>

      <div className="border-t border-[#D6BD98]/10"></div>

      <div>
        <h3 className="text-[10px] font-bold text-[#1A3636] uppercase tracking-wider mb-2">Timeline</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-[9px] text-[#677D6A]">Submitted</p>
            <p className="text-xs text-[#40534C] mt-0.5">{formatNairobiDateTime(checklist.submittedAt)}</p>
          </div>
          <div>
            <p className="text-[9px] text-[#677D6A]">Last Updated</p>
            <p className="text-xs text-[#40534C] mt-0.5">{formatNairobiDateTime(checklist.updatedAt)}</p>
          </div>
        </div>
      </div>
    </div>
  )

  const renderSiteVisitTab = () => (
    <div className="space-y-4">
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

      {/* Drawdown Funds with multiple drawdowns */}
      <div>
        <h3 className="text-[10px] font-bold text-[#1A3636] uppercase tracking-wider mb-2">Drawdown Funds</h3>
        <div className="space-y-2">
          {form?.drawdowns && form.drawdowns.length > 0 ? (
            form.drawdowns.map((drawdown: any, index: number) => (
              <div key={drawdown.id || index} className="grid grid-cols-2 gap-3 bg-[#F5F7F4] p-2 rounded">
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

  const renderProjectInfoTab = () => (
    <div className="space-y-4">
      <div>
        <h3 className="text-[10px] font-bold text-[#1A3636] uppercase tracking-wider mb-2 flex items-center gap-1">
          <FiTarget className="w-3 h-3" />
          Site Visit Objectives
        </h3>
        <div className="space-y-2">
          <div className="bg-[#F5F7F4] p-2 rounded">
            <p className="text-[8px] text-[#677D6A] mb-0.5">Objective 1: Confirm progress</p>
            <p className="text-[10px] text-[#40534C]">{form?.siteVisitObjective1 || '—'}</p>
          </div>
          <div className="bg-[#F5F7F4] p-2 rounded">
            <p className="text-[8px] text-[#677D6A] mb-0.5">Objective 2: Check defects</p>
            <p className="text-[10px] text-[#40534C]">{form?.siteVisitObjective2 || '—'}</p>
          </div>
          <div className="bg-[#F5F7F4] p-2 rounded">
            <p className="text-[8px] text-[#677D6A] mb-0.5">Objective 3: Note materials</p>
            <p className="text-[10px] text-[#40534C]">{form?.siteVisitObjective3 || '—'}</p>
          </div>
        </div>
      </div>

      <div className="border-t border-[#D6BD98]/10"></div>

      <div>
        <h3 className="text-[10px] font-bold text-[#1A3636] uppercase tracking-wider mb-2">Works Progress</h3>
        <div className="space-y-2">
          <div>
            <p className="text-[9px] text-[#677D6A]">Works Complete</p>
            <p className="text-[10px] text-[#40534C] mt-0.5 bg-[#F5F7F4] p-2 rounded">{form?.worksComplete || '—'}</p>
          </div>
          <div>
            <p className="text-[9px] text-[#677D6A]">Works Ongoing</p>
            <p className="text-[10px] text-[#40534C] mt-0.5 bg-[#F5F7F4] p-2 rounded">{form?.worksOngoing || '—'}</p>
          </div>
          <div>
            <p className="text-[9px] text-[#677D6A]">Materials Found on Site</p>
            <p className="text-[10px] text-[#40534C] mt-0.5 bg-[#F5F7F4] p-2 rounded">{form?.materialsFoundOnSite || '—'}</p>
          </div>
          <div>
            <p className="text-[9px] text-[#677D6A]">Defects Noted on Site</p>
            <p className="text-[10px] text-amber-800 mt-0.5 bg-amber-50 p-2 rounded border-l-2 border-amber-400">
              {form?.defectsNotedOnSite || '—'}
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-[#D6BD98]/10"></div>

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

  const renderFinancialTab = () => (
    <div className="space-y-4">
      <div>
        <h3 className="text-[10px] font-bold text-[#1A3636] uppercase tracking-wider mb-2 flex items-center gap-1">
          <FiBriefcase className="w-3 h-3" />
          Financial Summary
        </h3>
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

      {/* Drawdown Details with multiple drawdowns */}
      <div>
        <h3 className="text-[10px] font-bold text-[#1A3636] uppercase tracking-wider mb-2">Drawdown Details</h3>
        <div className="space-y-2">
          {form?.drawdowns && form.drawdowns.length > 0 ? (
            form.drawdowns.map((drawdown: any, index: number) => (
              <div key={drawdown.id || index} className="flex justify-between py-1 border-b border-[#D6BD98]/10 last:border-0">
                <p className="text-[9px] text-[#677D6A]">Drawdown {index + 1}</p>
                <p className="text-xs font-medium text-[#1A3636]">{formatCurrency(drawdown.amount)}</p>
              </div>
            ))
          ) : (
            <p className="text-xs text-[#40534C]">No drawdowns recorded</p>
          )}
          <div className="flex justify-between pt-2 mt-2 border-t border-[#D6BD98]/10">
            <p className="text-[9px] font-semibold text-[#1A3636]">Subtotal Drawn</p>
            <p className="text-sm font-bold text-[#1A3636]">{formatCurrency(form?.drawnFundsSubtotal)}</p>
          </div>
          <div className="flex justify-between">
            <p className="text-[9px] font-semibold text-[#1A3636]">Undrawn Funds</p>
            <p className="text-sm font-bold text-[#1A3636]">{formatCurrency(form?.undrawnFundsToDate)}</p>
          </div>
        </div>
      </div>

      <div className="border-t border-[#D6BD98]/10"></div>

      <div>
        <h3 className="text-[10px] font-bold text-[#1A3636] uppercase tracking-wider mb-2">Current Drawdown Request</h3>
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

  const renderDocumentsTab = () => {
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
                      <FiFileText className="w-2.5 h-2.5 text-[#677D6A]" />
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

  const renderPhotosTab = () => {
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

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white border-b border-[#D6BD98]/10 shadow-sm">
        {/* Site Visit Scheduled Banner */}
        {status === REPORT_STATUS.SITE_VISIT_SCHEDULED && (
          <div className="bg-accent-200 border-y border-accent-300">
            <div className="px-3 lg:px-4 py-2">
              <div className="flex items-center gap-2">
                <FiMapPin className="w-3 h-3 text-primary-600" />
                <span className="text-[9px] text-primary-600 font-medium">
                  Waiting for QS Site Visit
                </span>
                {getValue(checklist, 'siteVisitNotes') && (
                  <span className="text-[8px] text-primary-600 truncate">
                    Notes: {getValue(checklist, 'siteVisitNotes')}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
        <div className="px-3 lg:px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={handleGoBack}
                className="p-1 hover:bg-[#D6BD98]/10 rounded transition-colors"
              >
                <FiArrowLeft className="w-4 h-4 text-[#40534C]" />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-sm font-semibold text-[#1A3636]">
                    {reportNumber}
                  </h1>
                  <StatusBadge status={status} />
                </div>
                <p className="text-[9px] text-[#677D6A]">
                  {customerName}
                </p>
              </div>
            </div>

            {/* PDF Download Button */}
            <Button
              variant="primary"
              size="sm"
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              className="text-[9px] h-6 px-2 bg-[#677D6A] hover:bg-[#40534C] text-white"
              title="Download PDF"
            >
              <FiDownload className="w-2.5 h-2.5 mr-1" />
              {isDownloading ? '...' : 'PDF'}
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-3 lg:px-4 border-t border-[#D6BD98]/10">
          <div className="flex gap-1 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
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
          {activeTab === 'customer-info' && renderCustomerInfoTab()}
          {activeTab === 'site-visit' && renderSiteVisitTab()}
          {activeTab === 'project-info' && renderProjectInfoTab()}
          {activeTab === 'financial' && renderFinancialTab()}
          {activeTab === 'documents' && renderDocumentsTab()}
          {activeTab === 'photos' && renderPhotosTab()}
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
                  {comments.length}
                </span>
              </div>
            </div>

            {/* Scrollable Comments Container */}
            <div
              ref={commentsContainerRef}
              className="flex-1 overflow-y-auto bg-white"
            >
              {isLoadingComments ? (
                <div className="flex justify-center py-6">
                  <div className="w-4 h-4 border-2 border-[#677D6A] border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : comments.length === 0 ? (
                <div className="text-center py-8">
                  <FiMessageSquare className="w-4 h-4 text-[#D6BD98] mx-auto mb-1" />
                  <p className="text-[9px] text-[#677D6A]">No comments</p>
                </div>
              ) : (
                <div className="divide-y divide-[#D6BD98]/5">
                  {comments.map((comment, index) => {
                    const isLatest = index === 0

                    return (
                      <div
                        key={comment.id || `comment-${index}`}
                        className={`px-3 py-2 hover:bg-[#F5F7F4]/30 transition-colors ${isLatest ? 'bg-[#F5F7F4]/50' : ''
                          }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] font-bold text-[#1A3636]">
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
    </div>
  )
}

export default ReportViewPage