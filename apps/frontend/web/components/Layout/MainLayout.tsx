import React, { useState } from 'react';
import { EnhancedSidebar } from '@/widgets/AppSidebar/EnhancedSidebar';
import { TopHeader } from './TopHeader';

interface MainLayoutProps {
  children: React.ReactNode;
  currentPath?: string;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children, currentPath = '/dashboard' }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const handleNavigate = (path: string) => {
    // Handle navigation - in a real app this would use React Router
    console.log('Navigating to:', path);
    window.location.hash = path;
  };

  const handleLogout = () => {
    // Handle logout logic
    console.log('Logging out...');
    window.location.href = '/login';
  };

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <EnhancedSidebar
        currentPath={currentPath}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <TopHeader />
        
        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};