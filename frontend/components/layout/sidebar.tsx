"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Users,
  Briefcase,
  FileText,
  CheckSquare,
  FolderOpen,
  BarChart3,
  Brain,
  Settings,
  Home,
  Building2,
  Scale,
  Bot,
  FileSearch,
  Shield,
  ShieldCheck,
  Gavel,
  Lightbulb,
  UserCheck,
  Zap,
} from "lucide-react";

const coreModules = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Clients", href: "/clients", icon: Users },
  { name: "Matters", href: "/matters", icon: Briefcase },
  { name: "Contracts", href: "/contracts", icon: FileText },
  { name: "Documents", href: "/documents", icon: FolderOpen },
];

const legalSpecialties = [
  { name: "Intellectual Property", href: "/ip", icon: Lightbulb },
  { name: "Litigation & Disputes", href: "/litigation", icon: Gavel },
  { name: "Data Privacy & PIA", href: "/privacy", icon: Shield },
  { name: "Risk & Compliance", href: "/compliance", icon: ShieldCheck },
];

const aiServices = [
  { name: "Contract Analysis", href: "/ai/contract-analysis", icon: FileSearch },
  { name: "Document Generator", href: "/ai/document-generator", icon: Bot },
  { name: "Legal Research", href: "/ai/legal-research", icon: Brain },
  { name: "AI Orchestrator", href: "/ai/orchestrator", icon: Zap },
];

const adminServices = [
  { name: "Tasks & Workflows", href: "/tasks", icon: CheckSquare },
  { name: "Analytics & Reports", href: "/analytics", icon: BarChart3 },
  { name: "User Management", href: "/admin/users", icon: UserCheck },
];

interface SidebarProps {
  className?: string;
  onItemClick?: () => void;
}

export function Sidebar({ className, onItemClick }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div className={cn("flex h-full w-64 flex-col bg-card border-r", className)}>
      {/* Logo */}
      <div className="flex h-16 items-center px-6">
        <div className="flex items-center space-x-2">
          <Scale className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold">CounselFlow</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
        {/* Core Modules */}
        <div className="space-y-1">
          <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Core Practice
          </h3>
          {coreModules.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onItemClick}
                className={cn(
                  "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                {item.name}
              </Link>
            );
          })}
        </div>

        {/* Legal Specialties */}
        <div className="pt-4">
          <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Legal Specialties
          </h3>
          <div className="space-y-1">
            {legalSpecialties.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onItemClick}
                  className={cn(
                    "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>

        {/* AI Services Section */}
        <div className="pt-4">
          <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            AI Services
          </h3>
          <div className="space-y-1">
            {aiServices.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onItemClick}
                  className={cn(
                    "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Administration */}
        <div className="pt-4">
          <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Administration
          </h3>
          <div className="space-y-1">
            {adminServices.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onItemClick}
                  className={cn(
                    "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Settings */}
        <div className="pt-4">
          <Link
            href="/settings"
            onClick={onItemClick}
            className={cn(
              "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
              pathname === "/settings"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <Settings className="mr-3 h-5 w-5 flex-shrink-0" />
            Settings
          </Link>
        </div>
      </nav>
    </div>
  );
}