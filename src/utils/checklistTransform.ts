// src/utils/checklistTransform.ts
import { Checklist } from '@/types/checklist.types'
import { SiteVisitReport } from '@/types/report.types'

// Helper function to get value with case-insensitive access
const getValue = (obj: any, key: string): any => {
  if (!obj) return undefined
  
  // Try exact match
  if (obj[key] !== undefined && obj[key] !== null) return obj[key]
  
  // Try PascalCase (first letter capitalized)
  const pascalKey = key.charAt(0).toUpperCase() + key.slice(1)
  if (obj[pascalKey] !== undefined && obj[pascalKey] !== null) return obj[pascalKey]
  
  // Try all uppercase
  const upperKey = key.toUpperCase()
  if (obj[upperKey] !== undefined && obj[upperKey] !== null) return obj[upperKey]
  
  return undefined
}

export const transformChecklistToReport = (checklist: Checklist): SiteVisitReport => {
  // Extract values with case-insensitive access
  const id = getValue(checklist, 'id') || getValue(checklist, '_id') || ''
  const dclNo = getValue(checklist, 'dclNo') || ''
  const callReportNo = getValue(checklist, 'callReportNo') || ''
  const customerName = getValue(checklist, 'customerName') || getValue(checklist, 'CustomerName') || 'Unknown Client'
  const customerNumber = getValue(checklist, 'customerNumber') || getValue(checklist, 'CustomerNumber') || ''
  const customerEmail = getValue(checklist, 'customerEmail') || getValue(checklist, 'CustomerEmail') || ''
  const projectName = getValue(checklist, 'projectName') || getValue(checklist, 'ProjectName') || getValue(checklist, 'loanType') || ''
  const ibpsNo = getValue(checklist, 'ibpsNo') || getValue(checklist, 'IbpsNo') || ''
  const status = getValue(checklist, 'status') || getValue(checklist, 'Status') || 'draft'
  const createdAt = getValue(checklist, 'createdAt') || getValue(checklist, 'CreatedAt')
  const updatedAt = getValue(checklist, 'updatedAt') || getValue(checklist, 'UpdatedAt')
  
  // Get assigned RM info
  let assignedRM = null
  const assignedToRM = getValue(checklist, 'assignedToRM') || getValue(checklist, 'AssignedToRM')
  if (assignedToRM) {
    assignedRM = {
      id: assignedToRM.id || assignedToRM.Id || assignedToRM._id || '',
      name: assignedToRM.name || assignedToRM.Name || '',
      email: assignedToRM.email || assignedToRM.Email || ''
    }
  }
  
  // Get RM name
  let rmName = ''
  if (assignedRM?.name) {
    rmName = assignedRM.name
  } else {
    rmName = getValue(checklist, 'rmName') || getValue(checklist, 'RmName') || ''
  }

  // Calculate current step based on form data or status
  let currentStep = 1
  
  if (checklist.siteVisitForm) {
    const form = checklist.siteVisitForm
    if (form.progressPhotosPage3?.some(url => url)) currentStep = 4
    else if (form.siteExactLocation) currentStep = 3
    else if (form.customerName) currentStep = 2
  }
  
  // Override based on status
  if (status === 'submitted' || status === 'pending_qs_review') {
    currentStep = 7
  } else if (status === 'approved') {
    currentStep = 7
  }

  // Extract client info
  const client = {
    id: getValue(checklist, 'customerId') || getValue(checklist, 'CustomerId') || '',
    name: customerName,
    customerNumber: customerNumber,
    email: customerEmail,
    projectName: projectName
  }

  return {
    id: id,
    reportNo: callReportNo || dclNo || '',
    title: projectName || `Report ${callReportNo || dclNo || ''}`,
    clientName: customerName,
    client: client,
    status: status,
    createdAt: createdAt ? new Date(createdAt) : new Date(),
    updatedAt: updatedAt ? new Date(updatedAt) : new Date(),
    projectName: projectName,
    customerNumber: customerNumber,
    customerName: customerName,
    customerEmail: customerEmail,
    ibpsNo: ibpsNo,
    rmId: assignedRM?.id || '',
    rmName: rmName,
    currentStep: currentStep,
    stepProgress: {},
    assignedToRM: assignedRM,
    siteVisitForm: checklist.siteVisitForm
  }
}

export const transformChecklistsToReports = (checklists: Checklist[]): SiteVisitReport[] => {
  return checklists.map(transformChecklistToReport)
}