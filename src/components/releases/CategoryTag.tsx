/**
 * CategoryTag Component
 * Displays Five C's category tags for releases (CONNECT, CONVENE, etc.)
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { CATEGORY_CONFIG, type ReleaseCategory, type CategoryTagProps } from '@/types/releases';

export const CategoryTag: React.FC<CategoryTagProps> = ({
  category,
  showIcon = true,
  size = 'md',
  className,
}) => {
  const config = CATEGORY_CONFIG[category];

  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-[10px] gap-0.5',
    md: 'px-2 py-0.5 text-xs gap-1',
    lg: 'px-3 py-1 text-sm gap-1.5',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full',
        config.bgColor,
        config.color,
        sizeClasses[size],
        className
      )}
    >
      {showIcon && <span className="flex-shrink-0">{config.icon}</span>}
      <span>{config.label}</span>
    </span>
  );
};

/**
 * CategoryButton Component
 * Interactive button variant for filtering by category
 */
export interface CategoryButtonProps {
  category: ReleaseCategory;
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
}

export const CategoryButton: React.FC<CategoryButtonProps> = ({
  category,
  isActive = false,
  onClick,
  className,
}) => {
  const config = CATEGORY_CONFIG[category];

  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full transition-all',
        'border border-transparent',
        'hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2',
        isActive
          ? cn(config.bgColor, config.color, 'ring-2 ring-offset-2')
          : cn('bg-gray-100 text-gray-600 hover:bg-gray-200'),
        className
      )}
    >
      <span>{config.icon}</span>
      <span>{config.label}</span>
    </button>
  );
};

export default CategoryTag;
