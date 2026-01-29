import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ThemeProvider, useTheme } from '~/components/ui/theme-provider'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      store = {}
    }),
  }
})()

Object.defineProperty(window, 'localStorage', { value: localStorageMock })

// Mock matchMedia
const matchMediaMock = vi.fn((query: string) => ({
  matches: query === '(prefers-color-scheme: dark)',
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
}))

Object.defineProperty(window, 'matchMedia', { value: matchMediaMock })

// Test component that uses the theme context
function TestConsumer() {
  const { theme, resolvedTheme, setTheme } = useTheme()
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <span data-testid="resolved">{resolvedTheme}</span>
      <button onClick={() => setTheme('dark')}>Set Dark</button>
      <button onClick={() => setTheme('light')}>Set Light</button>
      <button onClick={() => setTheme('system')}>Set System</button>
    </div>
  )
}

describe('ThemeProvider', () => {
  beforeEach(() => {
    localStorageMock.clear()
    document.documentElement.classList.remove('light', 'dark')
    vi.clearAllMocks()
  })

  afterEach(() => {
    document.documentElement.classList.remove('light', 'dark')
  })

  it('defaults to system theme', async () => {
    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('theme')).toHaveTextContent('system')
    })
  })

  it('loads theme from localStorage', async () => {
    localStorageMock.getItem.mockReturnValueOnce('dark')

    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('theme')).toHaveTextContent('dark')
    })
  })

  it('allows setting theme to dark', async () => {
    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('theme')).toHaveTextContent('system')
    })

    fireEvent.click(screen.getByText('Set Dark'))

    await waitFor(() => {
      expect(screen.getByTestId('theme')).toHaveTextContent('dark')
      expect(screen.getByTestId('resolved')).toHaveTextContent('dark')
    })
  })

  it('allows setting theme to light', async () => {
    localStorageMock.getItem.mockReturnValueOnce('dark')

    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('theme')).toHaveTextContent('dark')
    })

    fireEvent.click(screen.getByText('Set Light'))

    await waitFor(() => {
      expect(screen.getByTestId('theme')).toHaveTextContent('light')
      expect(screen.getByTestId('resolved')).toHaveTextContent('light')
    })
  })

  it('saves theme to localStorage when changed', async () => {
    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    )

    await waitFor(() => {
      expect(screen.getByTestId('theme')).toHaveTextContent('system')
    })

    fireEvent.click(screen.getByText('Set Dark'))

    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith('spoonjoy-theme', 'dark')
    })
  })

  it('applies dark class to document when theme is dark', async () => {
    localStorageMock.getItem.mockReturnValueOnce('dark')

    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    )

    await waitFor(() => {
      expect(document.documentElement.classList.contains('dark')).toBe(true)
    })
  })

  it('applies light class to document when theme is light', async () => {
    localStorageMock.getItem.mockReturnValueOnce('light')

    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    )

    await waitFor(() => {
      expect(document.documentElement.classList.contains('light')).toBe(true)
    })
  })

  it('throws error when useTheme is used outside provider', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    expect(() => {
      render(<TestConsumer />)
    }).toThrow('useTheme must be used within a ThemeProvider')

    consoleError.mockRestore()
  })
})
