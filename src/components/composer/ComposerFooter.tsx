import { Button } from '@/components/ui/button';
import { ComposerMode } from '@/hooks/useUniversalComposer';
import { Loader2 } from 'lucide-react';

interface ComposerFooterProps {
  mode: ComposerMode;
  isSubmitting: boolean;
  isValid: boolean;
  onCancel: () => void;
  onSubmit: () => void;
}

export const ComposerFooter = ({
  mode,
  isSubmitting,
  isValid,
  onCancel,
  onSubmit,
}: ComposerFooterProps) => {
  return (
    <div className="flex items-center justify-between pt-4 border-t">
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
