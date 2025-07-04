import React, { useState } from 'react';
import { cn } from '@/shared/lib/utils';
import { 
  ChevronLeft, 
  ChevronRight, 
  Home, 
  FileText, 
  Users, 
  Building, 
  Scale, 
  AlertTriangle, 
  Settings, 
  Bot, 
  Upload, 
  Download, 
  Search, 
  Calendar, 
  Bell, 
  BarChart3, 
  Shield, 
  Gavel, 
  BookOpen, 
  MessageCircle, 
  FileCheck, 
  HelpCircle,
  LogOut,
  User
} from 'lucide-react';

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  badge?: string;
  children?: SidebarItem[];
}

interface EnhancedSidebarProps {
  currentPath?: string;
  onNavigate?: (path: string) => void;
  onLogout?: () => void;
}

const sidebarItems: SidebarItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: Home,
    path: '/dashboard'
  },
  {
    id: 'matters',
    label: 'Legal Matters',
    icon: Gavel,
    path: '/matters',
    children: [
      { id: 'matters-all', label: 'All Matters', icon: FileText, path: '/matters' },
      { id: 'matters-add', label: 'Add Matter', icon: FileText, path: '/matters/add' },
      { id: 'matters-urgent', label: 'Urgent Matters', icon: AlertTriangle, path: '/matters/urgent', badge: '3' }
    ]
  },
  {
    id: 'contracts',
    label: 'Contracts',
    icon: FileCheck,
    path: '/contracts',
    children: [
      { id: 'contracts-all', label: 'All Contracts', icon: FileText, path: '/contracts' },
      { id: 'contracts-add', label: 'Draft Contract', icon: FileText, path: '/contracts/add' },
      { id: 'contracts-review', label: 'Pending Review', icon: FileCheck, path: '/contracts/review', badge: '5' },
      { id: 'contracts-templates', label: 'Templates', icon: BookOpen, path: '/contracts/templates' }
    ]
  },
  {
    id: 'clients',
    label: 'Clients',
    icon: Users,
    path: '/clients',
    children: [
      { id: 'clients-all', label: 'All Clients', icon: Users, path: '/clients' },
      { id: 'clients-add', label: 'Add Client', icon: Users, path: '/clients/add' },
      { id: 'clients-active', label: 'Active Clients', icon: Users, path: '/clients/active' }
    ]
  },
  {
    id: 'companies',
    label: 'Companies',
    icon: Building,
    path: '/companies',
    children: [
      { id: 'companies-all', label: 'All Companies', icon: Building, path: '/companies' },
      { id: 'companies-add', label: 'Add Company', icon: Building, path: '/companies/add' }
    ]
  },
  {
    id: 'disputes',
    label: 'Disputes',
    icon: Scale,
    path: '/disputes',
    children: [
      { id: 'disputes-all', label: 'All Disputes', icon: Scale, path: '/disputes' },
      { id: 'disputes-add', label: 'Add Dispute', icon: Scale, path: '/disputes/add' },
      { id: 'disputes-active', label: 'Active Disputes', icon: AlertTriangle, path: '/disputes/active', badge: '2' }
    ]
  },
  {
    id: 'risks',
    label: 'Risk Management',
    icon: Shield,
    path: '/risks',
    children: [
      { id: 'risks-all', label: 'All Risks', icon: Shield, path: '/risks' },
      { id: 'risks-add', label: 'Add Risk', icon: Shield, path: '/risks/add' },
      { id: 'risks-critical', label: 'Critical Risks', icon: AlertTriangle, path: '/risks/critical', badge: '4' },
      { id: 'risks-heatmap', label: 'Risk Heatmap', icon: BarChart3, path: '/risks/heatmap' }
    ]
  },
  {
    id: 'ai-tools',
    label: 'AI Tools',
    icon: Bot,
    path: '/ai',
    children: [
      { id: 'ai-chat', label: 'AI Legal Assistant', icon: MessageCircle, path: '/ai/chat' },
      { id: 'ai-research', label: 'Legal Research', icon: Search, path: '/ai/research' },
      { id: 'ai-analysis', label: 'Document Analysis', icon: FileText, path: '/ai/analysis' },
      { id: 'ai-drafting', label: 'Contract Drafting', icon: FileCheck, path: '/ai/drafting' }
    ]
  },
  {
    id: 'documents',
    label: 'Document Management',
    icon: FileText,
    path: '/documents',
    children: [
      { id: 'documents-all', label: 'All Documents', icon: FileText, path: '/documents' },
      { id: 'documents-upload', label: 'Upload Files', icon: Upload, path: '/documents/upload' },
      { id: 'documents-templates', label: 'Templates', icon: BookOpen, path: '/documents/templates' }
    ]
  },
  {
    id: 'calendar',
    label: 'Calendar',
    icon: Calendar,
    path: '/calendar'
  },
  {
    id: 'reports',
    label: 'Reports & Analytics',
    icon: BarChart3,
    path: '/reports',
    children: [
      { id: 'reports-dashboard', label: 'Analytics Dashboard', icon: BarChart3, path: '/reports/dashboard' },
      { id: 'reports-financial', label: 'Financial Reports', icon: BarChart3, path: '/reports/financial' },
      { id: 'reports-performance', label: 'Performance Reports', icon: BarChart3, path: '/reports/performance' }
    ]
  }
];

const bottomItems: SidebarItem[] = [
  {
    id: 'notifications',
    label: 'Notifications',
    icon: Bell,
    path: '/notifications',
    badge: '12'
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    path: '/settings'
  },
  {
    id: 'help',
    label: 'Help & Support',
    icon: HelpCircle,
    path: '/help'
  }
];

export const EnhancedSidebar: React.FC<EnhancedSidebarProps> = ({ 
  currentPath = '/dashboard', 
  onNavigate,
  onLogout 
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>(['matters']);

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const isExpanded = (itemId: string) => expandedItems.includes(itemId);
  const isActive = (path: string) => currentPath === path;

  const handleNavigate = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    }
  };

  const SidebarMenuItem = ({ item, level = 0 }: { item: SidebarItem; level?: number }) => {
    const hasChildren = item.children && item.children.length > 0;
    const expanded = isExpanded(item.id);
    const active = isActive(item.path);

    return (
      <div key={item.id}>
        <div
          className={cn(
            'flex items-center gap-3 px-3 py-2 mx-2 rounded-lg cursor-pointer transition-all duration-200',
            level > 0 && 'ml-4',
            active ? 'bg-teal-100 text-teal-700 font-medium' : 'text-gray-700 hover:bg-gray-100',
            isCollapsed && level === 0 && 'justify-center px-2'
          )}
          onClick={() => {
            if (hasChildren) {
              toggleExpanded(item.id);
            } else {
              handleNavigate(item.path);
            }
          }}
        >
          <item.icon className={cn('h-5 w-5 flex-shrink-0', active && 'text-teal-600')} />
          
          {!isCollapsed && (
            <>
              <span className="flex-1 text-sm">{item.label}</span>
              
              {item.badge && (
                <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                  {item.badge}
                </span>
              )}
              
              {hasChildren && (
                <ChevronRight 
                  className={cn('h-4 w-4 transition-transform', expanded && 'rotate-90')} 
                />
              )}
            </>
          )}
        </div>

        {hasChildren && expanded && !isCollapsed && (
          <div className="ml-4 mt-1 space-y-1">
            {item.children?.map(child => (
              <SidebarMenuItem key={child.id} item={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={cn(
      'flex flex-col h-screen bg-white border-r border-gray-200 shadow-lg transition-all duration-300',
      isCollapsed ? 'w-16' : 'w-64'
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <Scale className="h-8 w-8 text-teal-600" />
            <h1 className="text-xl font-bold text-gray-800">
              COUNSEL<span className="font-normal">FLOW</span>
            </h1>
          </div>
        )}
        
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </button>
      </div>

      {/* User Profile */}
      {!isCollapsed && (
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
              <User className="h-6 w-6 text-teal-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800">John Attorney</p>
              <p className="text-xs text-gray-500">Senior Partner</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Items */}
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1">
          {sidebarItems.map(item => (
            <SidebarMenuItem key={item.id} item={item} />
          ))}
        </nav>
      </div>

      {/* Bottom Items */}
      <div className="border-t border-gray-200 p-4 space-y-1">
        {bottomItems.map(item => (
          <SidebarMenuItem key={item.id} item={item} />
        ))}
        
        <div
          className={cn(
            'flex items-center gap-3 px-3 py-2 mx-2 rounded-lg cursor-pointer transition-all duration-200 text-red-600 hover:bg-red-50',
            isCollapsed && 'justify-center px-2'
          )}
          onClick={onLogout}
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {!isCollapsed && <span className="text-sm">Logout</span>}
        </div>
      </div>
    </div>
  );
};