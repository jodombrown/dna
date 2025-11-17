import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ComposerMode, ComposerContext } from '@/hooks/useUniversalComposer';
import { ComposerModeSelector } from './ComposerModeSelector';
import { ComposerBody } from './ComposerBody';
import { ComposerFooter } from './ComposerFooter';
import { useState } from 'react';
import { ComposerFormData } from '@/hooks/useUniversalComposer';

interface UniversalComposerProps {
  isOpen: boolean;
  mode: ComposerMode;
  context: ComposerContext;
  isSubmitting: boolean;
  onClose: () => void;
  onModeChange: (mode: ComposerMode) => void;
  onSubmit: (formData: ComposerFormData) => void;
}

export const UniversalComposer = ({
  isOpen,
  mode,
  context,
  isSubmitting,
  onClose,
  onModeChange,
  onSubmit,
}: UniversalComposerProps) => {
  const [formData, setFormData] = useState<ComposerFormData>({
    content: '',
  });

  const handleSubmit = () => {
    onSubmit(formData);
    // Reset form
    setFormData({ content: '' });
  };

  const updateFormData = (updates: Partial<ComposerFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const isValid = () => {
    if (!formData.content.trim()) return false;
    
    switch (mode) {
      case 'event':
        return !!formData.title && !!formData.eventDate;
      case 'need':
        return !!formData.title && !!context.spaceId;
      case 'space':
        return !!formData.title;
      case 'story':
        return !!formData.title;
      default:
        return true;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            Share something with the diaspora
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            {getSubheader(mode)}
          </p>
        </DialogHeader>

        <div className="space-y-6">
          <ComposerModeSelector
            currentMode={mode}
            onModeChange={onModeChange}
            context={context}
          />

          <ComposerBody
            mode={mode}
            formData={formData}
            context={context}
            onChange={updateFormData}
          />

          <ComposerFooter
            mode={mode}
            isSubmitting={isSubmitting}
            isValid={isValid()}
            onCancel={onClose}
            onSubmit={handleSubmit}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

function getSubheader(mode: ComposerMode): string {
  switch (mode) {
    case 'post': return "What's on your mind?";
    case 'story': return 'Tell a longer narrative';
    case 'event': return 'Host something for the community';
    case 'need': return 'Ask for help or offer support';
    case 'space': return 'Start a space or project';
    case 'community': return 'Share with your community';
    default: return '';
  }
}
