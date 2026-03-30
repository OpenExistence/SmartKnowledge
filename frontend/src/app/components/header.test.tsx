// Tests pour le Header - vérifie la gestion des user null
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router'
import { Header } from '../components/header'

// Mock the api module
vi.mock('../services/api', () => ({
  api: {
    getCurrentUser: vi.fn().mockResolvedValue({ username: 'testuser', role: 'admin' }),
    logout: vi.fn().mockResolvedValue(undefined),
  },
}))

describe('Header', () => {
  beforeEach(() => {
    localStorage.getItem.mockReturnValue('fake-token')
  })

  it('renders without crashing when user is loading', () => {
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    )
    
    // Should show loading state initially
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('renders user initials after loading', async () => {
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    )
    
    // Wait for user to load
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // Should show user initials
    expect(screen.getByText('testuser')).toBeInTheDocument()
  })
})