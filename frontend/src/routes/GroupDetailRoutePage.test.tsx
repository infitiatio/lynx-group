import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GroupDetailRoutePage } from './GroupDetailRoutePage'
import type { GroupDto } from '../shared/types/groups'

const mockUseGroup = vi.hoisted(() => vi.fn())

vi.mock('../features/groups/useGroup', () => ({
  useGroup: mockUseGroup,
}))

const ownerGroup: GroupDto = {
  id: 'group-1',
  ownerUserId: 'owner-1',
  title: 'Owner Group',
  description: 'Editable description',
  isPublished: false,
  shareToken: null,
  createdAt: '2026-05-20T10:00:00Z',
  updatedAt: '2026-05-21T10:00:00Z',
  isOwner: true,
}

const nonOwnerGroup: GroupDto = {
  ...ownerGroup,
  isOwner: false,
}

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/groups/group-1']}>
      <Routes>
        <Route path="/groups/:groupId" element={<GroupDetailRoutePage />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('GroupDetailRoutePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows editable form for owner and updates group with saving state', async () => {
    const user = userEvent.setup()
    let resolveUpdate: () => void = () => {}

    const updateGroup = vi.fn(
      () =>
        new Promise<GroupDto>((resolve) => {
          resolveUpdate = () => resolve(ownerGroup)
        }),
    )

    mockUseGroup.mockReturnValue({
      group: ownerGroup,
      isLoading: false,
      error: null,
      refreshGroup: vi.fn(),
      updateGroup,
    })

    renderPage()

    expect(mockUseGroup).toHaveBeenCalledWith('group-1')
    expect(screen.getByRole('heading', { name: 'Edit group' })).toBeInTheDocument()

    await user.clear(screen.getByLabelText('Title'))
    await user.type(screen.getByLabelText('Title'), '  Updated owner group  ')
    await user.clear(screen.getByLabelText('Description'))
    await user.type(screen.getByLabelText('Description'), '  Updated description  ')
    await user.click(screen.getByRole('button', { name: 'Save changes' }))

    expect(updateGroup).toHaveBeenCalledWith({
      title: 'Updated owner group',
      description: 'Updated description',
    })
    expect(screen.getByRole('button', { name: 'Saving...' })).toBeDisabled()

    resolveUpdate()

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Save changes' })).toBeEnabled()
    })
  })

  it('shows read-only state for non-owners', () => {
    mockUseGroup.mockReturnValue({
      group: nonOwnerGroup,
      isLoading: false,
      error: null,
      refreshGroup: vi.fn(),
      updateGroup: vi.fn(),
    })

    renderPage()

    expect(screen.getByRole('heading', { name: 'Read only' })).toBeInTheDocument()
    expect(screen.getByText('Only the owner can edit this group.')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Save changes' })).not.toBeInTheDocument()
  })

  it('shows submit error when owner update fails', async () => {
    const user = userEvent.setup()

    mockUseGroup.mockReturnValue({
      group: ownerGroup,
      isLoading: false,
      error: null,
      refreshGroup: vi.fn(),
      updateGroup: vi.fn().mockRejectedValueOnce(new Error('Unable to save group.')),
    })

    renderPage()

    await user.clear(screen.getByLabelText('Title'))
    await user.type(screen.getByLabelText('Title'), 'Updated owner group')
    await user.clear(screen.getByLabelText('Description'))
    await user.type(screen.getByLabelText('Description'), 'Updated description')
    await user.click(screen.getByRole('button', { name: 'Save changes' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Unable to save group.')
  })
})
