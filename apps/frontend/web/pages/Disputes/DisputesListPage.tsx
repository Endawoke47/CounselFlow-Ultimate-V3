import React, { useState, useEffect } from 'react';
import CorporateLayout from '../../components/layout/CorporateLayout';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardBody, CardTitle, CardDescription, StatsCard } from '../../components/ui/Card';

const Icons = {
  gavel: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.832 18.477 19.246 18 17.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
  scale: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
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
  activity: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

interface Dispute {
  id: string;
  title: string;
  case_number: string;
  parties: {
    plaintiff: string;
    defendant: string;
  };
  type: 'litigation' | 'arbitration' | 'mediation' | 'settlement' | 'appeals';
  status: 'active' | 'pending' | 'discovery' | 'trial' | 'settled' | 'dismissed' | 'judgment';
  priority: 'high' | 'medium' | 'low';
  court: string;
  judge?: string;
  lead_attorney: string;
  team_members: string[];
  filing_date: string;
  next_hearing?: string;
  discovery_deadline?: string;
  trial_date?: string;
  claim_amount: number;
  estimated_costs: number;
  description: string;
  tags: string[];
  latest_activity: string;
  activity_date: string;
}

interface DisputeMetrics {
  totalDisputes: number;
  activeDisputes: number;
  settledDisputes: number;
  upcomingHearings: number;
  totalClaimValue: number;
  estimatedCosts: number;
}

const mockDisputes: Dispute[] = [
  {
    id: '1',
    title: 'Johnson vs. ABC Corporation',
    case_number: '2024-CV-12345',
    parties: {
      plaintiff: 'Robert Johnson',
      defendant: 'ABC Corporation'
    },
    type: 'litigation',
    status: 'discovery',
    priority: 'high',
    court: 'Superior Court of California',
    judge: 'Hon. Margaret Williams',
    lead_attorney: 'Sarah Chen',
    team_members: ['Michael Rodriguez', 'Emily Watson'],
    filing_date: '2024-03-15',
    next_hearing: '2025-01-25',
    discovery_deadline: '2025-02-15',
    trial_date: '2025-03-10',
    claim_amount: 2500000,
    estimated_costs: 350000,
    description: 'Product liability lawsuit involving defective manufacturing equipment resulting in workplace injury',
    tags: ['product-liability', 'workplace-injury', 'manufacturing'],
    latest_activity: 'Expert witness deposition scheduled',
    activity_date: '2024-12-18'
  },
  {
    id: '2',
    title: 'TechStart Inc. vs. DataCorp Ltd.',
    case_number: '2024-ARB-7890',
    parties: {
      plaintiff: 'TechStart Inc.',
      defendant: 'DataCorp Ltd.'
    },
    type: 'arbitration',
    status: 'active',
    priority: 'high',
    court: 'American Arbitration Association',
    lead_attorney: 'Michael Rodriguez',
    team_members: ['David Kim', 'Lisa Park'],
    filing_date: '2024-06-20',
    next_hearing: '2025-01-15',
    claim_amount: 1800000,
    estimated_costs: 275000,
    description: 'Breach of software licensing agreement and trade secret misappropriation claim',
    tags: ['intellectual-property', 'trade-secrets', 'software'],
    latest_activity: 'Arbitrator selection completed',
    activity_date: '2024-12-15'
  },
  {
    id: '3',
    title: 'Green Energy Solutions Settlement',
    case_number: '2024-CV-5678',
    parties: {
      plaintiff: 'Westside Municipality',
      defendant: 'Green Energy Solutions'
    },
    type: 'mediation',
    status: 'settled',
    priority: 'medium',
    court: 'Federal District Court',
    lead_attorney: 'Emily Watson',
    team_members: ['Sarah Chen'],
    filing_date: '2024-01-10',
    claim_amount: 850000,
    estimated_costs: 125000,
    description: 'Contract dispute regarding solar panel installation project delays',
    tags: ['contract-dispute', 'construction', 'renewable-energy'],
    latest_activity: 'Settlement agreement finalized',
    activity_date: '2024-11-30'
  },
  {
    id: '4',
    title: 'Maritime Logistics Appeal',
    case_number: '2024-APP-3456',
    parties: {
      plaintiff: 'Ocean Freight Co.',
      defendant: 'Port Authority'
    },
    type: 'appeals',
    status: 'pending',
    priority: 'medium',
    court: 'Court of Appeals, 9th Circuit',
    judge: 'Hon. James Patterson',
    lead_attorney: 'David Kim',
    team_members: ['Lisa Park'],
    filing_date: '2024-09-05',
    next_hearing: '2025-02-20',
    claim_amount: 1200000,
    estimated_costs: 180000,
    description: 'Appeal of lower court decision regarding port usage fees and regulations',
    tags: ['maritime-law', 'regulatory', 'appeals'],
    latest_activity: 'Appellate brief filed',
    activity_date: '2024-12-10'
  },
  {
    id: '5',
    title: 'Employment Discrimination Case',
    case_number: '2024-EMP-9012',
    parties: {
      plaintiff: 'Jennifer Martinez',
      defendant: 'Global Services Inc.'
    },
    type: 'litigation',
    status: 'trial',
    priority: 'high',
    court: 'Federal District Court',
    judge: 'Hon. Robert Chen',
    lead_attorney: 'Lisa Park',
    team_members: ['Emily Watson'],
    filing_date: '2024-02-28',
    trial_date: '2025-01-20',
    claim_amount: 450000,
    estimated_costs: 95000,
    description: 'Gender discrimination and wrongful termination lawsuit under Title VII',
    tags: ['employment-law', 'discrimination', 'title-vii'],
    latest_activity: 'Jury selection completed',
    activity_date: '2024-12-16'
  }
];

const mockMetrics: DisputeMetrics = {
  totalDisputes: 15,
  activeDisputes: 8,
  settledDisputes: 7,
  upcomingHearings: 4,
  totalClaimValue: 8750000,
  estimatedCosts: 1250000
};

const DisputesListPage: React.FC = () => {
  const [disputes, setDisputes] = useState<Dispute[]>(mockDisputes);
  const [metrics, setMetrics] = useState<DisputeMetrics>(mockMetrics);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');

  const filteredDisputes = disputes.filter(dispute => {
    const matchesSearch = dispute.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         dispute.case_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         dispute.parties.plaintiff.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         dispute.parties.defendant.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = filterType === 'all' || dispute.type === filterType;
    const matchesStatus = filterStatus === 'all' || dispute.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || dispute.priority === filterPriority;
    
    return matchesSearch && matchesType && matchesStatus && matchesPriority;
  });

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'discovery':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'trial':
        return 'bg-purple-100 text-purple-800 border border-purple-200';
      case 'settled':
        return 'bg-teal-100 text-teal-800 border border-teal-200';
      case 'dismissed':
        return 'bg-slate-100 text-slate-800 border border-slate-200';
      case 'judgment':
        return 'bg-indigo-100 text-indigo-800 border border-indigo-200';
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'litigation':
        return <Icons.gavel />;
      case 'arbitration':
        return <Icons.scale />;
      case 'mediation':
        return <Icons.user />;
      case 'appeals':
        return <Icons.document />;
      default:
        return <Icons.gavel />;
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

  const getDaysUntilHearing = (hearingDate: string) => {
    const today = new Date();
    const hearing = new Date(hearingDate);
    const diffTime = hearing.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Disputes', href: '/disputes' },
  ];

  const headerActions = (
    <div className="flex items-center space-x-3">
      <Button variant="outline" size="sm" leftIcon={<Icons.calendar />}>
        Court Calendar
      </Button>
      <Button variant="outline" size="sm" leftIcon={<Icons.document />}>
        Case Reports
      </Button>
      <Button variant="primary" size="sm" leftIcon={<Icons.plus />}>
        New Dispute
      </Button>
    </div>
  );

  return (
    <CorporateLayout
      title="Dispute Resolution"
      subtitle="Manage litigation, arbitration, and dispute resolution matters"
      breadcrumbs={breadcrumbs}
      headerActions={headerActions}
    >
      {/* Dispute Metrics */}
      <div className="stats-grid mb-8">
        <StatsCard
          title="Total Disputes"
          value={metrics.totalDisputes}
          change={{ value: '+2', type: 'neutral' }}
          icon={<Icons.gavel />}
        />
        <StatsCard
          title="Active Cases"
          value={metrics.activeDisputes}
          change={{ value: '+1', type: 'neutral' }}
          icon={<Icons.activity />}
        />
        <StatsCard
          title="Settled Cases"
          value={metrics.settledDisputes}
          change={{ value: '+3', type: 'positive' }}
          icon={<Icons.check />}
        />
        <StatsCard
          title="Upcoming Hearings"
          value={metrics.upcomingHearings}
          change={{ value: '4 this week', type: 'neutral' }}
          icon={<Icons.calendar />}
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
                    placeholder="Search cases, parties, or case numbers..."
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
                    <option value="litigation">Litigation</option>
                    <option value="arbitration">Arbitration</option>
                    <option value="mediation">Mediation</option>
                    <option value="settlement">Settlement</option>
                    <option value="appeals">Appeals</option>
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
                    <option value="pending">Pending</option>
                    <option value="discovery">Discovery</option>
                    <option value="trial">Trial</option>
                    <option value="settled">Settled</option>
                    <option value="dismissed">Dismissed</option>
                    <option value="judgment">Judgment</option>
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

      {/* Disputes List */}
      <div className="space-y-6">
        {filteredDisputes.map((dispute) => {
          const daysUntilHearing = dispute.next_hearing ? getDaysUntilHearing(dispute.next_hearing) : null;
          
          return (
            <Card key={dispute.id} variant="elevated" className="hover:shadow-xl transition-all duration-300">
              <CardBody>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        {getTypeIcon(dispute.type)}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-slate-900 mb-1">{dispute.title}</h3>
                      <p className="text-sm text-slate-600 mb-1">Case #{dispute.case_number}</p>
                      <p className="text-sm text-slate-600">
                        {dispute.parties.plaintiff} vs. {dispute.parties.defendant}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusStyles(dispute.status)}`}>
                      {dispute.status.charAt(0).toUpperCase() + dispute.status.slice(1)}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityStyles(dispute.priority)}`}>
                      {dispute.priority.charAt(0).toUpperCase() + dispute.priority.slice(1)}
                    </span>
                  </div>
                </div>

                <p className="text-slate-600 mb-4">{dispute.description}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <Icons.scale />
                      <span className="text-sm font-medium text-slate-700">Type</span>
                    </div>
                    <span className="text-sm text-slate-600 capitalize">{dispute.type}</span>
                  </div>
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <Icons.user />
                      <span className="text-sm font-medium text-slate-700">Lead Attorney</span>
                    </div>
                    <span className="text-sm text-slate-600">{dispute.lead_attorney}</span>
                  </div>
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <Icons.calendar />
                      <span className="text-sm font-medium text-slate-700">Filing Date</span>
                    </div>
                    <span className="text-sm text-slate-600">{formatDate(dispute.filing_date)}</span>
                  </div>
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <Icons.gavel />
                      <span className="text-sm font-medium text-slate-700">Court</span>
                    </div>
                    <span className="text-sm text-slate-600">{dispute.court}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                  <div>
                    <span className="text-sm text-slate-500">Claim Amount:</span>
                    <span className="ml-2 font-medium text-slate-900">{formatCurrency(dispute.claim_amount)}</span>
                  </div>
                  <div>
                    <span className="text-sm text-slate-500">Estimated Costs:</span>
                    <span className="ml-2 font-medium text-slate-900">{formatCurrency(dispute.estimated_costs)}</span>
                  </div>
                  {dispute.judge && (
                    <div>
                      <span className="text-sm text-slate-500">Judge:</span>
                      <span className="ml-2 font-medium text-slate-900">{dispute.judge}</span>
                    </div>
                  )}
                </div>

                {dispute.next_hearing && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Icons.calendar />
                        <span className="text-sm font-medium text-slate-700">Next Hearing:</span>
                        <span className="text-sm text-slate-900">{formatDate(dispute.next_hearing)}</span>
                      </div>
                      {daysUntilHearing !== null && (
                        <div className="flex items-center space-x-1">
                          <Icons.clock />
                          <span className={`text-sm font-medium ${daysUntilHearing <= 7 ? 'text-red-600' : 'text-slate-600'}`}>
                            {daysUntilHearing > 0 ? `${daysUntilHearing} days` : 'Today'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="mb-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Icons.activity />
                    <span className="text-sm font-medium text-slate-700">Latest Activity</span>
                    <span className="text-xs text-slate-500">({formatDate(dispute.activity_date)})</span>
                  </div>
                  <p className="text-sm text-slate-600">{dispute.latest_activity}</p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-1">
                    {dispute.tags.map((tag) => (
                      <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" leftIcon={<Icons.eye />}>
                      View Details
                    </Button>
                    <Button variant="outline" size="sm" leftIcon={<Icons.edit />}>
                      Update
                    </Button>
                    <Button variant="outline" size="sm" leftIcon={<Icons.document />}>
                      Documents
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredDisputes.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icons.gavel />
          </div>
          <h3 className="text-lg font-medium text-slate-900 mb-2">No disputes found</h3>
          <p className="text-slate-600 mb-4">
            {searchQuery ? 'Try adjusting your search criteria' : 'No active disputes at this time'}
          </p>
          <Button variant="primary" leftIcon={<Icons.plus />}>
            Create New Dispute
          </Button>
        </div>
      )}
    </CorporateLayout>
  );
};

export default DisputesListPage;