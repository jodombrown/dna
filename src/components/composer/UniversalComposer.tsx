/**
 * DNA Post Composer — Universal Gateway
 *
 * A single, unified creation interface that transforms based on user intent
 * across all Five C's (CONNECT, CONVENE, COLLABORATE, CONTRIBUTE, CONVEY).
 *
 * Mobile: vaul Drawer bottom sheet (swipe to dismiss, drag handle, sticky footer)
 * Desktop: centered modal (600px max width)
 *
 * Sprint 3A:
 * - Replaced Sheet with vaul Drawer for mobile (proper swipe-to-dismiss)
 * - Uses MODE_HANDLERS for validation (replaces switch/case)
 * - Mode switch text preservation (shared content + per-mode field caching)
 * - Inline validation errors with friendly messages
 */

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Drawer } from 'vaul';
import { ComposerMode, ComposerContext, ComposerFormData } from '@/hooks/useUniversalComposer';
import { ComposerModeSelector } from './ComposerModeSelector';
import { ComposerBody } from './ComposerBody';
import { ComposerFooter } from './ComposerFooter';
import { DIASuggestionBar } from './DIASuggestionBar';
import { DraftIndicator } from './DraftIndicator';
import { MODE_HANDLERS } from './modeHandlers';
import { useState, useCallback, useEffect, useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { Hash, Calendar, Users, Building2 } from 'lucide-react';
import { useMobile } from '@/hooks/useMobile';
import { diaComposerService } from '@/services/diaComposerService';
import { composerService } from '@/services/composerService';
import { ComposerMode as PRDComposerMode, type DIASuggestion } from '@/types/composer';
import type { ValidationResult } from './modeHandlers';

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
  // Shared content that persists across mode switches
  const [sharedContent, setSharedContent] = useState('');
  const [sharedMedia, setSharedMedia] = useState<string | undefined>(undefined);

  // Per-mode field cache: preserved when switching away, restored when switching back
  const [modeFieldCache, setModeFieldCache] = useState<Partial<Record<ComposerMode, Partial<ComposerFormData>>>>({});

  // Current form data (composed from shared + mode-specific)
  const [formData, setFormData] = useState<ComposerFormData>({ content: '' });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [diaSuggestion, setDiaSuggestion] = useState<DIASuggestion | null>(null);
  const [isDraftSaved, setIsDraftSaved] = useState(false);
  const { isMobile } = useMobile();
  const diaDebounceRef = useRef<ReturnType<typeof setTimeout>>();
  const autoSaveRef = useRef<ReturnType<typeof setTimeout>>();
  const prevModeRef = useRef<ComposerMode>(mode);

  // Mode switch text preservation
  useEffect(() => {
    const prevMode = prevModeRef.current;
    if (prevMode === mode) return;

    // Cache current mode-specific fields before switching
    setModeFieldCache(prev => ({
      ...prev,
      [prevMode]: { ...formData, content: undefined, mediaUrl: undefined },
    }));

    // Restore cached fields for the new mode, or use defaults
    const cachedFields = modeFieldCache[mode];
    const defaults = MODE_HANDLERS[mode].getDefaultValues();

    setFormData({
      ...defaults,
      ...cachedFields,
      content: sharedContent,
      mediaUrl: sharedMedia,
    });

    prevModeRef.current = mode;
  }, [mode]); // eslint-disable-line react-hooks/exhaustive-deps

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
            audience: 'public' as unknown as import('@/types/composer').AudienceType,
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
    // Client-side validation via MODE_HANDLERS (replaces switch/case)
    const handler = MODE_HANDLERS[mode];
    const validation: ValidationResult = handler.validate(formData);
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      // Scroll to first error field
      const firstErrorField = Object.keys(validation.errors)[0];
      document.getElementById(`composer-field-${firstErrorField}`)?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
      return;
    }

    // Clear validation errors and submit
    setValidationErrors({});
    onSubmit(formData);
    setFormData({ content: '' });
    setSharedContent('');
    setSharedMedia(undefined);
    setModeFieldCache({});
    setDiaSuggestion(null);
  };

  const updateFormData = useCallback((updates: Partial<ComposerFormData>) => {
    setFormData(prev => {
      const next = { ...prev, ...updates };
      return next;
    });
    // Keep shared content in sync
    if ('content' in updates && updates.content !== undefined) {
      setSharedContent(updates.content);
    }
    if ('mediaUrl' in updates) {
      setSharedMedia(updates.mediaUrl);
    }
    // Clear specific field errors when the user types
    const fieldKeys = Object.keys(updates);
    if (fieldKeys.length > 0) {
      setValidationErrors(prev => {
        const next = { ...prev };
        for (const key of fieldKeys) {
          delete next[key];
        }
        return next;
      });
    }
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

  // Validation via MODE_HANDLERS (replaces switch/case getValidationMessage)
  const getValidationState = (): { isValid: boolean; message: string | null } => {
    const handler = MODE_HANDLERS[mode];
    const validation = handler.validate(formData);
    if (validation.isValid) return { isValid: true, message: null };
    // Return the first error as the summary message
    const firstError = Object.values(validation.errors)[0];
    return { isValid: false, message: firstError || null };
  };

  const { isValid: formIsValid, message: validationMessage } = getValidationState();

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
        validationErrors={validationErrors}
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
        isValid={formIsValid}
        validationMessage={validationMessage}
        onCancel={onClose}
        onSubmit={handleSubmit}
      />
    </div>
  );

  // Mobile: vaul Drawer bottom sheet (swipe to dismiss, drag handle)
  if (isMobile) {
    return (
      <Drawer.Root open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/40 z-50" />
          <Drawer.Content className="fixed bottom-0 left-0 right-0 z-50 bg-background rounded-t-2xl">
            {/* Drag handle */}
            <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-muted mt-3 mb-2" />
            {/* Scrollable content with safe area padding */}
            <div className="max-h-[85vh] overflow-y-auto px-4 pb-safe">
              {composerContent}
              {/* Bottom safe area spacer for iOS home indicator */}
              <div className="h-6" />
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
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
