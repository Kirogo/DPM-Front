//src/contexts/AuthContext.tsx
import React, { createContext, useContext } from 'react'
import { useAppSelector } from '@/store/hooks'
import { AuthState } from '@/types/auth.types'

interface AuthContextType extends AuthState { }

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const authState = useAppSelector((state) => state.auth)

    return (
        <AuthContext.Provider value={authState}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuthContext = () => {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuthContext must be used within an AuthProvider')
    }
    return context
}
