export const toServer = (status?: string) => {
  if (!status) return status
  const s = status.toString().toLowerCase()
  switch (s) {
    case 'draft':
      return 'Draft'
    case 'pending_qs_review':
    case 'pendingqsreview':
    case 'pendingqs_review':
    case 'pending_qsreview':
      return 'PendingQsReview'
    case 'under_review':
    case 'underreview':
      return 'UnderReview'
    case 'revision_requested':
    case 'revisionrequested':
      return 'RevisionRequested'
    case 'site_visit_scheduled':
    case 'sitevisitscheduled':
      return 'SiteVisitScheduled'
    case 'approved':
      return 'Approved'
    case 'rejected':
      return 'Rejected'
    case 'archived':
      return 'Archived'
    default:
      return status
  }
}

export const fromServer = (status?: string) => {
  if (!status) return status
  const s = status.toString()
  // handle PascalCase enums from server
  switch (s) {
    case 'Draft':
      return 'draft'
    case 'PendingQsReview':
      return 'pending_qs_review'
    case 'UnderReview':
      return 'under_review'
    case 'RevisionRequested':
      return 'revision_requested'
    case 'SiteVisitScheduled':
      return 'site_visit_scheduled'
    case 'Approved':
      return 'approved'
    case 'Rejected':
      return 'rejected'
    case 'Archived':
      return 'archived'
    default:
      return s.toLowerCase()
  }
}

export const isStatus = (actual?: string, expected?: string) => {
  if (!actual || !expected) return false
  const a = actual.toString().toLowerCase()
  const e = expected.toString().toLowerCase()
  // Normalize common equivalents
  if (a === e) return true
  // map common server forms
  const mappedA = fromServer(actual)
  return mappedA === e
}
