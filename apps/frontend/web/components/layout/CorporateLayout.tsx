import React, { useState, useEffect } from 'react';
import CorporateSidebar from './CorporateSidebar';
import CorporateHeader from './CorporateHeader';

interface CorporateLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  breadcrumbs?: { label: string; href?: string }[];
  headerActions?: React.ReactNode;
  className?: string;
}

export const CorporateLayout: React.FC<CorporateLayoutProps> = ({
  children,
  title,
  subtitle,
  breadcrumbs,
  headerActions,
  className = '',
}) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarCollapsed(false);
        setIsMobileSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle escape key for mobile sidebar
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isMobileSidebarOpen) {
        setIsMobileSidebarOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isMobileSidebarOpen]);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <CorporateSidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        className={`${isMobileSidebarOpen ? 'open' : ''} lg:translate-x-0`}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <CorporateHeader
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        />

        {/* Page Content */}
        <main className={`main-content ${isSidebarCollapsed ? 'sidebar-collapsed' : ''} overflow-auto`}>
          {/* Page Header */}
          {(title || breadcrumbs || headerActions) && (
            <div className="mb-8">
              {/* Breadcrumbs */}
              {breadcrumbs && breadcrumbs.length > 0 && (
                <nav className="mb-4" aria-label="Breadcrumb">
                  <ol className="flex items-center space-x-2 text-sm">
                    {breadcrumbs.map((crumb, index) => (
                      <li key={index} className="flex items-center">
                        {index > 0 && (
                          <svg
                            className="w-4 h-4 text-slate-400 mx-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        )}
                        {crumb.href ? (
                          <a
                            href={crumb.href}
                            className="text-slate-500 hover:text-slate-700 transition-colors duration-200"
                          >
                            {crumb.label}
                          </a>
                        ) : (
                          <span className="text-slate-700 font-medium">{crumb.label}</span>
                        )}
                      </li>
                    ))}
                  </ol>
                </nav>
              )}

              {/* Page Title and Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  {title && (
                    <h1 className="text-2xl font-bold text-slate-900 mb-1">
                      {title}
                    </h1>
                  )}
                  {subtitle && (
                    <p className="text-slate-600">
                      {subtitle}
                    </p>
                  )}
                </div>
                {headerActions && (
                  <div className="mt-4 sm:mt-0 flex items-center space-x-3">
                    {headerActions}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Page Content */}
          <div className={`animate-fade-in ${className}`}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default CorporateLayout;