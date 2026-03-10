// src/pages/rm/ReportViewPage.tsx
import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useGetChecklistByIdQuery } from '@/services/api/checklistsApi'
import { useAuth } from '@/hooks/useAuth'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { generateSiteVisitReportPDF } from '@/utils/pdfGenerator'
import toast from 'react-hot-toast'
import { 
  FiArrowLeft, 
  FiUser, 
  FiMapPin, 
  FiDollarSign, 
  FiFileText, 
  FiImage, 
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiHome,
  FiBriefcase,
  FiDownload,
  FiEye,
  FiXCircle,
  FiTarget,
  FiClipboard,
  FiGrid,
  FiList,
  FiChevronRight,
  FiLock
} from 'react-icons/fi'
import { format } from 'date-fns'

// Helper function to deep clone an object
const deepClone = <T,>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj))
}

// Helper function to get value with case-insensitive access
const getValue = (obj: any, key: string): any => {
  if (!obj) return undefined
  
  // Direct check
  if (obj[key] !== undefined && obj[key] !== null) return obj[key]
  
  // Check with different casings
  const variations = [
    key,
    key.charAt(0).toUpperCase() + key.slice(1), // PascalCase
    key.toUpperCase(), // UPPERCASE
    key.toLowerCase(), // lowercase
    key.replace(/([A-Z])/g, '_$1').toUpperCase(), // SNAKE_CASE
    key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase()) // camelCase from snake_case
  ]
  
  for (const variation of variations) {
    if (obj[variation] !== undefined && obj[variation] !== null) {
      return obj[variation]
    }
  }
  
  // Check nested properties
  for (const k in obj) {
    if (typeof obj[k] === 'object' && obj[k] !== null) {
      const nested = getValue(obj[k], key)
      if (nested !== undefined) return nested
    }
  }
  
  return undefined
}

// Direct status extractor
const getReportStatus = (checklist: any): string => {
  if (!checklist) return 'pending'
  
  // Try direct property access first
  if (checklist.status) return checklist.status.toLowerCase()
  if (checklist.Status) return checklist.Status.toLowerCase()
  
  // Try getting via getValue
  const status = getValue(checklist, 'status')
  if (status) return status.toLowerCase()
  
  // Check for status in different forms
  const possibleStatusFields = ['status', 'Status', 'STATUS', 'reportStatus', 'ReportStatus']
  for (const field of possibleStatusFields) {
    if (checklist[field]) return checklist[field].toLowerCase()
  }
  
  // Check if it's in a nested object
  if (checklist.report && checklist.report.status) {
    return checklist.report.status.toLowerCase()
  }
  
  if (checklist.data && checklist.data.status) {
    return checklist.data.status.toLowerCase()
  }
  
  // Default fallback
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

const formatDateTime = (dateTime?: string) => {
  if (!dateTime) return '—'
  try {
    return format(new Date(dateTime), 'MMM d, yyyy h:mm a')
  } catch {
    return dateTime
  }
}

const formatDate = (dateString?: string) => {
  if (!dateString) return '—'
  try {
    return format(new Date(dateString), 'MMM d, yyyy')
  } catch {
    return dateString
  }
}

const formatMobileDateTime = (dateTime?: string) => {
  if (!dateTime) return '—'
  try {
    return format(new Date(dateTime), 'dd/MM/yy')
  } catch {
    return dateTime
  }
}

// Status Badge Component - matching the style from RMChecklistPage
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
    <span className={`${config.bgColor} ${config.color} px-2 py-0.5 rounded-full text-[9px] font-medium whitespace-nowrap`}>
      {config.label}
    </span>
  )
}

// Info Row Component - compact version
const InfoRow: React.FC<{ 
  label: string; 
  value?: string | number | null;
  className?: string;
}> = ({ label, value, className = '' }) => (
  <div className={className}>
    <p className="text-[10px] text-[#677D6A]">{label}</p>
    <p className="text-xs font-medium text-[#1A3636] break-words mt-0.5">
      {value || value === 0 ? value : <span className="text-[#D6BD98]">—</span>}
    </p>
  </div>
)

// Section Header Component - minimal
const SectionHeader: React.FC<{ 
  title: string; 
  icon?: React.ReactNode;
}> = ({ title, icon }) => (
  <div className="flex items-center gap-1.5 mb-3">
    {icon && <div className="text-[#677D6A]">{icon}</div>}
    <h3 className="text-[10px] font-semibold text-[#677D6A] uppercase tracking-wider">
      {title}
    </h3>
  </div>
)

// Photo Grid Component - compact
const PhotoGrid: React.FC<{ 
  photos: string[]; 
  title: string;
  emptyMessage?: string;
}> = ({ photos, title, emptyMessage = 'No photos' }) => {
  const validPhotos = photos.filter(url => url && url.trim() !== '')
  
  if (validPhotos.length === 0) {
    return (
      <div className="border border-dashed border-[#D6BD98]/30 rounded-lg p-4 text-center">
        <FiImage className="w-5 h-5 text-[#D6BD98] mx-auto mb-1" />
        <p className="text-[9px] text-[#677D6A]">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div>
      <p className="text-[9px] text-[#677D6A] mb-2">{title}</p>
      <div className="grid grid-cols-4 gap-1.5">
        {validPhotos.slice(0, 4).map((url, index) => (
          <a
            key={index}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative aspect-square rounded overflow-hidden border border-[#D6BD98]/20 hover:border-[#677D6A] transition-all"
          >
            <img
              src={url}
              alt={`${title} ${index + 1}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/100?text=Error'
              }}
            />
          </a>
        ))}
        {validPhotos.length > 4 && (
          <div className="aspect-square rounded bg-[#F5F7F4] flex items-center justify-center text-[8px] text-[#677D6A]">
            +{validPhotos.length - 4}
          </div>
        )}
      </div>
    </div>
  )
}

// Document Item Component - compact
const DocumentItem: React.FC<{ 
  label: string; 
  doc: any;
  docKey: string;
}> = ({ label, doc, docKey }) => {
  const status = doc[docKey]
  const fileUrl = doc[`${docKey}File`]

  return (
    <div className="flex items-center justify-between py-1.5 border-b border-[#D6BD98]/10 last:border-0">
      <span className="text-[10px] text-[#40534C]">{label}</span>
      <div className="flex items-center gap-2">
        {status === 'Yes' && fileUrl ? (
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[8px] text-blue-600 hover:underline flex items-center gap-0.5"
          >
            <FiFileText className="w-2.5 h-2.5" />
            View
          </a>
        ) : (
          <span className={`text-[8px] px-1.5 py-0.5 rounded-full ${
            status === 'Yes' ? 'bg-emerald-50 text-emerald-700' :
            status === 'No' ? 'bg-amber-50 text-amber-700' :
            'bg-gray-50 text-gray-500'
          }`}>
            {status || '—'}
          </span>
        )}
      </div>
    </div>
  )
}

// Helper to fetch and convert image to Base64
const getBase64ImageFromUrl = async (imageUrl: string): Promise<string> => {
  try {
    const res = await fetch(imageUrl);
    const blob = await res.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.addEventListener("load", () => resolve(reader.result as string), false);
      reader.addEventListener("error", () => reject("Failed to convert image to base64"));
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.warn("Failed to fetch image:", error);
    return "";
  }
};

export const ReportViewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [isDownloading, setIsDownloading] = useState(false)
  
  const { data: checklist, isLoading, error, refetch } = useGetChecklistByIdQuery(id!, {
    skip: !id,
    refetchOnMountOrArgChange: true
  })

  useEffect(() => {
    if (checklist) {
      console.log('Report data loaded:', checklist);
    }
  }, [checklist]);

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
    
    // CRITICAL SECURITY CHECK: Only allow download if status is APPROVED
    const status = getReportStatus(checklist)
    if (status !== 'approved') {
      toast.error('PDF can only be downloaded for approved reports')
      return
    }
    
    setIsDownloading(true)
    try {
      let logoBase64 = "";
      try {
        logoBase64 = await getBase64ImageFromUrl('/ncba-logo.png'); 
      } catch (e) {
        console.warn("Could not load logo for PDF", e);
      }

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
        progressPhotosPage3: formData.progressPhotosPage3 ? [...formData.progressPhotosPage3] : [],
        materialsOnSitePhotos: formData.materialsOnSitePhotos ? [...formData.materialsOnSitePhotos] : [],
        defectsNotedPhotos: formData.defectsNotedPhotos ? [...formData.defectsNotedPhotos] : [],
        documentsSubmitted: formData.documentsSubmitted ? { ...formData.documentsSubmitted } : {}
      }

      const reportNumber = (getValue(checklist, 'callReportNo') || getValue(checklist, 'dclNo') || 'CRN-000').replace(/^DCL-/i, 'CRN-')
      const reportStatus = getReportStatus(checklist)
      
      const approvedBy = reportStatus === 'approved' 
        ? checklist.approvedBy || checklist.ApprovedBy || 'QS Officer'
        : undefined
      
      const approvalDate = reportStatus === 'approved'
        ? checklist.approvedAt || checklist.ApprovedAt
        : undefined

      formData = {
        ...formData,
        customerNumber: getValue(checklist, 'customerNumber'),
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
        approvedBy,
        approvalDate
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
  const isApproved = status === 'approved'
  const isSubmitted = status === 'submitted' || status === 'pending_qs_review' || status === 'pendingqsreview'
  const isReadOnly = isApproved || isSubmitted

  // CRITICAL: Determine if download button should be enabled (ONLY for approved)
  const canDownload = isApproved

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

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <FiUser className="w-3 h-3" /> },
    { id: 'site-visit', label: 'Site Visit', icon: <FiMapPin className="w-3 h-3" /> },
    { id: 'financial', label: 'Financial', icon: <FiBriefcase className="w-3 h-3" /> },
    { id: 'documents', label: 'Documents', icon: <FiFileText className="w-3 h-3" /> },
    { id: 'photos', label: 'Photos', icon: <FiImage className="w-3 h-3" /> }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Minimal Header - matching RMChecklistPage style */}
      <div className="bg-white border-b border-[#D6BD98]/30 sticky top-0 z-10 px-4 py-2">
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
                <h1 className="text-sm font-bold text-[#1A3636]">
                  {reportNumber}
                </h1>
                <StatusBadge status={status} />
              </div>
              <p className="text-[9px] text-[#677D6A] mt-0.5">{customerName}</p>
            </div>
          </div>

          {/* CRITICAL SECURITY FIX: Download button only enabled for approved reports */}
          {isReadOnly && (
            <button
              onClick={handleDownloadPDF}
              disabled={!canDownload || isDownloading}
              className={`flex items-center gap-1 px-2 py-1 rounded transition-colors text-[9px] ${
                canDownload 
                  ? 'bg-[#677D6A] text-white hover:bg-[#40534C] cursor-pointer' 
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed opacity-50'
              }`}
              title={canDownload ? 'Download PDF' : 'PDF download only available for approved reports'}
            >
              {canDownload ? (
                <FiDownload className="w-3 h-3" />
              ) : (
                <FiLock className="w-3 h-3" />
              )}
              {isDownloading ? '...' : canDownload ? 'PDF' : 'Locked'}
            </button>
          )}
        </div>

        {/* Tabs - minimal style */}
        <div className="flex gap-3 mt-2 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1 px-1 py-1.5 text-[9px] font-medium border-b-2 whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'border-[#1A3636] text-[#1A3636]'
                  : 'border-transparent text-[#677D6A] hover:text-[#40534C]'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content - compact and professional */}
      <div className="px-4 py-3 max-w-4xl mx-auto">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* Customer Information - 2 column grid */}
            <div>
              <SectionHeader title="Customer Information" icon={<FiUser className="w-3 h-3" />} />
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                <InfoRow label="Report No." value={reportNumber} />
                <InfoRow label="Customer Name" value={getValue(checklist, 'customerName')} />
                <InfoRow label="Customer Type" value={form.customerType} />
                <InfoRow label="Customer No." value={getValue(checklist, 'customerNumber')} />
                <InfoRow label="IBPS No." value={getValue(checklist, 'ibpsNo')} />
                <InfoRow label="Project Name" value={getValue(checklist, 'projectName')} />
                {form.briefProfile && (
                  <div className="col-span-2">
                    <InfoRow label="Brief Profile" value={form.briefProfile} />
                  </div>
                )}
              </div>
            </div>

            {/* Financial Summary - card style */}
            {(form.bqAmount || form.constructionLoanAmount) && (
              <div>
                <SectionHeader title="Financial Summary" icon={<FiBriefcase className="w-3 h-3" />} />
                <div className="bg-[#F5F7F4] rounded p-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-[8px] text-[#677D6A]">BQ Amount</p>
                      <p className="text-xs font-semibold text-[#1A3636]">{formatCurrency(form.bqAmount)}</p>
                    </div>
                    <div>
                      <p className="text-[8px] text-[#677D6A]">Loan Amount</p>
                      <p className="text-xs font-semibold text-[#1A3636]">{formatCurrency(form.constructionLoanAmount)}</p>
                    </div>
                    <div>
                      <p className="text-[8px] text-[#677D6A]">Drawn (D1)</p>
                      <p className="text-[10px] text-[#40534C]">{formatCurrency(form.drawnFundsD1)}</p>
                    </div>
                    <div>
                      <p className="text-[8px] text-[#677D6A]">Drawn (D2)</p>
                      <p className="text-[10px] text-[#40534C]">{formatCurrency(form.drawnFundsD2)}</p>
                    </div>
                    <div className="col-span-2 flex justify-between pt-1 border-t border-[#D6BD98]/20">
                      <p className="text-[8px] text-[#677D6A]">Subtotal Drawn</p>
                      <p className="text-[10px] font-medium text-[#1A3636]">{formatCurrency(form.drawnFundsSubtotal)}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Site Visit Summary - minimal */}
            {form.siteVisitDateTime && (
              <div>
                <SectionHeader title="Site Visit" icon={<FiMapPin className="w-3 h-3" />} />
                <div className="grid grid-cols-2 gap-2">
                  <InfoRow label="Date & Time" value={formatDateTime(form.siteVisitDateTime)} />
                  <InfoRow label="Person Met" value={form.personMetAtSite} />
                  {form.siteExactLocation && (
                    <div className="col-span-2">
                      <InfoRow label="Location" value={form.siteExactLocation} />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Site Visit Tab */}
        {activeTab === 'site-visit' && (
          <div className="space-y-4">
            <div>
              <SectionHeader title="Visit Details" icon={<FiMapPin className="w-3 h-3" />} />
              <div className="grid grid-cols-2 gap-2">
                <InfoRow label="Date & Time" value={formatDateTime(form.siteVisitDateTime)} />
                <InfoRow label="Person Met" value={form.personMetAtSite} />
                <InfoRow label="Exact Location" value={form.siteExactLocation} className="col-span-2" />
                <InfoRow label="Plot/LR No." value={form.plotLrNo} />
                <InfoRow label="Site PIN" value={form.sitePin} />
                <InfoRow label="House Located Along" value={form.houseLocatedAlong} />
                <InfoRow label="Security Details" value={form.securityDetails} className="col-span-2" />
              </div>
            </div>

            <div>
              <SectionHeader title="Objectives" icon={<FiTarget className="w-3 h-3" />} />
              <div className="space-y-1.5">
                <div className="text-[9px] text-[#40534C]">
                  <span className="text-[#677D6A] mr-1">1.</span> {form.siteVisitObjective1 || 'Not specified'}
                </div>
                <div className="text-[9px] text-[#40534C]">
                  <span className="text-[#677D6A] mr-1">2.</span> {form.siteVisitObjective2 || 'Not specified'}
                </div>
                <div className="text-[9px] text-[#40534C]">
                  <span className="text-[#677D6A] mr-1">3.</span> {form.siteVisitObjective3 || 'Not specified'}
                </div>
              </div>
            </div>

            <div>
              <SectionHeader title="Works Progress" icon={<FiHome className="w-3 h-3" />} />
              <div className="space-y-2">
                <div className="bg-[#F5F7F4] p-2 rounded">
                  <p className="text-[8px] text-[#677D6A] mb-0.5">Works Complete</p>
                  <p className="text-[9px] text-[#40534C]">{form.worksComplete || '—'}</p>
                </div>
                <div className="bg-[#F5F7F4] p-2 rounded">
                  <p className="text-[8px] text-[#677D6A] mb-0.5">Works Ongoing</p>
                  <p className="text-[9px] text-[#40534C]">{form.worksOngoing || '—'}</p>
                </div>
                <div className="bg-[#F5F7F4] p-2 rounded">
                  <p className="text-[8px] text-[#677D6A] mb-0.5">Materials Found</p>
                  <p className="text-[9px] text-[#40534C]">{form.materialsFoundOnSite || '—'}</p>
                </div>
                <div className="bg-amber-50 p-2 rounded border-l-2 border-amber-400">
                  <p className="text-[8px] text-amber-600 mb-0.5">Defects Noted</p>
                  <p className="text-[9px] text-amber-800">{form.defectsNotedOnSite || 'None noted'}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Financial Tab - clean and professional */}
        {activeTab === 'financial' && (
          <div className="space-y-4">
            <div>
              <SectionHeader title="Loan Summary" icon={<FiBriefcase className="w-3 h-3" />} />
              <div className="bg-white border border-[#D6BD98]/20 rounded overflow-hidden">
                <div className="grid grid-cols-2 divide-x divide-[#D6BD98]/20">
                  <div className="p-3">
                    <p className="text-[8px] text-[#677D6A] uppercase">BQ Amount</p>
                    <p className="text-sm font-bold text-[#1A3636] mt-1">{formatCurrency(form.bqAmount)}</p>
                  </div>
                  <div className="p-3">
                    <p className="text-[8px] text-[#677D6A] uppercase">Loan Amount</p>
                    <p className="text-sm font-bold text-[#1A3636] mt-1">{formatCurrency(form.constructionLoanAmount)}</p>
                  </div>
                </div>
                <div className="border-t border-[#D6BD98]/20 p-3 bg-[#F5F7F4]">
                  <p className="text-[8px] text-[#677D6A] uppercase">Customer Contribution</p>
                  <p className="text-xs font-medium text-[#1A3636] mt-0.5">{formatCurrency(form.customerContribution)}</p>
                </div>
              </div>
            </div>

            <div>
              <SectionHeader title="Drawdown History" icon={<FiList className="w-3 h-3" />} />
              <div className="border border-[#D6BD98]/20 rounded overflow-hidden">
                <table className="w-full text-[9px]">
                  <thead className="bg-[#F5F7F4] border-b border-[#D6BD98]/20">
                    <tr>
                      <th className="px-2 py-1.5 text-left font-medium text-[#677D6A]">Item</th>
                      <th className="px-2 py-1.5 text-right font-medium text-[#677D6A]">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D6BD98]/10">
                    <tr>
                      <td className="px-2 py-1.5 text-[#40534C]">Drawn Funds (D1)</td>
                      <td className="px-2 py-1.5 text-right text-[#1A3636]">{formatCurrency(form.drawnFundsD1)}</td>
                    </tr>
                    <tr>
                      <td className="px-2 py-1.5 text-[#40534C]">Drawn Funds (D2)</td>
                      <td className="px-2 py-1.5 text-right text-[#1A3636]">{formatCurrency(form.drawnFundsD2)}</td>
                    </tr>
                    <tr className="bg-[#F5F7F4] font-medium">
                      <td className="px-2 py-1.5 text-[#1A3636]">Subtotal Drawn</td>
                      <td className="px-2 py-1.5 text-right text-[#1A3636]">{formatCurrency(form.drawnFundsSubtotal)}</td>
                    </tr>
                    <tr>
                      <td className="px-2 py-1.5 text-[#40534C]">Undrawn Funds</td>
                      <td className="px-2 py-1.5 text-right text-[#1A3636]">{formatCurrency(form.undrawnFundsToDate)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {(form.drawdownRequestNo || form.drawdownKesAmount) && (
              <div>
                <SectionHeader title="Current Request" icon={<FiBriefcase className="w-3 h-3" />} />
                <div className="bg-[#F5F7F4] p-3 rounded flex justify-between items-center">
                  <div>
                    <p className="text-[8px] text-[#677D6A]">Request No.</p>
                    <p className="text-[10px] font-medium text-[#1A3636]">{form.drawdownRequestNo || '—'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[8px] text-[#677D6A]">Amount</p>
                    <p className="text-xs font-bold text-[#1A3636]">{formatCurrency(form.drawdownKesAmount)}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Documents Tab - compact list */}
        {activeTab === 'documents' && (
          <div className="space-y-4">
            <div>
              <SectionHeader title="Submitted Documents" icon={<FiFileText className="w-3 h-3" />} />
              <div className="border border-[#D6BD98]/20 rounded p-2">
                {form.documentsSubmitted ? (
                  <>
                    <DocumentItem label="QS Valuation" doc={form.documentsSubmitted} docKey="qsValuation" />
                    <DocumentItem label="Interim Certificate" doc={form.documentsSubmitted} docKey="interimCertificate" />
                    <DocumentItem label="Instruction Letter" doc={form.documentsSubmitted} docKey="customerInstructionLetter" />
                    <DocumentItem label="Progress Report" doc={form.documentsSubmitted} docKey="contractorProgressReport" />
                    <DocumentItem label="Invoice" doc={form.documentsSubmitted} docKey="contractorInvoice" />
                  </>
                ) : (
                  <p className="text-[9px] text-[#677D6A] text-center py-2">No documents submitted</p>
                )}
              </div>
            </div>

            <div>
              <SectionHeader title="Sign-off" icon={<FiClipboard className="w-3 h-3" />} />
              <div className="grid grid-cols-3 gap-2 bg-[#F5F7F4] p-2 rounded">
                <InfoRow label="Prepared By" value={form.preparedBy} />
                <InfoRow label="Signature" value={form.signature} />
                <InfoRow label="Date" value={formatDate(form.preparedDate)} />
              </div>
            </div>
          </div>
        )}

        {/* Photos Tab - grid layout */}
        {activeTab === 'photos' && (
          <div className="space-y-4">
            <PhotoGrid 
              photos={form.progressPhotosPage3 || []} 
              title="Progress Photos"
              emptyMessage="No progress photos"
            />
            <PhotoGrid 
              photos={form.materialsOnSitePhotos || []} 
              title="Materials on Site"
              emptyMessage="No materials photos"
            />
            <PhotoGrid 
              photos={form.defectsNotedPhotos || []} 
              title="Defects Noted"
              emptyMessage="No defect photos"
            />
          </div>
        )}

        {/* Read-only footer */}
        {isReadOnly && (
          <div className="mt-4 p-2 bg-[#F5F7F4] rounded border border-[#D6BD98]/20">
            <div className="flex items-center gap-1.5 text-[#677D6A]">
              {isApproved ? (
                <>
                  <FiCheckCircle className="w-3 h-3" />
                  <p className="text-[8px]">Approved - PDF download available</p>
                </>
              ) : (
                <>
                  <FiLock className="w-3 h-3" />
                  <p className="text-[8px]">QS Review - PDF locked until approval</p>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ReportViewPage