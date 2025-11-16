/**
 * DEPRECATED: UserDashboardLayout - Legacy Layout Component
 * 
 * ⚠️ DO NOT USE THIS LAYOUT FOR NEW /dna/* ROUTES ⚠️
 * 
 * This layout component is deprecated and should NOT be used for any /dna/* routes.
 * All new and refactored /dna/* pages should use LayoutController with ViewStateContext.
 * 
 * Migration path:
 * - Replace UserDashboardLayout with LayoutController
 * - Define ViewState in ViewStateContext
 * - Use LeftNav and DashboardModules for columns
 * 
 * This file is kept only for backwards compatibility with legacy user profile pages.
 */

import React, { ReactNode } from 'react';
import UnifiedHeader from '@/components/UnifiedHeader';
import { LeftNav } from '../columns/LeftNav';
import { RightWidgets } from '../columns/RightWidgets';

interface UserDashboardLayoutProps {
  children: ReactNode;
  rightColumn?: ReactNode;
}

export const UserDashboardLayout: React.FC<UserDashboardLayoutProps> = ({ 
  children,
  rightColumn 
}) => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <UnifiedHeader />
      <div className="flex-1 flex">
        {/* Left Nav */}
        <aside className="hidden lg:block w-[15%] border-r border-border sticky top-0 h-screen overflow-y-auto">
          <LeftNav />
        </aside>
        
        {/* Main Content */}
        <main className="flex-1 w-full lg:w-[70%] overflow-y-auto">
          {children}
        </main>
        
        {/* Right Column */}
        <aside className="hidden xl:block w-[15%] border-l border-border sticky top-0 h-screen overflow-y-auto p-4">
          {rightColumn || <RightWidgets />}
        </aside>
      </div>
    </div>
  );
};
