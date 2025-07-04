import React, { useState, useEffect } from 'react';
import CorporateLayout from '../../components/layout/CorporateLayout';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardBody, CardTitle, CardDescription, StatsCard } from '../../components/ui/Card';

// Professional Icons
const Icons = {
  briefcase: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.832 18.477 19.246 18 17.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
  document: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  shield: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  clock: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  users: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
    </svg>
  ),
  trendingUp: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  ),
  plus: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  ),
  filter: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
    </svg>
  ),
  download: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
    </svg>
  ),
  bot: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  ),
};

interface DashboardStats {
  totalMatters: number;
  activeContracts: number;
  pendingRisks: number;
  upcomingDeadlines: number;
  totalClients: number;
  billableHours: number;
}

interface RecentActivity {
  id: string;
  type: 'matter' | 'contract' | 'risk' | 'document';
  title: string;
  description: string;
  time: string;
  priority: 'high' | 'medium' | 'low';
  user: string;
}

interface UpcomingDeadline {
  id: string;
  title: string;
  type: 'contract' | 'court' | 'filing' | 'review';
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
  matter: string;
}

const EnhancedDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalMatters: 124,
    activeContracts: 89,
    pendingRisks: 23,
    upcomingDeadlines: 12,
    totalClients: 56,
    billableHours: 2847,
  });

  const [recentActivity] = useState<RecentActivity[]>([
    {
      id: '1',
      type: 'matter',
      title: 'New Personal Injury Case',
      description: 'Case #2024-PI-001 has been assigned to Sarah Chen',
      time: '5 minutes ago',
      priority: 'high',
      user: 'John Doe',
    },
    {
      id: '2',
      type: 'contract',
      title: 'Microsoft Service Agreement',
      description: 'Contract review completed and signed',
      time: '1 hour ago',
      priority: 'medium',
      user: 'Sarah Chen',
    },
    {
      id: '3',
      type: 'risk',
      title: 'Compliance Risk Identified',
      description: 'GDPR compliance issue flagged in data processing',
      time: '2 hours ago',
      priority: 'high',
      user: 'AI Risk Engine',
    },
    {
      id: '4',
      type: 'document',
      title: 'Evidence Document Uploaded',
      description: 'Client uploaded medical records for case #2024-PI-001',
      time: '3 hours ago',
      priority: 'medium',
      user: 'Client Portal',
    },
  ]);

  const [upcomingDeadlines] = useState<UpcomingDeadline[]>([
    {
      id: '1',
      title: 'Discovery Deadline',
      type: 'court',
      dueDate: '2025-01-15',
      priority: 'high',
      matter: 'Johnson vs. ABC Corp',
    },
    {
      id: '2',
      title: 'Contract Renewal Review',
      type: 'contract',
      dueDate: '2025-01-18',
      priority: 'medium',
      matter: 'Microsoft Service Agreement',
    },
    {
      id: '3',
      title: 'SEC Filing Due',
      type: 'filing',
      dueDate: '2025-01-20',
      priority: 'high',
      matter: 'TechCorp IPO',
    },
    {
      id: '4',
      title: 'Policy Review',
      type: 'review',
      dueDate: '2025-01-22',
      priority: 'low',
      matter: 'Employee Handbook Update',
    },
  ]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'matter':
        return <Icons.briefcase />;
      case 'contract':
        return <Icons.document />;
      case 'risk':
        return <Icons.shield />;
      case 'document':
        return <Icons.document />;
      default:
        return <Icons.briefcase />;
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

  const formatDueDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays < 7) return `${diffDays} days`;
    return date.toLocaleDateString();
  };

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
  ];

  const headerActions = (
    <div className="flex items-center space-x-3">
      <Button variant="outline" size="sm" leftIcon={<Icons.filter />}>
        Filter
      </Button>
      <Button variant="outline" size="sm" leftIcon={<Icons.download />}>
        Export
      </Button>
      <Button variant="primary" size="sm" leftIcon={<Icons.plus />}>
        New Matter
      </Button>
    </div>
  );

  return (
    <CorporateLayout
      title="Legal Operations Dashboard"
      subtitle="Real-time insights into your legal practice"
      breadcrumbs={breadcrumbs}
      headerActions={headerActions}
    >
      {/* Key Performance Indicators */}
      <div className="stats-grid mb-8">
        <StatsCard
          title="Active Matters"
          value={stats.totalMatters}
          change={{ value: '+12%', type: 'positive' }}
          icon={<Icons.briefcase />}
        />
        <StatsCard
          title="Active Contracts"
          value={stats.activeContracts}
          change={{ value: '+8%', type: 'positive' }}
          icon={<Icons.document />}
        />
        <StatsCard
          title="Pending Risks"
          value={stats.pendingRisks}
          change={{ value: '-5%', type: 'positive' }}
          icon={<Icons.shield />}
        />
        <StatsCard
          title="Upcoming Deadlines"
          value={stats.upcomingDeadlines}
          change={{ value: '+3', type: 'negative' }}
          icon={<Icons.clock />}
        />
      </div>

      {/* Content Grid */}
      <div className="content-grid">
        {/* Main Content */}
        <div className="space-y-8">
          {/* Recent Activity */}
          <Card variant="elevated">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest updates across your legal operations</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardBody className="p-0">
              <div className="divide-y divide-slate-200">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="p-6 hover:bg-slate-50 transition-colors duration-200">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                          {getActivityIcon(activity.type)}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-slate-900">
                            {activity.title}
                          </p>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityStyles(activity.priority)}`}>
                            {activity.priority}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 mt-1">
                          {activity.description}
                        </p>
                        <div className="flex items-center mt-2 text-xs text-slate-500">
                          <span>{activity.time}</span>
                          <span className="mx-2">•</span>
                          <span>{activity.user}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* Performance Analytics */}
          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Performance Analytics</CardTitle>
              <CardDescription>Key metrics and trends for your legal practice</CardDescription>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700">Billable Hours</span>
                    <span className="text-2xl font-bold text-slate-900">{stats.billableHours.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full" style={{ width: '78%' }}></div>
                  </div>
                  <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>Target: 3,650 hours</span>
                    <span>78% complete</span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700">Client Satisfaction</span>
                    <span className="text-2xl font-bold text-slate-900">94%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full" style={{ width: '94%' }}></div>
                  </div>
                  <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>Based on 128 reviews</span>
                    <span>+2% vs last quarter</span>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Upcoming Deadlines */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Deadlines</CardTitle>
              <CardDescription>Critical dates requiring attention</CardDescription>
            </CardHeader>
            <CardBody className="p-0">
              <div className="divide-y divide-slate-200">
                {upcomingDeadlines.map((deadline) => (
                  <div key={deadline.id} className="p-4 hover:bg-slate-50 transition-colors duration-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900">{deadline.title}</p>
                        <p className="text-xs text-slate-600 mt-1">{deadline.matter}</p>
                        <div className="flex items-center mt-2">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityStyles(deadline.priority)}`}>
                            {deadline.priority}
                          </span>
                        </div>
                      </div>
                      <div className="text-right ml-3">
                        <p className="text-sm font-medium text-slate-900">
                          {formatDueDate(deadline.dueDate)}
                        </p>
                        <p className="text-xs text-slate-500 capitalize">{deadline.type}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks and shortcuts</CardDescription>
            </CardHeader>
            <CardBody className="space-y-3">
              <Button variant="outline" fullWidth leftIcon={<Icons.plus />}>
                Create New Matter
              </Button>
              <Button variant="outline" fullWidth leftIcon={<Icons.document />}>
                Upload Document
              </Button>
              <Button variant="outline" fullWidth leftIcon={<Icons.users />}>
                Add Client
              </Button>
              <Button variant="outline" fullWidth leftIcon={<Icons.shield />}>
                Risk Assessment
              </Button>
            </CardBody>
          </Card>

          {/* AI Assistant Card */}
          <Card variant="gradient">
            <CardBody>
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Icons.bot />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-1">AI Legal Assistant</h3>
                <p className="text-sm text-slate-600 mb-4">
                  Get instant legal insights and automate routine tasks with our advanced AI.
                </p>
                <Button variant="primary" size="sm" fullWidth>
                  Chat with AI
                </Button>
              </div>
            </CardBody>
          </Card>

          {/* System Status */}
          <Card variant="gradient">
            <CardBody>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-1">All Systems Operational</h3>
                <p className="text-sm text-slate-600">
                  Security monitoring, AI services, and data backups are all functioning normally.
                </p>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </CorporateLayout>
  );
};

export default EnhancedDashboard;