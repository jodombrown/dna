import React from 'react';
import { motion } from 'framer-motion';
import { SlidersHorizontal, MapPin, Briefcase, Target, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FilterState {
  country_of_origin?: string;
  current_country?: string;
  focus_areas?: string[];
  regional_expertise?: string[];
  industries?: string[];
  skills?: string[];
}

interface DiscoverFilterPillsProps {
  filters: FilterState;
  onOpenSheet: () => void;
  activeCount: number;
}

interface PillConfig {
  id: string;
  label: string;
  icon: React.ReactNode;
  getCount: (filters: FilterState) => number;
}

const pillConfigs: PillConfig[] = [
  {
    id: 'focus_areas',
    label: 'Focus Areas',
    icon: <Target className="h-3.5 w-3.5" />,
    getCount: (filters) => filters.focus_areas?.length || 0,
  },
  {
    id: 'industries',
    label: 'Industries',
    icon: <Briefcase className="h-3.5 w-3.5" />,
    getCount: (filters) => filters.industries?.length || 0,
  },
  {
    id: 'country_of_origin',
    label: 'Origin',
    icon: <Globe className="h-3.5 w-3.5" />,
    getCount: (filters) => (filters.country_of_origin ? 1 : 0),
  },
  {
    id: 'current_country',
    label: 'Location',
    icon: <MapPin className="h-3.5 w-3.5" />,
    getCount: (filters) => (filters.current_country ? 1 : 0),
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const pillVariants = {
  hidden: { opacity: 0, x: -10, scale: 0.9 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 25,
    },
  },
};

export const DiscoverFilterPills: React.FC<DiscoverFilterPillsProps> = ({
  filters,
  onOpenSheet,
  activeCount,
}) => {
  // Check for reduced motion preference
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (
    <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
      <motion.div
        className="flex gap-2 pb-1"
        variants={prefersReducedMotion ? undefined : containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* All Filters Pill */}
        <motion.button
          variants={prefersReducedMotion ? undefined : pillVariants}
          onClick={onOpenSheet}
          className={cn(
            'flex items-center gap-1.5 px-3 py-2 rounded-full',
            'text-xs font-medium whitespace-nowrap',
            'border transition-all duration-200',
            'active:scale-95',
            activeCount > 0
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-muted/50 text-muted-foreground border-border/50 hover:bg-muted'
          )}
          aria-label={`Open filters${activeCount > 0 ? `, ${activeCount} active` : ''}`}
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          <span>Filters</span>
          {activeCount > 0 && (
            <span className="flex items-center justify-center h-4 w-4 rounded-full bg-primary-foreground/20 text-[10px] font-semibold">
              {activeCount}
            </span>
          )}
        </motion.button>

        {/* Category Pills */}
        {pillConfigs.map((config) => {
          const count = config.getCount(filters);
          const isActive = count > 0;

          return (
            <motion.button
              key={config.id}
              variants={prefersReducedMotion ? undefined : pillVariants}
              onClick={onOpenSheet}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 rounded-full',
                'text-xs font-medium whitespace-nowrap',
                'border transition-all duration-200',
                'active:scale-95',
                isActive
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-muted/50 text-muted-foreground border-border/50 hover:bg-muted'
              )}
              aria-label={`${config.label}${isActive ? `, ${count} selected` : ''}`}
            >
              {config.icon}
              <span>{config.label}</span>
              {isActive && (
                <span className="flex items-center justify-center h-4 w-4 rounded-full bg-primary-foreground/20 text-[10px] font-semibold">
                  {count}
                </span>
              )}
            </motion.button>
          );
        })}
      </motion.div>
    </div>
  );
};
