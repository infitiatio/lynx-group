import { render, screen } from '@testing-library/react'
import { RouterProvider, createMemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { appRoutes } from './appRouter'

// Hoisted so the factory can capture the reference
const mockUseAuth = vi.hoisted(() => vi.fn())

vi.mock('../shared/auth/useAuth', () => ({
  useAuth: mockUseAuth,
}))

// GoogleLogin is rendered on LoginRoutePage; stub it to avoid GoogleOAuthProvider dependency
vi.mock('@react-oauth/google', () => ({
  GoogleLogin: () => <button type="button">Sign in with Google</button>,
}))

describe('app route tree', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      currentUser: { id: 'u1', email: 'alice@example.com', displayName: 'Alice' },
      login: vi.fn(),
      logout: vi.fn(),
    })
  })

  it('redirects the root route to /groups when authenticated', async () => {
    const router = createMemoryRouter(appRoutes, {
      initialEntries: ['/'],
    })

    render(<RouterProvider router={router} />)

    expect(await screen.findByRole('heading', { name: 'My Groups' })).toBeInTheDocument()
  })

  it('renders the dynamic share route when authenticated', async () => {
    const router = createMemoryRouter(appRoutes, {
      initialEntries: ['/shared/token-123'],
    })

    render(<RouterProvider router={router} />)

    expect(await screen.findByText('shareToken: token-123')).toBeInTheDocument()
  })

  it('redirects unauthenticated user from a protected route to /login', async () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      currentUser: null,
      login: vi.fn(),
      logout: vi.fn(),
    })

    const router = createMemoryRouter(appRoutes, {
      initialEntries: ['/groups'],
    })

    render(<RouterProvider router={router} />)

    expect(await screen.findByRole('heading', { name: 'Sign in' })).toBeInTheDocument()
  })
})
