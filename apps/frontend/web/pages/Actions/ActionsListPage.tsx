import React, { useState, useEffect } from 'react';
import CorporateLayout from '../../components/layout/CorporateLayout';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardBody, CardTitle, CardDescription, StatsCard } from '../../components/ui/Card';

const Icons = {
  task: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
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
  check: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  x: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  pause: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  play: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293L12 11l.707-.707A1 1 0 0113.414 10H15m-6 4v1a2 2 0 002 2h2a2 2 0 002-2v-1m-6 0h6" />
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
  flag: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 2H21l-3 6 3 6h-8.5l-1-2H5a2 2 0 00-2 2zm9-13.5V9" />
    </svg>
  ),
  warning: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
    </svg>
  ),
  activity: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

interface ActionItem {
  id: string;
  title: string;
  description: string;
  type: 'task' | 'reminder' | 'deadline' | 'review' | 'follow-up' | 'filing';
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled' | 'overdue';
  priority: 'high' | 'medium' | 'low';
  assignee: string;
  created_by: string;
  created_date: string;
  due_date: string;
  completed_date?: string;
  estimated_hours?: number;
  actual_hours?: number;
  matter_id?: string;
  matter_title?: string;
  contract_id?: string;
  contract_title?: string;
  tags: string[];
  notes?: string;
  dependencies?: string[];
  progress: number;
}

interface ActionMetrics {
  totalActions: number;
  pendingActions: number;
  completedActions: number;
  overdueActions: number;
  todaysDue: number;
  thisWeekDue: number;
}

const mockActions: ActionItem[] = [
  {
    id: '1',
    title: 'Review Microsoft Service Agreement',
    description: 'Complete legal review of the updated Microsoft cloud services agreement terms and conditions',
    type: 'review',
    status: 'pending',
    priority: 'high',
    assignee: 'Sarah Chen',
    created_by: 'Michael Rodriguez',
    created_date: '2024-12-10',
    due_date: '2025-01-15',
    estimated_hours: 8,
    matter_id: 'M001',
    matter_title: 'Microsoft Contract Review',
    tags: ['contract-review', 'enterprise', 'cloud-services'],
    notes: 'Focus on data processing clauses and liability terms',
    progress: 25
  },
  {
    id: '2',
    title: 'File Discovery Motion',
    description: 'Prepare and file motion for additional discovery in Johnson vs. ABC Corporation case',
    type: 'filing',
    status: 'in-progress',
    priority: 'high',
    assignee: 'Emily Watson',
    created_by: 'Sarah Chen',
    created_date: '2024-12-05',
    due_date: '2025-01-10',
    estimated_hours: 12,
    actual_hours: 6,
    matter_id: 'M002',
    matter_title: 'Johnson vs. ABC Corporation',
    tags: ['litigation', 'discovery', 'motion'],
    progress: 60
  },
  {
    id: '3',
    title: 'Client Follow-up - TechStart Inc.',
    description: 'Follow up with TechStart Inc. regarding arbitration scheduling and document submission',
    type: 'follow-up',
    status: 'pending',
    priority: 'medium',
    assignee: 'David Kim',
    created_by: 'Michael Rodriguez',
    created_date: '2024-12-12',
    due_date: '2025-01-08',
    estimated_hours: 2,
    matter_id: 'M003',
    matter_title: 'TechStart vs. DataCorp Arbitration',
    tags: ['client-communication', 'arbitration'],
    progress: 0
  },
  {
    id: '4',
    title: 'Compliance Audit Deadline',
    description: 'Submit quarterly compliance report for Healthcare Innovation Corp',
    type: 'deadline',
    status: 'overdue',
    priority: 'high',
    assignee: 'Lisa Park',
    created_by: 'David Kim',
    created_date: '2024-11-01',
    due_date: '2024-12-31',
    estimated_hours: 6,
    actual_hours: 4,
    matter_id: 'M004',
    matter_title: 'Healthcare Innovation Compliance',
    tags: ['compliance', 'healthcare', 'audit'],
    progress: 90
  },
  {
    id: '5',
    title: 'Contract Renewal Reminder',
    description: 'Remind client about upcoming contract renewal deadline for Office Lease Agreement',
    type: 'reminder',
    status: 'completed',
    priority: 'medium',
    assignee: 'Emily Watson',
    created_by: 'Sarah Chen',
    created_date: '2024-11-15',
    due_date: '2024-12-15',
    completed_date: '2024-12-14',
    estimated_hours: 1,
    actual_hours: 0.5,
    contract_id: 'C001',
    contract_title: 'Office Lease Agreement',
    tags: ['contract-renewal', 'real-estate'],
    progress: 100
  },
  {
    id: '6',
    title: 'Patent Application Review',
    description: 'Review patent application documentation for InnovateTech Solutions AI technology',
    type: 'task',
    status: 'in-progress',
    priority: 'medium',
    assignee: 'David Kim',
    created_by: 'Lisa Park',
    created_date: '2024-12-08',
    due_date: '2025-01-20',
    estimated_hours: 10,
    actual_hours: 3,
    matter_id: 'M005',
    matter_title: 'InnovateTech Patent Application',
    tags: ['intellectual-property', 'patent', 'ai'],
    progress: 30
  }
];

const mockMetrics: ActionMetrics = {
  totalActions: 45,
  pendingActions: 18,
  completedActions: 22,
  overdueActions: 5,
  todaysDue: 3,
  thisWeekDue: 8
};

const ActionsListPage: React.FC = () => {
  const [actions, setActions] = useState<ActionItem[]>(mockActions);
  const [metrics, setMetrics] = useState<ActionMetrics>(mockMetrics);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterAssignee, setFilterAssignee] = useState<string>('all');

  const filteredActions = actions.filter(action => {
    const matchesSearch = action.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         action.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         action.assignee.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (action.matter_title && action.matter_title.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesType = filterType === 'all' || action.type === filterType;
    const matchesStatus = filterStatus === 'all' || action.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || action.priority === filterPriority;
    const matchesAssignee = filterAssignee === 'all' || action.assignee === filterAssignee;
    
    return matchesSearch && matchesType && matchesStatus && matchesPriority && matchesAssignee;
  });

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border border-red-200';
      case 'overdue':
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'task':
        return <Icons.task />;
      case 'reminder':
        return <Icons.clock />;
      case 'deadline':
        return <Icons.calendar />;
      case 'review':
        return <Icons.eye />;
      case 'follow-up':
        return <Icons.user />;
      case 'filing':
        return <Icons.flag />;
      default:
        return <Icons.task />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <Icons.check />;
      case 'in-progress':
        return <Icons.play />;
      case 'pending':
        return <Icons.pause />;
      case 'cancelled':
        return <Icons.x />;
      case 'overdue':
        return <Icons.warning />;
      default:
        return <Icons.clock />;
    }
  };

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getUniqueAssignees = () => {
    const assignees = Array.from(new Set(actions.map(action => action.assignee)));
    return assignees.sort();
  };

  const updateActionStatus = (actionId: string, newStatus: ActionItem['status']) => {
    setActions(prevActions =>
      prevActions.map(action =>
        action.id === actionId
          ? {
              ...action,
              status: newStatus,
              completed_date: newStatus === 'completed' ? new Date().toISOString().split('T')[0] : undefined,
              progress: newStatus === 'completed' ? 100 : action.progress
            }
          : action
      )
    );
  };

  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Actions', href: '/actions' },
  ];

  const headerActions = (
    <div className="flex items-center space-x-3">
      <Button variant="outline" size="sm" leftIcon={<Icons.calendar />}>
        Calendar View
      </Button>
      <Button variant="outline" size="sm" leftIcon={<Icons.activity />}>
        Activity Report
      </Button>
      <Button variant="primary" size="sm" leftIcon={<Icons.plus />}>
        New Action
      </Button>
    </div>
  );

  return (
    <CorporateLayout
      title="Action Items"
      subtitle="Track tasks, deadlines, and follow-ups across all matters"
      breadcrumbs={breadcrumbs}
      headerActions={headerActions}
    >
      {/* Action Metrics */}
      <div className="stats-grid mb-8">
        <StatsCard
          title="Total Actions"
          value={metrics.totalActions}
          change={{ value: '+5 this week', type: 'neutral' }}
          icon={<Icons.task />}
        />
        <StatsCard
          title="Pending"
          value={metrics.pendingActions}
          change={{ value: '-3', type: 'positive' }}
          icon={<Icons.clock />}
        />
        <StatsCard
          title="Overdue"
          value={metrics.overdueActions}
          change={{ value: '+2', type: 'negative' }}
          icon={<Icons.warning />}
        />
        <StatsCard
          title="Due This Week"
          value={metrics.thisWeekDue}
          change={{ value: '3 today', type: 'neutral' }}
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
                    placeholder="Search actions, matters, or assignees..."
                    className="pl-10 pr-4 py-2 w-full border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-4 overflow-x-auto">
                <div className="flex items-center space-x-2 whitespace-nowrap">
                  <label className="text-sm font-medium text-slate-700">Type:</label>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="border border-slate-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Types</option>
                    <option value="task">Task</option>
                    <option value="reminder">Reminder</option>
                    <option value="deadline">Deadline</option>
                    <option value="review">Review</option>
                    <option value="follow-up">Follow-up</option>
                    <option value="filing">Filing</option>
                  </select>
                </div>
                <div className="flex items-center space-x-2 whitespace-nowrap">
                  <label className="text-sm font-medium text-slate-700">Status:</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="border border-slate-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="overdue">Overdue</option>
                  </select>
                </div>
                <div className="flex items-center space-x-2 whitespace-nowrap">
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
                <div className="flex items-center space-x-2 whitespace-nowrap">
                  <label className="text-sm font-medium text-slate-700">Assignee:</label>
                  <select
                    value={filterAssignee}
                    onChange={(e) => setFilterAssignee(e.target.value)}
                    className="border border-slate-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Assignees</option>
                    {getUniqueAssignees().map(assignee => (
                      <option key={assignee} value={assignee}>{assignee}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Actions List */}
      <div className="space-y-4">
        {filteredActions.map((action) => {
          const daysUntilDue = getDaysUntilDue(action.due_date);
          const isOverdue = daysUntilDue < 0 && action.status !== 'completed';
          const isDueToday = daysUntilDue === 0 && action.status !== 'completed';
          const isDueSoon = daysUntilDue <= 3 && daysUntilDue > 0 && action.status !== 'completed';
          
          return (
            <Card key={action.id} variant="elevated" className={`hover:shadow-xl transition-all duration-300 ${
              isOverdue ? 'border-l-4 border-l-red-500' : 
              isDueToday ? 'border-l-4 border-l-yellow-500' : 
              isDueSoon ? 'border-l-4 border-l-blue-500' : ''
            }`}>
              <CardBody>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="flex-shrink-0">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        action.status === 'completed' ? 'bg-green-100 text-green-600' :
                        action.status === 'overdue' ? 'bg-red-100 text-red-600' :
                        'bg-blue-100 text-blue-600'
                      }`}>
                        {getTypeIcon(action.type)}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900 mb-1">{action.title}</h3>
                          <p className="text-sm text-slate-600 mb-2">{action.description}</p>
                          {(action.matter_title || action.contract_title) && (
                            <p className="text-xs text-blue-600 font-medium">
                              Related: {action.matter_title || action.contract_title}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityStyles(action.priority)}`}>
                            {action.priority.charAt(0).toUpperCase() + action.priority.slice(1)}
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusStyles(action.status)}`}>
                            {action.status.charAt(0).toUpperCase() + action.status.slice(1).replace('-', ' ')}
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <Icons.user />
                            <span className="text-sm font-medium text-slate-700">Assignee</span>
                          </div>
                          <span className="text-sm text-slate-600">{action.assignee}</span>
                        </div>
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <Icons.calendar />
                            <span className="text-sm font-medium text-slate-700">Due Date</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-slate-600">{formatDate(action.due_date)}</span>
                            {(isOverdue || isDueToday || isDueSoon) && (
                              <span className={`text-xs font-medium ${
                                isOverdue ? 'text-red-600' : 
                                isDueToday ? 'text-yellow-600' : 
                                'text-blue-600'
                              }`}>
                                {isOverdue ? `${Math.abs(daysUntilDue)} days overdue` :
                                 isDueToday ? 'Due today' :
                                 `${daysUntilDue} days left`}
                              </span>
                            )}
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <Icons.clock />
                            <span className="text-sm font-medium text-slate-700">Hours</span>
                          </div>
                          <span className="text-sm text-slate-600">
                            {action.actual_hours || 0} / {action.estimated_hours || 0} hrs
                          </span>
                        </div>
                      </div>
                      
                      {action.progress > 0 && (
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-slate-700">Progress</span>
                            <span className="text-sm text-slate-600">{action.progress}%</span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-300 ${
                                action.progress === 100 ? 'bg-green-500' :
                                action.progress >= 75 ? 'bg-blue-500' :
                                action.progress >= 50 ? 'bg-yellow-500' :
                                'bg-slate-400'
                              }`}
                              style={{ width: `${action.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                      
                      {action.notes && (
                        <div className="mb-4 p-3 bg-slate-50 rounded-lg">
                          <div className="flex items-center space-x-2 mb-1">
                            <Icons.activity />
                            <span className="text-sm font-medium text-slate-700">Notes</span>
                          </div>
                          <p className="text-sm text-slate-600">{action.notes}</p>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-1">
                          {action.tags.map((tag) => (
                            <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                              {tag}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center space-x-2">
                          {action.status !== 'completed' && action.status !== 'cancelled' && (
                            <>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                leftIcon={<Icons.check />}
                                onClick={() => updateActionStatus(action.id, 'completed')}
                              >
                                Complete
                              </Button>
                              {action.status === 'pending' && (
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  leftIcon={<Icons.play />}
                                  onClick={() => updateActionStatus(action.id, 'in-progress')}
                                >
                                  Start
                                </Button>
                              )}
                            </>
                          )}
                          <Button variant="outline" size="sm" leftIcon={<Icons.eye />}>
                            View
                          </Button>
                          <Button variant="outline" size="sm" leftIcon={<Icons.edit />}>
                            Edit
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredActions.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icons.task />
          </div>
          <h3 className="text-lg font-medium text-slate-900 mb-2">No actions found</h3>
          <p className="text-slate-600 mb-4">
            {searchQuery ? 'Try adjusting your search criteria' : 'Get started by creating your first action item'}
          </p>
          <Button variant="primary" leftIcon={<Icons.plus />}>
            Create New Action
          </Button>
        </div>
      )}
    </CorporateLayout>
  );
};

export default ActionsListPage;