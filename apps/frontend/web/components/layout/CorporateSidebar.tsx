import React, { useState } from 'react';
import { Link, useLocation } from '@tanstack/react-router';

// Professional Icons (using Lucide React or similar)
const Icons = {
  dashboard: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v0M9 12l2 2 4-4" />
    </svg>
  ),
  matters: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  contracts: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  risks: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  disputes: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
    </svg>
  ),
  actions: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  ),
  companies: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
  aiChat: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  ),
  chevronLeft: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  ),
  menu: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  ),
};

interface NavItem {
  id: string;
  label: string;
  icon: keyof typeof Icons;
  href: string;
  badge?: number;
  subItems?: NavItem[];
}

const navigationItems: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: 'dashboard',
    href: '/dashboard',
  },
  {
    id: 'matters',
    label: 'Matter Management',
    icon: 'matters',
    href: '/matters',
    badge: 12,
  },
  {
    id: 'contracts',
    label: 'Contracts',
    icon: 'contracts',
    href: '/contracts',
    badge: 5,
  },
  {
    id: 'risks',
    label: 'Risk Management',
    icon: 'risks',
    href: '/risks',
    badge: 3,
  },
  {
    id: 'disputes',
    label: 'Dispute Resolution',
    icon: 'disputes',
    href: '/disputes',
  },
  {
    id: 'actions',
    label: 'Actions & Tasks',
    icon: 'actions',
    href: '/actions',
    badge: 8,
  },
  {
    id: 'companies',
    label: 'Company Management',
    icon: 'companies',
    href: '/companies',
  },
  {
    id: 'ai-chat',
    label: 'AI Legal Assistant',
    icon: 'aiChat',
    href: '/ai-chat',
  },
];

interface CorporateSidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  className?: string;
}

export const CorporateSidebar: React.FC<CorporateSidebarProps> = ({
  isCollapsed = false,
  onToggleCollapse,
  className = '',
}) => {
  const location = useLocation();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const isActiveRoute = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  return (
    <div className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${className}`}>
      {/* Brand Section */}
      <div className="sidebar-brand">
        <div className="flex items-center">
          {/* Logo */}
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">C</span>
            </div>
          </div>
          
          {/* Brand Text */}
          {!isCollapsed && (
            <div className="ml-3 transition-opacity duration-200">
              <h1 className="text-lg font-bold text-white">CounselFlow</h1>
              <p className="text-xs text-slate-300">Ultimate Legal OS</p>
            </div>
          )}
        </div>

        {/* Collapse Toggle */}
        <button
          onClick={onToggleCollapse}
          className="ml-auto p-1.5 rounded-lg hover:bg-slate-700 transition-colors duration-200"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <div className={`transform transition-transform duration-200 ${isCollapsed ? 'rotate-180' : ''}`}>
            <Icons.chevronLeft />
          </div>
        </button>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav flex-1 overflow-y-auto scrollbar-thin">
        {navigationItems.map((item) => {
          const IconComponent = Icons[item.icon];
          const isActive = isActiveRoute(item.href);
          const isHovered = hoveredItem === item.id;

          return (
            <Link
              key={item.id}
              to={item.href}
              className={`nav-item group relative ${isActive ? 'active' : ''}`}
              onMouseEnter={() => setHoveredItem(item.id)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              {/* Icon */}
              <div className="flex-shrink-0">
                <IconComponent />
              </div>

              {/* Label */}
              {!isCollapsed && (
                <span className="ml-3 text transition-opacity duration-200">
                  {item.label}
                </span>
              )}

              {/* Badge */}
              {!isCollapsed && item.badge && (
                <span className="ml-auto inline-flex items-center justify-center px-2 py-1 text-xs font-medium bg-red-500 text-white rounded-full min-w-[1.25rem] h-5">
                  {item.badge > 99 ? '99+' : item.badge}
                </span>
              )}

              {/* Collapsed Tooltip */}
              {isCollapsed && isHovered && (
                <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 px-3 py-2 bg-slate-900 text-white text-sm rounded-lg shadow-xl z-50 whitespace-nowrap animate-scale-in">
                  {item.label}
                  {item.badge && (
                    <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium bg-red-500 text-white rounded-full">
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                  {/* Tooltip Arrow */}
                  <div className="absolute top-1/2 left-0 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-slate-900 rotate-45"></div>
                </div>
              )}

              {/* Active Indicator */}
              {isActive && (
                <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-blue-400 rounded-l-full"></div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer Section */}
      {!isCollapsed && (
        <div className="p-4 border-t border-slate-700">
          <div className="bg-slate-700 rounded-lg p-3">
            <div className="flex items-center mb-2">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
              <span className="text-xs font-medium text-slate-300">System Status</span>
            </div>
            <p className="text-xs text-slate-400">All systems operational</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CorporateSidebar;