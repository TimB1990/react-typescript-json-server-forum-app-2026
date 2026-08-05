import React, { createContext, useContext, useEffect, useState } from 'react'
import type { User } from '../common/types/users'
import type { AuthContextType } from '../common/types/auth'

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const checkAuthStatus = async () => {
            try {
                const response = await fetch('http://localhost:5001/me', {
                    credentials: 'include'
                })

                if (response.ok) {
                    const data = await response.json();
                    setUser(data.user)
                } else {
                    setUser(null)
                }

            } catch (err) {
                console.error('Failed to verify session:', err);
                setUser(null);
            }
            finally {
                setLoading(false); // App ready
            }
        }

        checkAuthStatus()
    }, [])

    const logout = async () => {
        await fetch('http://localhost:5001/logout', {
            method: 'POST',
            credentials: 'include',
        })
        setUser(null)
    }

    return (
        <AuthContext.Provider value={{user, loading, setUser, logout}}>
            {children}
        </AuthContext.Provider>
    )
}

// Custom hook for accessing auth state anywhere
export const useAuth = () => {
    const context = useContext(AuthContext)
    if(!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
}
