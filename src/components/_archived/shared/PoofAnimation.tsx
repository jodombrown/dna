import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode } from 'react';

interface CollapseAnimationProps {
  children: ReactNode;
  isVisible: boolean;
  onExitComplete?: () => void;
  className?: string;
}

/**
 * CollapseAnimation - Wraps content with a collapse + fade exit animation
 * 
 * Usage:
 * const [isVisible, setIsVisible] = useState(true);
 * 
 * const handleDelete = () => {
 *   setIsVisible(false); // Triggers collapse animation
 * };
 * 
 * <CollapseAnimation 
 *   isVisible={isVisible} 
 *   onExitComplete={() => actualDeleteLogic()}
 * >
 *   <YourContent />
 * </CollapseAnimation>
 */
export function PoofAnimation({ 
  children, 
  isVisible, 
  onExitComplete,
  className = ''
}: CollapseAnimationProps) {
  return (
    <AnimatePresence mode="popLayout" onExitComplete={onExitComplete}>
      {isVisible && (
        <motion.div
          className={className}
          initial={{ opacity: 1, height: 'auto' }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{
            opacity: 0,
            height: 0,
            marginTop: 0,
            marginBottom: 0,
            paddingTop: 0,
            paddingBottom: 0,
          }}
          transition={{
            duration: 0.25,
            ease: [0.4, 0, 0.2, 1],
          }}
          style={{ overflow: 'hidden' }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * usePoofDelete - Hook for managing collapse delete animations
 * (Name kept for backwards compatibility)
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
