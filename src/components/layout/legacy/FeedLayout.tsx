/**
 * DEPRECATED: FeedLayout - Legacy Layout Component
 * 
 * ⚠️ DO NOT USE THIS LAYOUT FOR NEW /dna/* ROUTES ⚠️
 * 
 * This layout component is deprecated and should NOT be used for any /dna/* routes.
 * All new and refactored /dna/* pages should use LayoutController with ViewStateContext.
 * 
 * Migration path:
 * - Replace FeedLayout with LayoutController
 * - Define ViewState in ViewStateContext
 * - Use LeftNav, RightWidgets, or null for columns as needed
 * 
 * This file is kept only for:
 * - Backwards compatibility with non-/dna routes
 * - Reference during migration
 * - Legacy admin pages (if any)
 */

import React from 'react';
import UnifiedHeader from '@/components/UnifiedHeader';
import Footer from '@/components/Footer';

interface FeedLayoutProps {
  children: React.ReactNode;
}

export const FeedLayout: React.FC<FeedLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <UnifiedHeader />
      <main className="flex-1 w-full">
        {children}
      </main>
      <Footer />
    </div>
  );
};
