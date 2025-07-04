import React, { useState, useEffect } from 'react';
import CorporateLayout from '../../components/layout/CorporateLayout';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardBody, CardTitle, CardDescription, StatsCard } from '../../components/ui/Card';

const Icons = {
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
  exclamation: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  check: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
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
  trendingUp: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  ),
  trendingDown: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
    </svg>
  ),
  clock: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  eye: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ),
  document: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
};

interface Risk {
  id: string;
  title: string;
  description: string;
  category: 'compliance' | 'operational' | 'financial' | 'reputational' | 'cybersecurity' | 'legal';
  severity: 'critical' | 'high' | 'medium' | 'low';
  probability: 'very-high' | 'high' | 'medium' | 'low' | 'very-low';
  impact: 'catastrophic' | 'major' | 'moderate' | 'minor' | 'negligible';
  status: 'open' | 'in-progress' | 'mitigated' | 'closed' | 'monitoring';
  owner: string;
  dateIdentified: string;
  lastReviewed: string;
  mitigation: string;
  residualRisk: 'critical' | 'high' | 'medium' | 'low';
  tags: string[];
  relatedMatters?: string[];
}

interface RiskMetrics {
  totalRisks: number;
  criticalRisks: number;
  highRisks: number;
  mitigatedRisks: number;
  newRisksThisMonth: number;
  riskTrend: 'up' | 'down' | 'stable';
}

const mockRisks: Risk[] = [
  {
    id: '1',
    title: 'GDPR Compliance Gap in Data Processing',
    description: 'Current data processing procedures may not fully comply with GDPR requirements, particularly regarding data subject rights and consent management.',
    category: 'compliance',
    severity: 'critical',
    probability: 'high',
    impact: 'major',
    status: 'in-progress',
    owner: 'Emily Watson',
    dateIdentified: '2024-12-01',
    lastReviewed: '2024-12-15',
    mitigation: 'Implementing comprehensive GDPR compliance program with updated policies and procedures',
    residualRisk: 'medium',
    tags: ['gdpr', 'data-protection', 'privacy'],
    relatedMatters: ['Data Protection Audit', 'Privacy Policy Update'],
  },
  {
    id: '2',
    title: 'Cybersecurity Vulnerability in Client Portal',
    description: 'Security assessment identified potential vulnerabilities in the client portal that could lead to unauthorized access to confidential information.',
    category: 'cybersecurity',
    severity: 'high',
    probability: 'medium',
    impact: 'major',
    status: 'open',
    owner: 'David Kim',
    dateIdentified: '2024-11-20',
    lastReviewed: '2024-12-10',
    mitigation: 'Scheduling immediate security patches and implementing additional authentication measures',
    residualRisk: 'low',
    tags: ['cybersecurity', 'client-portal', 'data-breach'],
    relatedMatters: ['IT Security Audit'],
  },
  {
    id: '3',
    title: 'Contract Renewal Risk - Major Client',
    description: 'Large enterprise client contract up for renewal with reported dissatisfaction regarding service delivery timelines.',
    category: 'financial',
    severity: 'high',
    probability: 'medium',
    impact: 'major',
    status: 'monitoring',
    owner: 'Sarah Chen',
    dateIdentified: '2024-11-15',
    lastReviewed: '2024-12-18',
    mitigation: 'Proactive client engagement and service improvement plan implementation',
    residualRisk: 'medium',
    tags: ['contract-renewal', 'client-retention', 'revenue'],
    relatedMatters: ['Enterprise Client Renewal'],
  },
  {
    id: '4',
    title: 'Regulatory Change Impact - Financial Services',
    description: 'New financial services regulations may impact current client advisory practices and require significant process changes.',
    category: 'compliance',
    severity: 'medium',
    probability: 'high',
    impact: 'moderate',
    status: 'in-progress',
    owner: 'Michael Rodriguez',
    dateIdentified: '2024-10-30',
    lastReviewed: '2024-12-01',
    mitigation: 'Conducting regulatory impact assessment and updating compliance procedures',
    residualRisk: 'low',
    tags: ['financial-services', 'regulatory-change', 'compliance'],
    relatedMatters: ['Financial Services Compliance Review'],
  },
  {
    id: '5',
    title: 'Key Personnel Departure Risk',
    description: 'Senior partner considering departure which could impact client relationships and case continuity.',
    category: 'operational',
    severity: 'medium',
    probability: 'low',
    impact: 'major',
    status: 'monitoring',
    owner: 'Lisa Park',
    dateIdentified: '2024-12-10',
    lastReviewed: '2024-12-18',
    mitigation: 'Succession planning and knowledge transfer protocols being developed',
    residualRisk: 'medium',
    tags: ['personnel', 'succession-planning', 'knowledge-transfer'],
  },
];

const mockMetrics: RiskMetrics = {
  totalRisks: 23,
  criticalRisks: 3,
  highRisks: 8,
  mitigatedRisks: 12,
  newRisksThisMonth: 5,
  riskTrend: 'down',
};

const RiskManagementPage: React.FC = () => {
  const [risks, setRisks] = useState<Risk[]>(mockRisks);
  const [metrics, setMetrics] = useState<RiskMetrics>(mockMetrics);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredRisks = risks.filter(risk => {
    const matchesSearch = risk.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         risk.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         risk.owner.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = filterCategory === 'all' || risk.category === filterCategory;
    const matchesSeverity = filterSeverity === 'all' || risk.severity === filterSeverity;
    const matchesStatus = filterStatus === 'all' || risk.status === filterStatus;
    
    return matchesSearch && matchesCategory && matchesSeverity && matchesStatus;
  });

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border border-green-200';
      default:
        return 'bg-slate-100 text-slate-800 border border-slate-200';
    }
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-red-100 text-red-800 border border-red-200';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'mitigated':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'closed':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'monitoring':
        return 'bg-purple-100 text-purple-800 border border-purple-200';
      default:
        return 'bg-slate-100 text-slate-800 border border-slate-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'compliance':
        return <Icons.document />;
      case 'cybersecurity':
        return <Icons.shield />;
      case 'financial':
        return <Icons.trendingUp />;
      case 'operational':
        return <Icons.clock />;
      default:
        return <Icons.warning />;
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <Icons.exclamation />;
      case 'high':
        return <Icons.warning />;
      default:
        return <Icons.shield />;
    }
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
    { label: 'Risk Management', href: '/risks' },
  ];

  const headerActions = (
    <div className="flex items-center space-x-3">
      <Button variant="outline" size="sm" leftIcon={<Icons.filter />}>
        Risk Matrix
      </Button>
      <Button variant="outline" size="sm" leftIcon={<Icons.document />}>
        Risk Report
      </Button>
      <Button variant="primary" size="sm" leftIcon={<Icons.plus />}>
        New Risk Assessment
      </Button>
    </div>
  );

  return (
    <CorporateLayout
      title="Risk Management"
      subtitle="Identify, assess, and mitigate legal and operational risks"
      breadcrumbs={breadcrumbs}
      headerActions={headerActions}
    >
      {/* Risk Metrics */}
      <div className="stats-grid mb-8">
        <StatsCard
          title="Total Risks"
          value={metrics.totalRisks}
          change={{ value: `${metrics.newRisksThisMonth} this month`, type: 'neutral' }}
          icon={<Icons.shield />}
        />
        <StatsCard
          title="Critical Risks"
          value={metrics.criticalRisks}
          change={{ value: '-2', type: 'positive' }}
          icon={<Icons.exclamation />}
        />
        <StatsCard
          title="High Priority"
          value={metrics.highRisks}
          change={{ value: '-1', type: 'positive' }}
          icon={<Icons.warning />}
        />
        <StatsCard
          title="Mitigated"
          value={metrics.mitigatedRisks}
          change={{ value: '+3', type: 'positive' }}
          icon={<Icons.check />}
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
                    placeholder="Search risks by title, description, or owner..."
                    className="pl-10 pr-4 py-2 w-full border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-slate-700">Category:</label>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="border border-slate-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Categories</option>
                    <option value="compliance">Compliance</option>
                    <option value="cybersecurity">Cybersecurity</option>
                    <option value="financial">Financial</option>
                    <option value="operational">Operational</option>
                    <option value="reputational">Reputational</option>
                    <option value="legal">Legal</option>
                  </select>
                </div>
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-slate-700">Severity:</label>
                  <select
                    value={filterSeverity}
                    onChange={(e) => setFilterSeverity(e.target.value)}
                    className="border border-slate-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Severity</option>
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
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
                    <option value="open">Open</option>
                    <option value="in-progress">In Progress</option>
                    <option value="mitigated">Mitigated</option>
                    <option value="closed">Closed</option>
                    <option value="monitoring">Monitoring</option>
                  </select>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Risks List */}
      <div className="space-y-4">
        {filteredRisks.map((risk) => (
          <Card key={risk.id} variant="elevated" className="hover:shadow-xl transition-all duration-300">
            <CardBody>
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="flex-shrink-0">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getSeverityStyles(risk.severity).replace('border border-red-200', '').replace('border border-orange-200', '').replace('border border-yellow-200', '').replace('border border-green-200', '')}`}>
                      {getSeverityIcon(risk.severity)}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-1">{risk.title}</h3>
                        <p className="text-sm text-slate-600 mb-3">{risk.description}</p>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityStyles(risk.severity)}`}>
                          {risk.severity.charAt(0).toUpperCase() + risk.severity.slice(1)}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusStyles(risk.status)}`}>
                          {risk.status.charAt(0).toUpperCase() + risk.status.slice(1).replace('-', ' ')}
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          {getCategoryIcon(risk.category)}
                          <span className="text-sm font-medium text-slate-700">Category</span>
                        </div>
                        <span className="text-sm text-slate-600 capitalize">{risk.category}</span>
                      </div>
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <Icons.clock />
                          <span className="text-sm font-medium text-slate-700">Owner</span>
                        </div>
                        <span className="text-sm text-slate-600">{risk.owner}</span>
                      </div>
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <Icons.clock />
                          <span className="text-sm font-medium text-slate-700">Last Reviewed</span>
                        </div>
                        <span className="text-sm text-slate-600">{formatDate(risk.lastReviewed)}</span>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Icons.shield />
                        <span className="text-sm font-medium text-slate-700">Mitigation Strategy</span>
                      </div>
                      <p className="text-sm text-slate-600">{risk.mitigation}</p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-1">
                        {risk.tags.map((tag) => (
                          <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" leftIcon={<Icons.eye />}>
                          View Details
                        </Button>
                        <Button variant="outline" size="sm">
                          Update Status
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredRisks.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icons.shield />
          </div>
          <h3 className="text-lg font-medium text-slate-900 mb-2">No risks found</h3>
          <p className="text-slate-600 mb-4">
            {searchQuery ? 'Try adjusting your search criteria' : 'All risks are currently managed'}
          </p>
          <Button variant="primary" leftIcon={<Icons.plus />}>
            Add New Risk Assessment
          </Button>
        </div>
      )}
    </CorporateLayout>
  );
};

export default RiskManagementPage;