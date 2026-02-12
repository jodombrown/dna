/**
 * DraftIndicator — Shows when a draft has been auto-saved
 *
 * Per PRD Section 2.1:
 * - Appears briefly after auto-save
 * - Subtle, non-intrusive indicator
 */

import { Save } from 'lucide-react';

export const DraftIndicator = () => {
  return (
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground animate-in fade-in duration-300">
      <Save className="h-3 w-3" />
      <span>Draft saved</span>
    </div>
  );
};
