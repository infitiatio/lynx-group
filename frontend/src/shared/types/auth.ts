export interface CurrentUser {
  id: string
  email: string
  displayName: string
}

export interface AuthContextValue {
  currentUser: CurrentUser | null
  isAuthenticated: boolean
  login: (idToken: string) => Promise<void>
  logout: () => void
}
