import React, { useState } from 'react';
import { MainLayout } from './components/Layout/MainLayout';
import { LoginPage } from './pages/LoginPage/LoginPage';
import EnhancedDashboard from './pages/Dashboard/EnhancedDashboard';
import { SettingsPage } from './pages/Settings';
import { AIChatPage } from './pages/AIChat';
import { DocumentsPage } from './pages/Documents';
import { EnhancedMattersPage } from './pages/Matters';
import CompaniesListPage from './pages/Companies/CompaniesListPage';
import ActionsListPage from './pages/Actions/ActionsListPage';
import DisputesListPage from './pages/Disputes/DisputesListPage';
import './styles/globals.css';

type PageType = 'login' | 'dashboard' | 'matters' | 'contracts' | 'clients' | 'companies' | 
                'disputes' | 'risks' | 'ai' | 'documents' | 'calendar' | 'reports' | 
                'settings' | 'notifications' | 'help' | 'actions';

export const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageType>('login');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = async (credentials: { email: string; password: string; rememberMe: boolean }) => {
    // Simulate authentication
    console.log('Login attempt:', credentials);
    
    // In a real app, this would make an API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (credentials.email === 'demo@counselflow.com' && credentials.password === 'password123') {
      setIsAuthenticated(true);
      setCurrentPage('dashboard');
    } else {
      throw new Error('Invalid credentials');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentPage('login');
  };

  const handleNavigate = (path: string) => {
    // Simple router simulation
    const page = path.replace('/', '');
    if (page === '' || page === 'dashboard') {
      setCurrentPage('dashboard');
    } else {
      setCurrentPage(page as PageType);
    }
  };

  const renderPage = () => {
    if (!isAuthenticated) {
      return <LoginPage />;
    }

    switch (currentPage) {
      case 'dashboard':
        return <EnhancedDashboard />;
      case 'matters':
        return <EnhancedMattersPage />;
      case 'ai':
        return <AIChatPage />;
      case 'documents':
        return <DocumentsPage />;
      case 'settings':
        return <SettingsPage />;
      case 'contracts':
        return (
          <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Contracts</h1>
            <p>Contracts management page would be implemented here.</p>
          </div>
        );
      case 'clients':
        return (
          <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Clients</h1>
            <p>Clients management page would be implemented here.</p>
          </div>
        );
      case 'companies':
        return <CompaniesListPage />;
      case 'disputes':
        return <DisputesListPage />;
      case 'actions':
        return <ActionsListPage />;
      case 'risks':
        return (
          <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Risk Management</h1>
            <p>Risk management page would be implemented here.</p>
          </div>
        );
      case 'calendar':
        return (
          <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Calendar</h1>
            <p>Calendar page would be implemented here.</p>
          </div>
        );
      case 'reports':
        return (
          <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Reports & Analytics</h1>
            <p>Reports and analytics page would be implemented here.</p>
          </div>
        );
      case 'notifications':
        return (
          <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Notifications</h1>
            <p>Notifications page would be implemented here.</p>
          </div>
        );
      case 'help':
        return (
          <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Help & Support</h1>
            <p>Help and support page would be implemented here.</p>
          </div>
        );
      default:
        return <EnhancedDashboard />;
    }
  };

  if (!isAuthenticated) {
    return renderPage();
  }

  return (
    <MainLayout currentPath={`/${currentPage}`}>
      {renderPage()}
    </MainLayout>
  );
};