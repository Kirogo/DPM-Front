// src/components/layout/Header/Header.tsx
import React, { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { toggleSidebar } from '@/store/slices/uiSlice'
import { useAuth } from '@/hooks/useAuth'
import { useNotifications } from '@/hooks/useNotifications'
import { useLocation } from 'react-router-dom'
import { Dropdown } from '@/components/common/Dropdown'
import { UserMenu } from './UserMenu'
import { FiMenu, FiBell, FiChevronDown } from 'react-icons/fi'

// Page title mapping based on routes - UPDATED to include new pages
const pageTitles: Record<string, string> = {
  // Dashboard
  '/dashboard': 'Dashboard',
  '/rm': 'Dashboard',
  '/qs': 'Workspace',
  '/admin': 'Admin Dashboard',
  
  // NEW: Tabbed Reports Page
  '/rm/reports': 'My Reports',
  
  // NEW: Drafts and Approved Pages
  '/rm/drafts': 'Draft Reports',
  '/rm/approved': 'Approved Reports',
  
  // RM Checklist Routes
  '/rm/checklists': 'Call Reports',
  '/rm/checklists?newCallReport=1': 'New Report',
  '/rm/checklists?status=draft': 'Draft Reports',
  '/rm/checklists?status=submitted': 'Submitted Reports',
  '/rm/all-reports': 'All Reports',
  
  // Legacy Report Routes
  '/rm/reports?status=draft': 'Draft Reports',
  '/rm/reports?status=pending_qs_review': 'Submitted Reports',
  '/rm/reports/create': 'Create Report',
  
  // QS Routes
  '/qs/reviews': 'Review Reports',
  '/qs/site-visits': 'Site Visits',
  
  // Admin Routes
  '/admin/users': 'Manage Users',
  '/admin/clients': 'Manage Clients',
  '/admin/audit-logs': 'Audit Logs',
  '/admin/settings': 'System Settings',
  
  // Shared Routes
  '/profile': 'Profile',
  '/settings': 'Settings',
  '/notifications': 'Notifications',
}

export const Header: React.FC = () => {
  const dispatch = useAppDispatch()
  const location = useLocation()
  const { user } = useAuth()
  const { unreadCount, toggleNotifications } = useNotifications()
  const { currentPageTitle: storeTitle } = useAppSelector((state) => state.ui)
  const [pageTitle, setPageTitle] = useState<string>('')

  // Update page title based on current route
  useEffect(() => {
    const path = location.pathname
    const search = location.search
    const fullPath = `${path}${search}`
    
    console.log('Current route:', fullPath) // Debug log
    
    // Check exact match with query params first
    if (pageTitles[fullPath]) {
      setPageTitle(pageTitles[fullPath])
    } 
    // Then check path only
    else if (pageTitles[path]) {
      setPageTitle(pageTitles[path])
    }
    // Handle role-specific dashboards
    else if (path === '/rm') {
      setPageTitle('Dashboard')
    }
    else if (path === '/qs') {
      setPageTitle('Workspace')
    }
    else if (path === '/admin') {
      setPageTitle('Admin Dashboard')
    }
    // Fallback to store title or default
    else {
      setPageTitle(storeTitle || 'Dashboard')
    }
  }, [location.pathname, location.search, storeTitle])

  const handleToggleSidebar = () => {
    dispatch(toggleSidebar())
  }

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user) return 'U'
    return `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase()
  }

  return (
    <header className="bg-[#F5F7F4] border-b border-[#D6BD98]/20 sticky top-0 z-30 shadow-sm">
      <div className="flex items-center justify-between h-14 lg:h-16">
        {/* Left section - No spacer, just the menu button and title */}
        <div className="flex items-center flex-1">
          {/* Mobile Menu Toggle - Only visible on mobile */}
          <button
            onClick={handleToggleSidebar}
            className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg text-[#40534C] hover:bg-[#D6BD98]/10 hover:text-[#1A3636] focus:outline-none focus:ring-2 focus:ring-[#677D6A] ml-4 transition-all duration-200"
            aria-label="Toggle sidebar"
          >
            <FiMenu className="w-4 h-4" />
          </button>

          {/* Page Title - No decorative element to keep it clean */}
          <h1 className="text-[15px] sm:text-[17px] lg:text-[19px] font-bold text-[#1A3636] tracking-tight ml-4 lg:ml-6">
            {pageTitle}
          </h1>
        </div>

        {/* Right section - Notifications & User Menu */}
        <div className="flex items-center gap-1 sm:gap-2 mr-4 lg:mr-6">
          {/* Notifications */}
          <button
            onClick={toggleNotifications}
            className="relative w-9 h-9 flex items-center justify-center rounded-lg text-[#40534C] hover:text-[#1A3636] hover:bg-[#D6BD98]/10 focus:outline-none focus:ring-2 focus:ring-[#677D6A] transition-all duration-200 group"
            aria-label="Notifications"
          >
            <FiBell className="w-4 h-4 group-hover:scale-110 transition-transform" />
            
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex min-w-[18px] h-[18px] px-1 items-center justify-center rounded-full bg-gradient-to-r from-[#1A3636] to-[#40534C] text-white text-[10px] font-medium ring-2 ring-[#F5F7F4] animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* User Menu Dropdown */}
          <Dropdown
            trigger={
              <button className="flex items-center gap-1.5 sm:gap-2 focus:outline-none group p-1 pr-1.5 sm:pr-2 rounded-lg hover:bg-[#D6BD98]/10 transition-all duration-200 border border-transparent hover:border-[#D6BD98]/20">
                {/* Avatar with gradient */}
                <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg bg-gradient-to-br from-[#1A3636] to-[#40534C] flex items-center justify-center shadow-sm group-hover:shadow-md transition-all group-hover:scale-105">
                  <span className="text-[11px] sm:text-[13px] font-semibold text-white">
                    {getUserInitials()}
                  </span>
                </div>
                
                {/* User info - hidden on mobile, visible on tablet/desktop */}
                <div className="hidden md:block text-left">
                  <p className="text-[11px] font-semibold text-[#1A3636]">
                    {user ? `${user.firstName} ${user.lastName}` : 'User'}
                  </p>
                  <p className="text-[9px] text-[#677D6A] flex items-center gap-1">
                    <span className="inline-block w-1 h-1 rounded-full bg-[#677D6A]"></span>
                    {user?.role?.toLowerCase() || 'RM'}
                  </p>
                </div>
                
                {/* Chevron icon with animation */}
                <FiChevronDown className="w-3 h-3 sm:w-4 sm:h-4 text-[#677D6A] group-hover:text-[#40534C] group-hover:rotate-180 transition-all duration-300" />
              </button>
            }
            placement="bottom-right"
          >
            <UserMenu />
          </Dropdown>
        </div>
      </div>
    </header>
  )
}