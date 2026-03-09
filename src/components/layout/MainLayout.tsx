// src/components/layout/MainLayout.tsx
import React, { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Header } from './Header/Header'
import { Sidebar } from './Sidebar/Sidebar'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { setCurrentPageTitle } from '@/store/slices/uiSlice'
import { ReportCreateModal } from '../reports/ReportCreateModal'

// Map paths to page titles
const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/rm': 'Dashboard',
  '/rm/reports/create': 'New Report',
  '/rm/reports': 'My Reports',
    '/rm/all-reports': 'All Reports',
  '/rm/reports?status=draft': 'My Drafts',
  '/rm/reports?status=pending_qs_review': 'Submitted to QS',
  '/qs': 'Workspace',
  '/qs/reviews': 'Pending Reviews',
  '/qs/site-visits': 'Site Visits',
  '/admin': 'Dashboard',
  '/admin/users': 'Manage Users',
  '/admin/clients': 'Manage Clients',
  '/admin/audit-logs': 'Audit Logs',
  '/admin/settings': 'System Settings',
  '/profile': 'Profile',
  '/notifications': 'Notifications',
  '/settings': 'Settings'
}

export const MainLayout: React.FC = () => {
  const location = useLocation()
  const dispatch = useAppDispatch()
  const { sidebarOpen } = useAppSelector((state) => state.ui)
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024)

  // Handle resize events
  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Set page title based on current route
  useEffect(() => {
    const path = location.pathname
    const title = pageTitles[path] || 'Dashboard'
    dispatch(setCurrentPageTitle(title))
  }, [location.pathname, dispatch])

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  return (
    <div className="min-h-screen bg-[#F5F7F4] flex" style={{ fontFamily: 'Century Gothic, CenturyGothic, AppleGothic, sans-serif' }}>
      {/* Sidebar - fixed width */}
      <Sidebar isDesktop={isDesktop} />

      {/* Main Content */}
      <div className={`
        flex-1 flex flex-col min-h-screen
        transition-all duration-300 ease-in-out
        ${isDesktop ? 'lg:ml-60' : 'ml-0'}
      `}>
        <Header />
        
        {/* Main Content Area */}
        <main className="flex-1 w-full">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="border-t border-[#D6BD98]/20 py-3 px-4 sm:px-6 text-center text-xs text-[#677D6A] bg-[#F5F7F4] w-full">
          © {new Date().getFullYear()} GeoBuild. All rights reserved.
        </footer>
      </div>

      <ReportCreateModal />
    </div>
  )
}

export default MainLayout