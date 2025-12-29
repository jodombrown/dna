import React from 'react';
import { cn } from '@/lib/utils';
import { Users, Calendar, Handshake, Briefcase, Megaphone, Settings } from 'lucide-react';
import type { ReleaseCategory } from '@/hooks/useReleases';

interface CategoryConfig {
  color: string;
  bgColor: string;
  borderColor: string;
  icon: React.ReactNode;
  label: string;
}

const categories: Record<ReleaseCategory, CategoryConfig> = {
  CONNECT: {
    color: 'text-dna-emerald',
    bgColor: 'bg-dna-emerald/15',
    borderColor: 'border-dna-emerald/30',
    icon: <Users className="w-3.5 h-3.5" />,
    label: 'Connect',
  },
  CONVENE: {
    color: 'text-dna-copper',
    bgColor: 'bg-dna-copper/15',
    borderColor: 'border-dna-copper/30',
    icon: <Calendar className="w-3.5 h-3.5" />,
    label: 'Convene',
  },
  COLLABORATE: {
    color: 'text-dna-gold',
    bgColor: 'bg-dna-gold/15',
    borderColor: 'border-dna-gold/30',
    icon: <Handshake className="w-3.5 h-3.5" />,
    label: 'Collaborate',
  },
  CONTRIBUTE: {
    color: 'text-dna-forest',
    bgColor: 'bg-dna-forest/15',
    borderColor: 'border-dna-forest/30',
    icon: <Briefcase className="w-3.5 h-3.5" />,
    label: 'Contribute',
  },
  CONVEY: {
    color: 'text-dna-earth',
    bgColor: 'bg-dna-earth/15',
    borderColor: 'border-dna-earth/30',
    icon: <Megaphone className="w-3.5 h-3.5" />,
    label: 'Convey',
  },
  PLATFORM: {
    color: 'text-slate-600',
    bgColor: 'bg-slate-100',
    borderColor: 'border-slate-300',
    icon: <Settings className="w-3.5 h-3.5" />,
    label: 'Platform',
  },
};

interface CategoryTagProps {
  category: ReleaseCategory;
  className?: string;
  showIcon?: boolean;
}

export const CategoryTag: React.FC<CategoryTagProps> = ({ 
  category, 
  className,
  showIcon = true 
}) => {
  const config = categories[category];
  
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border',
        config.color,
        config.bgColor,
        config.borderColor,
        className
      )}
    >
      {showIcon && config.icon}
      {config.label}
    </span>
  );
};

export const getCategoryConfig = (category: ReleaseCategory) => categories[category];
