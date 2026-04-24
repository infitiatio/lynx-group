import { act, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { httpClient } from '../api/httpClient'
import { AuthProvider } from './AuthContext'
import { useAuth } from './useAuth'

vi.mock('../api/httpClient', () => ({
  httpClient: {
    postAsync: vi.fn(),
  },
}))

const mockPostAsync = vi.mocked(httpClient.postAsync)

function wrapper({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>
}

describe('useAuth', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
    // Prevent navigation side effects in tests
    Object.defineProperty(window, 'location', {
      value: { href: '' },
      writable: true,
      configurable: true,
    })
  })

  it('starts unauthenticated when localStorage is empty', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })

    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.currentUser).toBeNull()
  })

  it('restores authenticated session from localStorage on mount', () => {
    localStorage.setItem('lynxgroup.jwt', 'existing-token')
    localStorage.setItem(
      'lynxgroup.user',
      JSON.stringify({ id: 'u1', email: 'alice@example.com', displayName: 'Alice' }),
    )

    const { result } = renderHook(() => useAuth(), { wrapper })

    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.currentUser).toEqual({
      id: 'u1',
      email: 'alice@example.com',
      displayName: 'Alice',
    })
  })

  it('does not restore session when token is absent even if user data exists', () => {
    localStorage.setItem(
      'lynxgroup.user',
      JSON.stringify({ id: 'u1', email: 'alice@example.com', displayName: 'Alice' }),
    )

    const { result } = renderHook(() => useAuth(), { wrapper })

    expect(result.current.isAuthenticated).toBe(false)
  })

  it('stores token and user and sets authenticated state after successful login', async () => {
    mockPostAsync.mockResolvedValueOnce({
      ok: true,
      status: 200,
      data: {
        token: 'jwt-token',
        user: { id: 'u1', email: 'alice@example.com', displayName: 'Alice' },
      },
    })

    const { result } = renderHook(() => useAuth(), { wrapper })

    await act(async () => {
      await result.current.login('google-id-token')
    })

    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.currentUser).toEqual({
      id: 'u1',
      email: 'alice@example.com',
      displayName: 'Alice',
    })
    expect(localStorage.getItem('lynxgroup.jwt')).toBe('jwt-token')
    expect(localStorage.getItem('lynxgroup.user')).toBe(
      JSON.stringify({ id: 'u1', email: 'alice@example.com', displayName: 'Alice' }),
    )
  })

  it('throws and stays unauthenticated when login API returns an error', async () => {
    mockPostAsync.mockResolvedValueOnce({
      ok: false,
      status: 401,
      error: { title: 'Unauthorized', status: 401 },
    })

    const { result } = renderHook(() => useAuth(), { wrapper })

    await expect(
      act(async () => {
        await result.current.login('bad-token')
      }),
    ).rejects.toThrow('Unauthorized')

    expect(result.current.isAuthenticated).toBe(false)
  })

  it('clears token, user, and authenticated state on logout', () => {
    localStorage.setItem('lynxgroup.jwt', 'existing-token')
    localStorage.setItem(
      'lynxgroup.user',
      JSON.stringify({ id: 'u1', email: 'alice@example.com', displayName: 'Alice' }),
    )

    const { result } = renderHook(() => useAuth(), { wrapper })

    act(() => {
      result.current.logout()
    })

    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.currentUser).toBeNull()
    expect(localStorage.getItem('lynxgroup.jwt')).toBeNull()
    expect(localStorage.getItem('lynxgroup.user')).toBeNull()
  })
})
