/**
 * CounselFlow Ultimate V3 - Global Search Component Tests
 * ======================================================
 */

import { render, screen, userEvent, waitFor } from '@/lib/test-utils'
import { GlobalSearch } from '../global-search'
import { server } from '@/lib/test-utils/server'
import { http, HttpResponse } from 'msw'

describe('GlobalSearch Component', () => {
  it('renders search input', () => {
    render(<GlobalSearch onResultSelect={jest.fn()} />)
    
    const searchInput = screen.getByPlaceholderText(/search clients, matters, contracts/i)
    expect(searchInput).toBeInTheDocument()
  })

  it('shows search icon', () => {
    render(<GlobalSearch onResultSelect={jest.fn()} />)
    
    const searchIcon = screen.getByRole('button')
    expect(searchIcon).toBeInTheDocument()
  })

  it('handles user input', async () => {
    const user = userEvent.setup()
    render(<GlobalSearch onResultSelect={jest.fn()} />)
    
    const searchInput = screen.getByPlaceholderText(/search clients, matters, contracts/i)
    await user.type(searchInput, 'test query')
    
    expect(searchInput).toHaveValue('test query')
  })

  it('performs search and shows results', async () => {
    const user = userEvent.setup()
    const mockOnResultSelect = jest.fn()
    
    // Mock search API response
    server.use(
      http.get('/api/v1/search', () => {
        return HttpResponse.json({
          clients: [
            { id: '1', name: 'Test Client', type: 'client' }
          ],
          contracts: [
            { id: '2', title: 'Test Contract', type: 'contract' }
          ],
          matters: []
        })
      })
    )
    
    render(<GlobalSearch onResultSelect={mockOnResultSelect} />)
    
    const searchInput = screen.getByPlaceholderText(/search clients, matters, contracts/i)
    await user.type(searchInput, 'test')
    
    await waitFor(() => {
      expect(screen.getByText('Test Client')).toBeInTheDocument()
      expect(screen.getByText('Test Contract')).toBeInTheDocument()
    })
  })

  it('handles result selection', async () => {
    const user = userEvent.setup()
    const mockOnResultSelect = jest.fn()
    
    server.use(
      http.get('/api/v1/search', () => {
        return HttpResponse.json({
          clients: [
            { id: '1', name: 'Test Client', type: 'client' }
          ],
          contracts: [],
          matters: []
        })
      })
    )
    
    render(<GlobalSearch onResultSelect={mockOnResultSelect} />)
    
    const searchInput = screen.getByPlaceholderText(/search clients, matters, contracts/i)
    await user.type(searchInput, 'test')
    
    await waitFor(() => {
      const clientResult = screen.getByText('Test Client')
      expect(clientResult).toBeInTheDocument()
    })
    
    const clientResult = screen.getByText('Test Client')
    await user.click(clientResult)
    
    expect(mockOnResultSelect).toHaveBeenCalledWith({
      id: '1',
      name: 'Test Client',
      type: 'client'
    })
  })

  it('shows no results message when search returns empty', async () => {
    const user = userEvent.setup()
    
    server.use(
      http.get('/api/v1/search', () => {
        return HttpResponse.json({
          clients: [],
          contracts: [],
          matters: []
        })
      })
    )
    
    render(<GlobalSearch onResultSelect={jest.fn()} />)
    
    const searchInput = screen.getByPlaceholderText(/search clients, matters, contracts/i)
    await user.type(searchInput, 'nonexistent')
    
    await waitFor(() => {
      expect(screen.getByText(/no results found/i)).toBeInTheDocument()
    })
  })

  it('handles search errors gracefully', async () => {
    const user = userEvent.setup()
    
    server.use(
      http.get('/api/v1/search', () => {
        return new HttpResponse(null, { status: 500 })
      })
    )
    
    render(<GlobalSearch onResultSelect={jest.fn()} />)
    
    const searchInput = screen.getByPlaceholderText(/search clients, matters, contracts/i)
    await user.type(searchInput, 'error')
    
    await waitFor(() => {
      expect(screen.getByText(/search failed/i)).toBeInTheDocument()
    })
  })

  it('clears results when input is cleared', async () => {
    const user = userEvent.setup()
    
    server.use(
      http.get('/api/v1/search', () => {
        return HttpResponse.json({
          clients: [
            { id: '1', name: 'Test Client', type: 'client' }
          ],
          contracts: [],
          matters: []
        })
      })
    )
    
    render(<GlobalSearch onResultSelect={jest.fn()} />)
    
    const searchInput = screen.getByPlaceholderText(/search clients, matters, contracts/i)
    await user.type(searchInput, 'test')
    
    await waitFor(() => {
      expect(screen.getByText('Test Client')).toBeInTheDocument()
    })
    
    await user.clear(searchInput)
    
    await waitFor(() => {
      expect(screen.queryByText('Test Client')).not.toBeInTheDocument()
    })
  })

  it('debounces search requests', async () => {
    const user = userEvent.setup()
    const searchSpy = jest.fn()
    
    server.use(
      http.get('/api/v1/search', () => {
        searchSpy()
        return HttpResponse.json({
          clients: [],
          contracts: [],
          matters: []
        })
      })
    )
    
    render(<GlobalSearch onResultSelect={jest.fn()} />)
    
    const searchInput = screen.getByPlaceholderText(/search clients, matters, contracts/i)
    
    // Type quickly
    await user.type(searchInput, 'a')
    await user.type(searchInput, 'b')
    await user.type(searchInput, 'c')
    
    // Should debounce and only make one request
    await waitFor(() => {
      expect(searchSpy).toHaveBeenCalledTimes(1)
    })
  })

  it('applies custom placeholder', () => {
    render(
      <GlobalSearch 
        onResultSelect={jest.fn()} 
        placeholder="Custom search placeholder" 
      />
    )
    
    const searchInput = screen.getByPlaceholderText('Custom search placeholder')
    expect(searchInput).toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(
      <GlobalSearch 
        onResultSelect={jest.fn()} 
        className="custom-search-class" 
      />
    )
    
    const searchContainer = screen.getByRole('combobox').closest('div')
    expect(searchContainer).toHaveClass('custom-search-class')
  })
})