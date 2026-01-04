// src/components/hubs/shared/HubSubNav.tsx
// Sub-navigation tabs for Five C hub pages

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { LucideIcon } from 'lucide-react';

export interface SubNavTab {
  label: string;
  path: string;
  icon?: LucideIcon;
  badge?: number;
}

interface HubSubNavProps {
  tabs: SubNavTab[];
  basePath?: string;
  className?: string;
}

export function HubSubNav({ tabs, basePath, className }: HubSubNavProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => {
    // Exact match for hub index route
    if (path === basePath && location.pathname === basePath) {
      return true;
    }
    // Check if current path starts with tab path (for nested routes)
    return location.pathname === path || 
      (path !== basePath && location.pathname.startsWith(path));
  };

  return (
    <div className={cn('w-full', className)}>
      {/* Desktop: Horizontal tabs */}
      <div className="hidden md:flex items-center gap-1 p-1 bg-muted rounded-lg overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap',
              'transition-all duration-200',
              isActive(tab.path)
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
            )}
          >
            {tab.icon && <tab.icon className="w-4 h-4" />}
            {tab.label}
            {tab.badge !== undefined && tab.badge > 0 && (
              <Badge
                variant={isActive(tab.path) ? 'default' : 'secondary'}
                className="ml-1 px-1.5 py-0 text-xs min-w-[20px] h-5"
              >
                {tab.badge > 99 ? '99+' : tab.badge}
              </Badge>
            )}
          </button>
        ))}
      </div>

      {/* Mobile: Horizontal scroll with underline style */}
      <div className="md:hidden overflow-x-auto scrollbar-hide -mx-4 px-4">
        <div className="flex items-center gap-1 min-w-min border-b border-border">
          {tabs.map((tab) => (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={cn(
                'flex items-center gap-2 px-3 py-3 text-sm font-medium whitespace-nowrap',
                'relative transition-colors duration-200',
                isActive(tab.path)
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {tab.icon && <tab.icon className="w-4 h-4" />}
              {tab.label}
              {tab.badge !== undefined && tab.badge > 0 && (
                <Badge
                  variant={isActive(tab.path) ? 'default' : 'secondary'}
                  className="ml-1 px-1.5 py-0 text-xs min-w-[20px] h-5"
                >
                  {tab.badge > 99 ? '99+' : tab.badge}
                </Badge>
              )}
              {/* Underline indicator */}
              {isActive(tab.path) && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default HubSubNav;
