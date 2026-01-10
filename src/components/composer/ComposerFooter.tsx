import { Button } from '@/components/ui/button';
import { ComposerMode } from '@/hooks/useUniversalComposer';
import { Loader2 } from 'lucide-react';

interface ComposerFooterProps {
  mode: ComposerMode;
  isSubmitting: boolean;
  isValid: boolean;
  validationMessage?: string | null;
  onCancel: () => void;
  onSubmit: () => void;
}

export const ComposerFooter = ({
  mode,
  isSubmitting,
  isValid,
  validationMessage,
  onCancel,
  onSubmit,
}: ComposerFooterProps) => {
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
      case 'post': return 'Posting...';
      case 'story': return 'Publishing...';
      case 'event': return 'Creating...';
      case 'need': return 'Adding...';
      case 'space': return 'Starting...';
      case 'community': return 'Sharing...';
      default: return 'Submitting...';
    }
  }

  switch (mode) {
    case 'post': return 'Post';
    case 'story': return 'Publish Story';
    case 'event': return 'Create Event';
    case 'need': return 'Add Need';
    case 'space': return 'Start Space';
    case 'community': return 'Share to Community';
    default: return 'Submit';
  }
}
