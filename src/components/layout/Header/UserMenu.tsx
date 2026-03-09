// src/components/layout/Header/UserMenu.tsx
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { FiUser, FiSettings, FiHelpCircle, FiLogOut, FiMail } from 'react-icons/fi'

export const UserMenu: React.FC = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const menuItems = [
    {
      label: 'Profile',
      icon: FiUser,
      onClick: () => navigate('/profile'),
    },
    {
      label: 'Settings',
      icon: FiSettings,
      onClick: () => navigate('/settings'),
    },
    {
      label: 'Help & Support',
      icon: FiHelpCircle,
      onClick: () => navigate('/help'),
    },
  ]

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user) return 'U'
    return `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase()
  }

  return (
    <div 
      className="w-64 py-2 bg-[#F5F7F4] rounded-xl shadow-lg border border-[#D6BD98]/20 overflow-hidden"
      style={{ fontFamily: 'Century Gothic, CenturyGothic, AppleGothic, sans-serif' }}
    >
      {/* User Info Header with Gradient */}
      <div className="bg-gradient-to-r from-[#1A3636] to-[#40534C] px-4 py-4">
        <div className="flex items-center gap-3">
          {/* Avatar with initials */}
          <div className="w-12 h-12 rounded-full bg-[#D6BD98] flex items-center justify-center flex-shrink-0">
            <span className="text-lg font-semibold text-[#1A3636]">
              {getUserInitials()}
            </span>
          </div>
          
          {/* User Details */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">
              {user ? `${user.firstName} ${user.lastName}` : 'User'}
            </p>
            <div className="flex items-center gap-1 mt-0.5 text-xs text-[#D6BD98]/90">
              <FiMail className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{user?.email}</span>
            </div>
          </div>
        </div>

        {/* Role Badge - Directly below with minimal spacing */}
        <div className="mt-3 flex items-center">
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-[#D6BD98] text-[#1A3636]">
            {user?.role?.toLowerCase() || 'RM'}
          </span>
        </div>
      </div>

      {/* Menu Items */}
      <div className="py-2">
        {menuItems.map((item, index) => {
          const Icon = item.icon
          return (
            <button
              key={index}
              onClick={item.onClick}
              className="w-full text-left px-4 py-3 text-sm text-[#40534C] hover:text-[#1A3636] hover:bg-[#D6BD98]/10 flex items-center gap-3 transition-colors duration-150 group"
            >
              <Icon className="w-4 h-4 text-[#677D6A] group-hover:text-[#40534C]" />
              <span>{item.label}</span>
            </button>
          )
        })}
      </div>

      {/* Logout Button with Separator */}
      <div className="border-t border-[#D6BD98]/20">
        <button
          onClick={logout}
          className="w-full text-left px-4 py-3 text-sm text-[#1A3636] hover:text-[#1A3636] hover:bg-[#D6BD98]/10 flex items-center gap-3 transition-colors duration-150 group"
        >
          <FiLogOut className="w-4 h-4 text-[#677D6A] group-hover:text-[#1A3636]" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  )
}