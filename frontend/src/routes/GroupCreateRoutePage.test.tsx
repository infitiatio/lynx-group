import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GroupCreateRoutePage } from './GroupCreateRoutePage'
import type { GroupDto } from '../shared/types/groups'

const mockCreateGroup = vi.hoisted(() => vi.fn())
const mockNavigate = vi.hoisted(() => vi.fn())

vi.mock('../features/groups/useGroups', () => ({
  useGroups: () => ({
    groups: [],
    isLoading: false,
    error: null,
    refreshGroups: vi.fn(),
    createGroup: mockCreateGroup,
  }),
}))

vi.mock('react-router-dom', async (importOriginal) => {
  const original = await importOriginal<typeof import('react-router-dom')>()
  return {
    ...original,
    useNavigate: () => mockNavigate,
  }
})

const createdGroup: GroupDto = {
  id: 'group-new-1',
  ownerUserId: 'owner-1',
  title: 'New Group',
  description: 'Description',
  isPublished: false,
  shareToken: null,
  createdAt: '2026-05-23T08:00:00Z',
  updatedAt: '2026-05-23T08:00:00Z',
  isOwner: true,
}

describe('GroupCreateRoutePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('submits valid form data and navigates to the new group detail page', async () => {
    const user = userEvent.setup()
    mockCreateGroup.mockResolvedValueOnce(createdGroup)

    render(<GroupCreateRoutePage />)

    await user.type(screen.getByLabelText('Title'), '  New Group  ')
    await user.type(screen.getByLabelText('Description'), '  Description  ')
    await user.click(screen.getByRole('button', { name: 'Create group' }))

    expect(mockCreateGroup).toHaveBeenCalledWith({
      title: 'New Group',
      description: 'Description',
    })
    expect(mockNavigate).toHaveBeenCalledWith('/groups/group-new-1')
  })

  it('shows a user-facing error and stays on the page when create fails', async () => {
    const user = userEvent.setup()
    mockCreateGroup.mockRejectedValueOnce(new Error('Unable to create group.'))

    render(<GroupCreateRoutePage />)

    await user.type(screen.getByLabelText('Title'), 'My Group')
    await user.type(screen.getByLabelText('Description'), 'Group description')
    await user.click(screen.getByRole('button', { name: 'Create group' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Unable to create group.')
    expect(mockNavigate).not.toHaveBeenCalled()
  })
})
