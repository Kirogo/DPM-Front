// src/components/dashboard/StatsCards.tsx
import React from 'react'
import { useAuth } from '@/hooks/useAuth'

interface StatsCardsProps {
  stats: {
    totalReports: number
    pendingReviews: number
    approved: number
    revisions: number
  }
  role?: 'rm' | 'qs' // Optional prop to force role, otherwise uses auth
}

export const StatsCards: React.FC<StatsCardsProps> = ({ stats, role }) => {
  const { user } = useAuth()
  const userRole = role || user?.role || 'rm'
  const isQS = userRole === 'qs'

  // Different card configurations based on role
  const rmCards = [
    {
      title: 'My Reports',
      value: stats.totalReports,
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
      gradient: 'from-[#1A3636] to-[#40534C]',
      textColor: 'text-white',
      subtitle: 'Total submitted',
    },
    {
      title: 'QS Review',
      value: stats.pendingReviews,
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      gradient: 'from-[#40534C] to-[#677D6A]',
      textColor: 'text-white',
      subtitle: 'Awaiting review',
    },
    {
      title: 'Approved',
      value: stats.approved,
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      gradient: 'from-[#677D6A] to-[#95A89B]',
      textColor: 'text-white',
      subtitle: 'Completed',
    },
    {
      title: 'Rework',
      value: stats.revisions,
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
      ),
      gradient: 'from-[#D6BD98] to-[#E3D0B2]',
      textColor: 'text-[#1A3636]',
      subtitle: 'Changes needed',
    },
  ]

  const qsCards = [
    {
      title: 'Total Reports',
      value: stats.totalReports,
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
      ),
      gradient: 'from-[#1A3636] to-[#40534C]',
      textColor: 'text-white',
      subtitle: 'In system',
    },
    {
      title: 'Pending Review',
      value: stats.pendingReviews,
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      gradient: 'from-[#40534C] to-[#677D6A]',
      textColor: 'text-white',
      subtitle: 'Ready for review',
    },
    {
      title: 'In Progress',
      value: stats.revisions, // Reports sent back for rework
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
      ),
      gradient: 'from-[#D6BD98] to-[#E3D0B2]',
      textColor: 'text-[#1A3636]',
      subtitle: 'Rework in progress',
    },
    {
      title: 'Completed',
      value: stats.approved,
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      gradient: 'from-[#677D6A] to-[#95A89B]',
      textColor: 'text-white',
      subtitle: 'Approved',
    },
  ]

  const cards = isQS ? qsCards : rmCards

  return (
    <>
      {cards.map((card, index) => (
        <div
          key={index}
          className={`bg-gradient-to-br ${card.gradient} rounded-lg p-3 shadow-sm hover:shadow-md transition-all duration-200 relative overflow-hidden group flex-1 sm:flex-none min-w-[120px]`}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className={`text-[8px] font-medium ${card.title === 'In Progress' || card.title === 'Rework' ? 'text-[#40534C]' : 'text-white/70'}`}>
                {card.title}
              </p>
              <p className={`text-base lg:text-lg font-bold mt-0.5 ${card.textColor}`}>
                {card.value}
              </p>
            </div>
            <div className={`${card.title === 'In Progress' || card.title === 'Rework' ? 'text-[#1A3636]' : 'text-white/90'}`}>
              {card.icon}
            </div>
          </div>

          <div className="flex items-center gap-1 mt-1">
            <span className={`text-[7px] font-normal ${card.title === 'In Progress' || card.title === 'Rework' ? 'text-[#40534C]/80' : 'text-white/70'}`}>
              {card.subtitle}
            </span>
          </div>

          {/* Decorative blur effect */}
          <div className="absolute top-0 right-0 w-10 h-10 bg-white/5 rounded-full blur-xl -mr-3 -mt-3 group-hover:scale-110 transition-transform duration-500"></div>
        </div>
      ))}
    </>
  )
}