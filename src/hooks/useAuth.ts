// src/hooks/useAuth.ts
import { useCallback, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { login, logout, refreshToken, clearError } from '@/store/slices/authSlice'
import { LoginCredentials, RegisterDto, User } from '@/types/auth.types'
import { authApi } from '@/services/api/authApi'
import toast from 'react-hot-toast'

interface UseAuthReturn {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  permissions: string[];
  login: (credentials: LoginCredentials) => Promise<any>;
  logout: () => Promise<void>;
  register: (data: RegisterDto) => Promise<any>;
  updateProfile: (data: Partial<User>) => Promise<any>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>;
  hasPermission: (permission: string | string[]) => boolean;
  hasRole: (role: string | string[]) => boolean;
  clearError: () => void;
}

// Helper to decode JWT and check expiration
const getTokenExpiration = (token: string): Date | null => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    
    const { exp } = JSON.parse(jsonPayload);
    return exp ? new Date(exp * 1000) : null;
  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
};

export const useAuth = (): UseAuthReturn => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { user, token, isAuthenticated, isLoading, error, permissions } = useAppSelector(
    (state) => state.auth
  )
  
  const tokenCheckInterval = useRef<NodeJS.Timeout>()

  // Monitor token expiration
  useEffect(() => {
    if (!token || !isAuthenticated) {
      if (tokenCheckInterval.current) {
        clearInterval(tokenCheckInterval.current);
      }
      return;
    }

    // Check token expiration every minute
    tokenCheckInterval.current = setInterval(() => {
      const expiration = getTokenExpiration(token);
      
      if (expiration) {
        const now = new Date();
        const timeUntilExpiry = expiration.getTime() - now.getTime();
        const minutesUntilExpiry = Math.floor(timeUntilExpiry / 60000);
        
        console.log(`Token expires in ${minutesUntilExpiry} minutes at ${expiration.toLocaleString()}`);
        
        // If token expires in less than 5 minutes, try to refresh
        if (timeUntilExpiry < 5 * 60 * 1000 && timeUntilExpiry > 0) {
          console.log('Token expiring soon, attempting refresh...');
          dispatch(refreshToken());
        }
        
        // If token is expired, log out
        if (timeUntilExpiry <= 0) {
          console.log('Token expired, logging out...');
          toast.error('Your session has expired. Please log in again.');
          dispatch(logout());
          navigate('/login');
        }
      }
    }, 60000); // Check every minute

    return () => {
      if (tokenCheckInterval.current) {
        clearInterval(tokenCheckInterval.current);
      }
    };
  }, [token, isAuthenticated, dispatch, navigate]);

  useEffect(() => {
    // Check token expiration and refresh if needed
    const storedToken = localStorage.getItem('token')
    if (storedToken && !isAuthenticated && !isLoading) {
      const expiration = getTokenExpiration(storedToken);
      if (expiration && expiration > new Date()) {
        dispatch(refreshToken())
      } else {
        // Token is expired, clear storage
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
      }
    }
  }, [dispatch, isAuthenticated, isLoading])

const handleLogin = useCallback(
  async (credentials: LoginCredentials) => {
    try {
      console.log('🚀 Login attempt started')
      const result = await dispatch(login(credentials)).unwrap()
      console.log('✅ Login result:', result)
      console.log('👤 User object:', result.user)
      console.log('👤 User role:', result.user.role)
      
      // Log token expiration
      if (result.token) {
        const expiration = getTokenExpiration(result.token);
        if (expiration) {
          console.log(`🔑 Token expires at: ${expiration.toLocaleString()}`);
        }
      }
      
      toast.success('Login successful!')

      // Check if user and role exist
      if (!result.user) {
        console.error('❌ No user in login result')
        return result
      }

      return result
    } catch (error: any) {
      console.error('❌ Login error:', error)
      const errorMessage = typeof error === 'string' 
        ? error 
        : error?.message || error?.data?.message || 'Login failed'
      toast.error(errorMessage)
      throw error
    }
  },
  [dispatch]
)

const hasRole = useCallback(
  (role: string | string[]) => {
    if (!user) return false
    
    const userRole = user.role?.toLowerCase()
    console.log('Checking role:', { userRole, required: role })
    
    const requiredRoles = Array.isArray(role)
      ? role.map(r => r.toLowerCase())
      : [role.toLowerCase()]
    
    return requiredRoles.includes(userRole)
  },
  [user]
)

  const handleLogout = useCallback(async () => {
    try {
      await dispatch(logout()).unwrap()
      toast.success('Logged out successfully')
      navigate('/login', { replace: true })
    } catch (error: any) {
      console.error('Logout error:', error)
      // Still navigate to login even if API fails
      navigate('/login', { replace: true })
    }
  }, [dispatch, navigate])

  const handleRegister = useCallback(
    async (data: RegisterDto) => {
      try {
        const response = await authApi.register(data)
        toast.success('Registration successful! Please check your email to verify your account.')
        navigate('/login')
        return response.data
      } catch (error: any) {
        const errorMessage = error?.response?.data?.message || error?.message || 'Registration failed'
        toast.error(errorMessage)
        throw error
      }
    },
    [navigate]
  )

  const updateProfile = useCallback(
    async (data: Partial<User>) => {
      try {
        const response = await authApi.updateProfile(data)
        toast.success('Profile updated successfully')
        return response.data
      } catch (error: any) {
        const errorMessage = error?.response?.data?.message || error?.message || 'Failed to update profile'
        toast.error(errorMessage)
        throw error
      }
    },
    []
  )

  const changePassword = useCallback(
    async (oldPassword: string, newPassword: string) => {
      try {
        await authApi.changePassword(oldPassword, newPassword)
        toast.success('Password changed successfully')
      } catch (error: any) {
        const errorMessage = error?.response?.data?.message || error?.message || 'Failed to change password'
        toast.error(errorMessage)
        throw error
      }
    },
    []
  )

  const hasPermission = useCallback(
    (permission: string | string[]) => {
      if (!permissions) return false

      const requiredPermissions = Array.isArray(permission) ? permission : [permission]
      return requiredPermissions.every(p => permissions.includes(p))
    },
    [permissions]
  )

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    permissions,
    login: handleLogin,
    logout: handleLogout,
    register: handleRegister,
    updateProfile,
    changePassword,
    hasPermission,
    hasRole,
    clearError: () => dispatch(clearError()),
  }
}