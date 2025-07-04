import React, { useState, useEffect } from 'react';
import CorporateLayout from '../../components/layout/CorporateLayout';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardBody, CardTitle, CardDescription } from '../../components/ui/Card';

const Icons = {
  document: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
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
  calendar: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  eye: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ),
  edit: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  ),
  clock: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  warning: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
    </svg>
  ),
  check: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
};

interface Contract {
  id: string;
  title: string;
  counterparty: string;
  type: string;
  status: 'draft' | 'under-review' | 'approved' | 'signed' | 'executed' | 'expired';
  priority: 'high' | 'medium' | 'low';
  value: number;
  startDate: string;
  endDate: string;
  renewalDate?: string;
  assignedTo: string;
  description: string;
  tags: string[];
  riskLevel: 'low' | 'medium' | 'high';
  autoRenewal: boolean;
  daysUntilExpiry?: number;
}

const mockContracts: Contract[] = [
  {
    id: '1',
    title: 'Microsoft Cloud Services Agreement',
    counterparty: 'Microsoft Corporation',
    type: 'Service Agreement',
    status: 'signed',
    priority: 'high',
    value: 250000,
    startDate: '2024-01-01',
    endDate: '2025-12-31',
    renewalDate: '2025-10-01',
    assignedTo: 'Sarah Chen',
    description: 'Enterprise cloud services agreement covering Azure, Office 365, and related services',
    tags: ['cloud', 'saas', 'enterprise'],
    riskLevel: 'low',
    autoRenewal: true,
    daysUntilExpiry: 361,
  },
  {
    id: '2',
    title: 'Software Development Agreement',
    counterparty: 'TechDev Solutions',
    type: 'Development Contract',
    status: 'under-review',
    priority: 'high',
    value: 500000,
    startDate: '2025-02-01',
    endDate: '2025-08-31',
    assignedTo: 'Michael Rodriguez',
    description: 'Custom software development for internal case management system',
    tags: ['development', 'software', 'custom'],
    riskLevel: 'medium',
    autoRenewal: false,
    daysUntilExpiry: 244,
  },
  {
    id: '3',
    title: 'Office Lease Agreement',
    counterparty: 'Prime Real Estate Holdings',
    type: 'Real Estate Lease',
    status: 'signed',
    priority: 'medium',
    value: 180000,
    startDate: '2023-01-01',
    endDate: '2028-12-31',
    renewalDate: '2027-10-01',
    assignedTo: 'Emily Watson',
    description: 'Long-term office space lease for downtown headquarters',
    tags: ['real-estate', 'lease', 'headquarters'],
    riskLevel: 'low',
    autoRenewal: false,
    daysUntilExpiry: 1491,
  },
  {
    id: '4',
    title: 'Data Processing Agreement',
    counterparty: 'DataSecure Analytics',
    type: 'Data Processing',
    status: 'expired',
    priority: 'high',
    value: 75000,
    startDate: '2023-06-01',
    endDate: '2024-05-31',
    assignedTo: 'David Kim',
    description: 'GDPR-compliant data processing services for client analytics',
    tags: ['gdpr', 'data-processing', 'analytics'],
    riskLevel: 'high',
    autoRenewal: false,
    daysUntilExpiry: -217,
  },
  {
    id: '5',
    title: 'Legal Research Platform License',
    counterparty: 'LegalTech Innovations',
    type: 'Software License',
    status: 'approved',
    priority: 'medium',
    value: 45000,
    startDate: '2025-01-01',
    endDate: '2025-12-31',
    renewalDate: '2025-11-01',
    assignedTo: 'Lisa Park',
    description: 'AI-powered legal research and case law analysis platform',
    tags: ['legal-tech', 'ai', 'research'],
    riskLevel: 'low',
    autoRenewal: true,
    daysUntilExpiry: 361,
  },
];

const ContractsListPage: React.FC = () => {
  const [contracts, setContracts] = useState<Contract[]>(mockContracts);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const filteredContracts = contracts.filter(contract => {
    const matchesSearch = contract.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         contract.counterparty.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         contract.type.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || contract.status === filterStatus;
    const matchesType = filterType === 'all' || contract.type === filterType;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-slate-100 text-slate-800 border border-slate-200';
      case 'under-review':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'approved':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'signed':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'executed':
        return 'bg-purple-100 text-purple-800 border border-purple-200';
      case 'expired':
        return 'bg-red-100 text-red-800 border border-red-200';
      default:
        return 'bg-slate-100 text-slate-800 border border-slate-200';
    }
  };

  const getRiskStyles = (risk: string) => {
    switch (risk) {
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

  const getExpiryWarning = (daysUntilExpiry: number | undefined) => {
    if (!daysUntilExpiry) return null;
    
    if (daysUntilExpiry < 0) {
      return { type: 'expired', message: 'Expired', color: 'text-red-600' };
    } else if (daysUntilExpiry <= 30) {
      return { type: 'urgent', message: `${daysUntilExpiry} days`, color: 'text-red-600' };
    } else if (daysUntilExpiry <= 90) {
      return { type: 'warning', message: `${daysUntilExpiry} days`, color: 'text-yellow-600' };
    }
    return { type: 'normal', message: `${daysUntilExpiry} days`, color: 'text-slate-600' };
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
    { label: 'Contracts', href: '/contracts' },
  ];

  const headerActions = (
    <div className="flex items-center space-x-3">
      <Button variant="outline" size="sm" leftIcon={<Icons.filter />}>
        Filter
      </Button>
      <Button variant="outline" size="sm" leftIcon={<Icons.calendar />}>
        Calendar View
      </Button>
      <Button variant="primary" size="sm" leftIcon={<Icons.plus />}>
        New Contract
      </Button>
    </div>
  );

  return (
    <CorporateLayout
      title="Contract Management"
      subtitle="Manage contracts, track renewals, and ensure compliance"
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
                    placeholder="Search contracts, counterparties, or types..."
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
                    <option value="draft">Draft</option>
                    <option value="under-review">Under Review</option>
                    <option value="approved">Approved</option>
                    <option value="signed">Signed</option>
                    <option value="executed">Executed</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-slate-700">Type:</label>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="border border-slate-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Types</option>
                    <option value="Service Agreement">Service Agreement</option>
                    <option value="Development Contract">Development Contract</option>
                    <option value="Real Estate Lease">Real Estate Lease</option>
                    <option value="Data Processing">Data Processing</option>
                    <option value="Software License">Software License</option>
                  </select>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Contracts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredContracts.map((contract) => {
          const expiryWarning = getExpiryWarning(contract.daysUntilExpiry);
          
          return (
            <Card key={contract.id} variant="elevated" className="hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Icons.document />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{contract.title}</CardTitle>
                      <CardDescription className="text-sm">{contract.counterparty}</CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardBody className="pt-0">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusStyles(contract.status)}`}>
                      {contract.status.charAt(0).toUpperCase() + contract.status.slice(1).replace('-', ' ')}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRiskStyles(contract.riskLevel)}`}>
                      {contract.riskLevel.charAt(0).toUpperCase() + contract.riskLevel.slice(1)} Risk
                    </span>
                  </div>
                  
                  <p className="text-sm text-slate-600 line-clamp-2">{contract.description}</p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Type:</span>
                      <span className="font-medium text-slate-900">{contract.type}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Value:</span>
                      <span className="font-medium text-slate-900">{formatCurrency(contract.value)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">End Date:</span>
                      <span className="font-medium text-slate-900">{formatDate(contract.endDate)}</span>
                    </div>
                    {expiryWarning && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">
                          {expiryWarning.type === 'expired' ? 'Status:' : 'Expires in:'}
                        </span>
                        <div className="flex items-center space-x-1">
                          {expiryWarning.type !== 'normal' && (
                            <Icons.warning />
                          )}
                          <span className={`font-medium ${expiryWarning.color}`}>
                            {expiryWarning.message}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-slate-600">Assigned to: {contract.assignedTo}</span>
                  </div>
                  
                  {contract.autoRenewal && (
                    <div className="flex items-center space-x-2 text-green-600">
                      <Icons.check />
                      <span className="text-sm font-medium">Auto-renewal enabled</span>
                    </div>
                  )}
                  
                  <div className="flex flex-wrap gap-1">
                    {contract.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                        {tag}
                      </span>
                    ))}
                    {contract.tags.length > 3 && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-600">
                        +{contract.tags.length - 3} more
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2 pt-2 border-t border-slate-200">
                    <Button variant="outline" size="sm" leftIcon={<Icons.eye />} className="flex-1">
                      View
                    </Button>
                    <Button variant="outline" size="sm" leftIcon={<Icons.edit />} className="flex-1">
                      Edit
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredContracts.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icons.document />
          </div>
          <h3 className="text-lg font-medium text-slate-900 mb-2">No contracts found</h3>
          <p className="text-slate-600 mb-4">
            {searchQuery ? 'Try adjusting your search criteria' : 'Get started by creating your first contract'}
          </p>
          <Button variant="primary" leftIcon={<Icons.plus />}>
            Create New Contract
          </Button>
        </div>
      )}
    </CorporateLayout>
  );
};

export default ContractsListPage;