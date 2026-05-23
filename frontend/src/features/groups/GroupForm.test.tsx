import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { GroupForm } from './GroupForm'

describe('GroupForm', () => {
  it('shows required field validation and blocks submit when fields are empty', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockResolvedValue(undefined)

    render(<GroupForm submitLabel="Create group" onSubmit={onSubmit} />)

    await user.click(screen.getByRole('button', { name: 'Create group' }))

    expect(screen.getByText('Title is required.')).toBeInTheDocument()
    expect(screen.getByText('Description is required.')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('submits trimmed values and shows saving state while submit is in progress', async () => {
    const user = userEvent.setup()
    let resolveSubmit: () => void = () => {}

    const onSubmit = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveSubmit = resolve
        }),
    )

    render(<GroupForm submitLabel="Create group" onSubmit={onSubmit} />)

    await user.type(screen.getByLabelText('Title'), '  Team Group  ')
    await user.type(screen.getByLabelText('Description'), '  Group description  ')
    await user.click(screen.getByRole('button', { name: 'Create group' }))

    expect(onSubmit).toHaveBeenCalledWith({
      title: 'Team Group',
      description: 'Group description',
    })
    expect(screen.getByRole('button', { name: 'Saving...' })).toBeDisabled()

    resolveSubmit()

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Create group' })).toBeEnabled()
    })
  })

  it('shows submit error and keeps form editable when submit fails', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockRejectedValueOnce(new Error('Unable to save group.'))

    render(
      <GroupForm
        submitLabel="Save changes"
        initialValues={{ title: 'Original title', description: 'Original description' }}
        onSubmit={onSubmit}
      />,
    )

    await user.clear(screen.getByLabelText('Title'))
    await user.type(screen.getByLabelText('Title'), 'Updated title')
    await user.clear(screen.getByLabelText('Description'))
    await user.type(screen.getByLabelText('Description'), 'Updated description')
    await user.click(screen.getByRole('button', { name: 'Save changes' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Unable to save group.')
    expect(screen.getByRole('button', { name: 'Save changes' })).toBeEnabled()
  })
})
