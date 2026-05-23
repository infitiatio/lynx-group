import { render, screen } from '@testing-library/react'
import { RouterProvider, createMemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { appRoutes } from './appRouter'
import type { GroupDto } from '../shared/types/groups'

// Hoisted so the factory can capture the reference
const mockUseAuth = vi.hoisted(() => vi.fn())
const mockGetAsync = vi.hoisted(() => vi.fn())

const sampleGroup: GroupDto = {
  id: 'group-1',
  ownerUserId: 'u1',
  title: 'Team Notes',
  description: 'Shared workspace for the product team.',
  isPublished: false,
  shareToken: null,
  createdAt: '2026-05-22T10:00:00Z',
  updatedAt: '2026-05-22T10:00:00Z',
  isOwner: true,
}

vi.mock('../shared/auth/useAuth', () => ({
  useAuth: mockUseAuth,
}))

vi.mock('../shared/api', () => ({
  httpClient: {
    getAsync: mockGetAsync,
    postAsync: vi.fn(),
    putAsync: vi.fn(),
    deleteAsync: vi.fn(),
  },
}))

// GoogleLogin is rendered on LoginRoutePage; stub it to avoid GoogleOAuthProvider dependency
vi.mock('@react-oauth/google', () => ({
  GoogleLogin: () => <button type="button">Sign in with Google</button>,
}))

describe('app route tree', () => {
  beforeEach(() => {
    mockGetAsync.mockResolvedValue({
      ok: true,
      status: 200,
      data: [sampleGroup],
    })

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

  it('renders the group create route when authenticated', async () => {
    const router = createMemoryRouter(appRoutes, {
      initialEntries: ['/groups/new'],
    })

    render(<RouterProvider router={router} />)

    expect(await screen.findByRole('heading', { name: 'Create Group' })).toBeInTheDocument()
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
