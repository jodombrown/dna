import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ComposerMode, ComposerContext, ComposerFormData } from '@/hooks/useUniversalComposer';
import { ComposerModeSelector } from './ComposerModeSelector';
import { ComposerBody } from './ComposerBody';
import { ComposerFooter } from './ComposerFooter';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Hash, Calendar, Users, Building2 } from 'lucide-react';
import { useMobile } from '@/hooks/useMobile';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

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
  const { isMobile } = useMobile();

  const handleSubmit = () => {
    onSubmit(formData);
    // Reset form
    setFormData({ content: '' });
  };

  const updateFormData = (updates: Partial<ComposerFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const getValidationMessage = (): string | null => {
    switch (mode) {
      case 'event':
        if (!formData.title || formData.title.length < 10) return 'Event title must be at least 10 characters';
        if (!formData.eventDate) return 'Please select an event date';
        if (!formData.content || formData.content.length < 50) return 'Description must be at least 50 characters';
        if ((formData.format === 'in_person' || !formData.format) && !formData.location) return 'Please add a location for in-person events';
        if ((formData.format === 'virtual' || formData.format === 'hybrid') && !formData.meetingUrl) return 'Please add a meeting link';
        return null;
      case 'need':
        if (!formData.title) return 'Please add a title';
        if (!context.spaceId) return 'Needs must be created within a Space';
        if (!formData.content.trim()) return 'Please add a description';
        return null;
      case 'space':
        if (!formData.title) return 'Please add a space title';
        if (!formData.content.trim()) return 'Please add a description';
        return null;
      case 'story':
        if (!formData.title?.trim()) return 'Story title is required';
        if (formData.content.length < 400) return `Story needs ${400 - formData.content.length} more characters`;
        return null;
      default:
        if (!formData.content.trim()) return 'Please write something';
        return null;
    }
  };

  const isValid = () => getValidationMessage() === null;

  // Mobile: slide-in sheet from the right
  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
        <SheetContent side="right" className="w-full max-w-md sm:max-w-lg">
          <div className="space-y-4 mt-2">
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
              validationMessage={getValidationMessage()}
              onCancel={onClose}
              onSubmit={handleSubmit}
            />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop: existing centered dialog
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            Share something with the diaspora
          </DialogTitle>
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm text-muted-foreground">
              {getSubheader(mode)}
            </p>
            {/* Context Badge */}
            {getContextBadge(context)}
          </div>
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
            validationMessage={getValidationMessage()}
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

function getContextBadge(context: ComposerContext): React.ReactNode {
  if (context.spaceId) {
    return (
      <Badge variant="secondary" className="gap-1.5">
        <Building2 className="h-3 w-3" />
        Posting in Space
      </Badge>
    );
  }
  if (context.eventId) {
    return (
      <Badge variant="secondary" className="gap-1.5">
        <Calendar className="h-3 w-3" />
        Posting in Event
      </Badge>
    );
  }
  if (context.communityId) {
    return (
      <Badge variant="secondary" className="gap-1.5">
        <Users className="h-3 w-3" />
        Posting in Community
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="gap-1.5">
      <Hash className="h-3 w-3" />
      Posting to Home Feed
    </Badge>
  );
}
