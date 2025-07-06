"use client";

import React, { useState, memo, useCallback, Suspense } from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { cn } from "@/lib/utils";
import { useFeatureFlag, useRenderMetrics, useCleanup } from "@/lib/performance";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy load the chatbot to reduce initial bundle size
const LazyChatbotTrigger = React.lazy(() => 
  import("@/components/ai/legal-chatbot").then(module => ({
    default: module.ChatbotTrigger
  }))
);

interface LayoutProps {
  children: React.ReactNode;
}

// Memoized mobile sidebar overlay
const MobileSidebarOverlay = memo<{
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}>(({ isOpen, onClose, children }) => {
  // Handle escape key
  useCleanup(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when sidebar is open
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex md:hidden">
      <div
        className="fixed inset-0 bg-black/50 transition-opacity duration-200"
        onClick={onClose}
        aria-label="Close sidebar"
      />
      <div className="relative flex w-64 flex-col bg-background shadow-xl transform transition-transform duration-200">
        {children}
      </div>
    </div>
  );
});
MobileSidebarOverlay.displayName = 'MobileSidebarOverlay';

// Main layout component with performance optimizations
export const Layout = memo<LayoutProps>(({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Feature flags for conditional loading
  const enableChatbot = useFeatureFlag('chatbot', true);
  const enableAnimations = useFeatureFlag('animations', true);
  
  // Performance monitoring in development
  useRenderMetrics('Layout');
  
  // Memoized callbacks to prevent unnecessary re-renders
  const handleSidebarToggle = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);
  
  const handleSidebarClose = useCallback(() => {
    setSidebarOpen(false);
  }, []);
  
  const handleSidebarItemClick = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  return (
    <div className={cn(
      "flex h-screen bg-background",
      enableAnimations && "transition-colors duration-200"
    )}>
      {/* Desktop sidebar - always rendered for better performance */}
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      {/* Mobile sidebar - conditionally rendered */}
      <MobileSidebarOverlay isOpen={sidebarOpen} onClose={handleSidebarClose}>
        <Sidebar onItemClick={handleSidebarItemClick} />
      </MobileSidebarOverlay>

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header with memoized click handler */}
        <Header onMenuClick={handleSidebarToggle} />
        
        {/* Main content with optimized scrolling */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-muted/10">
          <div className="container mx-auto px-6 py-8">
            {children}
          </div>
        </main>
      </div>

      {/* Conditionally render AI chatbot */}
      {enableChatbot && (
        <Suspense 
          fallback={
            <div className="fixed bottom-4 right-4 z-50">
              <Skeleton className="h-12 w-12 rounded-full" />
            </div>
          }
        >
          <LazyChatbotTrigger />
        </Suspense>
      )}
    </div>
  );
});
Layout.displayName = 'Layout';