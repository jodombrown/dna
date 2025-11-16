/**
 * DEPRECATED: LinkedInLayout - Legacy Layout Component
 * 
 * ⚠️ DO NOT USE THIS LAYOUT FOR NEW /dna/* ROUTES ⚠️
 * 
 * This layout component is deprecated and should NOT be used for any /dna/* routes.
 * All new and refactored /dna/* pages should use LayoutController with ViewStateContext.
 * 
 * This file is kept only for reference. If you need a LinkedIn-style layout,
 * configure it through ViewStateContext → LayoutController.
 */

import React from 'react';
import UnifiedHeader from '@/components/UnifiedHeader';

interface LinkedInLayoutProps {
  children: React.ReactNode;
}

export const LinkedInLayout: React.FC<LinkedInLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <UnifiedHeader />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
};
