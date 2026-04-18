const TOKEN_KEY = 'lynxgroup.jwt'

export const tokenStorage = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY)
  },

  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token)
  },

  clearToken(): void {
    localStorage.removeItem(TOKEN_KEY)
  },
}
