/**
 * FocusBackdrop - Semi-transparent overlay for Focus Mode
 *
 * Provides visual separation between the focus panel and underlying content.
 * Clicking the backdrop dismisses the panel.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface FocusBackdropProps {
  onClick: () => void;
  className?: string;
}

export function FocusBackdrop({ onClick, className }: FocusBackdropProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className={cn(
        'fixed inset-0 z-40',
        'bg-black/30',
        'cursor-pointer',
        className
      )}
      aria-label="Close focus panel"
      role="button"
      tabIndex={-1}
    />
  );
}

export default FocusBackdrop;
