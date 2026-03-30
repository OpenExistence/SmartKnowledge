// Tests pour l'upload de fichiers dans InterviewsPage
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router'
import { Interviews } from '../pages/interviews'

// Mock API
vi.mock('../services/api', () => ({
  api: {
    getEntretiens: vi.fn().mockResolvedValue([
      { id: 1, expert_nom: "John Doe", expert_fonction: "Engineer", domaine: "IT", statut: "transcribed", created_at: "2026-03-22" },
      { id: 2, expert_nom: "Jane Smith", expert_fonction: "Manager", domaine: "Sales", statut: "indexed", created_at: "2026-03-21" },
    ]),
    deleteEntretien: vi.fn().mockResolvedValue(undefined),
  },
}))

// Mock fetch
global.fetch = vi.fn()

describe('Interviews - File Upload', () => {
  beforeEach(() => {
    localStorage.getItem.mockReturnValue('fake-token')
    vi.clearAllMocks()
  })

  it('renders interviews list', async () => {
    render(
      <BrowserRouter>
        <Interviews />
      </BrowserRouter>
    )
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })
  })

  it('opens new interview modal', async () => {
    render(
      <BrowserRouter>
        <Interviews />
      </BrowserRouter>
    )
    
    // Click new interview button
    const newButton = screen.getByText(/New Interview/i)
    fireEvent.click(newButton)
    
    // Modal should open with form
    await waitFor(() => {
      expect(screen.getByText('Expert Name *')).toBeInTheDocument()
    })
  })

  it('shows text file upload option', async () => {
    render(
      <BrowserRouter>
        <Interviews />
      </BrowserRouter>
    )
    
    // Open modal
    fireEvent.click(screen.getByText(/New Interview/i))
    
    await waitFor(() => {
      expect(screen.getByText('Text File')).toBeInTheDocument()
      expect(screen.getByText('Audio')).toBeInTheDocument()
    })
  })

  it('switches between text and audio upload', async () => {
    render(
      <BrowserRouter>
        <Interviews />
      </BrowserRouter>
    )
    
    // Open modal
    fireEvent.click(screen.getByText(/New Interview/i))
    
    await waitFor(() => {
      // Click audio button
      fireEvent.click(screen.getByText('Audio'))
    })
    
    // Should show audio upload UI
    await waitFor(() => {
      expect(screen.getByText(/\.mp3, \.wav/)).toBeInTheDocument()
    })
  })

  it('validates required expert name', async () => {
    // Mock fetch to return error
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: "expert_nom is required" })
    })

    render(
      <BrowserRouter>
        <Interviews />
      </BrowserRouter>
    )
    
    // Open modal
    fireEvent.click(screen.getByText(/New Interview/i))
    
    await waitFor(() => {
      // Try to submit without expert name
      fireEvent.submit(screen.getByText('Create').closest('form')!)
    })
    
    // Error should be shown
    await waitFor(() => {
      expect(screen.getByText("Expert name is required")).toBeInTheDocument()
    })
  })
})