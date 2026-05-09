import { createContext, useCallback, useMemo, useState, type ReactNode } from 'react'
import { httpClient } from '../api/httpClient'
import type { AuthContextValue, CurrentUser } from '../types/auth'
import { tokenStorage } from './tokenStorage'

// eslint-disable-next-line react-refresh/only-export-components -- context is intentionally exported alongside AuthProvider
export const AuthContext = createContext<AuthContextValue | null>(null)

interface AuthProviderProps {
  children: ReactNode
}

interface GoogleCallbackResponse {
  token: string
  user: {
    id: string
    email: string
    displayName: string
  }
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(() => {
    if (!tokenStorage.getToken()) return null
    return tokenStorage.getUser()
  })

  const login = useCallback(async (idToken: string): Promise<void> => {
    const result = await httpClient.postAsync<GoogleCallbackResponse>('/api/auth/google-callback', { idToken })
    if (!result.ok) {
      throw new Error(result.error.title ?? 'Authentication failed')
    }
    const user: CurrentUser = {
      id: result.data.user.id,
      email: result.data.user.email,
      displayName: result.data.user.displayName,
    }
    tokenStorage.setToken(result.data.token)
    tokenStorage.setUser(user)
    setCurrentUser(user)
  }, [])

  const logout = useCallback((): void => {
    tokenStorage.clearToken()
    tokenStorage.clearUser()
    setCurrentUser(null)
    window.location.href = '/login'
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      currentUser,
      isAuthenticated: currentUser !== null,
      login,
      logout,
    }),
    [currentUser, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
