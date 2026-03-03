import React, { useEffect, useState, createContext, useContext } from 'react'
import { authApi } from '../api/endpoints'
import type { User } from '../types/api'
interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (token: string, user: User) => void
  logout: () => void
  updateUser: (user: User) => void
}
const AuthContext = createContext<AuthContextType | undefined>(undefined)
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token')
      if (token) {
        try {
          const userData = await authApi.me()
          setUser(userData)
        } catch (error) {
          console.error('Failed to fetch user', error)
          localStorage.removeItem('token')
        }
      }
      setIsLoading(false)
    }
    initAuth()
  }, [])
  const login = (token: string, userData: User) => {
    localStorage.setItem('token', token)
    setUser(userData)
  }
  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
    window.location.href = '/login'
  }
  const updateUser = (userData: User) => {
    setUser(userData)
  }
  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
