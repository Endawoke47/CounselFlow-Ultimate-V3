import React, { useState, useRef } from 'react';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { 
  Upload, 
  Download, 
  Search, 
  Filter, 
  FileText, 
  FolderOpen, 
  MoreVertical, 
  Eye, 
  Edit, 
  Trash2, 
  Share, 
  Star, 
  Clock, 
  User, 
  FileImage, 
  FileVideo, 
  Archive,
  Plus,
  Grid,
  List,
  SortAsc,
  SortDesc
} from 'lucide-react';

interface Document {
  id: string;
  name: string;
  type: 'pdf' | 'doc' | 'docx' | 'txt' | 'image' | 'video' | 'other';
  size: number;
  lastModified: Date;
  owner: string;
  isStarred: boolean;
  tags: string[];
  category: 'contract' | 'matter' | 'research' | 'template' | 'other';
}

interface DocumentsPageProps {
  onUpload?: (files: File[]) => Promise<void>;
  onDownload?: (documentId: string) => void;
  onDelete?: (documentId: string) => Promise<void>;
}

const mockDocuments: Document[] = [
  {
    id: '1',
    name: 'Employment Agreement - John Doe.pdf',
    type: 'pdf',
    size: 2400000,
    lastModified: new Date('2024-01-15'),
    owner: 'Sarah Johnson',
    isStarred: true,
    tags: ['employment', 'contract', 'hr'],
    category: 'contract'
  },
  {
    id: '2',
    name: 'Case Research - Smith vs Jones.docx',
    type: 'docx',
    size: 850000,
    lastModified: new Date('2024-01-14'),
    owner: 'Mike Wilson',
    isStarred: false,
    tags: ['research', 'litigation'],
    category: 'research'
  },
  {
    id: '3',
    name: 'NDA Template.doc',
    type: 'doc',
    size: 520000,
    lastModified: new Date('2024-01-13'),
    owner: 'Emily Davis',
    isStarred: true,
    tags: ['template', 'nda', 'confidentiality'],
    category: 'template'
  },
  {
    id: '4',
    name: 'Contract Review Notes.txt',
    type: 'txt',
    size: 15000,
    lastModified: new Date('2024-01-12'),
    owner: 'John Attorney',
    isStarred: false,
    tags: ['notes', 'review'],
    category: 'other'
  }
];

export const DocumentsPage: React.FC<DocumentsPageProps> = ({ 
  onUpload, 
  onDownload, 
  onDelete 
}) => {
  const [documents, setDocuments] = useState<Document[]>(mockDocuments);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (files: FileList | null) => {
    if (!files) return;
    
    setIsUploading(true);
    try {
      const fileArray = Array.from(files);
      
      if (onUpload) {
        await onUpload(fileArray);
      }
      
      // Add to local state (mock implementation)
      const newDocuments = fileArray.map((file, index) => ({
        id: `new-${Date.now()}-${index}`,
        name: file.name,
        type: getFileType(file.name),
        size: file.size,
        lastModified: new Date(),
        owner: 'Current User',
        isStarred: false,
        tags: [],
        category: 'other' as const
      }));
      
      setDocuments(prev => [...newDocuments, ...prev]);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const getFileType = (filename: string): Document['type'] => {
    const extension = filename.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return 'pdf';
      case 'doc':
      case 'docx':
        return extension;
      case 'txt':
        return 'txt';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return 'image';
      case 'mp4':
      case 'avi':
      case 'mov':
        return 'video';
      default:
        return 'other';
    }
  };

  const getFileIcon = (type: Document['type']) => {
    switch (type) {
      case 'pdf':
      case 'doc':
      case 'docx':
      case 'txt':
        return FileText;
      case 'image':
        return FileImage;
      case 'video':
        return FileVideo;
      default:
        return Archive;
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredAndSortedDocuments = documents
    .filter(doc => {
      const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'date':
          comparison = a.lastModified.getTime() - b.lastModified.getTime();
          break;
        case 'size':
          comparison = a.size - b.size;
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const toggleDocumentSelection = (id: string) => {
    setSelectedDocuments(prev => 
      prev.includes(id) 
        ? prev.filter(docId => docId !== id)
        : [...prev, id]
    );
  };

  const handleStarToggle = (id: string) => {
    setDocuments(prev => 
      prev.map(doc => 
        doc.id === id ? { ...doc, isStarred: !doc.isStarred } : doc
      )
    );
  };

  const handleBulkDelete = async () => {
    if (selectedDocuments.length === 0) return;
    
    for (const id of selectedDocuments) {
      if (onDelete) {
        await onDelete(id);
      }
    }
    
    setDocuments(prev => prev.filter(doc => !selectedDocuments.includes(doc.id)));
    setSelectedDocuments([]);
  };

  const DocumentCard = ({ document }: { document: Document }) => {
    const FileIcon = getFileIcon(document.type);
    
    return (
      <div className={`group relative ${viewMode === 'grid' ? 'p-4 border border-gray-200 rounded-lg hover:shadow-md' : 'flex items-center gap-4 p-4 border-b border-gray-100 hover:bg-gray-50'} transition-all cursor-pointer`}>
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={selectedDocuments.includes(document.id)}
            onChange={() => toggleDocumentSelection(document.id)}
            className="rounded border-gray-300"
          />
          
          <div className={`${viewMode === 'grid' ? 'w-12 h-12' : 'w-8 h-8'} bg-gray-100 rounded-lg flex items-center justify-center`}>
            <FileIcon className={`${viewMode === 'grid' ? 'h-6 w-6' : 'h-4 w-4'} text-gray-600`} />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-gray-900 truncate">{document.name}</h3>
            {document.isStarred && (
              <Star className="h-4 w-4 text-yellow-500 fill-current" />
            )}
          </div>
          
          <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
            <span>{formatFileSize(document.size)}</span>
            <span>•</span>
            <span>{document.lastModified.toLocaleDateString()}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {document.owner}
            </span>
          </div>
          
          {document.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {document.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="sm" onClick={() => handleStarToggle(document.id)}>
            <Star className={`h-4 w-4 ${document.isStarred ? 'text-yellow-500 fill-current' : 'text-gray-400'}`} />
          </Button>
          <Button variant="ghost" size="sm">
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Share className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onDownload?.(document.id)}>
            <Download className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <MoreVertical className="h-4 w-4" />
          </Button>
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
            <FolderOpen className="h-6 w-6 text-gray-600" />
            <h1 className="text-2xl font-bold text-gray-800">Document Management</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              <Upload className="h-4 w-4 mr-2" />
              {isUploading ? 'Uploading...' : 'Upload Files'}
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Folder
            </Button>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">All Categories</option>
              <option value="contract">Contracts</option>
              <option value="matter">Matters</option>
              <option value="research">Research</option>
              <option value="template">Templates</option>
              <option value="other">Other</option>
            </select>
            
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {selectedDocuments.length > 0 && (
              <>
                <span className="text-sm text-gray-600">
                  {selectedDocuments.length} selected
                </span>
                <Button variant="outline" size="sm" onClick={handleBulkDelete}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
                <Button variant="outline" size="sm">
                  <Archive className="h-4 w-4 mr-2" />
                  Archive
                </Button>
              </>
            )}
            
            <div className="flex items-center border border-gray-300 rounded-md">
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-2 py-1 hover:bg-gray-100"
              >
                {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
              </button>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-2 py-1 border-l border-gray-300 focus:outline-none"
              >
                <option value="date">Date</option>
                <option value="name">Name</option>
                <option value="size">Size</option>
              </select>
            </div>
            
            <div className="flex items-center border border-gray-300 rounded-md">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
              >
                <List className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
              >
                <Grid className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          {filteredAndSortedDocuments.length === 0 ? (
            <div className="text-center py-12">
              <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm ? 'Try adjusting your search criteria' : 'Upload your first document to get started'}
              </p>
              <Button onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-4 w-4 mr-2" />
                Upload Documents
              </Button>
            </div>
          ) : (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' : 'space-y-0'}>
              {filteredAndSortedDocuments.map((document) => (
                <DocumentCard key={document.id} document={document} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.mp4,.avi,.mov"
        onChange={(e) => handleFileUpload(e.target.files)}
        className="hidden"
      />
    </div>
  );
};