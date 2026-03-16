// src/pages/rm/RMChecklistDetailPage.tsx
import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  useGetChecklistByIdQuery,
  useUpdateRmChecklistMutation,
  useDeleteRmChecklistMutation
} from '@/services/api/checklistsApi'
import { SiteVisitCallReportForm } from '@/types/checklist.types'
import { useAuth } from '@/hooks/useAuth'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import SiteVisitCallReportFormComponent from '@/components/rm/SiteVisitCallReportForm'
import PreviewStep from '@/components/rm/PreviewStep'
import axiosInstance from '@/services/api/axiosConfig'
import { Comment } from '@/types/report.types'
import toast from 'react-hot-toast'
import { formatNairobiDateTime, formatCompactNairobiDateTime } from '@/utils/dateUtils'
import { generateSiteVisitReportPDF } from '@/utils/pdfGenerator'
import {
  MapPin,
  FileText,
  ArrowLeft,
  Save,
  Send,
  AlertCircle,
  Building2,
  CheckCircle2,
  Users,
  XCircle,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Image as ImageIcon,
  ListCheck,
  MessageCircle,
  Download,
  Eye,
  Trash2,
  Clock
} from 'lucide-react'
// IMPORT THE LOGO DIRECTLY
import ncbaLogo from '@/assets/NCBALogo.png'

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

// Initial empty form state - UPDATED with drawdowns array
const initialFormState: SiteVisitCallReportForm = {
  callReportNo: '',
  customerName: '',
  customerType: '',
  siteVisitDateTime: '',
  personMetAtSite: '',
  bqAmount: '',
  constructionLoanAmount: '',
  customerContribution: '',
  // UPDATED: Replace drawnFundsD1/D2 with drawdowns array
  drawdowns: [{ id: crypto.randomUUID?.() || Date.now().toString(), amount: '' }],
  drawnFundsSubtotal: '',
  undrawnFundsToDate: '',
  briefProfile: '',
  siteExactLocation: '',
  houseLocatedAlong: '',
  sitePin: '',
  securityDetails: '',
  plotLrNo: '',
  siteVisitObjective1: '',
  siteVisitObjective2: '',
  siteVisitObjective3: '',
  worksComplete: '',
  worksOngoing: '',
  materialsFoundOnSite: '',
  defectsNotedOnSite: '',
  drawdownRequestNo: '',
  drawdownKesAmount: '',
  documentsSubmitted: {
    qsValuation: '',
    interimCertificate: '',
    customerInstructionLetter: '',
    contractorProgressReport: '',
    contractorInvoice: ''
  },
  preparedBy: '',
  signature: '',
  preparedDate: '',
  progressPhotosPage3: ['', '', '', ''],
  progressPhotosPage4: ['', '', '', ''],
  materialsOnSitePhotos: ['', '', '', ''],
  defectsNotedPhotos: ['', '', '', '']
}

// Status badge component
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const statusLower = status?.toLowerCase() || 'pending'

  const statusConfig: Record<string, { label: string; color: string; bgColor: string }> = {
    pending: { label: 'Pending', color: 'text-[#677D6A]', bgColor: 'bg-[#677D6A]/10' },
    draft: { label: 'Draft', color: 'text-[#40534C]', bgColor: 'bg-[#D6BD98]/20' },
    submitted: { label: 'QS Review', color: 'text-[#1A3636]', bgColor: 'bg-[#D6BD98]/30' },
    rework: { label: 'Rework', color: 'text-orange-700', bgColor: 'bg-orange-100' },
    approved: { label: 'Approved', color: 'text-white', bgColor: 'bg-[#677D6A]' },
    rejected: { label: 'Rejected', color: 'text-red-600', bgColor: 'bg-red-100' },
  }

  const config = statusConfig[statusLower] || statusConfig.pending

  return (
    <span className={`${config.bgColor} ${config.color} px-2 py-0.5 rounded text-[9px] font-medium whitespace-nowrap`}>
      {config.label}
    </span>
  )
}

// Validation function
const isStepComplete = (step: number, formData: SiteVisitCallReportForm): boolean => {
  switch (step) {
    case 1:
      return !!(formData.customerName && formData.customerType)
    case 2:
      return !!(
        formData.siteVisitDateTime &&
        formData.personMetAtSite &&
        formData.bqAmount &&
        formData.constructionLoanAmount &&
        formData.customerContribution &&
        formData.siteExactLocation
      )
    case 3:
      return !!(
        formData.worksComplete &&
        formData.worksOngoing &&
        formData.materialsFoundOnSite &&
        formData.defectsNotedOnSite
      )
    case 4:
      return !!(
        formData.preparedBy &&
        formData.signature &&
        formData.preparedDate
      )
    case 5:
      return !!(
        formData.progressPhotosPage3.some(url => url && url.trim() !== '') &&
        formData.materialsOnSitePhotos.some(url => url && url.trim() !== '') &&
        formData.defectsNotedPhotos.some(url => url && url.trim() !== '')
      )
    case 6:
      return true
    default:
      return false
  }
}

const isAllStepsComplete = (formData: SiteVisitCallReportForm): boolean => {
  return (
    isStepComplete(1, formData) &&
    isStepComplete(2, formData) &&
    isStepComplete(3, formData) &&
    isStepComplete(4, formData) &&
    isStepComplete(5, formData)
  )
}

// Helper function to get value with comprehensive case-insensitive access
const getValue = (obj: any, key: string): any => {
  if (!obj) return undefined

  if (obj[key] !== undefined && obj[key] !== null) return obj[key]

  const pascalKey = key.charAt(0).toUpperCase() + key.slice(1)
  if (obj[pascalKey] !== undefined && obj[pascalKey] !== null) return obj[pascalKey]

  const upperKey = key.toUpperCase()
  if (obj[upperKey] !== undefined && obj[upperKey] !== null) return obj[upperKey]

  const exactDtoKey = key === 'siteVisitForm' ? 'SiteVisitForm' :
    key === 'customerName' ? 'CustomerName' :
      key === 'customerNumber' ? 'CustomerNumber' :
        key === 'customerEmail' ? 'CustomerEmail' :
          key === 'projectName' ? 'ProjectName' :
            key === 'ibpsNo' ? 'IbpsNo' :
              key === 'dclNo' ? 'DclNo' :
                key === 'callReportNo' ? 'CallReportNo' : key
  if (obj[exactDtoKey] !== undefined && obj[exactDtoKey] !== null) return obj[exactDtoKey]

  return undefined
}

// Helper function to transform comment data
const transformComment = (comment: any): Comment => ({
  id: comment.id || comment._id || '',
  reportId: comment.reportId || comment.ReportId || '',
  userId: comment.userId || comment.UserId || '',
  userName: comment.userName || comment.UserName || 'Unknown',
  userRole: comment.userRole || comment.UserRole || '',
  text: comment.text || comment.Text || '',
  isInternal: comment.isInternal || comment.IsInternal || false,
  createdAt: comment.createdAt || comment.CreatedAt || new Date().toISOString()
})

// Function to extract status from checklist
const extractStatus = (checklist: any): string => {
  if (!checklist) return 'pending'
  
  const possibleStatusLocations = [
    checklist.status,
    checklist.Status,
    checklist.STATUS,
    checklist.reportStatus,
    checklist.ReportStatus,
    checklist.data?.status,
    checklist.data?.Status,
    checklist.report?.status,
    checklist.report?.Status,
    checklist._doc?.status,
    checklist._doc?.Status
  ]
  
  for (const status of possibleStatusLocations) {
    if (status !== undefined && status !== null) {
      return status.toString().toLowerCase()
    }
  }
  
  return 'pending'
}

// Function to check if a report should be read-only
const isReadOnlyStatus = (status: string): boolean => {
  const lowerStatus = status?.toLowerCase()
  return lowerStatus === 'submitted' || 
         lowerStatus === 'approved' || 
         lowerStatus === 'pending_qs_review' || 
         lowerStatus === 'pendingqsreview' ||
         lowerStatus === 'completed' ||
         lowerStatus === 'under_review' ||
         lowerStatus === 'underreview'
}

// Function to check if report can be deleted (only Pending and Draft)
const canDeleteReport = (status: string): boolean => {
  const lowerStatus = status?.toLowerCase()
  return lowerStatus === 'pending' || lowerStatus === 'draft'
}

export const RMChecklistDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const isMobile = useMediaQuery('(max-width: 768px)')

  const [activeStep, setActiveStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSavingDraft, setIsSavingDraft] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false)
  const [logoBase64, setLogoBase64] = useState<string>('')
  const [formData, setFormData] = useState<SiteVisitCallReportForm>(initialFormState)
  const [apiError, setApiError] = useState<string | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [isLoadingComments, setIsLoadingComments] = useState(false)
  const [redirectAttempted, setRedirectAttempted] = useState(false)
  const [reportStatus, setReportStatus] = useState<string>('pending')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const autoSaveTimer = useRef<NodeJS.Timeout>()
  const commentsContainerRef = useRef<HTMLDivElement>(null)

  // Load logo when component mounts
  React.useEffect(() => {
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

  // Fetch checklist data
  const { data: checklist, isLoading, error, refetch } = useGetChecklistByIdQuery(id!, {
    skip: !id,
    refetchOnMountOrArgChange: true
  })

  const [updateChecklist] = useUpdateRmChecklistMutation()
  const [deleteChecklist] = useDeleteRmChecklistMutation()

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

  // Steps configuration
  const steps = [
    { id: 1, name: '1.Customer Info', icon: Users, description: 'Customer and report details' },
    { id: 2, name: '2.Site Visit', icon: MapPin, description: 'Site visit details and amounts' },
    { id: 3, name: '3.Project Info', icon: Building2, description: 'Project progress and objectives' },
    { id: 4, name: '4.Documents', icon: FileText, description: 'Submit required documents' },
    { id: 5, name: '5.Photos', icon: ImageIcon, description: 'Upload site photos' },
    { id: 6, name: '6.Preview', icon: ListCheck, description: 'Review all information before submission' },
  ]

  // Load checklist data and extract status
  useEffect(() => {
    if (checklist) {
      const extractedStatus = extractStatus(checklist)
      setReportStatus(extractedStatus)

      const possibleFormData = [
        checklist.siteVisitForm,
        checklist.SiteVisitForm,
        checklist.siteVisitFormJson,
        checklist.SiteVisitFormJson
      ].filter(Boolean)

      let formDataFound = null

      for (const formSource of possibleFormData) {
        try {
          if (typeof formSource === 'string' && formSource !== 'null') {
            const parsed = JSON.parse(formSource)
            if (parsed && typeof parsed === 'object') {
              formDataFound = parsed
              break
            }
          } else if (formSource && typeof formSource === 'object') {
            formDataFound = formSource
            break
          }
        } catch (e) {
          console.log('Error parsing form source:', e)
        }
      }

      if (formDataFound) {
        setFormData(formDataFound as SiteVisitCallReportForm);
      } else {
        setFormData(prev => ({
          ...prev,
          callReportNo: getValue(checklist, 'callReportNo') || getValue(checklist, 'dclNo') || '',
          customerName: getValue(checklist, 'customerName') || '',
          customerEmail: getValue(checklist, 'customerEmail') || '',
          projectName: getValue(checklist, 'projectName') || '',
          ibpsNo: getValue(checklist, 'ibpsNo') || '',
        }));
      }
    }
  }, [checklist]);

  // Redirect to read-only view if report is submitted or approved
  useEffect(() => {
    if (checklist && !isLoading && !redirectAttempted) {
      const status = reportStatus
      
      if (isReadOnlyStatus(status)) {
        toast.loading('This report is in read-only mode', { duration: 2000 })
        setRedirectAttempted(true)
        navigate(`/rm/reports/${id}/view`, { replace: true })
      }
    }
  }, [checklist, isLoading, id, navigate, redirectAttempted, reportStatus])

  // Handle API error
  useEffect(() => {
    if (error) {
      setApiError('Failed to load report data. Please try again.')
      toast.error('Failed to load report data')
    }
  }, [error])

  const handleFormChange = (updatedForm: SiteVisitCallReportForm) => {
    if (isReadOnlyStatus(reportStatus)) {
      toast.error('This report is in read-only mode and cannot be edited')
      return
    }

    setFormData(updatedForm)

    if (autoSaveTimer.current) {
      clearTimeout(autoSaveTimer.current)
    }

    autoSaveTimer.current = setTimeout(() => {
      if (!isSubmitting && !isSavingDraft && !isReadOnlyStatus(reportStatus)) {
        handleSaveDraft(true)
      }
    }, 90000)
  }

  const handleSaveDraft = async (silent: boolean = false) => {
    if (!id) return

    if (isReadOnlyStatus(reportStatus)) {
      toast.error('Cannot save draft: Report is in read-only mode')
      return
    }

    setIsSavingDraft(true)
    try {
      const currentChecklist = checklist;

      const payload: any = {
        status: 'draft'
      };

      if (getValue(currentChecklist, 'customerNumber')) payload.customerNumber = getValue(currentChecklist, 'customerNumber');
      if (getValue(currentChecklist, 'customerName')) payload.customerName = getValue(currentChecklist, 'customerName');
      if (getValue(currentChecklist, 'customerEmail')) payload.customerEmail = getValue(currentChecklist, 'customerEmail');
      if (getValue(currentChecklist, 'projectName')) payload.projectName = getValue(currentChecklist, 'projectName');
      if (getValue(currentChecklist, 'ibpsNo')) payload.ibpsNo = getValue(currentChecklist, 'ibpsNo');

      const assignedToRM = getValue(currentChecklist, 'assignedToRM');
      if (assignedToRM?.id || assignedToRM?._id) {
        payload.assignedToRM = assignedToRM.id || assignedToRM._id;
      }

      if (getValue(currentChecklist, 'documents')) payload.documents = getValue(currentChecklist, 'documents');

      payload.siteVisitForm = formData;

      await updateChecklist({
        id,
        payload
      }).unwrap();

      if (!silent) {
        toast.success('Draft saved successfully!');
      }
      refetch();
    } catch (error) {
      if (!silent) {
        toast.error('Failed to save draft');
      }
    } finally {
      setIsSavingDraft(false);
    }
  }

  const handleDeleteReport = async () => {
    if (!id) return

    if (!canDeleteReport(reportStatus)) {
      toast.error('This report cannot be deleted')
      setShowDeleteConfirm(false)
      return
    }

    setIsDeleting(true)
    try {
      await deleteChecklist(id).unwrap()
      toast.success('Report deleted successfully')
      navigate('/rm/reports')
    } catch (error) {
      toast.error('Failed to delete report')
    } finally {
      setIsDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  const handleSubmit = async () => {
    if (!id) return

    if (isReadOnlyStatus(reportStatus)) {
      toast.error('Cannot submit: Report is in read-only mode')
      return
    }

    if (!isAllStepsComplete(formData)) {
      toast.error('Please complete all steps before submitting')
      for (let i = 1; i <= 5; i++) {
        if (!isStepComplete(i, formData)) {
          setActiveStep(i)
          break
        }
      }
      return
    }

    setIsSubmitting(true)
    try {
      const currentChecklist = checklist;

      const payload: any = {
        status: 'submitted'
      };

      if (getValue(currentChecklist, 'customerNumber')) payload.customerNumber = getValue(currentChecklist, 'customerNumber');
      if (getValue(currentChecklist, 'customerName')) payload.customerName = getValue(currentChecklist, 'customerName');
      if (getValue(currentChecklist, 'customerEmail')) payload.customerEmail = getValue(currentChecklist, 'customerEmail');
      if (getValue(currentChecklist, 'projectName')) payload.projectName = getValue(currentChecklist, 'projectName');
      if (getValue(currentChecklist, 'ibpsNo')) payload.ibpsNo = getValue(currentChecklist, 'ibpsNo');

      const assignedToRM = getValue(currentChecklist, 'assignedToRM');
      if (assignedToRM?.id || assignedToRM?._id) {
        payload.assignedToRM = assignedToRM.id || assignedToRM._id;
      }

      if (getValue(currentChecklist, 'documents')) payload.documents = getValue(currentChecklist, 'documents');

      payload.siteVisitForm = formData;

      await updateChecklist({
        id,
        payload
      }).unwrap();

      toast.success('Report submitted successfully!');
      navigate('/rm/reports')

    } catch (error) {
      toast.error('Failed to submit report');
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleDownloadPDF = async () => {
    if (!id || !formData) return

    setIsDownloadingPDF(true)
    try {
      const reportNumber = getValue(checklist, 'callReportNo') || getValue(checklist, 'dclNo') || 'CRN-000'
      const formattedReportNumber = reportNumber.replace(/^DCL-/i, 'CRN-')

      // Create a deep copy of formData
      const pdfData = JSON.parse(JSON.stringify(formData))
      
      // Ensure all required arrays exist
      pdfData.progressPhotosPage3 = pdfData.progressPhotosPage3 || []
      pdfData.materialsOnSitePhotos = pdfData.materialsOnSitePhotos || []
      pdfData.defectsNotedPhotos = pdfData.defectsNotedPhotos || []
      pdfData.documentsSubmitted = pdfData.documentsSubmitted || {}

      // Add customer number to PDF data
      pdfData.customerNumber = getValue(checklist, 'customerNumber') || '—'

      const doc = generateSiteVisitReportPDF(
        pdfData,
        formattedReportNumber,
        logoBase64,
        reportStatus, // Pass the actual report status
        undefined // approvalDate (optional)
      )

      doc.save(`Site_Visit_Report_${formattedReportNumber}_${new Date().toISOString().split('T')[0]}.pdf`)

      toast.success('PDF downloaded successfully!')
    } catch (error) {
      console.error('PDF generation error:', error)
      toast.error('Failed to generate PDF')
    } finally {
      setIsDownloadingPDF(false)
    }
  }

  const handleNext = () => {
    if (isReadOnlyStatus(reportStatus)) {
      toast.error('Cannot navigate: Report is in read-only mode')
      return
    }
    if (activeStep < steps.length) {
      setActiveStep(activeStep + 1)
    }
  }

  const handlePrevious = () => {
    if (isReadOnlyStatus(reportStatus)) {
      toast.error('Cannot navigate: Report is in read-only mode')
      return
    }
    if (activeStep > 1) {
      setActiveStep(activeStep - 1)
    }
  }

  const handleCancel = () => {
    navigate('/rm/reports')
  }

  const handleRetry = () => {
    setApiError(null)
    refetch()
  }

  const handleEditStep = (stepId: number) => {
    if (isReadOnlyStatus(reportStatus)) {
      toast.error('Cannot edit: Report is in read-only mode')
      return
    }
    setActiveStep(stepId)
  }

  // Get visible steps for mobile
  const getMobileVisibleSteps = () => {
    if (!isMobile) return steps;

    const prevStep = activeStep > 1 ? steps[activeStep - 2] : null;
    const currentStep = steps[activeStep - 1];
    const nextStep = activeStep < steps.length ? steps[activeStep] : null;

    return [prevStep, currentStep, nextStep].filter(Boolean);
  };

  const isApproved = reportStatus === 'approved'
  const isSubmitted = reportStatus === 'submitted' || 
                     reportStatus === 'pending_qs_review' || 
                     reportStatus === 'pendingqsreview' ||
                     reportStatus === 'under_review'
  const isEditable = !isReadOnlyStatus(reportStatus)
  const showDeleteButton = canDeleteReport(reportStatus) && isEditable
  const isReworkRequired = reportStatus === 'rework';

  // If redirecting, show loading state
  if (redirectAttempted && (isApproved || isSubmitted)) {
    return (
      <div className="min-h-screen bg-white flex justify-center items-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#677D6A] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs text-[#40534C]">Redirecting to read-only view...</p>
        </div>
      </div>
    )
  }

  // Loading state
  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-[#D6BD98]/20 rounded w-1/4"></div>
            <div className="h-48 bg-[#D6BD98]/10 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (apiError || error) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center py-8">
            <XCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
            <h2 className="text-sm font-semibold text-[#1A3636] mb-1">Failed to Load Report</h2>
            <p className="text-xs text-[#40534C] mb-4">{apiError || 'Unable to fetch report data.'}</p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={handleRetry}
                className="px-3 py-1.5 bg-[#1A3636] text-white rounded text-xs flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                Retry
              </button>
              <button
                onClick={handleCancel}
                className="px-3 py-1.5 border border-[#677D6A] text-[#40534C] rounded text-xs"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // No data state
  if (!checklist) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center py-8">
            <AlertCircle className="w-8 h-8 text-yellow-500 mx-auto mb-3" />
            <h2 className="text-sm font-semibold text-[#1A3636] mb-1">Report Not Found</h2>
            <button
              onClick={handleCancel}
              className="px-3 py-1.5 bg-[#1A3636] text-white rounded text-xs mt-2"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    )
  }

  const displayValue = (getValue(checklist, 'callReportNo') || getValue(checklist, 'dclNo') || '-').replace(/^DCL-/i, 'CRN-')
  const allComplete = isAllStepsComplete(formData)
  const mobileVisibleSteps = getMobileVisibleSteps();

  return (
    <div className="min-h-screen bg-white">
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded max-w-sm w-full p-4">
            <div className="flex items-center gap-2 text-red-600 mb-3">
              <Trash2 className="w-4 h-4" />
              <h3 className="text-sm font-medium">Delete Report</h3>
            </div>
            <p className="text-xs text-gray-600 mb-4">
              Are you sure you want to delete this report? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-3 py-1.5 border border-gray-300 rounded text-xs hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteReport}
                disabled={isDeleting}
                className="px-3 py-1.5 bg-red-600 text-white rounded text-xs hover:bg-red-700 disabled:opacity-50 flex items-center gap-1"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="sticky top-0 z-20 bg-white border-b border-[#D6BD98]/10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={handleCancel}
                className="p-1 hover:bg-[#D6BD98]/10 rounded transition-colors"
              >
                <ArrowLeft className="w-4 h-4 text-[#40534C]" />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-sm font-semibold text-[#1A3636]">
                    {displayValue}
                  </h1>
                  <StatusBadge status={reportStatus} />
                </div>
                <p className="text-[9px] text-[#677D6A]">
                  {isApproved ? 'Approved (Read Only)' : 
                   isSubmitted ? 'Under QS Review' : 
                   `Step ${activeStep} of ${steps.length}`}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-1">
              {showDeleteButton && (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                  title="Delete report"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
              
              {/* PDF Download Button - Available for all statuses */}
              <button
                onClick={handleDownloadPDF}
                disabled={isDownloadingPDF}
                className="px-2 py-1 bg-[#677D6A] text-white rounded hover:bg-[#40534C] transition-colors text-[9px] flex items-center gap-1"
                title="Download PDF"
              >
                <Download className="w-3 h-3" />
                {isDownloadingPDF ? '...' : 'PDF'}
              </button>

              {!isApproved && !isSubmitted && (
                <>
                  <button
                    onClick={() => handleSaveDraft(false)}
                    disabled={isSavingDraft || isSubmitting || !isEditable}
                    className={`px-2 py-1 border border-[#677D6A] text-[#40534C] rounded hover:bg-[#D6BD98]/10 transition-colors text-[9px] flex items-center gap-1 ${!isEditable ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <Save className="w-3 h-3" />
                    {isSavingDraft ? '...' : 'Draft'}
                  </button>

                  {activeStep === steps.length ? (
                    <button
                      onClick={handleSubmit}
                      disabled={!allComplete || isSubmitting || !isEditable}
                      className={`px-2 py-1 rounded text-[9px] flex items-center gap-1 ${
                        allComplete && isEditable
                          ? 'bg-[#1A3636] text-white hover:bg-[#40534C]'
                          : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      <Send className="w-3 h-3" />
                      {isSubmitting ? '...' : 'Submit'}
                    </button>
                  ) : (
                    <button
                      onClick={handleNext}
                      disabled={!isEditable}
                      className={`px-2 py-1 bg-[#1A3636] text-white rounded hover:bg-[#40534C] transition-colors text-[9px] flex items-center gap-1 ${!isEditable ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      Next
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Progress Steps */}
          {!isApproved && !isSubmitted && (
            <div className="mt-3">
              {isMobile ? (
                <div className="flex items-center justify-between">
                  {mobileVisibleSteps.map((step, index) => {
                    const isComplete = isStepComplete(step.id, formData);
                    const isActive = activeStep === step.id;

                    return (
                      <React.Fragment key={step.id}>
                        <button
                          onClick={() => setActiveStep(step.id)}
                          disabled={!isEditable}
                          className={`flex flex-col items-center focus:outline-none group flex-1 ${!isEditable ? 'cursor-not-allowed opacity-60' : ''}`}
                        >
                          <div
                            className={`flex items-center justify-center w-7 h-7 rounded-full transition-all ${
                              isComplete
                                ? 'bg-[#677D6A] text-white'
                                : isActive
                                  ? 'bg-[#1A3636] text-white ring-2 ring-[#D6BD98]/30'
                                  : 'bg-[#F5F7F4] border border-[#D6BD98]/20 text-[#40534C]'
                            }`}
                          >
                            {isComplete ? (
                              <CheckCircle2 className="w-3 h-3" />
                            ) : (
                              <step.icon className="w-3 h-3" />
                            )}
                          </div>
                          <span className={`mt-1 text-[7px] font-medium text-center ${
                            isActive ? 'text-[#1A3636]' : 'text-[#677D6A]'
                          }`}>
                            {step.name}
                          </span>
                        </button>
                        {index < mobileVisibleSteps.length - 1 && (
                          <div className="flex-1 h-px mx-1 bg-[#D6BD98]/30" />
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  {steps.map((step, index) => {
                    const isComplete = isStepComplete(step.id, formData);
                    const isActive = activeStep === step.id;

                    return (
                      <React.Fragment key={step.id}>
                        <button
                          onClick={() => setActiveStep(step.id)}
                          disabled={!isEditable}
                          className={`flex items-center focus:outline-none group ${!isEditable ? 'cursor-not-allowed opacity-60' : ''}`}
                        >
                          <div
                            className={`flex items-center justify-center w-6 h-6 rounded-full transition-all ${
                              isComplete
                                ? 'bg-[#677D6A] text-white'
                                : isActive
                                  ? 'bg-[#1A3636] text-white ring-2 ring-[#D6BD98]/30'
                                  : 'bg-[#F5F7F4] border border-[#D6BD98]/20 text-[#40534C]'
                            }`}
                          >
                            {isComplete ? (
                              <CheckCircle2 className="w-3 h-3" />
                            ) : (
                              <step.icon className="w-3 h-3" />
                            )}
                          </div>
                          <span className={`ml-2 text-[9px] font-medium hidden sm:block ${
                            isActive ? 'text-[#1A3636]' : 'text-[#677D6A]'
                          }`}>
                            {step.name}
                          </span>
                        </button>
                        {index < steps.length - 1 && (
                          <div className={`flex-1 h-px mx-2 ${
                            index < activeStep - 1 || (index < steps.length - 1 && isStepComplete(step.id + 1, formData))
                              ? 'bg-[#677D6A]/50'
                              : 'bg-[#D6BD98]/30'
                          }`} />
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Mobile navigation buttons */}
          {isMobile && !isApproved && !isSubmitted && (
            <div className="mt-3 flex items-center gap-2">
              {activeStep > 1 && (
                <button
                  onClick={handlePrevious}
                  disabled={!isEditable}
                  className={`flex-1 px-2 py-1 border border-[#677D6A] text-[#40534C] rounded flex items-center justify-center gap-1 text-[8px] ${!isEditable ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <ChevronLeft className="w-3 h-3" />
                  Prev
                </button>
              )}
              {activeStep === steps.length ? (
                <button
                  onClick={handleSubmit}
                  disabled={!allComplete || isSubmitting || !isEditable}
                  className={`flex-1 px-2 py-1 rounded flex items-center justify-center gap-1 text-[8px] ${
                    allComplete && isEditable
                      ? 'bg-[#1A3636] text-white'
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <Send className="w-3 h-3" />
                  {isSubmitting ? '...' : 'Submit'}
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  disabled={!isEditable}
                  className={`flex-1 px-2 py-1 bg-[#1A3636] text-white rounded flex items-center justify-center gap-1 text-[8px] ${!isEditable ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  Next
                  <ChevronRight className="w-3 h-3" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Content - 70/30 Split */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Left Column - Main Form (70%) */}
          <div className="lg:w-[70%] bg-white">
            {activeStep === 6 ? (
              <PreviewStep
                formData={formData}
                onEditStep={handleEditStep}
                isReadOnly={!isEditable}
                reportNumber={displayValue}
                customerNumber={getValue(checklist, 'customerNumber')}
                reportStatus={reportStatus} // Pass the report status
              />
            ) : (
              <SiteVisitCallReportFormComponent
                value={formData}
                onChange={handleFormChange}
                activeStep={activeStep}
                isReadOnly={!isEditable}
              />
            )}
          </div>

          {/* Right Column - Comments Sidebar (30%) */}
          <div className="lg:w-[30%]">
            <div className="sticky top-[100px] bg-white border-l border-[#D6BD98]/10 overflow-hidden flex flex-col">
              {/* Header */}
              <div className="px-3 py-2 border-b border-[#D6BD98]/10">
                <div className="flex items-center justify-between">
                  <h3 className="text-[9px] font-semibold text-[#1A3636] uppercase tracking-wider">
                    Comments
                  </h3>
                  <span className="text-[8px] text-[#677D6A] bg-[#F5F7F4] px-1.5 py-0.5 rounded">
                    {comments.length}
                  </span>
                </div>
                {isReworkRequired && !isApproved && !isSubmitted && (
                  <p className="text-[7px] text-amber-600 mt-1">
                    QS has requested changes
                  </p>
                )}
              </div>

              {/* Scrollable Comments Container */}
              <div
                ref={commentsContainerRef}
                className="h-[calc(100vh-200px)] overflow-y-auto"
              >
                {isLoadingComments ? (
                  <div className="flex justify-center py-6">
                    <div className="w-4 h-4 border-2 border-[#677D6A] border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : comments.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageCircle className="w-4 h-4 text-[#D6BD98] mx-auto mb-1" />
                    <p className="text-[9px] text-[#677D6A]">No comments</p>
                  </div>
                ) : (
                  <div className="divide-y divide-[#D6BD98]/5">
                    {comments.map((comment, index) => {
                      const isLatest = index === 0
                      
                      return (
                        <div 
                          key={comment.id || `comment-${index}`}
                          className={`px-3 py-2 hover:bg-[#F5F7F4]/30 transition-colors ${
                            isLatest ? 'bg-[#F5F7F4]/50' : ''
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[9px] font-bold text-[#1A3636]">
                                {comment.userName}
                              </span>
                              <span className="text-[6px] font-medium text-[#677D6A] bg-white px-1 py-0.5 rounded border border-[#D6BD98]/20">
                                {comment.userRole}
                              </span>
                              {isLatest && (
                                <span className="text-[5px] font-medium text-emerald-600 bg-emerald-50 px-1 py-0.5 rounded">
                                  New
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-0.5 text-[#677D6A]">
                              <Clock className="w-2 h-2" />
                              <span className="text-[6px] whitespace-nowrap">
                                {formatCompactNairobiDateTime(comment.createdAt)}
                              </span>
                            </div>
                          </div>
                          
                          <p className="text-[8px] text-[#40534C] leading-relaxed font-normal">
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
    </div>
  )
}

export default RMChecklistDetailPage