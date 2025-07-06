"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { 
  Search, 
  Users, 
  Briefcase, 
  FileText,
  Clock,
  TrendingUp,
  Brain,
  Zap,
  ArrowRight,
  Filter,
  X
} from "lucide-react";
import { apiClient, type Client, type Matter, type Contract } from "@/lib/api";
import { toast } from "sonner";

interface SearchResult {
  id: string;
  title: string;
  subtitle?: string;
  type: "client" | "matter" | "contract";
  status?: string;
  priority?: string;
  risk_level?: string;
  relevance_score?: number;
  created_at: string;
  data: Client | Matter | Contract;
}

interface GlobalSearchProps {
  onResultSelect?: (result: SearchResult) => void;
  placeholder?: string;
  className?: string;
}

export function GlobalSearch({ onResultSelect, placeholder = "Search clients, matters, contracts...", className }: GlobalSearchProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const searchTimeout = useRef<NodeJS.Timeout>();

  const availableFilters = [
    { value: "clients", label: "Clients", icon: Users },
    { value: "matters", label: "Matters", icon: Briefcase },
    { value: "contracts", label: "Contracts", icon: FileText },
    { value: "high_priority", label: "High Priority", icon: TrendingUp },
    { value: "active", label: "Active", icon: Zap },
    { value: "recent", label: "Recent", icon: Clock },
  ];

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("counselflow_recent_searches");
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Debounced search function
  useEffect(() => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    if (query.length >= 2) {
      searchTimeout.current = setTimeout(() => {
        performSearch(query);
      }, 300);
    } else {
      setResults([]);
    }

    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [query, selectedFilters]);

  const performSearch = async (searchQuery: string) => {
    try {
      setLoading(true);
      const searchResults: SearchResult[] = [];

      // Search clients if not filtered out
      if (!selectedFilters.length || selectedFilters.includes("clients")) {
        try {
          const clientResponse = await apiClient.getClients({ 
            query: searchQuery, 
            limit: 10 
          });
          
          clientResponse.clients.forEach(client => {
            const relevanceScore = calculateRelevance(searchQuery, client.name, client.email);
            if (relevanceScore > 0.3) {
              searchResults.push({
                id: client.id,
                title: client.name,
                subtitle: client.email || client.industry,
                type: "client",
                status: client.status,
                risk_level: client.risk_level,
                relevance_score: relevanceScore,
                created_at: client.created_at,
                data: client
              });
            }
          });
        } catch (error) {
          console.error("Failed to search clients:", error);
        }
      }

      // Search matters if not filtered out
      if (!selectedFilters.length || selectedFilters.includes("matters")) {
        try {
          const matterResponse = await apiClient.getMatters({ 
            search: searchQuery, 
            limit: 10 
          });
          
          matterResponse.matters.forEach(matter => {
            const relevanceScore = calculateRelevance(searchQuery, matter.title, matter.description);
            if (relevanceScore > 0.3) {
              searchResults.push({
                id: matter.id,
                title: matter.title,
                subtitle: matter.matter_number,
                type: "matter",
                status: matter.status,
                priority: matter.priority,
                relevance_score: relevanceScore,
                created_at: matter.created_at,
                data: matter
              });
            }
          });
        } catch (error) {
          console.error("Failed to search matters:", error);
        }
      }

      // Search contracts if not filtered out
      if (!selectedFilters.length || selectedFilters.includes("contracts")) {
        try {
          const contractResponse = await apiClient.getContracts({ 
            search: searchQuery, 
            limit: 10 
          });
          
          contractResponse.contracts.forEach(contract => {
            const relevanceScore = calculateRelevance(searchQuery, contract.title, contract.description);
            if (relevanceScore > 0.3) {
              searchResults.push({
                id: contract.id,
                title: contract.title,
                subtitle: contract.contract_number,
                type: "contract",
                status: contract.status,
                risk_level: contract.risk_level,
                relevance_score: relevanceScore,
                created_at: contract.created_at,
                data: contract
              });
            }
          });
        } catch (error) {
          console.error("Failed to search contracts:", error);
        }
      }

      // Apply additional filters
      let filteredResults = searchResults;

      if (selectedFilters.includes("high_priority")) {
        filteredResults = filteredResults.filter(result => 
          (result.type === "matter" && ["HIGH", "URGENT", "CRITICAL"].includes((result.data as Matter).priority)) ||
          (result.type === "contract" && ["HIGH", "CRITICAL"].includes(result.risk_level || ""))
        );
      }

      if (selectedFilters.includes("active")) {
        filteredResults = filteredResults.filter(result => 
          result.status === "ACTIVE" || result.status === "OPENED"
        );
      }

      if (selectedFilters.includes("recent")) {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        filteredResults = filteredResults.filter(result => 
          new Date(result.created_at) > oneWeekAgo
        );
      }

      // Sort by relevance score and limit results
      filteredResults.sort((a, b) => (b.relevance_score || 0) - (a.relevance_score || 0));
      setResults(filteredResults.slice(0, 20));

    } catch (error) {
      console.error("Search failed:", error);
      toast.error("Search failed");
    } finally {
      setLoading(false);
    }
  };

  // Simple relevance calculation algorithm
  const calculateRelevance = (query: string, title: string, description?: string): number => {
    const queryLower = query.toLowerCase();
    const titleLower = title.toLowerCase();
    const descLower = (description || "").toLowerCase();

    let score = 0;

    // Exact title match gets highest score
    if (titleLower === queryLower) score += 10;
    
    // Title starts with query gets high score
    else if (titleLower.startsWith(queryLower)) score += 8;
    
    // Title contains query gets medium score
    else if (titleLower.includes(queryLower)) score += 5;
    
    // Description contains query gets lower score
    if (descLower.includes(queryLower)) score += 2;

    // Bonus for shorter titles (more specific)
    if (title.length < 50) score += 1;

    // Normalize to 0-1 scale
    return Math.min(score / 10, 1);
  };

  const handleResultSelect = (result: SearchResult) => {
    // Save to recent searches
    const newRecentSearches = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
    setRecentSearches(newRecentSearches);
    localStorage.setItem("counselflow_recent_searches", JSON.stringify(newRecentSearches));

    setOpen(false);
    setQuery("");
    
    if (onResultSelect) {
      onResultSelect(result);
    } else {
      // Default navigation
      const basePath = `/dashboard/${result.type === "client" ? "clients" : result.type + "s"}`;
      window.location.href = `${basePath}?id=${result.id}`;
    }
  };

  const toggleFilter = (filter: string) => {
    setSelectedFilters(prev => 
      prev.includes(filter) 
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  };

  const clearFilters = () => {
    setSelectedFilters([]);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "client": return <Users className="h-4 w-4 text-counselflow-primary" />;
      case "matter": return <Briefcase className="h-4 w-4 text-counselflow-primary" />;
      case "contract": return <FileText className="h-4 w-4 text-counselflow-primary" />;
      default: return null;
    }
  };

  const getStatusColor = (type: string, status?: string, riskLevel?: string) => {
    if (type === "client") {
      switch (status) {
        case "ACTIVE": return "bg-counselflow-success/20 text-counselflow-success";
        case "INACTIVE": return "bg-gray-100 text-gray-700";
        default: return "bg-gray-100 text-gray-700";
      }
    }
    
    if (type === "matter" || type === "contract") {
      switch (status) {
        case "ACTIVE":
        case "OPENED":
        case "EXECUTED":
          return "bg-counselflow-success/20 text-counselflow-success";
        case "DRAFT":
        case "UNDER_REVIEW":
          return "bg-counselflow-warning/20 text-counselflow-warning";
        default: return "bg-gray-100 text-gray-700";
      }
    }

    return "bg-gray-100 text-gray-700";
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={`w-full justify-start text-left font-normal border-counselflow-primary/30 hover:border-counselflow-primary ${className}`}
        >
          <Search className="mr-2 h-4 w-4 text-counselflow-neutral" />
          <span className="text-counselflow-neutral">{placeholder}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[600px] p-0" align="start">
        <Command>
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 text-counselflow-neutral" />
            <CommandInput
              placeholder={placeholder}
              value={query}
              onValueChange={setQuery}
              className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          {/* Filters */}
          <div className="p-3 border-b bg-counselflow-light/10">
            <div className="flex flex-wrap gap-2 mb-2">
              {availableFilters.map((filter) => {
                const Icon = filter.icon;
                const isSelected = selectedFilters.includes(filter.value);
                return (
                  <Button
                    key={filter.value}
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleFilter(filter.value)}
                    className={`h-7 text-xs ${isSelected 
                      ? "bg-counselflow-primary hover:bg-counselflow-dark" 
                      : "border-counselflow-primary/30 hover:bg-counselflow-light/20"
                    }`}
                  >
                    <Icon className="h-3 w-3 mr-1" />
                    {filter.label}
                  </Button>
                );
              })}
            </div>
            {selectedFilters.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-6 px-2 text-xs text-counselflow-neutral hover:text-counselflow-dark"
              >
                <X className="h-3 w-3 mr-1" />
                Clear filters
              </Button>
            )}
          </div>

          <CommandList className="max-h-[400px]">
            {loading && (
              <div className="flex items-center justify-center py-6">
                <div className="flex items-center space-x-2">
                  <Brain className="h-4 w-4 animate-pulse text-counselflow-primary" />
                  <span className="text-sm text-counselflow-neutral">Searching with AI...</span>
                </div>
              </div>
            )}

            {!loading && query.length >= 2 && results.length === 0 && (
              <CommandEmpty className="py-6 text-center text-sm text-counselflow-neutral">
                No results found for "{query}"
              </CommandEmpty>
            )}

            {!loading && query.length < 2 && recentSearches.length > 0 && (
              <CommandGroup heading="Recent Searches">
                {recentSearches.map((recentQuery, index) => (
                  <CommandItem
                    key={index}
                    onSelect={() => setQuery(recentQuery)}
                    className="flex items-center space-x-2 cursor-pointer"
                  >
                    <Clock className="h-4 w-4 text-counselflow-neutral" />
                    <span>{recentQuery}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {!loading && results.length > 0 && (
              <CommandGroup heading={`Results (${results.length})`}>
                {results.map((result) => (
                  <CommandItem
                    key={`${result.type}-${result.id}`}
                    onSelect={() => handleResultSelect(result)}
                    className="flex items-center space-x-3 cursor-pointer p-3 hover:bg-counselflow-light/10"
                  >
                    <div className="flex-shrink-0">
                      {getTypeIcon(result.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-counselflow-dark truncate">
                          {result.title}
                        </p>
                        {result.relevance_score && result.relevance_score > 0.8 && (
                          <Brain className="h-3 w-3 text-counselflow-bright" title="High relevance match" />
                        )}
                      </div>
                      {result.subtitle && (
                        <p className="text-xs text-counselflow-neutral truncate">
                          {result.subtitle}
                        </p>
                      )}
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {result.type}
                        </Badge>
                        {result.status && (
                          <Badge 
                            className={`text-xs ${getStatusColor(result.type, result.status, result.risk_level)}`}
                          >
                            {result.status.replace(/_/g, ' ')}
                          </Badge>
                        )}
                        {result.priority && ["HIGH", "URGENT", "CRITICAL"].includes(result.priority) && (
                          <Badge className="text-xs bg-orange-100 text-orange-700">
                            {result.priority}
                          </Badge>
                        )}
                        {result.risk_level && ["HIGH", "CRITICAL"].includes(result.risk_level) && (
                          <Badge className="text-xs bg-red-100 text-red-700">
                            Risk: {result.risk_level}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex-shrink-0">
                      <ArrowRight className="h-4 w-4 text-counselflow-neutral" />
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {!loading && query.length >= 2 && results.length === 0 && (
              <div className="py-6 text-center">
                <p className="text-sm text-counselflow-neutral mb-2">
                  No results found. Try:
                </p>
                <ul className="text-xs text-counselflow-neutral space-y-1">
                  <li>• Using different keywords</li>
                  <li>• Checking spelling</li>
                  <li>• Removing filters</li>
                  <li>• Searching for partial matches</li>
                </ul>
              </div>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export default GlobalSearch;