// src/constants/reportStatus.ts
export const REPORT_STATUS = {
  // Draft/Initial states
  DRAFT: 'draft',
  
  // RM submission states
  SUBMITTED: 'submitted',
  PENDING_QS_REVIEW: 'pending_qs_review',
  
  // QS review states
  UNDER_REVIEW: 'under_review',
  SITE_VISIT_SCHEDULED: 'site_visit_scheduled',
  
  // Returned to RM states
  REWORK: 'rework',
  REVISION_REQUESTED: 'revision_requested',
  RETURNED: 'returned',
  
  // Final states
  APPROVED: 'approved',
  COMPLETED: 'completed',
  REJECTED: 'rejected',
} as const;

export type ReportStatus = typeof REPORT_STATUS[keyof typeof REPORT_STATUS];

// Status badge configuration - DISTINCT COLORS for each status
export const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string }> = {
  // Draft states
  [REPORT_STATUS.DRAFT]: { 
    label: 'Draft', 
    color: 'text-[#40534C]', 
    bgColor: 'bg-[#D6BD98]/20' 
  },
  
  // Pending/Submitted states
  [REPORT_STATUS.SUBMITTED]: { 
    label: 'QS Review', 
    color: 'text-[#1A3636]', 
    bgColor: 'bg-[#D6BD98]/30' 
  },
  [REPORT_STATUS.PENDING_QS_REVIEW]: { 
    label: 'QS Review', 
    color: 'text-[#1A3636]', 
    bgColor: 'bg-[#D6BD98]/30' 
  },
  
  // Under Review
  [REPORT_STATUS.UNDER_REVIEW]: { 
    label: 'Under Review', 
    color: 'text-[#40534C]', 
    bgColor: 'bg-[#D6BD98]/40' 
  },
  
  // Site Visit - DISTINCT COLOR (not orange like rework)
  [REPORT_STATUS.SITE_VISIT_SCHEDULED]: { 
    label: 'Site Visit Scheduled', 
    color: 'text-[#40534C]', 
    bgColor: 'bg-[#F0E2CC]'  // Solid accent color
  },
  
  // Rework states - ORANGE (keep existing)
  [REPORT_STATUS.REWORK]: { 
    label: 'Rework', 
    color: 'text-orange-700', 
    bgColor: 'bg-orange-100' 
  },
  [REPORT_STATUS.REVISION_REQUESTED]: { 
    label: 'Rework', 
    color: 'text-orange-700', 
    bgColor: 'bg-orange-100' 
  },
  [REPORT_STATUS.RETURNED]: { 
    label: 'Rework', 
    color: 'text-orange-700', 
    bgColor: 'bg-orange-100' 
  },
  
  // Approved states
  [REPORT_STATUS.APPROVED]: { 
    label: 'Approved', 
    color: 'text-white', 
    bgColor: 'bg-[#677D6A]' 
  },
  [REPORT_STATUS.COMPLETED]: { 
    label: 'Approved', 
    color: 'text-white', 
    bgColor: 'bg-[#677D6A]' 
  },
  
  // Rejected
  [REPORT_STATUS.REJECTED]: { 
    label: 'Rejected', 
    color: 'text-white', 
    bgColor: 'bg-[#1A3636]' 
  },
};

// Helper function to get status config with fallback
export const getStatusConfig = (status: string) => {
  const statusLower = status?.toLowerCase() || 'pending';
  return STATUS_CONFIG[statusLower] || { 
    label: status || 'Pending', 
    color: 'text-[#677D6A]', 
    bgColor: 'bg-[#677D6A]/10' 
  };
};