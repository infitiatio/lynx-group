import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GroupsRoutePage } from './GroupsRoutePage'
import type { GroupDto } from '../shared/types/groups'

const mockUseGroups = vi.hoisted(() => vi.fn())

vi.mock('../features/groups/useGroups', () => ({
  useGroups: mockUseGroups,
}))

const sampleGroup: GroupDto = {
  id: 'group-1',
  ownerUserId: 'owner-1',
  title: 'Engineering Team',
  description: 'Shared links for engineering discussions.',
  isPublished: false,
  shareToken: null,
  createdAt: '2026-05-22T10:00:00Z',
  updatedAt: '2026-05-22T12:00:00Z',
  isOwner: true,
}

function renderPage() {
  return render(
    <MemoryRouter>
      <GroupsRoutePage />
    </MemoryRouter>,
  )
}

describe('GroupsRoutePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders loading state while groups are loading', () => {
    mockUseGroups.mockReturnValue({
      groups: [],
      isLoading: true,
      error: null,
      refreshGroups: vi.fn(),
      createGroup: vi.fn(),
    })

    renderPage()

    expect(screen.getByRole('heading', { name: 'My Groups' })).toBeInTheDocument()
    expect(screen.getByText('Loading groups...')).toBeInTheDocument()
  })

  it('renders empty state when no groups are returned', () => {
    mockUseGroups.mockReturnValue({
      groups: [],
      isLoading: false,
      error: null,
      refreshGroups: vi.fn(),
      createGroup: vi.fn(),
    })

    renderPage()

    expect(screen.getByText('You have not created any groups yet.')).toBeInTheDocument()
  })

  it('renders groups when data load succeeds', () => {
    mockUseGroups.mockReturnValue({
      groups: [sampleGroup],
      isLoading: false,
      error: null,
      refreshGroups: vi.fn(),
      createGroup: vi.fn(),
    })

    renderPage()

    expect(screen.getByRole('link', { name: 'Engineering Team' })).toBeInTheDocument()
    expect(screen.getByText('Owned')).toBeInTheDocument()
    expect(screen.getByText('Draft')).toBeInTheDocument()
  })

  it('renders API error state and retries on user action', async () => {
    const refreshGroups = vi.fn().mockResolvedValue(undefined)
    const user = userEvent.setup()

    mockUseGroups.mockReturnValue({
      groups: [],
      isLoading: false,
      error: 'Unable to load groups.',
      refreshGroups,
      createGroup: vi.fn(),
    })

    renderPage()

    expect(screen.getByRole('alert')).toHaveTextContent('Unable to load groups.')
    await user.click(screen.getByRole('button', { name: 'Try again' }))

    expect(refreshGroups).toHaveBeenCalledTimes(1)
  })
})
