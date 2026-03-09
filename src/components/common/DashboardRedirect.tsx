// src/components/common/DashboardRedirect.tsx
import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { LoadingSpinner } from './LoadingSpinner'

export const DashboardRedirect: React.FC = () => {
    const navigate = useNavigate()
    const { user, isAuthenticated, isLoading } = useAuth()

    useEffect(() => {
        console.log('DashboardRedirect - Mounted at:', new Date().toISOString())
        console.log('DashboardRedirect - State:', { 
            isAuthenticated, 
            user,
            userRole: user?.role,
            isLoading,
            path: window.location.pathname 
        })

        // Wait for loading to complete
        if (isLoading) {
            console.log('DashboardRedirect: Still loading...')
            return
        }

        // Check authentication
        if (!isAuthenticated || !user) {
            console.log('DashboardRedirect: Not authenticated, redirecting to login')
            navigate('/login', { replace: true })
            return
        }

        const role = user.role?.toLowerCase()
        console.log('DashboardRedirect: Role detected:', role)
        
        if (!role) {
            console.log('DashboardRedirect: No role found, redirecting to login')
            navigate('/login', { replace: true })
            return
        }

        // Determine target path based on role
        let targetPath = ''
        if (role === 'admin') targetPath = '/admin'
        else if (role === 'qs') targetPath = '/qs'
        else if (role === 'rm') targetPath = '/rm'
        else targetPath = '/login'

        // Check if we're already on the correct page
        const currentPath = window.location.pathname
        if (currentPath === targetPath) {
            console.log('DashboardRedirect: Already on correct page:', currentPath)
            return
        }

        console.log('DashboardRedirect: Redirecting to:', targetPath)
        
        // Use navigate for client-side routing
        navigate(targetPath, { replace: true })
    }, [user, isAuthenticated, isLoading, navigate])

    return (
        <div className="flex h-screen items-center justify-center">
            <LoadingSpinner 
                size="lg" 
                label={isLoading ? "Loading user data..." : "Redirecting to your dashboard..."} 
            />
        </div>
    )
}

export default DashboardRedirect