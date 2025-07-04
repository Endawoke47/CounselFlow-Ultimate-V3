import React, { useState, useEffect } from 'react';
import CorporateLayout from '../../components/layout/CorporateLayout';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardBody, CardTitle, CardDescription, StatsCard } from '../../components/ui/Card';

const Icons = {
  building: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H7m-2 0h2m14 0V9a2 2 0 00-2-2M9 8h6" />
    </svg>
  ),
  office: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
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
  globe: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
    </svg>
  ),
  phone: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  ),
  mail: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  user: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
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
  document: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  briefcase: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.832 18.477 19.246 18 17.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
  shield: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  warning: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
    </svg>
  ),
};

interface Company {
  id: string;
  name: string;
  legal_name: string;
  type: 'corporation' | 'llc' | 'partnership' | 'sole-proprietorship' | 'non-profit';
  status: 'active' | 'inactive' | 'pending' | 'dissolved';
  jurisdiction: string;
  incorporation_date: string;
  ein: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  contact: {
    phone?: string;
    email?: string;
    website?: string;
  };
  primary_contact: {
    name: string;
    title: string;
    email: string;
    phone: string;
  };
  industry: string;
  employees?: number;
  annual_revenue?: number;
  description: string;
  tags: string[];
  compliance_status: 'compliant' | 'issues' | 'critical' | 'unknown';
  active_matters: number;
  active_contracts: number;
  last_updated: string;
  assigned_attorney: string;
}

interface CompanyMetrics {
  totalCompanies: number;
  activeCompanies: number;
  newCompanies: number;
  complianceIssues: number;
  totalMatters: number;
  totalContracts: number;
}

const mockCompanies: Company[] = [
  {
    id: '1',
    name: 'TechCorp Inc.',
    legal_name: 'Technology Corporation Incorporated',
    type: 'corporation',
    status: 'active',
    jurisdiction: 'Delaware',
    incorporation_date: '2018-03-15',
    ein: '12-3456789',
    address: {
      street: '123 Innovation Drive',
      city: 'San Francisco',
      state: 'CA',
      zip: '94105',
      country: 'United States'
    },
    contact: {
      phone: '+1 (555) 123-4567',
      email: 'legal@techcorp.com',
      website: 'https://techcorp.com'
    },
    primary_contact: {
      name: 'Jennifer Smith',
      title: 'Chief Legal Officer',
      email: 'j.smith@techcorp.com',
      phone: '+1 (555) 123-4568'
    },
    industry: 'Technology',
    employees: 1500,
    annual_revenue: 45000000,
    description: 'Leading software development company specializing in enterprise solutions',
    tags: ['technology', 'software', 'enterprise'],
    compliance_status: 'compliant',
    active_matters: 3,
    active_contracts: 12,
    last_updated: '2024-12-15',
    assigned_attorney: 'Sarah Chen'
  },
  {
    id: '2',
    name: 'GreenEnergy Solutions LLC',
    legal_name: 'Green Energy Solutions Limited Liability Company',
    type: 'llc',
    status: 'active',
    jurisdiction: 'California',
    incorporation_date: '2020-07-22',
    ein: '98-7654321',
    address: {
      street: '456 Renewable Way',
      city: 'Los Angeles',
      state: 'CA',
      zip: '90210',
      country: 'United States'
    },
    contact: {
      phone: '+1 (555) 987-6543',
      email: 'info@greenenergy.com',
      website: 'https://greenenergy.com'
    },
    primary_contact: {
      name: 'Michael Rodriguez',
      title: 'General Manager',
      email: 'm.rodriguez@greenenergy.com',
      phone: '+1 (555) 987-6544'
    },
    industry: 'Renewable Energy',
    employees: 250,
    annual_revenue: 8500000,
    description: 'Solar and wind energy installation and maintenance services',
    tags: ['renewable-energy', 'solar', 'wind'],
    compliance_status: 'issues',
    active_matters: 1,
    active_contracts: 8,
    last_updated: '2024-12-10',
    assigned_attorney: 'Emily Watson'
  },
  {
    id: '3',
    name: 'Financial Advisors Partnership',
    legal_name: 'Financial Advisors Limited Partnership',
    type: 'partnership',
    status: 'active',
    jurisdiction: 'New York',
    incorporation_date: '2015-11-08',
    ein: '55-1122334',
    address: {
      street: '789 Wall Street',
      city: 'New York',
      state: 'NY',
      zip: '10005',
      country: 'United States'
    },
    contact: {
      phone: '+1 (555) 555-7890',
      email: 'partners@financialadvisors.com',
      website: 'https://financialadvisors.com'
    },
    primary_contact: {
      name: 'David Kim',
      title: 'Managing Partner',
      email: 'd.kim@financialadvisors.com',
      phone: '+1 (555) 555-7891'
    },
    industry: 'Financial Services',
    employees: 85,
    annual_revenue: 12000000,
    description: 'Comprehensive financial planning and investment advisory services',
    tags: ['finance', 'investment', 'advisory'],
    compliance_status: 'compliant',
    active_matters: 2,
    active_contracts: 15,
    last_updated: '2024-12-18',
    assigned_attorney: 'Michael Rodriguez'
  },
  {
    id: '4',
    name: 'Healthcare Innovation Corp',
    legal_name: 'Healthcare Innovation Corporation',
    type: 'corporation',
    status: 'active',
    jurisdiction: 'Massachusetts',
    incorporation_date: '2019-09-12',
    ein: '77-9988776',
    address: {
      street: '321 Medical Center Blvd',
      city: 'Boston',
      state: 'MA',
      zip: '02101',
      country: 'United States'
    },
    contact: {
      phone: '+1 (555) 444-5566',
      email: 'legal@healthcareinnovation.com',
      website: 'https://healthcareinnovation.com'
    },
    primary_contact: {
      name: 'Dr. Lisa Park',
      title: 'Chief Medical Officer',
      email: 'l.park@healthcareinnovation.com',
      phone: '+1 (555) 444-5567'
    },
    industry: 'Healthcare',
    employees: 750,
    annual_revenue: 28000000,
    description: 'Medical device development and healthcare technology solutions',
    tags: ['healthcare', 'medical-devices', 'innovation'],
    compliance_status: 'critical',
    active_matters: 5,
    active_contracts: 22,
    last_updated: '2024-12-12',
    assigned_attorney: 'David Kim'
  },
  {
    id: '5',
    name: 'Community Arts Foundation',
    legal_name: 'Community Arts Foundation (Non-Profit)',
    type: 'non-profit',
    status: 'active',
    jurisdiction: 'Illinois',
    incorporation_date: '2012-05-20',
    ein: '33-4455667',
    address: {
      street: '654 Arts District Ave',
      city: 'Chicago',
      state: 'IL',
      zip: '60610',
      country: 'United States'
    },
    contact: {
      phone: '+1 (555) 333-2211',
      email: 'info@communityarts.org',
      website: 'https://communityarts.org'
    },
    primary_contact: {
      name: 'Amanda Wilson',
      title: 'Executive Director',
      email: 'a.wilson@communityarts.org',
      phone: '+1 (555) 333-2212'
    },
    industry: 'Non-Profit',
    employees: 25,
    description: 'Supporting local artists and community arts education programs',
    tags: ['non-profit', 'arts', 'community'],
    compliance_status: 'compliant',
    active_matters: 0,
    active_contracts: 3,
    last_updated: '2024-11-28',
    assigned_attorney: 'Lisa Park'
  }
];

const mockMetrics: CompanyMetrics = {
  totalCompanies: 42,
  activeCompanies: 38,
  newCompanies: 5,
  complianceIssues: 7,
  totalMatters: 85,
  totalContracts: 156
};

const CompaniesListPage: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>(mockCompanies);
  const [metrics, setMetrics] = useState<CompanyMetrics>(mockMetrics);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCompliance, setFilterCompliance] = useState<string>('all');

  const filteredCompanies = companies.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         company.legal_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         company.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         company.assigned_attorney.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = filterType === 'all' || company.type === filterType;
    const matchesStatus = filterStatus === 'all' || company.status === filterStatus;
    const matchesCompliance = filterCompliance === 'all' || company.compliance_status === filterCompliance;
    
    return matchesSearch && matchesType && matchesStatus && matchesCompliance;
  });

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'inactive':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'pending':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'dissolved':
        return 'bg-red-100 text-red-800 border border-red-200';
      default:
        return 'bg-slate-100 text-slate-800 border border-slate-200';
    }
  };

  const getComplianceStyles = (status: string) => {
    switch (status) {
      case 'compliant':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'issues':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'critical':
        return 'bg-red-100 text-red-800 border border-red-200';
      case 'unknown':
        return 'bg-slate-100 text-slate-800 border border-slate-200';
      default:
        return 'bg-slate-100 text-slate-800 border border-slate-200';
    }
  };

  const getComplianceIcon = (status: string) => {
    switch (status) {
      case 'compliant':
        return <Icons.shield />;
      case 'issues':
        return <Icons.warning />;
      case 'critical':
        return <Icons.warning />;
      default:
        return <Icons.shield />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'corporation':
        return <Icons.building />;
      case 'llc':
        return <Icons.office />;
      case 'partnership':
        return <Icons.user />;
      case 'non-profit':
        return <Icons.globe />;
      default:
        return <Icons.building />;
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
    { label: 'Companies', href: '/companies' },
  ];

  const headerActions = (
    <div className="flex items-center space-x-3">
      <Button variant="outline" size="sm" leftIcon={<Icons.document />}>
        Compliance Report
      </Button>
      <Button variant="outline" size="sm" leftIcon={<Icons.calendar />}>
        Annual Filings
      </Button>
      <Button variant="primary" size="sm" leftIcon={<Icons.plus />}>
        Add Company
      </Button>
    </div>
  );

  return (
    <CorporateLayout
      title="Company Management"
      subtitle="Manage corporate entities, compliance, and organizational structures"
      breadcrumbs={breadcrumbs}
      headerActions={headerActions}
    >
      {/* Company Metrics */}
      <div className="stats-grid mb-8">
        <StatsCard
          title="Total Companies"
          value={metrics.totalCompanies}
          change={{ value: `+${metrics.newCompanies} this month`, type: 'positive' }}
          icon={<Icons.building />}
        />
        <StatsCard
          title="Active Companies"
          value={metrics.activeCompanies}
          change={{ value: '90%', type: 'neutral' }}
          icon={<Icons.shield />}
        />
        <StatsCard
          title="Compliance Issues"
          value={metrics.complianceIssues}
          change={{ value: '-2', type: 'positive' }}
          icon={<Icons.warning />}
        />
        <StatsCard
          title="Active Matters"
          value={metrics.totalMatters}
          change={{ value: '+8', type: 'neutral' }}
          icon={<Icons.briefcase />}
        />
      </div>

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
                    placeholder="Search companies, industries, or attorneys..."
                    className="pl-10 pr-4 py-2 w-full border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-slate-700">Type:</label>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="border border-slate-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Types</option>
                    <option value="corporation">Corporation</option>
                    <option value="llc">LLC</option>
                    <option value="partnership">Partnership</option>
                    <option value="sole-proprietorship">Sole Proprietorship</option>
                    <option value="non-profit">Non-Profit</option>
                  </select>
                </div>
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-slate-700">Status:</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="border border-slate-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="pending">Pending</option>
                    <option value="dissolved">Dissolved</option>
                  </select>
                </div>
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-slate-700">Compliance:</label>
                  <select
                    value={filterCompliance}
                    onChange={(e) => setFilterCompliance(e.target.value)}
                    className="border border-slate-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Compliance</option>
                    <option value="compliant">Compliant</option>
                    <option value="issues">Issues</option>
                    <option value="critical">Critical</option>
                    <option value="unknown">Unknown</option>
                  </select>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Companies Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredCompanies.map((company) => (
          <Card key={company.id} variant="elevated" className="hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      {getTypeIcon(company.type)}
                    </div>
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{company.name}</CardTitle>
                    <CardDescription className="text-sm">{company.legal_name}</CardDescription>
                    <p className="text-xs text-slate-500 mt-1">{company.industry}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusStyles(company.status)}`}>
                    {company.status.charAt(0).toUpperCase() + company.status.slice(1)}
                  </span>
                  <div className="flex items-center space-x-1">
                    {getComplianceIcon(company.compliance_status)}
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getComplianceStyles(company.compliance_status)}`}>
                      {company.compliance_status.charAt(0).toUpperCase() + company.compliance_status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardBody className="pt-0">
              <div className="space-y-4">
                <p className="text-sm text-slate-600 line-clamp-2">{company.description}</p>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-slate-500">Type:</span>
                    <p className="text-sm font-medium text-slate-900 capitalize">{company.type.replace('-', ' ')}</p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500">Jurisdiction:</span>
                    <p className="text-sm font-medium text-slate-900">{company.jurisdiction}</p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500">EIN:</span>
                    <p className="text-sm font-medium text-slate-900">{company.ein}</p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500">Incorporated:</span>
                    <p className="text-sm font-medium text-slate-900">{formatDate(company.incorporation_date)}</p>
                  </div>
                </div>
                
                <div className="border-t border-slate-200 pt-3">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-slate-500">Primary Contact:</span>
                    <span className="font-medium text-slate-900">{company.primary_contact.name}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-slate-500">Title:</span>
                    <span className="text-slate-900">{company.primary_contact.title}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Attorney:</span>
                    <span className="text-slate-900">{company.assigned_attorney}</span>
                  </div>
                </div>
                
                {(company.employees || company.annual_revenue) && (
                  <div className="border-t border-slate-200 pt-3">
                    <div className="grid grid-cols-2 gap-4">
                      {company.employees && (
                        <div>
                          <span className="text-xs text-slate-500">Employees:</span>
                          <p className="text-sm font-medium text-slate-900">{company.employees.toLocaleString()}</p>
                        </div>
                      )}
                      {company.annual_revenue && (
                        <div>
                          <span className="text-xs text-slate-500">Annual Revenue:</span>
                          <p className="text-sm font-medium text-slate-900">{formatCurrency(company.annual_revenue)}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="border-t border-slate-200 pt-3">
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <span className="text-xs text-slate-500">Active Matters:</span>
                      <p className="text-sm font-medium text-slate-900">{company.active_matters}</p>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500">Active Contracts:</span>
                      <p className="text-sm font-medium text-slate-900">{company.active_contracts}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-1 mb-3">
                  {company.tags.map((tag) => (
                    <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                      {tag}
                    </span>
                  ))}
                </div>
                
                <div className="flex items-center space-x-2 pt-2 border-t border-slate-200">
                  <Button variant="outline" size="sm" leftIcon={<Icons.eye />} className="flex-1">
                    View Details
                  </Button>
                  <Button variant="outline" size="sm" leftIcon={<Icons.edit />} className="flex-1">
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" leftIcon={<Icons.document />}>
                    Files
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredCompanies.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icons.building />
          </div>
          <h3 className="text-lg font-medium text-slate-900 mb-2">No companies found</h3>
          <p className="text-slate-600 mb-4">
            {searchQuery ? 'Try adjusting your search criteria' : 'Get started by adding your first company'}
          </p>
          <Button variant="primary" leftIcon={<Icons.plus />}>
            Add New Company
          </Button>
        </div>
      )}
    </CorporateLayout>
  );
};

export default CompaniesListPage;