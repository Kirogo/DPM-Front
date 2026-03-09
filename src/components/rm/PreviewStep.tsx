// src/components/rm/PreviewStep.tsx
import React from 'react'
import { SiteVisitCallReportForm } from '@/types/checklist.types'
import { Edit3, User, MapPin, Calendar, DollarSign, FileText, Image as ImageIcon, CheckCircle2, XCircle, AlertCircle, Building2, Users, FileCheck, Clock, Home, Hash, Target, Briefcase, ClipboardList, FileSignature, Star, Eye } from 'lucide-react'

interface PreviewStepProps {
  formData: SiteVisitCallReportForm
  onEditStep: (stepId: number) => void
  isReadOnly?: boolean // Add this
}

// Helper function to format currency
const formatCurrency = (value: string | number): string => {
  if (!value) return 'KES 0.00'
  const num = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(num)) return 'KES 0.00'
  return `KES ${num.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

// Helper function to format date
const formatDate = (dateString: string): string => {
  if (!dateString) return 'Not specified'
  try {
    return new Date(dateString).toLocaleString('en-KE', {
      dateStyle: 'medium',
      timeStyle: 'short'
    })
  } catch {
    return dateString
  }
}

// Section Header Component
const SectionHeader: React.FC<{ 
  title: string; 
  icon: React.ReactNode;
  stepId: number;
  onEdit: (stepId: number) => void;
  isComplete?: boolean;
  isReadOnly?: boolean;
}> = ({ title, icon, stepId, onEdit, isComplete = true, isReadOnly = false }) => (
  <div className="flex items-center justify-between mb-4">
    <div className="flex items-center gap-2">
      <div className="p-1.5 rounded-lg bg-[#677D6A]/10">
        {icon}
      </div>
      <h3 className="font-semibold text-[#1A3636]">{title}</h3>
      {!isComplete && !isReadOnly && (
        <span className="flex items-center gap-1 text-xs text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full">
          <AlertCircle className="w-3 h-3" />
          Incomplete
        </span>
      )}
      {isReadOnly && (
        <span className="text-xs text-[#677D6A] bg-[#F5F7F4] px-2 py-0.5 rounded-full">
          Read Only
        </span>
      )}
    </div>
    {!isReadOnly && (
      <button
        onClick={() => onEdit(stepId)}
        className="flex items-center gap-1 text-xs text-[#40534C] hover:text-[#1A3636] bg-[#D6BD98]/10 hover:bg-[#D6BD98]/20 px-2 py-1 rounded-lg transition-colors"
      >
        <Edit3 className="w-3 h-3" />
        Edit
      </button>
    )}
  </div>
)

// Info Row Component
const InfoRow: React.FC<{ 
  label: string; 
  value: string | number; 
  fullWidth?: boolean;
}> = ({ label, value, fullWidth = false }) => (
  <div className={fullWidth ? 'col-span-2' : ''}>
    <p className="text-xs text-[#677D6A] mb-0.5">{label}</p>
    <p className="text-sm font-medium text-[#1A3636] break-words">
      {value || value === 0 ? value : <span className="text-[#D6BD98] italic">Not provided</span>}
    </p>
  </div>
)

// Photo Grid Component
const PhotoGrid: React.FC<{ 
  photos: string[]; 
  title: string;
  emptyMessage?: string;
}> = ({ photos, title, emptyMessage = 'No photos uploaded' }) => {
  const validPhotos = photos.filter(url => url && url.trim() !== '')
  
  if (validPhotos.length === 0) {
    return (
      <div className="border border-dashed border-[#D6BD98]/50 rounded-lg p-4 text-center">
        <ImageIcon className="w-8 h-8 text-[#D6BD98] mx-auto mb-2" />
        <p className="text-sm text-[#677D6A]">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div>
      <p className="text-xs text-[#677D6A] mb-2">{title}</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {validPhotos.map((url, index) => (
          <a
            key={index}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative aspect-square rounded-lg overflow-hidden border border-[#D6BD98]/30 hover:border-[#677D6A] transition-all"
          >
            <img
              src={url}
              alt={`${title} ${index + 1}`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
              <Eye className="w-5 h-5 text-white opacity-0 group-hover:opacity-100" />
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}

// Documents Status Component
const DocumentStatus: React.FC<{ 
  label: string; 
  value: string;
}> = ({ label, value }) => (
  <div className="flex items-center justify-between py-2 border-b border-[#D6BD98]/10 last:border-0">
    <span className="text-xs text-[#40534C]">{label}</span>
    <span className={`flex items-center gap-1 text-xs font-medium ${
      value === 'Yes' ? 'text-green-600' : value === 'No' ? 'text-red-500' : 'text-[#D6BD98]'
    }`}>
      {value === 'Yes' && <CheckCircle2 className="w-3 h-3" />}
      {value === 'No' && <XCircle className="w-3 h-3" />}
      {value || 'Not specified'}
    </span>
  </div>
)

// Main Preview Component
const PreviewStep: React.FC<PreviewStepProps> = ({ formData, onEditStep, isReadOnly = false }) => {
  // Calculate completion status for each section
  const sectionComplete = {
    customer: !!(formData.customerName && formData.customerType),
    siteVisit: !!(
      formData.siteVisitDateTime &&
      formData.personMetAtSite &&
      formData.bqAmount &&
      formData.constructionLoanAmount &&
      formData.customerContribution &&
      formData.siteExactLocation
    ),
    project: !!(
      formData.worksComplete &&
      formData.worksOngoing &&
      formData.materialsFoundOnSite &&
      formData.defectsNotedOnSite
    ),
    documents: !!(
      formData.preparedBy &&
      formData.signature &&
      formData.preparedDate
    ),
    photos: !!(
      formData.progressPhotosPage3.some(url => url && url.trim() !== '') &&
      formData.materialsOnSitePhotos.some(url => url && url.trim() !== '') &&
      formData.defectsNotedPhotos.some(url => url && url.trim() !== '')
    )
  }

  const allSectionsComplete = Object.values(sectionComplete).every(Boolean)

  return (
    <div className="space-y-6">
      {/* Header with completion status */}
      <div className={`flex items-center justify-between p-4 rounded-lg border ${
        allSectionsComplete 
          ? 'bg-gradient-to-r from-[#D4AF37]/10 to-[#FFD700]/10 border-[#D4AF37]/30' 
          : 'bg-gradient-to-r from-[#1A3636]/5 to-[#677D6A]/5 border-[#D6BD98]/30'
      }`}>
        <div className="flex items-center gap-3">
          {allSectionsComplete ? (
            <Star className="w-5 h-5 text-[#D4AF37]" />
          ) : (
            <Eye className="w-5 h-5 text-[#40534C]" />
          )}
          <div>
            <h2 className="font-semibold text-[#1A3636]">
              {isReadOnly ? 'Report Preview (Read Only)' : 'Review & Submit'}
            </h2>
            <p className="text-xs text-[#677D6A]">
              {isReadOnly 
                ? 'This report is approved and cannot be edited' 
                : allSectionsComplete 
                  ? 'All sections complete! Ready for submission.' 
                  : 'Please review all information before submitting'}
            </p>
          </div>
        </div>
        {!allSectionsComplete && !isReadOnly && (
          <div className="flex items-center gap-2 text-yellow-600 bg-yellow-50 px-3 py-1.5 rounded-lg">
            <AlertCircle className="w-4 h-4" />
            <span className="text-xs font-medium">Some sections are incomplete</span>
          </div>
        )}
        {isReadOnly && (
          <div className="flex items-center gap-2 text-[#677D6A] bg-[#F5F7F4] px-3 py-1.5 rounded-lg">
            <FileText className="w-4 h-4" />
            <span className="text-xs font-medium">Final Version</span>
          </div>
        )}
      </div>

      {/* Customer Information Section */}
      <div>
        <SectionHeader 
          title="Customer Information" 
          icon={<User className="w-4 h-4 text-[#40534C]" />}
          stepId={1}
          onEdit={onEditStep}
          isComplete={sectionComplete.customer}
          isReadOnly={isReadOnly}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoRow label="Call Report No." value={formData.callReportNo || '—'} />
          <InfoRow label="Customer Name" value={formData.customerName} />
          <InfoRow label="Customer Type" value={formData.customerType} />
          <InfoRow label="Brief Profile" value={formData.briefProfile} />
        </div>
      </div>

      <div className="border-t border-[#D6BD98]/20"></div>

      {/* Site Visit Details Section */}
      <div>
        <SectionHeader 
          title="Site Visit Details" 
          icon={<MapPin className="w-4 h-4 text-[#40534C]" />}
          stepId={2}
          onEdit={onEditStep}
          isComplete={sectionComplete.siteVisit}
          isReadOnly={isReadOnly}
        />
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoRow label="Visit Date & Time" value={formatDate(formData.siteVisitDateTime)} />
            <InfoRow label="Person Met at Site" value={formData.personMetAtSite} />
          </div>

          <div className="bg-[#F5F7F4] p-4 rounded-lg">
            <h4 className="text-xs font-semibold text-[#1A3636] mb-3 flex items-center gap-1">
              <DollarSign className="w-3 h-3" />
              Financial Summary
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <InfoRow label="BQ Amount" value={formatCurrency(formData.bqAmount)} />
              <InfoRow label="Construction Loan" value={formatCurrency(formData.constructionLoanAmount)} />
              <InfoRow label="Customer Contribution" value={formatCurrency(formData.customerContribution)} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 pt-3 border-t border-[#D6BD98]/20">
              <InfoRow label="Drawn Funds (D1)" value={formatCurrency(formData.drawnFundsD1)} />
              <InfoRow label="Drawn Funds (D2)" value={formatCurrency(formData.drawnFundsD2)} />
              <InfoRow label="Subtotal Drawn" value={formatCurrency(formData.drawnFundsSubtotal)} />
              <InfoRow label="Undrawn Funds to Date" value={formatCurrency(formData.undrawnFundsToDate)} />
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-[#1A3636] mb-3 flex items-center gap-1">
              <Home className="w-3 h-3" />
              Site Location Details
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoRow label="Exact Location" value={formData.siteExactLocation} />
              <InfoRow label="House Located Along" value={formData.houseLocatedAlong} />
              <InfoRow label="Site PIN" value={formData.sitePin} />
              <InfoRow label="Security Details" value={formData.securityDetails} />
              <InfoRow label="Plot/LR No." value={formData.plotLrNo} fullWidth />
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-[#D6BD98]/20"></div>

      {/* Project Information Section */}
      <div>
        <SectionHeader 
          title="Project Information" 
          icon={<Building2 className="w-4 h-4 text-[#40534C]" />}
          stepId={3}
          onEdit={onEditStep}
          isComplete={sectionComplete.project}
          isReadOnly={isReadOnly}
        />
        <div className="space-y-4">
          <div>
            <p className="text-xs text-[#677D6A] mb-1 flex items-center gap-1">
              <Target className="w-3 h-3" />
              Site Visit Objectives
            </p>
            <div className="bg-[#F5F7F4] p-3 rounded-lg space-y-2">
              <p className="text-sm text-[#1A3636]">1. {formData.siteVisitObjective1 || 'Not specified'}</p>
              <p className="text-sm text-[#1A3636]">2. {formData.siteVisitObjective2 || 'Not specified'}</p>
              <p className="text-sm text-[#1A3636]">3. {formData.siteVisitObjective3 || 'Not specified'}</p>
            </div>
          </div>

          <div>
            <p className="text-xs text-[#677D6A] mb-1">Works Complete</p>
            <div className="bg-[#F5F7F4] p-3 rounded-lg">
              <p className="text-sm text-[#1A3636]">{formData.worksComplete || 'Not specified'}</p>
            </div>
          </div>

          <div>
            <p className="text-xs text-[#677D6A] mb-1">Works Ongoing</p>
            <div className="bg-[#F5F7F4] p-3 rounded-lg">
              <p className="text-sm text-[#1A3636]">{formData.worksOngoing || 'Not specified'}</p>
            </div>
          </div>

          <div>
            <p className="text-xs text-[#677D6A] mb-1">Materials Found on Site</p>
            <div className="bg-[#F5F7F4] p-3 rounded-lg">
              <p className="text-sm text-[#1A3636]">{formData.materialsFoundOnSite || 'Not specified'}</p>
            </div>
          </div>

          <div>
            <p className="text-xs text-[#677D6A] mb-1">Defects Noted</p>
            <div className="bg-[#F5F7F4] p-3 rounded-lg border-l-2 border-amber-400">
              <p className="text-sm text-[#1A3636]">{formData.defectsNotedOnSite || 'No defects noted'}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2 pt-2 border-t border-[#D6BD98]/20">
            <InfoRow label="Drawdown Request No." value={formData.drawdownRequestNo} />
            <InfoRow label="Drawdown Amount" value={formatCurrency(formData.drawdownKesAmount)} />
          </div>
        </div>
      </div>

      <div className="border-t border-[#D6BD98]/20"></div>

      {/* Documents Section */}
      <div>
        <SectionHeader 
          title="Documents & Sign-off" 
          icon={<FileText className="w-4 h-4 text-[#40534C]" />}
          stepId={4}
          onEdit={onEditStep}
          isComplete={sectionComplete.documents}
          isReadOnly={isReadOnly}
        />
        <div className="space-y-4">
          <div>
            <h4 className="text-xs font-semibold text-[#1A3636] mb-2">Submitted Documents</h4>
            <div className="space-y-1">
              <DocumentStatus label="QS Valuation" value={formData.documentsSubmitted.qsValuation} />
              <DocumentStatus label="Interim Certificate" value={formData.documentsSubmitted.interimCertificate} />
              <DocumentStatus label="Customer Instruction Letter" value={formData.documentsSubmitted.customerInstructionLetter} />
              <DocumentStatus label="Contractor's Progress Report" value={formData.documentsSubmitted.contractorProgressReport} />
              <DocumentStatus label="Contractor's Invoice" value={formData.documentsSubmitted.contractorInvoice} />
            </div>
          </div>

          <div className="bg-[#F5F7F4] p-4 rounded-lg">
            <h4 className="text-xs font-semibold text-[#1A3636] mb-3 flex items-center gap-1">
              <FileSignature className="w-3 h-3" />
              Sign-off Details
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <InfoRow label="Prepared By" value={formData.preparedBy} />
              <InfoRow label="Signature" value={formData.signature} />
              <InfoRow label="Date" value={formatDate(formData.preparedDate)} />
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-[#D6BD98]/20"></div>

      {/* Photos Section */}
      <div>
        <SectionHeader 
          title="Site Photos" 
          icon={<ImageIcon className="w-4 h-4 text-[#40534C]" />}
          stepId={5}
          onEdit={onEditStep}
          isComplete={sectionComplete.photos}
          isReadOnly={isReadOnly}
        />
        <div className="space-y-6">
          <PhotoGrid 
            photos={formData.progressPhotosPage3} 
            title="Progress Photos"
            emptyMessage="No progress photos uploaded"
          />
          
          <PhotoGrid 
            photos={formData.materialsOnSitePhotos} 
            title="Materials on Site"
            emptyMessage="No materials photos uploaded"
          />
          
          <PhotoGrid 
            photos={formData.defectsNotedPhotos} 
            title="Defects Noted"
            emptyMessage="No defect photos uploaded"
          />
        </div>
      </div>

      {/* Summary Footer */}
      <div className={`flex items-center justify-between p-4 rounded-lg border ${
        allSectionsComplete 
          ? 'bg-gradient-to-r from-[#D4AF37]/20 to-[#FFD700]/20 border-[#D4AF37]/40' 
          : 'bg-gradient-to-r from-[#677D6A]/10 to-[#D6BD98]/10 border-[#D6BD98]/30'
      }`}>
        <div className="flex items-center gap-2">
          <ClipboardList className={`w-4 h-4 ${allSectionsComplete ? 'text-[#D4AF37]' : 'text-[#40534C]'}`} />
          <span className={`text-sm ${allSectionsComplete ? 'text-[#1A3636] font-medium' : 'text-[#1A3636]'}`}>
            {isReadOnly ? 'Final Report' : `${Object.values(sectionComplete).filter(Boolean).length} of 5 sections complete`}
          </span>
        </div>
        {allSectionsComplete && !isReadOnly && (
          <div className="flex items-center gap-1 text-[#D4AF37]">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-xs font-medium">All sections complete</span>
          </div>
        )}
        {isReadOnly && (
          <div className="flex items-center gap-1 text-[#677D6A]">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-xs font-medium">Approved Version</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default PreviewStep