import React, { useState } from 'react';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { Label } from '@/shared/ui/Label';
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  Calendar, 
  User, 
  DollarSign, 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  XCircle, 
  MoreVertical,
  FileText,
  Scale,
  Building
} from 'lucide-react';

interface Matter {
  id: string;
  title: string;
  client: string;
  type: 'litigation' | 'corporate' | 'employment' | 'intellectual_property' | 'real_estate' | 'other';
  status: 'active' | 'pending' | 'closed' | 'on_hold';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignedLawyer: string;
  startDate: Date;
  dueDate?: Date;
  estimatedValue: number;
  billableHours: number;
  description: string;
  tags: string[];
}

interface EnhancedMattersPageProps {
  onCreateMatter?: (matter: Omit<Matter, 'id'>) => Promise<void>;
  onUpdateMatter?: (id: string, matter: Partial<Matter>) => Promise<void>;
  onDeleteMatter?: (id: string) => Promise<void>;
}

const mockMatters: Matter[] = [
  {
    id: '1',
    title: 'ABC Corp vs XYZ Industries - Contract Dispute',
    client: 'ABC Corporation',
    type: 'litigation',
    status: 'active',
    priority: 'high',
    assignedLawyer: 'Sarah Johnson',
    startDate: new Date('2024-01-10'),
    dueDate: new Date('2024-06-15'),
    estimatedValue: 500000,
    billableHours: 120,
    description: 'Commercial litigation involving breach of contract claims related to software licensing agreement.',
    tags: ['contract', 'commercial', 'software']
  },
  {
    id: '2',
    title: 'Employee Handbook Review - TechCorp',
    client: 'TechCorp Industries',
    type: 'employment',
    status: 'pending',
    priority: 'medium',
    assignedLawyer: 'Mike Wilson',
    startDate: new Date('2024-01-12'),
    dueDate: new Date('2024-02-01'),
    estimatedValue: 25000,
    billableHours: 15,
    description: 'Comprehensive review and update of employee handbook for compliance with new labor regulations.',
    tags: ['employment', 'compliance', 'hr']
  },
  {
    id: '3',
    title: 'Patent Application - Innovation Labs',
    client: 'Innovation Labs LLC',
    type: 'intellectual_property',
    status: 'active',
    priority: 'high',
    assignedLawyer: 'Emily Davis',
    startDate: new Date('2024-01-08'),
    dueDate: new Date('2024-03-10'),
    estimatedValue: 75000,
    billableHours: 45,
    description: 'Filing patent application for revolutionary AI algorithm in healthcare diagnostics.',
    tags: ['patent', 'ai', 'healthcare']
  },
  {
    id: '4',
    title: 'Real Estate Transaction - Downtown Office',
    client: 'Global Enterprises',
    type: 'real_estate',
    status: 'closed',
    priority: 'medium',
    assignedLawyer: 'John Attorney',
    startDate: new Date('2023-11-15'),
    dueDate: new Date('2024-01-05'),
    estimatedValue: 2000000,
    billableHours: 80,
    description: 'Commercial real estate acquisition of downtown office building.',
    tags: ['real estate', 'commercial', 'acquisition']
  }
];

export const EnhancedMattersPage: React.FC<EnhancedMattersPageProps> = ({
  onCreateMatter,
  onUpdateMatter,
  onDeleteMatter
}) => {
  const [matters, setMatters] = useState<Matter[]>(mockMatters);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedMatter, setSelectedMatter] = useState<Matter | null>(null);
  const [newMatter, setNewMatter] = useState<Partial<Matter>>({
    title: '',
    client: '',
    type: 'litigation',
    status: 'pending',
    priority: 'medium',
    assignedLawyer: '',
    startDate: new Date(),
    estimatedValue: 0,
    billableHours: 0,
    description: '',
    tags: []
  });

  const getStatusIcon = (status: Matter['status']) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'closed': return <XCircle className="h-4 w-4 text-gray-500" />;
      case 'on_hold': return <AlertTriangle className="h-4 w-4 text-orange-500" />;
    }
  };

  const getPriorityColor = (priority: Matter['priority']) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
    }
  };

  const getTypeIcon = (type: Matter['type']) => {
    switch (type) {
      case 'litigation': return <Scale className="h-4 w-4" />;
      case 'corporate': return <Building className="h-4 w-4" />;
      case 'employment': return <User className="h-4 w-4" />;
      case 'intellectual_property': return <FileText className="h-4 w-4" />;
      case 'real_estate': return <Building className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const filteredMatters = matters.filter(matter => {
    const matchesSearch = matter.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         matter.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         matter.assignedLawyer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || matter.type === selectedType;
    const matchesStatus = selectedStatus === 'all' || matter.status === selectedStatus;
    const matchesPriority = selectedPriority === 'all' || matter.priority === selectedPriority;
    
    return matchesSearch && matchesType && matchesStatus && matchesPriority;
  });

  const handleCreateMatter = async () => {
    if (!newMatter.title || !newMatter.client) return;
    
    const matter = {
      ...newMatter,
      id: Date.now().toString(),
      startDate: newMatter.startDate || new Date(),
      billableHours: newMatter.billableHours || 0,
      estimatedValue: newMatter.estimatedValue || 0,
      tags: newMatter.tags || []
    } as Matter;
    
    if (onCreateMatter) {
      await onCreateMatter(matter);
    }
    
    setMatters(prev => [matter, ...prev]);
    setShowCreateModal(false);
    setNewMatter({
      title: '',
      client: '',
      type: 'litigation',
      status: 'pending',
      priority: 'medium',
      assignedLawyer: '',
      startDate: new Date(),
      estimatedValue: 0,
      billableHours: 0,
      description: '',
      tags: []
    });
  };

  const handleEditMatter = async () => {
    if (!selectedMatter) return;
    
    if (onUpdateMatter) {
      await onUpdateMatter(selectedMatter.id, selectedMatter);
    }
    
    setMatters(prev => prev.map(matter => 
      matter.id === selectedMatter.id ? selectedMatter : matter
    ));
    setShowEditModal(false);
    setSelectedMatter(null);
  };

  const handleDeleteMatter = async (id: string) => {
    if (onDeleteMatter) {
      await onDeleteMatter(id);
    }
    
    setMatters(prev => prev.filter(matter => matter.id !== id));
  };

  const CreateEditModal = ({ isEdit = false }: { isEdit?: boolean }) => {
    const data = isEdit ? selectedMatter : newMatter;
    const setData = isEdit ? setSelectedMatter : setNewMatter;
    
    if (!data) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <h2 className="text-xl font-bold mb-4">
            {isEdit ? 'Edit Matter' : 'Create New Matter'}
          </h2>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Matter Title</Label>
              <Input
                id="title"
                value={data.title || ''}
                onChange={(e) => setData({ ...data, title: e.target.value })}
                placeholder="Enter matter title"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="client">Client</Label>
                <Input
                  id="client"
                  value={data.client || ''}
                  onChange={(e) => setData({ ...data, client: e.target.value })}
                  placeholder="Client name"
                />
              </div>
              <div>
                <Label htmlFor="assignedLawyer">Assigned Lawyer</Label>
                <Input
                  id="assignedLawyer"
                  value={data.assignedLawyer || ''}
                  onChange={(e) => setData({ ...data, assignedLawyer: e.target.value })}
                  placeholder="Lawyer name"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="type">Type</Label>
                <select
                  id="type"
                  value={data.type || 'litigation'}
                  onChange={(e) => setData({ ...data, type: e.target.value as Matter['type'] })}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="litigation">Litigation</option>
                  <option value="corporate">Corporate</option>
                  <option value="employment">Employment</option>
                  <option value="intellectual_property">IP</option>
                  <option value="real_estate">Real Estate</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  value={data.status || 'pending'}
                  onChange={(e) => setData({ ...data, status: e.target.value as Matter['status'] })}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="pending">Pending</option>
                  <option value="active">Active</option>
                  <option value="on_hold">On Hold</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
              <div>
                <Label htmlFor="priority">Priority</Label>
                <select
                  id="priority"
                  value={data.priority || 'medium'}
                  onChange={(e) => setData({ ...data, priority: e.target.value as Matter['priority'] })}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="estimatedValue">Estimated Value ($)</Label>
                <Input
                  id="estimatedValue"
                  type="number"
                  value={data.estimatedValue || ''}
                  onChange={(e) => setData({ ...data, estimatedValue: Number(e.target.value) })}
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={data.dueDate ? data.dueDate.toISOString().split('T')[0] : ''}
                  onChange={(e) => setData({ ...data, dueDate: new Date(e.target.value) })}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                rows={4}
                value={data.description || ''}
                onChange={(e) => setData({ ...data, description: e.target.value })}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Matter description..."
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-3 mt-6">
            <Button 
              variant="outline" 
              onClick={() => {
                if (isEdit) {
                  setShowEditModal(false);
                  setSelectedMatter(null);
                } else {
                  setShowCreateModal(false);
                }
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={isEdit ? handleEditMatter : handleCreateMatter}
              disabled={!data.title || !data.client}
            >
              {isEdit ? 'Update Matter' : 'Create Matter'}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Scale className="h-6 w-6 text-gray-600" />
            <h1 className="text-2xl font-bold text-gray-800">Legal Matters</h1>
          </div>
          
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Matter
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search matters..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="all">All Types</option>
            <option value="litigation">Litigation</option>
            <option value="corporate">Corporate</option>
            <option value="employment">Employment</option>
            <option value="intellectual_property">IP</option>
            <option value="real_estate">Real Estate</option>
            <option value="other">Other</option>
          </select>
          
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="on_hold">On Hold</option>
            <option value="closed">Closed</option>
          </select>
          
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="all">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Matters List */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          {filteredMatters.length === 0 ? (
            <div className="text-center py-12">
              <Scale className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No matters found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm ? 'Try adjusting your search criteria' : 'Create your first matter to get started'}
              </p>
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Matter
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredMatters.map((matter) => (
                <div key={matter.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(matter.type)}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(matter.priority)}`}>
                        {matter.priority.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(matter.status)}
                      <button className="p-1 hover:bg-gray-100 rounded">
                        <MoreVertical className="h-4 w-4 text-gray-400" />
                      </button>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {matter.title}
                  </h3>
                  
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      {matter.client}
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {matter.assignedLawyer}
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      ${matter.estimatedValue.toLocaleString()}
                    </div>
                    {matter.dueDate && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Due {matter.dueDate.toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {matter.description}
                  </p>
                  
                  {matter.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {matter.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="text-xs text-gray-500">
                      {matter.billableHours}h billed
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setSelectedMatter(matter);
                          setShowEditModal(true);
                        }}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDeleteMatter(matter.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showCreateModal && <CreateEditModal />}
      {showEditModal && <CreateEditModal isEdit />}
    </div>
  );
};