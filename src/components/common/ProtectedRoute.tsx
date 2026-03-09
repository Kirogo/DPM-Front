// src/components/common/ProtectedRoute.tsx
import React, { useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth()
  const location = useLocation()

  useEffect(() => {
    console.log('ProtectedRoute - Auth State:', { 
      isAuthenticated, 
      isLoading,
      userRole: user?.role,
      path: location.pathname 
    })
  }, [isAuthenticated, isLoading, user, location])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1A3636]"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    console.log('ProtectedRoute: Not authenticated, redirecting to login')
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}

export default ProtectedRoute