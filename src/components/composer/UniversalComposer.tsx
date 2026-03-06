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
 *
 * Sprint 3B:
 * - Success screen replaces form after publish (celebration + DIA next action)
 * - DIA intent detection suggests mode switch while user types
 * - First-time onboarding tooltips on mode chips
 */

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Drawer } from 'vaul';
import { ComposerMode, ComposerContext, ComposerFormData } from '@/hooks/useUniversalComposer';
import type { ComposerSuccessData } from '@/hooks/useUniversalComposer';
import { ComposerModeSelector } from './ComposerModeSelector';
import { ComposerBody } from './ComposerBody';
import { ComposerFooter } from './ComposerFooter';
import { DIASuggestionBar } from './DIASuggestionBar';
import { DraftIndicator } from './DraftIndicator';
import { ComposerSuccessScreen } from './ComposerSuccessScreen';
import { DIAIntentBar } from './DIAIntentBar';
import { ComposerOnboarding, useComposerOnboarding } from './ComposerOnboarding';
import { MODE_HANDLERS } from './modeHandlers';
import { useState, useCallback, useEffect, useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { Hash, Calendar, Users, Building2 } from 'lucide-react';
import { useMobile } from '@/hooks/useMobile';
import { useNavigate } from 'react-router-dom';
import { diaComposerService } from '@/services/diaComposerService';
import { composerService } from '@/services/composerService';
import { detectIntent, type IntentSuggestion } from '@/services/diaIntentDetectionService';
import { useDebounce } from '@/hooks/useDebounce';
import type { PostCreationSuggestion } from '@/services/diaPostCreationService';
import { ComposerMode as PRDComposerMode, type DIASuggestion } from '@/types/composer';
import type { ValidationResult } from './modeHandlers';

interface UniversalComposerProps {
  isOpen: boolean;
  mode: ComposerMode;
  context: ComposerContext;
  isSubmitting: boolean;
  successData: ComposerSuccessData | null;
  onClose: () => void;
  onModeChange: (mode: ComposerMode) => void;
  onSubmit: (formData: ComposerFormData) => void;
  onDismissSuccess: () => void;
}

export const UniversalComposer = ({
  isOpen,
  mode,
  context,
  isSubmitting,
  successData,
  onClose,
  onModeChange,
  onSubmit,
  onDismissSuccess,
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

  // Sprint 3B: Intent detection state
  const [intentSuggestion, setIntentSuggestion] = useState<IntentSuggestion | null>(null);
  const [dismissedModes, setDismissedModes] = useState<Set<ComposerMode>>(new Set());
  const debouncedContent = useDebounce(sharedContent, 500);

  // Sprint 3B: Onboarding
  const { isFirstTime, markComplete } = useComposerOnboarding();

  // Navigation for DIA actions — called unconditionally per Rules of Hooks
  const navigate = useNavigate();

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

  // Sprint 3B: Intent detection — runs on debounced content, separate from DIA ambient
  useEffect(() => {
    if (debouncedContent.length < 30) {
      setIntentSuggestion(null);
      return;
    }

    const suggestion = detectIntent(debouncedContent, mode, {
      dismissedModes,
      confidenceThreshold: 0.7,
    });

    setIntentSuggestion(suggestion);
  }, [debouncedContent, mode, dismissedModes]);

  // Reset intent state when composer opens/closes
  useEffect(() => {
    if (!isOpen) {
      setIntentSuggestion(null);
      setDismissedModes(new Set());
    }
  }, [isOpen]);

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
    // Sprint 3B: Don't clear form data here — success screen needs it.
    // Form data will be cleared when the success screen is dismissed.
    setValidationErrors({});
    onSubmit(formData);
    setDiaSuggestion(null);
    setIntentSuggestion(null);
  };

  // Sprint 3B: Clear form data when success screen is dismissed
  const handleDismissSuccess = useCallback(() => {
    setFormData({ content: '' });
    setSharedContent('');
    setSharedMedia(undefined);
    setModeFieldCache({});
    setDiaSuggestion(null);
    setIntentSuggestion(null);
    onDismissSuccess();
  }, [onDismissSuccess]);

  // Sprint 3B: Handle DIA action from success screen
  const handleDIAAction = useCallback((suggestion: PostCreationSuggestion) => {
    handleDismissSuccess();
    if (suggestion.actionType === 'navigate' && suggestion.actionPayload.route) {
      navigate?.(suggestion.actionPayload.route);
    }
    // share and invite actions can be handled by future infrastructure
  }, [handleDismissSuccess, navigate]);

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

  // Sprint 3B: Intent bar accept — switch mode with text preservation
  const handleIntentAccept = useCallback((suggestedMode: ComposerMode) => {
    onModeChange(suggestedMode);
    setIntentSuggestion(null);
  }, [onModeChange]);

  // Sprint 3B: Intent bar dismiss — track dismissed mode for this session
  const handleIntentDismiss = useCallback(() => {
    if (intentSuggestion) {
      setDismissedModes(prev => new Set([...prev, intentSuggestion.suggestedMode]));
    }
    setIntentSuggestion(null);
  }, [intentSuggestion]);

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

  // Sprint 3B: If success data is present, show success screen instead of form
  const composerContent = successData ? (
    <ComposerSuccessScreen
      mode={successData.mode}
      createdId={successData.createdId}
      createdTitle={successData.createdTitle}
      formData={successData.formDataSnapshot}
      onDismiss={handleDismissSuccess}
      onDIAAction={handleDIAAction}
    />
  ) : (
    <div className="space-y-4">
      {/* Header: Mode Selector + Draft Indicator */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1 min-w-0 relative">
          <ComposerModeSelector
            currentMode={mode}
            onModeChange={(newMode) => {
              onModeChange(newMode);
              // Sprint 3B: Mark onboarding complete on first mode interaction
              if (isFirstTime) markComplete();
            }}
            context={context}
          />
          {/* Sprint 3B: Onboarding overlay */}
          {isFirstTime && (
            <div className="absolute inset-0 z-10">
              <ComposerOnboarding
                isFirstTime={isFirstTime}
                onComplete={markComplete}
              />
            </div>
          )}
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

      {/* Sprint 3B: Intent Detection Bar — between text input and DIA suggestions */}
      {intentSuggestion && !diaSuggestion && (
        <DIAIntentBar
          suggestion={intentSuggestion}
          onAccept={handleIntentAccept}
          onDismiss={handleIntentDismiss}
        />
      )}

      {/* DIA Suggestion Bar (Sprint 3A ambient analysis) */}
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

  // Handle dismiss for both close and success screen dismiss
  const handleOpenChange = useCallback((open: boolean) => {
    if (!open) {
      if (successData) {
        handleDismissSuccess();
      } else {
        onClose();
      }
    }
  }, [successData, handleDismissSuccess, onClose]);

  // Mobile: vaul Drawer bottom sheet (swipe to dismiss, drag handle)
  if (isMobile) {
    return (
      <Drawer.Root
        open={isOpen}
        onOpenChange={handleOpenChange}
        handleOnly={true}
      >
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/40 z-50" />
          <Drawer.Content className="fixed bottom-0 left-0 right-0 z-50 bg-background rounded-t-2xl flex flex-col max-h-[90vh]">
            {/* Drag handle — only this triggers swipe-to-dismiss */}
            <div className="pt-3 pb-2 flex-shrink-0 cursor-grab active:cursor-grabbing" vaul-drawer-handle="">
              <div className="mx-auto w-12 h-1.5 rounded-full bg-muted-foreground/30" />
            </div>
            {/* Scrollable content with safe area padding */}
            <div className="flex-1 overflow-y-auto overscroll-contain px-4 pb-safe">
              {composerContent}
              {/* Bottom safe area spacer for iOS home indicator */}
              <div className="h-6" />
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    );
  }

  // Desktop: slide-in panel from right
  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-[480px] overflow-y-auto p-6"
      >
        <SheetHeader className="mb-4">
          <SheetTitle className="text-xl font-semibold">
            {successData ? 'Published!' : 'Share something with the diaspora'}
          </SheetTitle>
        </SheetHeader>
        {composerContent}
      </SheetContent>
    </Sheet>
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
