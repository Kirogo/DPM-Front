// src/components/rm/PreviewStep.tsx
import React, { useState, useEffect } from 'react'
import { SiteVisitCallReportForm } from '@/types/checklist.types'
import { generateSiteVisitReportPDF } from '@/utils/pdfGenerator'
import { Button } from '@/components/common/Button'
import toast from 'react-hot-toast'
import { 
  FiUser, 
  FiMapPin, 
  FiBriefcase, 
  FiFileText, 
  FiImage, 
  FiDownload,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiHome,
  FiTarget,
  FiPenTool,
  FiEye,
  FiInfo,
  FiHash,
  FiCreditCard
} from 'react-icons/fi'
// IMPORT THE LOGO DIRECTLY
import ncbaLogo from '@/assets/NCBALogo.png'

interface PreviewStepProps {
  formData: SiteVisitCallReportForm
  onEditStep: (stepId: number) => void
  isReadOnly?: boolean
  reportNumber?: string
  customerNumber?: string
  reportStatus?: string // Add report status prop
}

// Helper function to format currency
const formatCurrency = (value: string | number): string => {
  if (!value) return '—'
  const num = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(num)) return '—'
  return `KES ${num.toLocaleString('en-KE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

// Helper function to format date
const formatDate = (dateString: string): string => {
  if (!dateString) return '—'
  try {
    const date = new Date(dateString)
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    return `${day}/${month}/${year} ${hours}:${minutes}`
  } catch {
    return dateString
  }
}

// Helper function to format date only
const formatDateOnly = (dateString: string): string => {
  if (!dateString) return '—'
  try {
    const date = new Date(dateString)
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  } catch {
    return dateString
  }
}

// Helper to get value safely
const getValue = (value: any): string => {
  if (value === undefined || value === null) return '—'
  if (typeof value === 'string' && value.trim() === '') return '—'
  return value.toString()
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

// Info Row Component - Minimal design
const InfoRow: React.FC<{ 
  label: string; 
  value: any;
  fullWidth?: boolean;
}> = ({ label, value, fullWidth = false }) => (
  <div className={fullWidth ? 'col-span-2' : ''}>
    <p className="text-[9px] text-[#677D6A] uppercase tracking-wider">{label}</p>
    <p className="text-xs text-[#40534C] mt-0.5 break-words">
      {getValue(value)}
    </p>
  </div>
)

// Section Header Component - Matching QSReviewDetailPage
const SectionHeader: React.FC<{ 
  title: string; 
  icon?: React.ReactNode;
  stepId: number;
  onEdit: (stepId: number) => void;
  isReadOnly?: boolean;
}> = ({ title, icon, stepId, onEdit, isReadOnly = false }) => (
  <div className="flex items-center justify-between mb-3">
    <div className="flex items-center gap-1.5">
      {icon && <span className="text-[#677D6A]">{icon}</span>}
      <h3 className="text-[10px] font-bold text-[#1A3636] uppercase tracking-wider">
        {title}
      </h3>
    </div>
    {!isReadOnly && (
      <button
        onClick={() => onEdit(stepId)}
        className="text-[9px] text-[#40534C] hover:text-[#1A3636] bg-[#F5F7F4] hover:bg-[#D6BD98]/20 px-2 py-1 rounded transition-colors"
      >
        Edit
      </button>
    )}
  </div>
)

// Document Status Component - Minimal
const DocumentStatus: React.FC<{ 
  label: string; 
  value: string;
}> = ({ label, value }) => (
  <div className="flex items-center justify-between py-1.5 border-b border-[#D6BD98]/10 last:border-0">
    <span className="text-[10px] text-[#40534C]">{label}</span>
    <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded ${
      value === 'Yes' ? 'bg-emerald-100 text-emerald-700' : 
      value === 'No' ? 'bg-amber-100 text-amber-700' : 
      'bg-gray-100 text-gray-700'
    }`}>
      {value || '—'}
    </span>
  </div>
)

// Photo Grid Component - Minimal
const PhotoGrid: React.FC<{ 
  photos: string[]; 
  title: string;
  emptyMessage?: string;
}> = ({ photos, title, emptyMessage = 'No photos' }) => {
  const validPhotos = photos.filter(url => url && url.trim() !== '')
  
  if (validPhotos.length === 0) {
    return (
      <div className="border border-dashed border-[#D6BD98]/20 rounded p-4 text-center">
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
            className="group relative aspect-square rounded border border-[#D6BD98]/20 hover:border-[#677D6A] transition-all overflow-hidden"
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

// Main Preview Component
const PreviewStep: React.FC<PreviewStepProps> = ({ 
  formData, 
  onEditStep, 
  isReadOnly = false,
  reportNumber = 'CRN-000',
  customerNumber = '—',
  reportStatus = 'draft' // Default to draft if not provided
}) => {
  const [isDownloading, setIsDownloading] = useState(false)
  const [logoBase64, setLogoBase64] = useState<string>('')

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

  const handleDownloadPDF = async () => {
    setIsDownloading(true)
    try {
      // Create a deep copy of formData to avoid mutations
      const pdfData = JSON.parse(JSON.stringify(formData))
      
      // Ensure all required arrays exist
      pdfData.progressPhotosPage3 = pdfData.progressPhotosPage3 || []
      pdfData.materialsOnSitePhotos = pdfData.materialsOnSitePhotos || []
      pdfData.defectsNotedPhotos = pdfData.defectsNotedPhotos || []
      pdfData.documentsSubmitted = pdfData.documentsSubmitted || {}

      // Ensure the report number and customer number are in the PDF data
      pdfData.callReportNo = reportNumber
      pdfData.customerNumber = customerNumber

      const doc = generateSiteVisitReportPDF(
        pdfData,
        reportNumber,
        logoBase64,
        reportStatus, // Pass the report status
        undefined // approvalDate (optional)
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

  return (
    <div className="space-y-4">
      {/* Header with Download Button */}
      <div className="flex items-center justify-between py-2 border-b border-[#D6BD98]/10">
        <div className="flex items-center gap-2">
          <FiInfo className="w-4 h-4 text-[#677D6A]" />
          <h2 className="text-xs font-semibold text-[#1A3636]">
            {isReadOnly ? 'Report Preview' : 'Review & Submit'}
          </h2>
        </div>
        
        {/* Download Button */}
        {/*<Button
          variant="primary"
          size="sm"
          onClick={handleDownloadPDF}
          disabled={isDownloading}
          className="text-[9px] h-6 px-2 bg-[#677D6A] hover:bg-[#40534C] text-white"
          title="Download PDF"
        >
          <FiDownload className="w-2.5 h-2.5 mr-1" />
          {isDownloading ? '...' : 'PDF'}
        </Button>*/}
      </div>

      {/* Customer Information Section */}
      <div className="space-y-3">
        <SectionHeader 
          title="Customer Information" 
          icon={<FiUser className="w-3 h-3" />}
          stepId={1}
          onEdit={onEditStep}
          isReadOnly={isReadOnly}
        />
        <div className="grid grid-cols-2 gap-3">
          <InfoRow label="Report No." value={reportNumber} />
          <InfoRow label="Customer No." value={customerNumber} />
          <InfoRow label="Customer Name" value={formData.customerName} />
          <InfoRow label="Customer Type" value={formData.customerType} />
          <InfoRow label="Brief Profile" value={formData.briefProfile} fullWidth />
        </div>
      </div>

      <div className="border-t border-[#D6BD98]/10"></div>

      {/* Site Visit Section */}
      <div className="space-y-3">
        <SectionHeader 
          title="Site Visit" 
          icon={<FiMapPin className="w-3 h-3" />}
          stepId={2}
          onEdit={onEditStep}
          isReadOnly={isReadOnly}
        />
        
        {/* Visit Details */}
        <div className="grid grid-cols-2 gap-3">
          <InfoRow label="Date & Time" value={formatDate(formData.siteVisitDateTime)} />
          <InfoRow label="Person Met" value={formData.personMetAtSite} />
          <InfoRow label="Exact Location" value={formData.siteExactLocation} fullWidth />
          <InfoRow label="Plot/LR No." value={formData.plotLrNo} />
          <InfoRow label="Site PIN" value={formData.sitePin} />
          <InfoRow label="House Located Along" value={formData.houseLocatedAlong} />
          <InfoRow label="Security Details" value={formData.securityDetails} fullWidth />
        </div>

        {/* Financial Summary */}
        {(formData.bqAmount || formData.constructionLoanAmount) && (
          <div className="bg-[#F5F7F4] p-3 rounded mt-2">
            <h4 className="text-[9px] font-semibold text-[#1A3636] uppercase tracking-wider mb-2 flex items-center gap-1">
              <FiBriefcase className="w-2.5 h-2.5" />
              Financial Summary
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <InfoRow label="BQ Amount" value={formatCurrency(formData.bqAmount)} />
              <InfoRow label="Loan Amount" value={formatCurrency(formData.constructionLoanAmount)} />
              <InfoRow label="Customer Contribution" value={formatCurrency(formData.customerContribution)} />
            </div>
          </div>
        )}

        {/* Drawdown Details */}
        {(formData.drawnFundsD1 || formData.drawnFundsD2) && (
          <div className="mt-2">
            <h4 className="text-[9px] font-semibold text-[#1A3636] uppercase tracking-wider mb-2">Drawdown Funds</h4>
            <div className="grid grid-cols-2 gap-3">
              <InfoRow label="Drawn Funds D1" value={formatCurrency(formData.drawnFundsD1)} />
              <InfoRow label="Drawn Funds D2" value={formatCurrency(formData.drawnFundsD2)} />
              <InfoRow label="Subtotal Drawn" value={formatCurrency(formData.drawnFundsSubtotal)} />
              <InfoRow label="Undrawn Funds" value={formatCurrency(formData.undrawnFundsToDate)} />
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-[#D6BD98]/10"></div>

      {/* Project Information Section */}
      <div className="space-y-3">
        <SectionHeader 
          title="Project Information" 
          icon={<FiHome className="w-3 h-3" />}
          stepId={3}
          onEdit={onEditStep}
          isReadOnly={isReadOnly}
        />

        {/* Site Visit Objectives */}
        <div>
          <h4 className="text-[9px] font-semibold text-[#1A3636] uppercase tracking-wider mb-2 flex items-center gap-1">
            <FiTarget className="w-2.5 h-2.5" />
            Objectives
          </h4>
          <div className="space-y-1.5">
            <div className="text-[10px] text-[#40534C]">
              <span className="text-[#677D6A] mr-1">1.</span> {formData.siteVisitObjective1 || 'Not specified'}
            </div>
            <div className="text-[10px] text-[#40534C]">
              <span className="text-[#677D6A] mr-1">2.</span> {formData.siteVisitObjective2 || 'Not specified'}
            </div>
            <div className="text-[10px] text-[#40534C]">
              <span className="text-[#677D6A] mr-1">3.</span> {formData.siteVisitObjective3 || 'Not specified'}
            </div>
          </div>
        </div>

        {/* Works Progress */}
        <div className="space-y-2 mt-3">
          <div className="bg-[#F5F7F4] p-2 rounded">
            <p className="text-[8px] text-[#677D6A] mb-0.5">Works Complete</p>
            <p className="text-[10px] text-[#40534C]">{formData.worksComplete || '—'}</p>
          </div>
          <div className="bg-[#F5F7F4] p-2 rounded">
            <p className="text-[8px] text-[#677D6A] mb-0.5">Works Ongoing</p>
            <p className="text-[10px] text-[#40534C]">{formData.worksOngoing || '—'}</p>
          </div>
          <div className="bg-[#F5F7F4] p-2 rounded">
            <p className="text-[8px] text-[#677D6A] mb-0.5">Materials Found</p>
            <p className="text-[10px] text-[#40534C]">{formData.materialsFoundOnSite || '—'}</p>
          </div>
          <div className="bg-amber-50 p-2 rounded border-l-2 border-amber-400">
            <p className="text-[8px] text-amber-600 mb-0.5">Defects Noted</p>
            <p className="text-[10px] text-amber-800">{formData.defectsNotedOnSite || 'None noted'}</p>
          </div>
        </div>

        {/* Drawdown Request */}
        {(formData.drawdownRequestNo || formData.drawdownKesAmount) && (
          <div className="mt-3 pt-2 border-t border-[#D6BD98]/10">
            <div className="grid grid-cols-2 gap-3">
              <InfoRow label="Request No." value={formData.drawdownRequestNo} />
              <InfoRow label="Amount Requested" value={formatCurrency(formData.drawdownKesAmount)} />
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-[#D6BD98]/10"></div>

      {/* Documents Section */}
      <div className="space-y-3">
        <SectionHeader 
          title="Documents" 
          icon={<FiFileText className="w-3 h-3" />}
          stepId={4}
          onEdit={onEditStep}
          isReadOnly={isReadOnly}
        />

        <div className="border border-[#D6BD98]/20 rounded p-2">
          <DocumentStatus label="QS Valuation" value={formData.documentsSubmitted.qsValuation} />
          <DocumentStatus label="Interim Certificate" value={formData.documentsSubmitted.interimCertificate} />
          <DocumentStatus label="Customer Instructions" value={formData.documentsSubmitted.customerInstructionLetter} />
          <DocumentStatus label="Contractor's Progress" value={formData.documentsSubmitted.contractorProgressReport} />
          <DocumentStatus label="Contractor's Invoice" value={formData.documentsSubmitted.contractorInvoice} />
        </div>

        {/* Sign-off */}
        {(formData.preparedBy || formData.signature || formData.preparedDate) && (
          <div className="bg-[#F5F7F4] p-3 rounded mt-2">
            <h4 className="text-[9px] font-semibold text-[#1A3636] uppercase tracking-wider mb-2 flex items-center gap-1">
              <FiPenTool className="w-2.5 h-2.5" />
              Sign-off
            </h4>
            <div className="grid grid-cols-3 gap-3">
              <InfoRow label="Prepared By" value={formData.preparedBy} />
              <InfoRow label="Signature" value={formData.signature} />
              <InfoRow label="Date" value={formatDateOnly(formData.preparedDate)} />
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-[#D6BD98]/10"></div>

      {/* Photos Section */}
      <div className="space-y-3">
        <SectionHeader 
          title="Photos" 
          icon={<FiImage className="w-3 h-3" />}
          stepId={5}
          onEdit={onEditStep}
          isReadOnly={isReadOnly}
        />
        
        <PhotoGrid 
          photos={formData.progressPhotosPage3 || []} 
          title="Progress Photos"
          emptyMessage="No progress photos"
        />
        
        <PhotoGrid 
          photos={formData.materialsOnSitePhotos || []} 
          title="Materials on Site"
          emptyMessage="No materials photos"
        />
        
        <PhotoGrid 
          photos={formData.defectsNotedPhotos || []} 
          title="Defects Noted"
          emptyMessage="No defect photos"
        />
      </div>

      {/* Summary Footer */}
      <div className="mt-4 pt-3 border-t border-[#D6BD98]/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[#677D6A]">
            <FiEye className="w-3 h-3" />
            <span className="text-[8px]">Preview Mode</span>
          </div>
          {isReadOnly ? (
            <div className="flex items-center gap-1 text-[#677D6A]">
              <FiCheckCircle className="w-3 h-3" />
              <span className="text-[8px] font-medium">Final Version</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-[#677D6A]">
              <FiCheckCircle className="w-3 h-3" />
              <span className="text-[8px] font-medium">Ready for Review</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PreviewStep