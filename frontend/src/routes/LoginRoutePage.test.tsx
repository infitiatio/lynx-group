import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { LoginRoutePage } from './LoginRoutePage'

// Hoisted mock refs so factory functions can capture them
const mockLogin = vi.hoisted(() => vi.fn())
const mockNavigate = vi.hoisted(() => vi.fn())

vi.mock('@react-oauth/google', () => ({
  GoogleLogin: ({
    onSuccess,
    onError,
  }: {
    onSuccess: (response: { credential: string }) => void
    onError: () => void
  }) => (
    <div>
      <button type="button" onClick={() => onSuccess({ credential: 'test-id-token' })}>
        Sign in with Google
      </button>
      <button type="button" onClick={() => onError()}>
        Simulate Google Error
      </button>
    </div>
  ),
}))

vi.mock('../shared/auth/useAuth', () => ({
  useAuth: () => ({
    isAuthenticated: false,
    currentUser: null,
    login: mockLogin,
    logout: vi.fn(),
  }),
}))

vi.mock('react-router-dom', async (importOriginal) => {
  const original = await importOriginal<typeof import('react-router-dom')>()
  return {
    ...original,
    useNavigate: () => mockNavigate,
  }
})

function renderLoginPage() {
  return render(
    <MemoryRouter>
      <LoginRoutePage />
    </MemoryRouter>,
  )
}

describe('LoginRoutePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the sign-in heading and Google login button', () => {
    renderLoginPage()

    expect(screen.getByRole('heading', { name: 'Sign in' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sign in with Google' })).toBeInTheDocument()
  })

  it('calls login with the credential and navigates to /groups on success', async () => {
    mockLogin.mockResolvedValueOnce(undefined)
    const user = userEvent.setup()

    renderLoginPage()

    await user.click(screen.getByRole('button', { name: 'Sign in with Google' }))

    expect(mockLogin).toHaveBeenCalledWith('test-id-token')
    expect(mockNavigate).toHaveBeenCalledWith('/groups', { replace: true })
  })

  it('shows a user-facing error and does not navigate when login throws', async () => {
    mockLogin.mockRejectedValueOnce(new Error('Authentication failed'))
    const user = userEvent.setup()

    renderLoginPage()

    await user.click(screen.getByRole('button', { name: 'Sign in with Google' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Authentication failed')
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('shows an error when Google reports a sign-in error', async () => {
    const user = userEvent.setup()

    renderLoginPage()

    await user.click(screen.getByRole('button', { name: 'Simulate Google Error' }))

    expect(screen.getByRole('alert')).toHaveTextContent('Google sign-in failed')
  })
})
