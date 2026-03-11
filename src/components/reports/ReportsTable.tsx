// src/components/reports/ReportsTable.tsx
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { SiteVisitReport } from '@/types/report.types'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { formatNairobiDate } from '@/utils/dateUtils'; // This will now work

interface ReportsTableProps {
    reports: SiteVisitReport[]
}

// Function to check if a report should be read-only
const isReadOnlyStatus = (status: string): boolean => {
  const lowerStatus = status?.toLowerCase()
  return lowerStatus === 'submitted' || 
         lowerStatus === 'approved' || 
         lowerStatus === 'pending_qs_review' || 
         lowerStatus === 'pendingqsreview' ||
         lowerStatus === 'completed'
}

// Status badge component for reports table
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
    <span className={`${config.bgColor} ${config.color} px-2 py-1 rounded-full text-[10px] font-medium`}>
      {config.label}
    </span>
  )
}

export const ReportsTable: React.FC<ReportsTableProps> = ({ reports }) => {
    const navigate = useNavigate()
    const isMobile = useMediaQuery('(max-width: 768px)')

    const handleRowClick = (reportId: string, status: string) => {
        // Log for debugging
        console.log('ReportsTable navigating to report:', { reportId, status })
        
        // Check if status is read-only (submitted/QS Review or approved)
        if (isReadOnlyStatus(status)) {
            navigate(`/rm/reports/${reportId}/view`)
        } else {
            navigate(`/rm/checklists/${reportId}`)
        }
    }

    if (isMobile) {
        return (
            <div className="divide-y divide-[#D6BD98]/10 bg-white rounded-lg border border-[#D6BD98]/20">
                {reports.length === 0 ? (
                    <div className="p-8 text-center text-[#677D6A]">
                        No reports found
                    </div>
                ) : (
                    reports.map((report) => (
                        <div
                            key={report.id}
                            onClick={() => handleRowClick(report.id, report.status || 'pending')}
                            className="p-3 hover:bg-[#D6BD98]/5 transition-colors cursor-pointer active:bg-[#D6BD98]/10"
                        >
                            <div className="flex items-center justify-between text-[11px]">
                                <span className="font-medium text-[#1A3636] truncate max-w-[70px]">
                                    {report.reportNo || 'CRN-'}
                                </span>
                                <span className="text-[#40534C] truncate max-w-[80px]">
                                    {report.customerName || report.clientName || '—'}
                                </span>
                                <StatusBadge status={report.status || 'pending'} />
                                <span className="text-[8px] text-[#677D6A] whitespace-nowrap">
                                    {formatCompactNairobiDateTime(report.updatedAt || report.createdAt)}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        )
    }

    // Desktop view
    return (
        <div className="border border-[#D6BD98]/20 rounded-lg overflow-hidden bg-white">
            <table className="w-full">
                <thead className="bg-[#F5F7F4]">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#40534C] uppercase tracking-wider">Report No.</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#40534C] uppercase tracking-wider">Customer</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#40534C] uppercase tracking-wider">Project</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#40534C] uppercase tracking-wider">Updated</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[#40534C] uppercase tracking-wider">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-[#D6BD98]/10">
                    {reports.length === 0 ? (
                        <tr>
                            <td colSpan={5} className="px-6 py-8 text-center text-[#677D6A]">
                                No reports found
                            </td>
                        </tr>
                    ) : (
                        reports.map((report) => (
                            <tr
                                key={report.id}
                                onClick={() => handleRowClick(report.id, report.status || 'pending')}
                                className="hover:bg-[#D6BD98]/5 transition-colors cursor-pointer"
                            >
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#1A3636]">
                                    {report.reportNo || '—'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-[#40534C]">
                                    {report.customerName || report.clientName || '—'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-[#40534C]">
                                    {report.projectName || (report.client?.projectName) || '—'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-[#677D6A]">
                                    {formatNairobiDate(report.updatedAt || report.createdAt)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <StatusBadge status={report.status || 'pending'} />
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    )
}