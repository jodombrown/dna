import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode } from 'react';

interface PoofAnimationProps {
  children: ReactNode;
  isVisible: boolean;
  onExitComplete?: () => void;
  className?: string;
}

/**
 * PoofAnimation - Wraps content with a subtle "poof" exit animation
 * 
 * Usage:
 * const [isVisible, setIsVisible] = useState(true);
 * 
 * const handleDelete = () => {
 *   setIsVisible(false); // Triggers poof animation
 * };
 * 
 * <PoofAnimation 
 *   isVisible={isVisible} 
 *   onExitComplete={() => actualDeleteLogic()}
 * >
 *   <YourContent />
 * </PoofAnimation>
 */
export function PoofAnimation({ 
  children, 
  isVisible, 
  onExitComplete,
  className = ''
}: PoofAnimationProps) {
  return (
    <AnimatePresence mode="popLayout" onExitComplete={onExitComplete}>
      {isVisible && (
        <motion.div
          className={className}
          initial={{ opacity: 1, scale: 1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{
            opacity: 0,
            scale: 0.8,
            filter: 'blur(4px)',
            transition: {
              duration: 0.25,
              ease: [0.4, 0, 0.2, 1]
            }
          }}
          layout
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * usePoofDelete - Hook for managing poof delete animations
 * 
 * Usage:
 * const { visibleItems, triggerPoof } = usePoofDelete(items, 'id');
 * 
 * const handleDelete = (id: string) => {
 *   triggerPoof(id, () => actualDeleteMutation(id));
 * };
 */
import { useState, useCallback } from 'react';

export function usePoofDelete<T extends { id: string }>(
  items: T[],
  onDeleteComplete?: (id: string) => void
) {
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());

  const triggerPoof = useCallback((id: string, deleteCallback?: () => void) => {
    // Hide the item (triggers animation)
    setHiddenIds(prev => new Set(prev).add(id));
    
    // After animation completes, run the actual delete
    setTimeout(() => {
      deleteCallback?.();
      onDeleteComplete?.(id);
      // Clean up hidden ID after delete
      setHiddenIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 250); // Match animation duration
  }, [onDeleteComplete]);

  const isVisible = useCallback((id: string) => !hiddenIds.has(id), [hiddenIds]);

  return { triggerPoof, isVisible, hiddenIds };
}
