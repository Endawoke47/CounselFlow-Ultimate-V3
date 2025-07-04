import React, { useState } from 'react';

// Simple working version first
export const SimpleApp: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPage, setCurrentPage] = useState('login');

  const LoginPage = () => (
    <div style={{ 
      height: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: '#f0f9ff'
    }}>
      <div style={{
        background: 'white',
        padding: '40px',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        width: '400px',
        textAlign: 'center'
      }}>
        <h1 style={{ 
          color: '#0d9488', 
          fontSize: '32px', 
          marginBottom: '20px',
          fontWeight: 'bold'
        }}>
          COUNSELFLOW ULTIMATE
        </h1>
        
        <div style={{ marginBottom: '20px' }}>
          <input
            type="email"
            placeholder="Email"
            defaultValue="demo@counselflow.com"
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              marginBottom: '10px',
              fontSize: '16px'
            }}
          />
          <input
            type="password"
            placeholder="Password"
            defaultValue="password123"
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '16px'
            }}
          />
        </div>
        
        <button
          onClick={() => setIsAuthenticated(true)}
          style={{
            width: '100%',
            padding: '12px',
            background: '#0d9488',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          Sign In
        </button>
        
        <div style={{
          marginTop: '20px',
          padding: '15px',
          background: '#f3f4f6',
          borderRadius: '6px',
          fontSize: '14px',
          color: '#374151'
        }}>
          <strong>Demo Credentials:</strong><br />
          Email: demo@counselflow.com<br />
          Password: password123
        </div>
      </div>
    </div>
  );

  const Dashboard = () => (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* Sidebar */}
      <div style={{
        width: '250px',
        background: '#1f2937',
        color: 'white',
        padding: '20px'
      }}>
        <h2 style={{ color: '#0d9488', marginBottom: '30px' }}>COUNSELFLOW</h2>
        
        <nav>
          {[
            'Dashboard',
            'Legal Matters',
            'Contracts', 
            'Clients',
            'AI Assistant',
            'Documents',
            'Settings'
          ].map(item => (
            <div
              key={item}
              onClick={() => setCurrentPage(item.toLowerCase())}
              style={{
                padding: '12px',
                cursor: 'pointer',
                borderRadius: '6px',
                marginBottom: '5px',
                background: currentPage === item.toLowerCase() ? '#0d9488' : 'transparent'
              }}
            >
              {item}
            </div>
          ))}
        </nav>
        
        <button
          onClick={() => setIsAuthenticated(false)}
          style={{
            position: 'absolute',
            bottom: '20px',
            left: '20px',
            right: '20px',
            padding: '10px',
            background: '#dc2626',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: '20px', background: '#f9fafb' }}>
        <h1 style={{ fontSize: '24px', marginBottom: '20px', color: '#1f2937' }}>
          {currentPage.charAt(0).toUpperCase() + currentPage.slice(1)}
        </h1>
        
        {currentPage === 'dashboard' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' }}>
              {[
                { title: 'Active Matters', value: '127', color: '#0d9488' },
                { title: 'Active Contracts', value: '45', color: '#2563eb' },
                { title: 'Pending Tasks', value: '23', color: '#f59e0b' },
                { title: 'Critical Risks', value: '5', color: '#dc2626' }
              ].map(stat => (
                <div key={stat.title} style={{
                  background: 'white',
                  padding: '20px',
                  borderRadius: '8px',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                }}>
                  <h3 style={{ fontSize: '14px', color: '#6b7280', marginBottom: '10px' }}>{stat.title}</h3>
                  <p style={{ fontSize: '32px', fontWeight: 'bold', color: stat.color, margin: 0 }}>{stat.value}</p>
                </div>
              ))}
            </div>
            
            <div style={{
              background: 'white',
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
            }}>
              <h3 style={{ marginBottom: '15px' }}>Welcome to CounselFlow Ultimate</h3>
              <p style={{ color: '#6b7280', lineHeight: '1.6' }}>
                This is your comprehensive legal management system. Navigate through the sidebar to access:
              </p>
              <ul style={{ marginTop: '10px', color: '#6b7280' }}>
                <li>Legal Matters Management</li>
                <li>Contract Lifecycle Management</li>
                <li>Client Relationship Management</li>
                <li>AI-Powered Legal Assistant</li>
                <li>Document Management System</li>
                <li>Advanced Analytics & Reporting</li>
              </ul>
            </div>
          </div>
        )}
        
        {currentPage === 'ai assistant' && (
          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            height: 'calc(100vh - 120px)'
          }}>
            <h3 style={{ marginBottom: '20px' }}>AI Legal Assistant</h3>
            <div style={{
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              height: '400px',
              padding: '15px',
              background: '#f9fafb',
              marginBottom: '15px',
              overflowY: 'auto'
            }}>
              <div style={{ marginBottom: '15px' }}>
                <div style={{
                  background: '#0d9488',
                  color: 'white',
                  padding: '10px',
                  borderRadius: '6px',
                  marginBottom: '10px',
                  maxWidth: '80%'
                }}>
                  Hello! I'm your AI Legal Assistant. I can help you with legal research, contract analysis, compliance questions, and more. How can I assist you today?
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                placeholder="Ask me anything about legal matters..."
                style={{
                  flex: 1,
                  padding: '10px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px'
                }}
              />
              <button style={{
                padding: '10px 20px',
                background: '#0d9488',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}>
                Send
              </button>
            </div>
          </div>
        )}
        
        {currentPage !== 'dashboard' && currentPage !== 'ai assistant' && (
          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            <p style={{ color: '#6b7280' }}>
              {currentPage.charAt(0).toUpperCase() + currentPage.slice(1)} module coming soon! 
              This is where you'll manage your {currentPage}.
            </p>
          </div>
        )}
      </div>
    </div>
  );

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return <Dashboard />;
};