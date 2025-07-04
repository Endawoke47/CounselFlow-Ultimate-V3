import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { 
  Bot, 
  Send, 
  Paperclip, 
  Mic, 
  MicOff, 
  Download, 
  Copy, 
  ThumbsUp, 
  ThumbsDown,
  User,
  FileText,
  Search,
  Scale,
  AlertCircle,
  Loader2
} from 'lucide-react';

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  attachments?: string[];
}

interface AIChatPageProps {
  onSendMessage?: (message: string, attachments?: File[]) => Promise<string>;
}

const predefinedPrompts = [
  {
    id: 'legal-research',
    icon: Search,
    title: 'Legal Research',
    description: 'Research case law and legal precedents',
    prompt: 'Help me research legal precedents for contract disputes in New York state.'
  },
  {
    id: 'contract-analysis',
    icon: FileText,
    title: 'Contract Analysis',
    description: 'Analyze contracts for risks and issues',
    prompt: 'Analyze this contract for potential legal risks and problematic clauses.'
  },
  {
    id: 'compliance-check',
    icon: Scale,
    title: 'Compliance Check',
    description: 'Check regulatory compliance requirements',
    prompt: 'What are the compliance requirements for data privacy in healthcare?'
  },
  {
    id: 'risk-assessment',
    icon: AlertCircle,
    title: 'Risk Assessment',
    description: 'Assess legal risks in business decisions',
    prompt: 'Assess the legal risks of this business transaction.'
  }
];

export const AIChatPage: React.FC<AIChatPageProps> = ({ onSendMessage }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Hello! I\'m your AI Legal Assistant. I can help you with legal research, contract analysis, compliance questions, and more. How can I assist you today?',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (message: string) => {
    if (!message.trim() && attachments.length === 0) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: message,
      timestamp: new Date(),
      attachments: attachments.map(file => file.name)
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setAttachments([]);
    setIsLoading(true);

    try {
      let assistantResponse = '';
      
      if (onSendMessage) {
        assistantResponse = await onSendMessage(message, attachments);
      } else {
        // Simulate AI response
        await new Promise(resolve => setTimeout(resolve, 2000));
        assistantResponse = generateMockResponse(message);
      }

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: assistantResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'I apologize, but I encountered an error processing your request. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateMockResponse = (message: string): string => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('contract') || lowerMessage.includes('agreement')) {
      return 'Based on your contract inquiry, I can help you analyze key provisions, identify potential risks, and ensure compliance with relevant laws. Would you like me to review specific clauses or provide general contract drafting guidelines?';
    } else if (lowerMessage.includes('research') || lowerMessage.includes('precedent')) {
      return 'For legal research, I can help you find relevant case law, statutes, and legal precedents. I\'ll search through legal databases and provide you with the most relevant findings along with case citations and analysis.';
    } else if (lowerMessage.includes('compliance')) {
      return 'Compliance requirements vary by industry and jurisdiction. I can help you understand specific regulatory requirements, create compliance checklists, and identify potential compliance gaps in your organization.';
    } else if (lowerMessage.includes('risk')) {
      return 'Legal risk assessment involves analyzing potential legal exposures and their likelihood. I can help you identify, categorize, and prioritize legal risks, as well as suggest mitigation strategies.';
    } else {
      return 'I understand you need legal assistance. Could you provide more specific details about your legal question or the type of help you need? I\'m here to assist with research, analysis, drafting, and compliance matters.';
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleVoiceToggle = () => {
    if (isListening) {
      setIsListening(false);
      // Stop voice recognition
    } else {
      setIsListening(true);
      // Start voice recognition
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handlePromptClick = (prompt: string) => {
    setInputMessage(prompt);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
              <Bot className="h-6 w-6 text-teal-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">AI Legal Assistant</h1>
              <p className="text-sm text-gray-600">Powered by Advanced AI Models</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Chat
            </Button>
            <Button variant="outline" size="sm">
              Clear History
            </Button>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full flex">
          {/* Messages */}
          <div className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.type === 'assistant' && (
                    <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Bot className="h-5 w-5 text-teal-600" />
                    </div>
                  )}
                  
                  <div className={`max-w-3xl ${message.type === 'user' ? 'order-first' : ''}`}>
                    <div
                      className={`p-4 rounded-lg ${
                        message.type === 'user'
                          ? 'bg-teal-600 text-white'
                          : 'bg-white border border-gray-200'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      
                      {message.attachments && message.attachments.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {message.attachments.map((attachment, index) => (
                            <div key={index} className="flex items-center gap-2 text-xs opacity-75">
                              <Paperclip className="h-3 w-3" />
                              {attachment}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-gray-500">
                        {message.timestamp.toLocaleTimeString()}
                      </span>
                      
                      {message.type === 'assistant' && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => copyToClipboard(message.content)}
                            className="p-1 hover:bg-gray-100 rounded"
                          >
                            <Copy className="h-3 w-3 text-gray-400" />
                          </button>
                          <button className="p-1 hover:bg-gray-100 rounded">
                            <ThumbsUp className="h-3 w-3 text-gray-400" />
                          </button>
                          <button className="p-1 hover:bg-gray-100 rounded">
                            <ThumbsDown className="h-3 w-3 text-gray-400" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {message.type === 'user' && (
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="h-5 w-5 text-gray-600" />
                    </div>
                  )}
                </div>
              ))}
              
              {isLoading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="h-5 w-5 text-teal-600" />
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm text-gray-600">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-gray-200 bg-white p-4">
              {/* Attachments */}
              {attachments.length > 0 && (
                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    {attachments.map((file, index) => (
                      <div key={index} className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1">
                        <FileText className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-700">{file.name}</span>
                        <button
                          onClick={() => removeAttachment(index)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Input */}
              <div className="flex gap-2">
                <div className="flex-1 flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Ask me anything about legal matters..."
                    className="flex-1 bg-transparent border-none focus:ring-0 focus:border-none"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(inputMessage);
                      }
                    }}
                  />
                  
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 hover:bg-gray-200 rounded-full"
                  >
                    <Paperclip className="h-4 w-4 text-gray-500" />
                  </button>
                  
                  <button
                    onClick={handleVoiceToggle}
                    className={`p-2 hover:bg-gray-200 rounded-full ${
                      isListening ? 'bg-red-100 text-red-600' : 'text-gray-500'
                    }`}
                  >
                    {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  </button>
                </div>
                
                <Button
                  onClick={() => handleSendMessage(inputMessage)}
                  disabled={isLoading || (!inputMessage.trim() && attachments.length === 0)}
                  className="rounded-full px-4"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </div>

          {/* Sidebar with Prompts */}
          <div className="w-80 bg-white border-l border-gray-200 p-4">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Quick Prompts</h3>
            <div className="space-y-3">
              {predefinedPrompts.map((prompt) => (
                <button
                  key={prompt.id}
                  onClick={() => handlePromptClick(prompt.prompt)}
                  className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <prompt.icon className="h-5 w-5 text-teal-600" />
                    <span className="font-medium text-gray-800">{prompt.title}</span>
                  </div>
                  <p className="text-sm text-gray-600">{prompt.description}</p>
                </button>
              ))}
            </div>

            <div className="mt-6 p-4 bg-teal-50 rounded-lg">
              <h4 className="font-medium text-teal-800 mb-2">Pro Tips</h4>
              <ul className="text-sm text-teal-700 space-y-1">
                <li>• Be specific with your questions</li>
                <li>• Attach relevant documents</li>
                <li>• Use voice input for convenience</li>
                <li>• Save important responses</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};