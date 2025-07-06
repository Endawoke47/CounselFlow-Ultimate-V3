/**
 * CounselFlow Ultimate V3 - Test Server Setup
 * ===========================================
 * 
 * Mock Service Worker (MSW) setup for API mocking in tests
 */

import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'

// Mock API handlers
const handlers = [
  // Auth endpoints
  http.post('/api/v1/auth/login', () => {
    return HttpResponse.json({
      access_token: 'mock_access_token',
      refresh_token: 'mock_refresh_token',
      token_type: 'bearer',
      user: {
        id: '1',
        email: 'test@counselflow.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'IN_HOUSE_COUNSEL',
        status: 'ACTIVE'
      }
    })
  }),

  http.get('/api/v1/auth/me', () => {
    return HttpResponse.json({
      id: '1',
      email: 'test@counselflow.com',
      firstName: 'Test',
      lastName: 'User',
      role: 'IN_HOUSE_COUNSEL',
      status: 'ACTIVE'
    })
  }),

  // Clients endpoints
  http.get('/api/v1/clients', () => {
    return HttpResponse.json({
      items: [
        {
          id: '1',
          name: 'Test Corporation',
          type: 'CORPORATE',
          status: 'ACTIVE',
          email: 'contact@testcorp.com',
          industry: 'Technology',
          revenue: 5000000,
          employeeCount: 250
        },
        {
          id: '2',
          name: 'Startup Inc',
          type: 'STARTUP',
          status: 'PROSPECT',
          email: 'hello@startup.com',
          industry: 'FinTech',
          revenue: 1000000,
          employeeCount: 50
        }
      ],
      total: 2,
      page: 1,
      size: 20,
      pages: 1
    })
  }),

  http.get('/api/v1/clients/:id', ({ params }) => {
    const { id } = params
    return HttpResponse.json({
      id,
      name: 'Test Corporation',
      type: 'CORPORATE',
      status: 'ACTIVE',
      email: 'contact@testcorp.com',
      industry: 'Technology',
      revenue: 5000000,
      employeeCount: 250
    })
  }),

  http.post('/api/v1/clients', () => {
    return HttpResponse.json({
      id: '3',
      name: 'New Client',
      type: 'CORPORATE',
      status: 'ACTIVE',
      email: 'new@client.com',
      industry: 'Technology',
      revenue: 2000000,
      employeeCount: 100
    }, { status: 201 })
  }),

  // Contracts endpoints
  http.get('/api/v1/contracts', () => {
    return HttpResponse.json({
      items: [
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
          expirationDate: '2025-01-01'
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
          expirationDate: '2024-12-31'
        }
      ],
      total: 2,
      page: 1,
      size: 20,
      pages: 1
    })
  }),

  // Matters endpoints
  http.get('/api/v1/matters', () => {
    return HttpResponse.json({
      items: [
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
          targetCloseDate: '2024-12-15'
        }
      ],
      total: 1,
      page: 1,
      size: 20,
      pages: 1
    })
  }),

  // AI endpoints
  http.post('/api/v1/ai/contracts/:id/analyze', () => {
    return HttpResponse.json({
      risk_score: 0.65,
      risk_level: 'MEDIUM',
      summary: 'Contract analysis shows moderate risk with standard terms',
      key_risks: ['Liability limitations', 'Termination clauses'],
      recommendations: ['Review liability caps', 'Clarify termination procedures'],
      confidence: 0.92
    })
  }),

  http.post('/api/v1/ai/generate-document', () => {
    return HttpResponse.json({
      content: 'MUTUAL NON-DISCLOSURE AGREEMENT\n\nThis Agreement is entered into...',
      clauses_included: ['confidentiality', 'return_of_materials', 'term'],
      suggestions: ['Consider adding specific penalties clause'],
      confidence: 0.88
    })
  }),

  // Error handlers for testing error states
  http.get('/api/v1/error/500', () => {
    return new HttpResponse(null, { status: 500 })
  }),

  http.get('/api/v1/error/401', () => {
    return new HttpResponse(null, { status: 401 })
  }),

  http.get('/api/v1/error/403', () => {
    return new HttpResponse(null, { status: 403 })
  }),

  http.get('/api/v1/error/404', () => {
    return new HttpResponse(null, { status: 404 })
  }),
]

// Setup server
export const server = setupServer(...handlers)