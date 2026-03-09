// src/components/dashboard/QuickActions.tsx
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '@/components/common/Card'

interface QuickAction {
  title: string
  description: string
  icon: React.ReactNode
  path: string
  color: string
}

export const QuickActions: React.FC = () => {
  const navigate = useNavigate()

  const actions: QuickAction[] = [
    {
      title: 'New Report',
      description: 'Create a site visit report',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
      ),
      path: '/rm/new-report?newCallReport=1',
      color: 'text-[#1A3636]',
    },
    {
      title: 'My Reports',
      description: 'View all your reports',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
      ),
      path: '/rm/reports',
      color: 'text-[#40534C]',
    },
    {
      title: 'Clients',
      description: 'Manage your clients',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
      path: '/rm/clients',
      color: 'text-[#677D6A]',
    },
    {
      title: 'Calendar',
      description: 'Schedule site visits',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      ),
      path: '/rm/calendar',
      color: 'text-[#D6BD98]',
    },
  ]

  return (
    <>
      {actions.map((action, index) => (
        <Card
          key={index}
          className="cursor-pointer hover:shadow-md transition-all hover:-translate-y-0.5 border border-[#D6BD98]/20"
          onClick={() => navigate(action.path)}
        >
          <div className="flex items-start space-x-3 p-2">
            <div className={`${action.color} bg-[#D6BD98]/10 p-2 rounded-lg`}>
              {action.icon}
            </div>
            <div>
              <h3 className="text-xs font-medium text-[#1A3636]">{action.title}</h3>
              <p className="text-[9px] text-[#677D6A] mt-0.5">{action.description}</p>
            </div>
          </div>
        </Card>
      ))}
    </>
  )
}