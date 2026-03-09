// src/components/layout/Sidebar/Sidebar.tsx
import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { toggleSidebar } from '@/store/slices/uiSlice'
import { useAuth } from '@/hooks/useAuth'
import {
  FiHome,
  FiList,
  FiClipboard,
  FiMapPin,
  FiUsers,
  FiUserPlus,
  FiBriefcase,
  FiSettings,
  FiShield,
  FiX,
  FiClock,
  FiCheckCircle,
  FiEdit,
  FiSend,
  FiFileText
} from 'react-icons/fi'

interface MenuItem {
  id: string
  label: string
  path: string
  icon: React.ElementType
  roles?: string[]
}

interface SidebarProps {
  isDesktop: boolean
}

export const Sidebar: React.FC<SidebarProps> = ({ isDesktop }) => {
  const dispatch = useAppDispatch()
  const location = useLocation()
  const navigate = useNavigate()
  const { user, hasRole } = useAuth()
  const { sidebarOpen } = useAppSelector((state) => state.ui)
  const [activeItem, setActiveItem] = useState<string>('')

  useEffect(() => {
    const path = location.pathname
    setActiveItem(path)
  }, [location.pathname])

  const handleMobileClose = () => {
    if (!isDesktop) {
      dispatch(toggleSidebar())
    }
  }

  const handleItemClick = (path: string) => {
    navigate(path)
    handleMobileClose()
  }

  const menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      path: '/dashboard',
      icon: FiHome,
    },
    {
      id: 'my-reports',
      label: 'My Reports',
      path: '/rm/reports',
      icon: FiList,
      roles: ['rm'],
    },
    {
      id: 'drafts',
      label: 'Drafts',
      path: '/rm/drafts',
      icon: FiEdit,
      roles: ['rm'],
    },
    {
      id: 'approved',
      label: 'Approved',
      path: '/rm/approved',
      icon: FiCheckCircle,
      roles: ['rm'],
    },
    {
      id: 'all-reports',
      label: 'All Reports',
      path: '/rm/all-reports',
      icon: FiFileText,
      roles: ['rm'],
    },
    {
      id: 'pending-reviews',
      label: 'Reports',
      path: '/qs/reviews',
      icon: FiClock,
      roles: ['qs'],
    },
    {
      id: 'site-visits',
      label: 'Site Visits',
      path: '/qs/site-visits',
      icon: FiMapPin,
      roles: ['qs'],
    },
    {
      id: 'users',
      label: 'Manage Users',
      path: '/admin/users',
      icon: FiUsers,
      roles: ['admin'],
    },
    {
      id: 'clients',
      label: 'Manage Clients',
      path: '/admin/clients',
      icon: FiUserPlus,
      roles: ['admin'],
    },
    {
      id: 'audit-logs',
      label: 'Audit Logs',
      path: '/admin/audit-logs',
      icon: FiBriefcase,
      roles: ['admin'],
    },
    {
      id: 'settings',
      label: 'System Settings',
      path: '/admin/settings',
      icon: FiSettings,
      roles: ['admin'],
    },
  ]

  const getVisibleMenuItems = () => {
    if (!user) return []
    return menuItems.filter(item => {
      if (!item.roles) return true
      return item.roles.some(role => hasRole(role))
    })
  }

  const isItemActive = (item: MenuItem): boolean => {
    if (item.id === 'dashboard') {
      return location.pathname === '/rm' ||
        location.pathname === '/qs' ||
        location.pathname === '/admin' ||
        location.pathname === '/dashboard'
    }
    return location.pathname === item.path
  }

  const visibleMenuItems = getVisibleMenuItems()

  const getSidebarClasses = () => {
    if (isDesktop) {
      return 'translate-x-0'
    }
    return sidebarOpen ? 'translate-x-0' : '-translate-x-full'
  }

  return (
    <>
      {!isDesktop && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={handleMobileClose}
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-50 w-56 bg-[#F5F7F4] border-r border-[#D6BD98]/20
        transition-transform duration-300 ease-in-out
        ${getSidebarClasses()}
        flex flex-col h-screen
      `}>
        <div className="flex items-center justify-between px-3 h-14 lg:h-16">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 bg-gradient-to-br from-[#1A3636] to-[#40534C] rounded-md flex items-center justify-center">
              <span className="text-[#D6BD98] font-bold text-sm">G</span>
            </div>
            <span className="text-[15px] font-semibold text-[#1A3636]">GeoBuild</span>
          </div>

          {!isDesktop && (
            <button
              onClick={handleMobileClose}
              className="p-1 rounded-md text-[#40534C] hover:bg-[#D6BD98]/10 transition-colors"
              aria-label="Close sidebar"
            >
              <FiX className="w-4 h-4" />
            </button>
          )}
        </div>

        <nav className="flex-1 px-2 py-3 overflow-y-auto scrollbar-thin scrollbar-thumb-[#D6BD98]/30 hover:scrollbar-thumb-[#D6BD98]/50">
          <div className="space-y-1">
            {visibleMenuItems.map((item) => {
              const Icon = item.icon
              const active = isItemActive(item)

              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item.path)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 text-[12px] font-medium rounded-lg
                    transition-all duration-200
                    ${active
                      ? 'bg-[#D6BD98] text-[#1A3636] font-semibold shadow-sm'
                      : 'text-[#40534C] hover:bg-[#D6BD98]/10 hover:text-[#1A3636]'
                    }
                  `}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-[#1A3636]' : 'text-[#677D6A]'}`} />
                  <span>{item.label}</span>
                  
                  {active && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#1A3636]"></span>
                  )}
                </button>
              )
            })}
          </div>
        </nav>

        <div className="px-3 py-3 border-t border-[#D6BD98]/20">
          <div className="text-[9px] text-[#677D6A]">
            <p className="font-medium text-[#1A3636] text-[10px]">GeoBuild v1.0.0</p>
            <p className="mt-0.5">© {new Date().getFullYear()} NCBA</p>
          </div>
        </div>
      </aside>
    </>
  )
}