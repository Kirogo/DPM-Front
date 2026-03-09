// src/components/dashboard/ActivityFeed.tsx
import React from 'react'
import { formatDistanceToNow } from 'date-fns'
import { 
  FiPlusCircle, 
  FiCheckCircle, 
  FiXCircle, 
  FiMessageCircle,
  FiSend,
  FiClock,
  FiRefreshCw
} from 'react-icons/fi'

interface Activity {
  id: string
  type: 'report_created' | 'report_submitted' | 'report_approved' | 'report_rejected' | 'report_rewind' | 'comment_added'
  user: string
  target: string
  timestamp: Date
}

// Mock data - replace with real data from API
const mockActivities: Activity[] = [
  {
    id: '1',
    type: 'report_created',
    user: 'John Doe',
    target: 'Site Visit - Project Alpha',
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
  },
  {
    id: '2',
    type: 'report_submitted',
    user: 'Jane Smith',
    target: 'Foundation Inspection',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
  },
  {
    id: '3',
    type: 'report_approved',
    user: 'Mike Johnson',
    target: 'Structural Assessment',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
  },
  {
    id: '4',
    type: 'report_rewind',
    user: 'QS User',
    target: 'Electrical Works Review',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8), // 8 hours ago
  },
  {
    id: '5',
    type: 'comment_added',
    user: 'Sarah Wilson',
    target: 'Material Quality Check',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
  },
]

const activityIcons = {
  report_created: (
    <div className="w-6 h-6 rounded-full bg-[#677D6A]/10 flex items-center justify-center">
      <FiPlusCircle className="w-3 h-3 text-[#677D6A]" />
    </div>
  ),
  report_submitted: (
    <div className="w-6 h-6 rounded-full bg-[#D6BD98]/20 flex items-center justify-center">
      <FiSend className="w-3 h-3 text-[#D6BD98]" />
    </div>
  ),
  report_approved: (
    <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
      <FiCheckCircle className="w-3 h-3 text-emerald-600" />
    </div>
  ),
  report_rejected: (
    <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center">
      <FiXCircle className="w-3 h-3 text-red-600" />
    </div>
  ),
  report_rewind: (
    <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center">
      <FiRefreshCw className="w-3 h-3 text-amber-600" />
    </div>
  ),
  comment_added: (
    <div className="w-6 h-6 rounded-full bg-[#40534C]/10 flex items-center justify-center">
      <FiMessageCircle className="w-3 h-3 text-[#40534C]" />
    </div>
  ),
}

const activityText = {
  report_created: 'created a new report',
  report_submitted: 'submitted a report',
  report_approved: 'approved',
  report_rejected: 'rejected',
  report_rewind: 'requested rework for',
  comment_added: 'commented on',
}

// Loading skeleton
const ActivitySkeleton = () => (
  <div className="animate-pulse">
    <div className="flex items-start space-x-2">
      <div className="w-6 h-6 rounded-full bg-[#D6BD98]/20"></div>
      <div className="flex-1 space-y-1">
        <div className="h-3 bg-[#D6BD98]/20 rounded w-3/4"></div>
        <div className="h-2 bg-[#D6BD98]/20 rounded w-1/2"></div>
      </div>
    </div>
  </div>
)

interface ActivityFeedProps {
  isLoading?: boolean
  limit?: number
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ 
  isLoading = false, 
  limit = 5 
}) => {
  const displayedActivities = mockActivities.slice(0, limit)

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <ActivitySkeleton key={i} />
        ))}
      </div>
    )
  }

  if (displayedActivities.length === 0) {
    return (
      <div className="text-center py-4">
        <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-[#D6BD98]/10 flex items-center justify-center">
          <FiClock className="w-5 h-5 text-[#677D6A]" />
        </div>
        <p className="text-xs text-[#40534C]">No recent activity</p>
      </div>
    )
  }

  return (
    <div className="flow-root">
      <ul className="-mb-2">
        {displayedActivities.map((activity, index) => (
          <li key={activity.id}>
            <div className="relative pb-3">
              {index < displayedActivities.length - 1 && (
                <span
                  className="absolute top-3 left-3 -ml-px h-full w-0.5 bg-[#D6BD98]/20"
                  aria-hidden="true"
                />
              )}
              <div className="relative flex items-start space-x-2">
                <div className="flex-shrink-0">
                  {activityIcons[activity.type]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-[#40534C] leading-tight">
                    <span className="font-medium text-[#1A3636]">{activity.user}</span>{' '}
                    {activityText[activity.type]}{' '}
                    <span className="font-medium text-[#1A3636]">{activity.target}</span>
                  </p>
                  <p className="mt-0.5 text-[8px] text-[#677D6A]">
                    {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                  </p>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}