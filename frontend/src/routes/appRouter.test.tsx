import { render, screen } from '@testing-library/react'
import { RouterProvider, createMemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { appRoutes } from './appRouter'

describe('app route tree', () => {
  it('redirects the root route to /groups', async () => {
    const router = createMemoryRouter(appRoutes, {
      initialEntries: ['/'],
    })

    render(<RouterProvider router={router} />)

    expect(await screen.findByRole('heading', { name: 'My Groups' })).toBeInTheDocument()
  })

  it('renders the dynamic share route', async () => {
    const router = createMemoryRouter(appRoutes, {
      initialEntries: ['/shared/token-123'],
    })

    render(<RouterProvider router={router} />)

    expect(await screen.findByText('shareToken: token-123')).toBeInTheDocument()
  })
})
