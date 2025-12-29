import React from 'react';
import { cn } from '@/lib/utils';
import { Sparkles, Clock, Archive } from 'lucide-react';

type BadgeStatus = 'new' | 'recent' | 'archived';

interface StatusBadgeProps {
  status: BadgeStatus;
  className?: string;
}

const statusConfig: Record<BadgeStatus, { label: string; className: string; icon: React.ReactNode }> = {
  new: {
    label: 'NEW',
    className: 'bg-dna-gold text-dna-charcoal',
    icon: <Sparkles className="w-3 h-3" />,
  },
  recent: {
    label: 'RECENT',
    className: 'bg-dna-emerald text-white',
    icon: <Clock className="w-3 h-3" />,
  },
  archived: {
    label: 'ARCHIVED',
    className: 'bg-slate-500 text-white',
    icon: <Archive className="w-3 h-3" />,
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const config = statusConfig[status];
  
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold tracking-wider rounded-md uppercase',
        config.className,
        className
      )}
    >
      {config.icon}
      {config.label}
    </span>
  );
};
