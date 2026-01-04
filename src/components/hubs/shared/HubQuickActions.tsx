// src/components/hubs/shared/HubQuickActions.tsx
// Quick action cards grid for Five C hub pages

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface QuickAction {
  label: string;
  description: string;
  icon: LucideIcon;
  onClick: () => void;
  variant?: 'primary' | 'default';
}

interface HubQuickActionsProps {
  actions: QuickAction[];
  className?: string;
}

export function HubQuickActions({ actions, className }: HubQuickActionsProps) {
  return (
    <div className={cn('grid grid-cols-2 md:grid-cols-4 gap-3', className)}>
      {actions.map((action, index) => (
        <button
          key={index}
          onClick={action.onClick}
          className={cn(
            'group flex flex-col items-center p-4 sm:p-5 rounded-xl',
            'border transition-all duration-200',
            'text-center min-h-[120px] sm:min-h-[140px]',
            action.variant === 'primary'
              ? 'bg-primary text-primary-foreground border-primary hover:bg-primary/90'
              : 'bg-card border-border hover:border-primary hover:bg-primary/5'
          )}
        >
          <div
            className={cn(
              'flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl mb-3',
              action.variant === 'primary'
                ? 'bg-primary-foreground/20'
                : 'bg-primary/10 group-hover:bg-primary/20'
            )}
          >
            <action.icon
              className={cn(
                'w-5 h-5 sm:w-6 sm:h-6',
                action.variant === 'primary'
                  ? 'text-primary-foreground'
                  : 'text-primary'
              )}
            />
          </div>
          <span
            className={cn(
              'font-semibold text-sm sm:text-base mb-1',
              action.variant === 'primary'
                ? 'text-primary-foreground'
                : 'text-foreground'
            )}
          >
            {action.label}
          </span>
          <span
            className={cn(
              'text-xs leading-tight',
              action.variant === 'primary'
                ? 'text-primary-foreground/80'
                : 'text-muted-foreground'
            )}
          >
            {action.description}
          </span>
        </button>
      ))}
    </div>
  );
}

export default HubQuickActions;
