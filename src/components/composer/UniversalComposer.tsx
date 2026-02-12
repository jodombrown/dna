/**
 * DNA Post Composer — Universal Gateway
 *
 * A single, unified creation interface that transforms based on user intent
 * across all Five C's (CONNECT, CONVENE, COLLABORATE, CONTRIBUTE, CONVEY).
 *
 * Mobile: bottom sheet (85% screen height, slide up)
 * Desktop: centered modal (600px max width)
 */

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ComposerMode, ComposerContext, ComposerFormData } from '@/hooks/useUniversalComposer';
import { ComposerModeSelector } from './ComposerModeSelector';
import { ComposerBody } from './ComposerBody';
import { ComposerFooter } from './ComposerFooter';
import { DIASuggestionBar } from './DIASuggestionBar';
import { DraftIndicator } from './DraftIndicator';
import { useState, useCallback, useEffect, useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { Hash, Calendar, Users, Building2, FileEdit } from 'lucide-react';
import { useMobile } from '@/hooks/useMobile';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { diaComposerService } from '@/services/diaComposerService';
import { composerService } from '@/services/composerService';
import { ComposerMode as PRDComposerMode, type DIASuggestion } from '@/types/composer';

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
  const [diaSuggestion, setDiaSuggestion] = useState<DIASuggestion | null>(null);
  const [isDraftSaved, setIsDraftSaved] = useState(false);
  const { isMobile } = useMobile();
  const diaDebounceRef = useRef<ReturnType<typeof setTimeout>>();
  const autoSaveRef = useRef<ReturnType<typeof setTimeout>>();

  // DIA ambient analysis: analyze content as user types
  useEffect(() => {
    if (!formData.content || formData.content.length < 50) {
      setDiaSuggestion(null);
      return;
    }

    if (diaDebounceRef.current) {
      clearTimeout(diaDebounceRef.current);
    }

    diaDebounceRef.current = setTimeout(async () => {
      const prdMode = mode as unknown as PRDComposerMode;
      const suggestion = await diaComposerService.analyzeContent(
        formData.content,
        prdMode
      );
      setDiaSuggestion(suggestion);
    }, 1500);

    return () => {
      if (diaDebounceRef.current) clearTimeout(diaDebounceRef.current);
    };
  }, [formData.content, mode]);

  // Auto-save draft every 10 seconds when content changes
  useEffect(() => {
    if (!formData.content.trim()) return;

    if (autoSaveRef.current) {
      clearTimeout(autoSaveRef.current);
    }

    autoSaveRef.current = setTimeout(async () => {
      try {
        const prdMode = mode as unknown as PRDComposerMode;
        await composerService.saveDraft(
          prdMode,
          {
            body: formData.content,
            media: [],
            audience: 'public' as const,
            tags: [],
            mentions: [],
            hashtags: [],
          },
          { ...formData }
        );
        setIsDraftSaved(true);
        setTimeout(() => setIsDraftSaved(false), 2000);
      } catch {
        // Silent fail for draft auto-save
      }
    }, 10000);

    return () => {
      if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    };
  }, [formData, mode]);

  const handleSubmit = () => {
    onSubmit(formData);
    setFormData({ content: '' });
    setDiaSuggestion(null);
  };

  const updateFormData = useCallback((updates: Partial<ComposerFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  }, []);

  const handleDIASuggestionAccept = useCallback((suggestion: DIASuggestion) => {
    if (suggestion.action.type === 'switch_mode') {
      const targetMode = suggestion.action.payload.targetMode as ComposerMode;
      onModeChange(targetMode);
    }
    setDiaSuggestion(null);
  }, [onModeChange]);

  const handleDIASuggestionDismiss = useCallback(() => {
    setDiaSuggestion(null);
  }, []);

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

  const composerContent = (
    <div className="space-y-4">
      {/* Header: Mode Selector + Draft Indicator */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1 min-w-0">
          <ComposerModeSelector
            currentMode={mode}
            onModeChange={onModeChange}
            context={context}
          />
        </div>
        {isDraftSaved && <DraftIndicator />}
      </div>

      {/* Context Badge */}
      <div className="flex items-center gap-2 flex-wrap">
        <p className="text-sm text-muted-foreground">
          {getSubheader(mode)}
        </p>
        {getContextBadge(context)}
      </div>

      {/* Body (mode-specific fields) */}
      <ComposerBody
        mode={mode}
        formData={formData}
        context={context}
        onChange={updateFormData}
      />

      {/* DIA Suggestion Bar */}
      {diaSuggestion && (
        <DIASuggestionBar
          suggestion={diaSuggestion}
          onAccept={handleDIASuggestionAccept}
          onDismiss={handleDIASuggestionDismiss}
        />
      )}

      {/* Footer */}
      <ComposerFooter
        mode={mode}
        isSubmitting={isSubmitting}
        isValid={isValid()}
        validationMessage={getValidationMessage()}
        onCancel={onClose}
        onSubmit={handleSubmit}
      />
    </div>
  );

  // Mobile: bottom sheet (per PRD Section 7.1)
  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
        <SheetContent
          side="bottom"
          className="h-[85vh] rounded-t-2xl overflow-y-auto px-4 pb-6 pt-3"
        >
          {/* Drag handle */}
          <div className="flex justify-center mb-3">
            <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
          </div>
          {composerContent}
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop: centered modal (per PRD Section 7.1)
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Share something with the diaspora
          </DialogTitle>
        </DialogHeader>
        {composerContent}
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
