"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MessageCircle,
  Send,
  Brain,
  Scale,
  FileText,
  Search,
  User,
  Bot,
  Copy,
  ThumbsUp,
  ThumbsDown,
  MoreHorizontal,
  RefreshCw,
  Download,
  BookOpen,
  Gavel,
  AlertTriangle,
  Lightbulb,
  Zap,
  Clock,
  Star,
  Settings
} from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  type?: "text" | "legal_analysis" | "document_draft" | "research" | "contract_review";
  metadata?: {
    confidence?: number;
    sources?: string[];
    practice_area?: string;
    jurisdiction?: string;
    related_cases?: string[];
    risk_level?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  };
  isTyping?: boolean;
  reactions?: {
    helpful: boolean;
    accurate: boolean;
  };
}

interface ChatSession {
  id: string;
  title: string;
  created_at: Date;
  updated_at: Date;
  message_count: number;
  practice_area?: string;
}

interface LegalChatbotProps {
  isOpen?: boolean;
  onClose?: () => void;
  className?: string;
  embedded?: boolean;
}

const QUICK_ACTIONS = [
  {
    title: "Contract Review",
    icon: FileText,
    prompt: "Help me review a contract for potential risks and issues",
    type: "contract_review"
  },
  {
    title: "Legal Research",
    icon: Search,
    prompt: "I need to research case law and precedents for",
    type: "research"
  },
  {
    title: "Document Drafting",
    icon: BookOpen,
    prompt: "Help me draft a legal document",
    type: "document_draft"
  },
  {
    title: "Compliance Check",
    icon: Scale,
    prompt: "Check compliance requirements for",
    type: "legal_analysis"
  },
  {
    title: "Risk Assessment",
    icon: AlertTriangle,
    prompt: "Analyze the legal risks in this situation:",
    type: "legal_analysis"
  },
  {
    title: "Case Strategy",
    icon: Gavel,
    prompt: "Help me develop strategy for this case:",
    type: "legal_analysis"
  }
];

const PRACTICE_AREAS = [
  "Corporate Law",
  "Contract Law",
  "Employment Law",
  "Intellectual Property",
  "Litigation",
  "Real Estate",
  "Tax Law",
  "Mergers & Acquisitions",
  "Compliance",
  "Securities",
  "Banking & Finance",
  "International Law"
];

export function LegalChatbot({ isOpen, onClose, className, embedded = false }: LegalChatbotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPracticeArea, setSelectedPracticeArea] = useState<string>("");
  const [selectedJurisdiction, setSelectedJurisdiction] = useState<string>("US");
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: "welcome",
        role: "assistant",
        content: "Hello! I'm your AI legal assistant powered by CounselFlow. I can help you with contract analysis, legal research, document drafting, compliance checks, and more. How can I assist you today?",
        timestamp: new Date(),
        type: "text",
        metadata: {
          confidence: 1.0
        }
      };
      setMessages([welcomeMessage]);
    }
  }, []);

  const handleSendMessage = async (message?: string) => {
    const messageText = message || currentMessage.trim();
    if (!messageText || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: messageText,
      timestamp: new Date(),
      type: "text"
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage("");
    setIsLoading(true);

    // Add typing indicator
    const typingMessage: ChatMessage = {
      id: "typing",
      role: "assistant",
      content: "Analyzing your request...",
      timestamp: new Date(),
      isTyping: true
    };
    setMessages(prev => [...prev, typingMessage]);

    try {
      // Determine the type of request
      const requestType = detectRequestType(messageText);
      let response;

      switch (requestType) {
        case "contract_review":
          response = await apiClient.analyzeContract({
            contract_text: messageText,
            analysis_type: "comprehensive",
            use_consensus: true
          });
          break;
        case "legal_research":
          response = await apiClient.performLegalResearch({
            query: messageText,
            jurisdiction: selectedJurisdiction,
            practice_area: selectedPracticeArea,
            use_consensus: true
          });
          break;
        case "document_draft":
          response = await apiClient.generateDocument({
            document_type: "legal_document",
            template_data: { query: messageText, practice_area: selectedPracticeArea },
            use_consensus: true
          });
          break;
        case "litigation_analysis":
          response = await apiClient.analyzeLitigationStrategy({
            case_description: messageText,
            jurisdiction: selectedJurisdiction,
            use_consensus: true
          });
          break;
        default:
          // Generic AI response
          response = {
            response: generateContextualResponse(messageText),
            confidence: 0.85,
            type: "general_legal_advice"
          };
      }

      // Remove typing indicator and add real response
      setMessages(prev => prev.filter(msg => msg.id !== "typing"));

      const assistantMessage: ChatMessage = {
        id: Date.now().toString(),
        role: "assistant",
        content: response.response || response.analysis || response.strategy || "I'm sorry, I couldn't process that request. Please try rephrasing your question.",
        timestamp: new Date(),
        type: requestType,
        metadata: {
          confidence: response.confidence || 0.8,
          sources: response.sources || [],
          practice_area: selectedPracticeArea || response.practice_area,
          jurisdiction: selectedJurisdiction,
          related_cases: response.related_cases || [],
          risk_level: response.risk_level || "MEDIUM"
        }
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error("Chat error:", error);
      
      // Remove typing indicator
      setMessages(prev => prev.filter(msg => msg.id !== "typing"));
      
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        role: "assistant",
        content: "I apologize, but I encountered an error processing your request. Please try again or rephrase your question.",
        timestamp: new Date(),
        type: "text",
        metadata: {
          confidence: 0.0
        }
      };
      
      setMessages(prev => [...prev, errorMessage]);
      toast.error("Failed to get AI response");
    } finally {
      setIsLoading(false);
    }
  };

  const detectRequestType = (message: string): string => {
    const lowercaseMessage = message.toLowerCase();
    
    if (lowercaseMessage.includes("contract") || lowercaseMessage.includes("agreement")) {
      return "contract_review";
    }
    if (lowercaseMessage.includes("research") || lowercaseMessage.includes("case law") || lowercaseMessage.includes("precedent")) {
      return "legal_research";
    }
    if (lowercaseMessage.includes("draft") || lowercaseMessage.includes("document") || lowercaseMessage.includes("template")) {
      return "document_draft";
    }
    if (lowercaseMessage.includes("litigation") || lowercaseMessage.includes("case strategy") || lowercaseMessage.includes("lawsuit")) {
      return "litigation_analysis";
    }
    return "general";
  };

  const generateContextualResponse = (message: string): string => {
    // Simple contextual responses for demo purposes
    const responses = [
      "Based on current legal standards and best practices, I recommend reviewing the specific details of your situation. Could you provide more context about the legal area you're working in?",
      "That's an interesting legal question. To provide the most accurate guidance, I'd need to understand more about your jurisdiction and the specific circumstances involved.",
      "From a legal perspective, there are several factors to consider. Let me break down the key points you should be aware of...",
      "This touches on important legal principles. I recommend consulting the relevant statutes and case law in your jurisdiction for the most current guidance."
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleQuickAction = (action: typeof QUICK_ACTIONS[0]) => {
    setCurrentMessage(action.prompt);
    inputRef.current?.focus();
  };

  const handleMessageReaction = (messageId: string, reaction: "helpful" | "accurate", value: boolean) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? {
            ...msg,
            reactions: {
              ...msg.reactions,
              [reaction]: value
            }
          }
        : msg
    ));
    
    toast.success(value ? "Thanks for your feedback!" : "Feedback noted");
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const newChatSession = () => {
    setMessages([]);
    setCurrentSessionId(null);
    // Re-initialize with welcome message
    const welcomeMessage: ChatMessage = {
      id: "welcome",
      role: "assistant",
      content: "Hello! I'm your AI legal assistant. How can I help you today?",
      timestamp: new Date(),
      type: "text"
    };
    setMessages([welcomeMessage]);
  };

  const getMessageIcon = (type?: string) => {
    switch (type) {
      case "contract_review": return <FileText className="h-4 w-4 text-blue-600" />;
      case "legal_research": return <Search className="h-4 w-4 text-green-600" />;
      case "document_draft": return <BookOpen className="h-4 w-4 text-purple-600" />;
      case "litigation_analysis": return <Gavel className="h-4 w-4 text-red-600" />;
      default: return <Brain className="h-4 w-4 text-counselflow-primary" />;
    }
  };

  const getConfidenceColor = (confidence?: number) => {
    if (!confidence) return "text-gray-500";
    if (confidence >= 0.9) return "text-green-600";
    if (confidence >= 0.7) return "text-yellow-600";
    return "text-orange-600";
  };

  const ChatContent = () => (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b bg-counselflow-light/10">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-counselflow-primary rounded-full flex items-center justify-center">
            <Brain className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-counselflow-dark">Legal AI Assistant</h3>
            <p className="text-xs text-counselflow-neutral">Powered by CounselFlow</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" onClick={newChatSession}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Chat Settings</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setShowSettings(true)}>
                <Settings className="h-4 w-4 mr-2" />
                Preferences
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Download className="h-4 w-4 mr-2" />
                Export Chat
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Context Settings */}
      <div className="flex items-center space-x-2 p-3 bg-gray-50 border-b">
        <Select value={selectedPracticeArea} onValueChange={setSelectedPracticeArea}>
          <SelectTrigger className="w-[180px] h-8 text-xs">
            <SelectValue placeholder="Practice Area" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Areas</SelectItem>
            {PRACTICE_AREAS.map((area) => (
              <SelectItem key={area} value={area}>
                {area}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={selectedJurisdiction} onValueChange={setSelectedJurisdiction}>
          <SelectTrigger className="w-[120px] h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="US">United States</SelectItem>
            <SelectItem value="CA">Canada</SelectItem>
            <SelectItem value="UK">United Kingdom</SelectItem>
            <SelectItem value="EU">European Union</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Quick Actions */}
      {messages.length <= 1 && (
        <div className="p-4 border-b">
          <p className="text-sm text-counselflow-neutral mb-3">Quick Actions:</p>
          <div className="grid grid-cols-2 gap-2">
            {QUICK_ACTIONS.map((action) => {
              const Icon = action.icon;
              return (
                <Button
                  key={action.title}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAction(action)}
                  className="justify-start text-left h-auto p-2 border-counselflow-primary/30"
                >
                  <Icon className="h-4 w-4 mr-2 text-counselflow-primary" />
                  <span className="text-xs">{action.title}</span>
                </Button>
              );
            })}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === "user"
                  ? "bg-counselflow-primary text-white"
                  : "bg-gray-100 text-gray-900"
              }`}
            >
              {message.role === "assistant" && (
                <div className="flex items-center space-x-2 mb-2">
                  {getMessageIcon(message.type)}
                  <span className="text-xs font-medium">
                    {message.type?.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()) || "AI Assistant"}
                  </span>
                  {message.metadata?.confidence && (
                    <Badge variant="outline" className="text-xs">
                      <span className={getConfidenceColor(message.metadata.confidence)}>
                        {Math.round(message.metadata.confidence * 100)}% confident
                      </span>
                    </Badge>
                  )}
                </div>
              )}
              
              <div className={`text-sm ${message.isTyping ? "animate-pulse" : ""}`}>
                {message.content}
              </div>
              
              {message.metadata?.risk_level && (
                <div className="mt-2">
                  <Badge 
                    className={`text-xs ${
                      message.metadata.risk_level === "HIGH" || message.metadata.risk_level === "CRITICAL" 
                        ? "bg-red-100 text-red-700" 
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    Risk: {message.metadata.risk_level}
                  </Badge>
                </div>
              )}

              {message.role === "assistant" && !message.isTyping && (
                <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-200">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMessageReaction(message.id, "helpful", true)}
                      className="h-6 px-2"
                    >
                      <ThumbsUp className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMessageReaction(message.id, "helpful", false)}
                      className="h-6 px-2"
                    >
                      <ThumbsDown className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(message.content)}
                      className="h-6 px-2"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <span className="text-xs text-gray-500">
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex space-x-2">
          <Input
            ref={inputRef}
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            placeholder="Ask me about contracts, legal research, compliance..."
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            disabled={isLoading}
            className="flex-1 border-counselflow-primary/30 focus:border-counselflow-primary"
          />
          <Button
            onClick={() => handleSendMessage()}
            disabled={isLoading || !currentMessage.trim()}
            className="bg-counselflow-primary hover:bg-counselflow-dark"
          >
            {isLoading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          AI responses are for informational purposes only and do not constitute legal advice.
        </p>
      </div>
    </div>
  );

  if (embedded) {
    return (
      <Card className={`h-[600px] ${className}`}>
        <ChatContent />
      </Card>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] h-[80vh] p-0">
        <ChatContent />
      </DialogContent>
    </Dialog>
  );
}

// Floating Chat Button Component
export function ChatbotTrigger() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-counselflow-primary hover:bg-counselflow-dark shadow-lg z-50"
        size="icon"
      >
        <MessageCircle className="h-6 w-6 text-white" />
      </Button>
      
      <LegalChatbot
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}

export default LegalChatbot;