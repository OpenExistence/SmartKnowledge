// Tests pour StatusBadge - vérifie la gestion des variants
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StatusBadge } from '../components/status-badge'

describe('StatusBadge', () => {
  it('renders recorded status correctly', () => {
    render(<StatusBadge variant="recorded" label="Recorded" />)
    expect(screen.getByText('Recorded')).toBeInTheDocument()
  })

  it('renders transcribed status correctly', () => {
    render(<StatusBadge variant="transcribed" label="Transcribed" />)
    expect(screen.getByText('Transcribed')).toBeInTheDocument()
  })

  it('renders indexed status correctly', () => {
    render(<StatusBadge variant="indexed" label="Indexed" />)
    expect(screen.getByText('Indexed')).toBeInTheDocument()
  })

  it('renders pending status correctly', () => {
    render(<StatusBadge variant="pending" label="Pending" />)
    expect(screen.getByText('Pending')).toBeInTheDocument()
  })

  it('renders error status correctly', () => {
    render(<StatusBadge variant="error" label="Error" />)
    expect(screen.getByText('Error')).toBeInTheDocument()
  })
})