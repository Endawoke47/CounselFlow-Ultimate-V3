import React, { useState, useEffect } from 'react';
import CorporateLayout from '../../components/layout/CorporateLayout';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardBody, CardTitle, CardDescription } from '../../components/ui/Card';

const Icons = {
  plus: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  ),
  search: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  filter: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
    </svg>
  ),
  briefcase: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.832 18.477 19.246 18 17.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
  clock: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  user: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  chevronRight: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  ),
  dots: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
    </svg>
  ),
};

interface Matter {
  id: string;
  title: string;
  client: string;
  type: string;
  status: 'active' | 'pending' | 'closed' | 'on-hold';
  priority: 'high' | 'medium' | 'low';
  assignedTo: string;
  dueDate: string;
  description: string;
  value: number;
  created: string;
  tags: string[];
}

const mockMatters: Matter[] = [
  {
    id: '1',
    title: 'Personal Injury Settlement',
    client: 'Johnson vs. ABC Corp',
    type: 'Personal Injury',
    status: 'active',
    priority: 'high',
    assignedTo: 'Sarah Chen',
    dueDate: '2025-01-15',
    description: 'Motor vehicle accident claim involving multiple parties',
    value: 450000,
    created: '2024-11-15',
    tags: ['personal-injury', 'settlement', 'motor-vehicle'],
  },
  {
    id: '2',
    title: 'Corporate Merger Legal Review',
    client: 'TechCorp Inc.',
    type: 'Corporate Law',
    status: 'active',
    priority: 'high',
    assignedTo: 'Michael Rodriguez',
    dueDate: '2025-01-20',
    description: 'Due diligence and regulatory approval for acquisition',
    value: 2500000,
    created: '2024-12-01',
    tags: ['corporate', 'merger', 'due-diligence'],
  },
  {
    id: '3',
    title: 'Contract Dispute Resolution',
    client: 'BuildCorp Ltd.',
    type: 'Contract Law',
    status: 'pending',
    priority: 'medium',
    assignedTo: 'Emily Watson',
    dueDate: '2025-01-25',
    description: 'Breach of contract claim in construction project',
    value: 180000,
    created: '2024-12-05',
    tags: ['contract', 'dispute', 'construction'],
  },
  {
    id: '4',
    title: 'IP Patent Application',
    client: 'InnovateTech Solutions',
    type: 'Intellectual Property',
    status: 'active',
    priority: 'medium',
    assignedTo: 'David Kim',
    dueDate: '2025-02-01',
    description: 'Software patent application for AI technology',
    value: 75000,
    created: '2024-12-10',
    tags: ['patent', 'intellectual-property', 'ai'],
  },
  {
    id: '5',
    title: 'Employment Termination Case',
    client: 'Global Services Inc.',
    type: 'Employment Law',
    status: 'closed',
    priority: 'low',
    assignedTo: 'Lisa Park',
    dueDate: '2024-12-15',
    description: 'Wrongful termination claim resolution',
    value: 95000,
    created: '2024-10-20',
    tags: ['employment', 'termination', 'resolution'],
  },
];

const MattersListPage: React.FC = () => {
  const [matters, setMatters] = useState<Matter[]>(mockMatters);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');

  const filteredMatters = matters.filter(matter => {
    const matchesSearch = matter.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         matter.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         matter.type.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || matter.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || matter.priority === filterPriority;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'closed':
        return 'bg-slate-100 text-slate-800 border border-slate-200';
      case 'on-hold':
        return 'bg-red-100 text-red-800 border border-red-200';
      default:
        return 'bg-slate-100 text-slate-800 border border-slate-200';
    }
  };

  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border border-green-200';
      default:
        return 'bg-slate-100 text-slate-800 border border-slate-200';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Matters', href: '/matters' },
  ];

  const headerActions = (
    <div className="flex items-center space-x-3">
      <Button variant="outline" size="sm" leftIcon={<Icons.filter />}>
        Filter
      </Button>
      <Button variant="primary" size="sm" leftIcon={<Icons.plus />}>
        New Matter
      </Button>
    </div>
  );

  return (
    <CorporateLayout
      title="Matter Management"
      subtitle="Manage and track all legal matters and cases"
      breadcrumbs={breadcrumbs}
      headerActions={headerActions}
    >
      {/* Search and Filter Bar */}
      <div className="mb-6">
        <Card>
          <CardBody className="p-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div className="flex-1 lg:mr-6">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Icons.search />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search matters, clients, or case types..."
                    className="pl-10 pr-4 py-2 w-full border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-slate-700">Status:</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="border border-slate-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="closed">Closed</option>
                    <option value="on-hold">On Hold</option>
                  </select>
                </div>
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-slate-700">Priority:</label>
                  <select
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value)}
                    className="border border-slate-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Priority</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Matters Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredMatters.map((matter) => (
          <Card key={matter.id} variant="elevated" className="hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Icons.briefcase />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{matter.title}</CardTitle>
                    <CardDescription className="text-sm">{matter.client}</CardDescription>
                  </div>
                </div>
                <button className="p-1 rounded-md hover:bg-slate-100 transition-colors">
                  <Icons.dots />
                </button>
              </div>
            </CardHeader>
            <CardBody className="pt-0">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusStyles(matter.status)}`}>
                    {matter.status.charAt(0).toUpperCase() + matter.status.slice(1)}
                  </span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityStyles(matter.priority)}`}>
                    {matter.priority.charAt(0).toUpperCase() + matter.priority.slice(1)}
                  </span>
                </div>
                
                <p className="text-sm text-slate-600 line-clamp-2">{matter.description}</p>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Type:</span>
                    <span className="font-medium text-slate-900">{matter.type}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Value:</span>
                    <span className="font-medium text-slate-900">{formatCurrency(matter.value)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Due Date:</span>
                    <span className="font-medium text-slate-900">{formatDate(matter.dueDate)}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Icons.user />
                  <span className="text-sm text-slate-600">{matter.assignedTo}</span>
                </div>
                
                <div className="flex flex-wrap gap-1">
                  {matter.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                      {tag}
                    </span>
                  ))}
                  {matter.tags.length > 3 && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-600">
                      +{matter.tags.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredMatters.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icons.briefcase />
          </div>
          <h3 className="text-lg font-medium text-slate-900 mb-2">No matters found</h3>
          <p className="text-slate-600 mb-4">
            {searchQuery ? 'Try adjusting your search criteria' : 'Get started by creating your first matter'}
          </p>
          <Button variant="primary" leftIcon={<Icons.plus />}>
            Create New Matter
          </Button>
        </div>
      )}
    </CorporateLayout>
  );
};

export default MattersListPage;