// src/types/checklist.types.ts (Updated with full client fields)
export interface ChecklistDocumentItem {
  name: string
  status: string
  action?: string
  comment?: string
}

export interface ChecklistDocumentCategory {
  category: string
  docList: ChecklistDocumentItem[]
}

export interface ChecklistUserRef {
  _id?: string
  id?: string
  name?: string
  email?: string
}

// Client information from backend
export interface ChecklistClientInfo {
  customerId?: string
  customerNumber?: string
  customerName?: string
  customerEmail?: string
  projectName?: string
  ibpsNo?: string
}

// NEW: Drawdown Item Interface
export interface DrawdownItem {
  id: string
  amount: string
}

// Site Visit Form Types
export interface SiteVisitSubmittedDocs {
  qsValuation: string
  qsValuationFile?: string
  qsValuationReason?: string
  
  interimCertificate: string
  interimCertificateFile?: string
  interimCertificateReason?: string
  
  customerInstructionLetter: string
  customerInstructionLetterFile?: string
  customerInstructionLetterReason?: string
  
  contractorProgressReport: string
  contractorProgressReportFile?: string
  contractorProgressReportReason?: string
  
  contractorInvoice: string
  contractorInvoiceFile?: string
  contractorInvoiceReason?: string
}

export interface SiteVisitCallReportForm {
  callReportNo: string
  customerName: string
  customerType: string
  siteVisitDateTime: string
  personMetAtSite: string
  bqAmount: string
  constructionLoanAmount: string
  customerContribution: string
  // UPDATED: Replace single drawdown fields with array
  drawdowns: DrawdownItem[]
  drawnFundsSubtotal: string
  undrawnFundsToDate: string
  briefProfile: string
  siteExactLocation: string
  houseLocatedAlong: string
  sitePin: string
  securityDetails: string
  plotLrNo: string
  siteVisitObjective1: string
  siteVisitObjective2: string
  siteVisitObjective3: string
  worksComplete: string
  worksOngoing: string
  materialsFoundOnSite: string
  defectsNotedOnSite: string
  drawdownRequestNo: string
  drawdownKesAmount: string
  documentsSubmitted: SiteVisitSubmittedDocs
  preparedBy: string
  signature: string
  preparedDate: string
  progressPhotosPage3: string[]
  progressPhotosPage4: string[]
  materialsOnSitePhotos: string[]
  defectsNotedPhotos: string[]
}

export type ReportStatus = 
  | 'pending'      // Newly created, not filled
  | 'draft'        // Partially filled, saved as draft
  | 'submitted'    // Fully filled and submitted to QS
  | 'pending_qs_review' // Submitted and awaiting QS review
  | 'rework'       // Returned by QS for revisions
  | 'approved'     // Approved by QS
  | 'rejected';    // Rejected by QS

// Lock information interface
export interface ReportLockInfo {
  isLocked: boolean
  lockedBy?: ChecklistUserRef
  lockedAt?: string
  lockedByRMId?: string
  lockedByRMName?: string
}

// Main Checklist Interface - UPDATED with all fields
export interface Checklist {
  _id: string
  id?: string
  callReportNo?: string
  dclNo: string
  customerId?: string
  customerName?: string
  customerNumber?: string
  customerEmail?: string
  projectName?: string
  loanType?: string
  ibpsNo?: string
  status?: string
  createdBy?: ChecklistUserRef
  assignedToRM?: ChecklistUserRef
  documents: ChecklistDocumentCategory[]
  createdAt?: string
  updatedAt?: string
  siteVisitForm?: SiteVisitCallReportForm
  // Lock fields
  isLocked?: boolean
  lockedBy?: ChecklistUserRef
  lockedAt?: string
  
  // QS fields
  assignedToQS?: string
  assignedToQSName?: string
  submittedAt?: string
  priority?: string
  reviewedAt?: string
  reviewedBy?: string
  status?: ReportStatus
}

// DTOs for API calls
export interface CreateChecklistDto {
  customerId?: string
  customerName: string
  customerNumber: string
  customerEmail?: string
  projectName: string
  assignedToRM: string
  documents: ChecklistDocumentCategory[]
  ibpsNo: string
  siteVisitForm?: SiteVisitCallReportForm
}

export interface UpdateChecklistDto extends CreateChecklistDto {
  status?: ReportStatus
}

// Lock/Unlock DTOs
export interface LockReportDto {
  reportId: string
  userId: string
  userName: string
}

export interface UnlockReportDto {
  reportId: string
  userId: string
}

// Helper function to create default form - UPDATED with drawdowns array
export const createDefaultSiteVisitCallReportForm = (): SiteVisitCallReportForm => ({
  callReportNo: '',
  customerName: '',
  customerType: '',
  siteVisitDateTime: '',
  personMetAtSite: '',
  bqAmount: '',
  constructionLoanAmount: '',
  customerContribution: '',
  // UPDATED: Initialize with one default drawdown
  drawdowns: [{ id: crypto.randomUUID?.() || Date.now().toString(), amount: '' }],
  drawnFundsSubtotal: '',
  undrawnFundsToDate: '',
  briefProfile: '',
  siteExactLocation: '',
  houseLocatedAlong: '',
  sitePin: '',
  securityDetails: '',
  plotLrNo: '',
  siteVisitObjective1: 'Confirm progress on site and level of work done',
  siteVisitObjective2: 'Confirm status of the building including taking note of any visible defects',
  siteVisitObjective3: 'Take note of materials stored on site',
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
    contractorInvoice: '',
  },
  preparedBy: '',
  signature: '',
  preparedDate: '',
  progressPhotosPage3: ['', '', '', ''],
  progressPhotosPage4: ['', '', '', ''],
  materialsOnSitePhotos: ['', '', '', ''],
  defectsNotedPhotos: ['', '', '', ''],
})