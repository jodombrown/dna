/**
 * ComposerFooter — Contextual submit button with C-module accent colors
 *
 * Per PRD Section 7.3:
 * - Post: "Share" in DNA Emerald
 * - Story: "Publish" in Deep Teal
 * - Event: "Create Event" in Warm Amber-Gold
 * - Space: "Launch Space" in Forest Green
 * - Opportunity: "Post Opportunity" in Copper
 * - Submitting: dimmed + spinner
 * - Validation error: shake animation + error toast
 */

import { Button } from '@/components/ui/button';
import { ComposerMode } from '@/hooks/useUniversalComposer';
import { Loader2, Save } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ComposerFooterProps {
  mode: ComposerMode;
  isSubmitting: boolean;
  isValid: boolean;
  validationMessage?: string | null;
  onCancel: () => void;
  onSubmit: () => void;
}

/** C-module accent background colors for each mode's submit button */
const MODE_BUTTON_COLORS: Record<string, string> = {
  post: 'bg-[#4A8D77] hover:bg-[#3d7a66]',        // DNA Emerald
  story: 'bg-[#2A7A8C] hover:bg-[#236879]',       // Deep Teal
  event: 'bg-[#C4942A] hover:bg-[#a87e24]',       // Warm Amber-Gold
  space: 'bg-[#2D5A3D] hover:bg-[#244a32]',       // Forest Green
  need: 'bg-[#B87333] hover:bg-[#9e632c]',        // Copper
};

export const ComposerFooter = ({
  mode,
  isSubmitting,
  isValid,
  validationMessage,
  onCancel,
  onSubmit,
}: ComposerFooterProps) => {
  const accentClass = MODE_BUTTON_COLORS[mode] || MODE_BUTTON_COLORS.post;

  return (
    <div className="space-y-2 pt-4 border-t">
      {/* Validation message */}
      {!isValid && validationMessage && (
        <p className="text-sm text-amber-600 dark:text-amber-400 text-center">
          {validationMessage}
        </p>
      )}

      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>

        <Button
          onClick={onSubmit}
          disabled={!isValid || isSubmitting}
          className={cn(
            'text-white min-w-[140px]',
            accentClass,
            !isValid && 'opacity-50',
            isSubmitting && 'opacity-70'
          )}
        >
          {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {getSubmitLabel(mode, isSubmitting)}
        </Button>
      </div>
    </div>
  );
};

function getSubmitLabel(mode: ComposerMode, isSubmitting: boolean): string {
  if (isSubmitting) {
    switch (mode) {
      case 'post': return 'Sharing...';
      case 'story': return 'Publishing...';
      case 'event': return 'Creating...';
      case 'need': return 'Posting...';
      case 'space': return 'Launching...';
      case 'community': return 'Sharing...';
      default: return 'Submitting...';
    }
  }

  switch (mode) {
    case 'post': return 'Share';
    case 'story': return 'Publish';
    case 'event': return 'Create Event';
    case 'need': return 'Post Opportunity';
    case 'space': return 'Launch Space';
    case 'community': return 'Share to Community';
    default: return 'Submit';
  }
}
