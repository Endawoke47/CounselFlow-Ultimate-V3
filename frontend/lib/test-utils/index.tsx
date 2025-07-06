/**
 * CounselFlow Ultimate V3 - Test Utilities
 * ========================================
 * 
 * Common test utilities and helpers for React component testing
 */

import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Mock providers for testing
const TestProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        refetchOnWindowFocus: false,
      },
    },
  })

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

// Custom render function that includes providers
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  return render(ui, {
    wrapper: TestProviders,
    ...options,
  })
}

// Mock user with various roles
export const mockUsers = {
  admin: {
    id: '1',
    email: 'admin@counselflow.com',
    firstName: 'Admin',
    lastName: 'User',
    role: 'ADMIN',
    status: 'ACTIVE',
  },
  legalCounsel: {
    id: '2',
    email: 'counsel@counselflow.com',
    firstName: 'Legal',
    lastName: 'Counsel',
    role: 'IN_HOUSE_COUNSEL',
    status: 'ACTIVE',
  },
  client: {
    id: '3',
    email: 'client@company.com',
    firstName: 'Client',
    lastName: 'User',
    role: 'CLIENT',
    status: 'ACTIVE',
  },
}

// Mock data
export const mockClients = [
  {
    id: '1',
    name: 'Acme Corporation',
    type: 'CORPORATE',
    status: 'ACTIVE',
    email: 'contact@acme.com',
    industry: 'Technology',
    revenue: 5000000,
    employeeCount: 250,
  },
  {
    id: '2',
    name: 'Startup Inc',
    type: 'STARTUP',
    status: 'PROSPECT',
    email: 'hello@startup.com',
    industry: 'FinTech',
    revenue: 1000000,
    employeeCount: 50,
  },
]

export const mockContracts = [
  {
    id: '1',
    title: 'Master Service Agreement',
    type: 'MSA',
    status: 'EXECUTED',
    clientId: '1',
    value: 250000,
    currency: 'USD',
    aiRiskScore: 0.3,
    riskLevel: 'MEDIUM',
    effectiveDate: '2024-01-01',
    expirationDate: '2025-01-01',
  },
  {
    id: '2',
    title: 'Software License Agreement',
    type: 'LICENSING',
    status: 'UNDER_REVIEW',
    clientId: '2',
    value: 100000,
    currency: 'USD',
    aiRiskScore: 0.7,
    riskLevel: 'HIGH',
    effectiveDate: '2024-02-01',
    expirationDate: '2024-12-31',
  },
]

export const mockMatters = [
  {
    id: '1',
    title: 'Contract Dispute Resolution',
    type: 'LITIGATION',
    status: 'ACTIVE',
    priority: 'HIGH',
    clientId: '1',
    budget: 500000,
    spentAmount: 125000,
    startDate: '2024-01-15',
    targetCloseDate: '2024-12-15',
  },
]

// Test utilities
export const createMockRouter = (overrides = {}) => ({
  route: '/',
  pathname: '/',
  query: {},
  asPath: '/',
  push: jest.fn(),
  replace: jest.fn(),
  reload: jest.fn(),
  back: jest.fn(),
  prefetch: jest.fn(),
  beforePopState: jest.fn(),
  events: {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
  },
  ...overrides,
})

// Wait for async operations in tests
export const waitForAsync = () => new Promise(resolve => setTimeout(resolve, 0))

// Common test assertions
export const expectElementToBeInDocument = (element: HTMLElement | null) => {
  expect(element).toBeInTheDocument()
}

export const expectElementNotToBeInDocument = (element: HTMLElement | null) => {
  expect(element).not.toBeInTheDocument()
}

export const expectElementToHaveText = (element: HTMLElement | null, text: string) => {
  expect(element).toHaveTextContent(text)
}

// Form testing utilities
export const fillForm = async (user: ReturnType<typeof userEvent.setup>, formData: Record<string, string>) => {
  for (const [fieldName, value] of Object.entries(formData)) {
    const field = document.querySelector(`[name="${fieldName}"]`) as HTMLInputElement
    if (field) {
      await user.clear(field)
      await user.type(field, value)
    }
  }
}

export const submitForm = async (user: ReturnType<typeof userEvent.setup>, formSelector = 'form') => {
  const form = document.querySelector(formSelector) as HTMLFormElement
  const submitButton = form?.querySelector('[type="submit"]') as HTMLButtonElement
  if (submitButton) {
    await user.click(submitButton)
  }
}

// API testing utilities
export const mockApiResponse = (data: any, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  json: () => Promise.resolve(data),
})

export const mockApiError = (status = 500, message = 'Server Error') => ({
  ok: false,
  status,
  json: () => Promise.resolve({ detail: message }),
})

// Table testing utilities
export const getTableRows = (container: HTMLElement) => {
  return container.querySelectorAll('tbody tr')
}

export const getTableHeaders = (container: HTMLElement) => {
  return container.querySelectorAll('thead th')
}

export const clickTableHeader = async (user: ReturnType<typeof userEvent.setup>, container: HTMLElement, headerText: string) => {
  const headers = getTableHeaders(container)
  const targetHeader = Array.from(headers).find(header => 
    header.textContent?.includes(headerText)
  )
  if (targetHeader) {
    await user.click(targetHeader)
  }
}

// Date utilities for testing
export const formatDateForInput = (date: Date) => {
  return date.toISOString().split('T')[0]
}

export const createDateInPast = (daysAgo: number) => {
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  return date
}

export const createDateInFuture = (daysFromNow: number) => {
  const date = new Date()
  date.setDate(date.getDate() + daysFromNow)
  return date
}

// Re-export everything from testing-library
export * from '@testing-library/react'
export { userEvent }

// Use custom render as default
export { customRender as render }