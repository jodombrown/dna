/**
 * DIAIntentBar — Sprint 3B intent detection suggestion UI
 *
 * Appears below the text input, above mode-specific fields.
 * Slides in when DIA detects the user might be in the wrong mode.
 *
 * Behavior:
 * - Only shows when suggestion confidence >= threshold
 * - Dismissing adds mode to dismissedModes (won't re-suggest this session)
 * - Accepting triggers mode switch with text preservation
 * - Auto-dismisses after 10 seconds
 * - Only one suggestion at a time
 */

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, X, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MODE_HANDLERS } from './modeHandlers';
import type { IntentSuggestion } from '@/services/diaIntentDetectionService';
import type { ComposerMode } from '@/hooks/useUniversalComposer';

interface DIAIntentBarProps {
  suggestion: IntentSuggestion | null;
  onAccept: (suggestedMode: ComposerMode) => void;
  onDismiss: () => void;
}

// No auto-dismiss - banner stays until user acts

export const DIAIntentBar = ({
  suggestion,
  onAccept,
  onDismiss,
}: DIAIntentBarProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const autoDismissRef = useRef<ReturnType<typeof setTimeout>>();
  const prevSuggestionId = useRef<string | null>(null);

  // Animate in when suggestion appears - no auto-dismiss
  useEffect(() => {
    if (suggestion && suggestion.id !== prevSuggestionId.current) {
      prevSuggestionId.current = suggestion.id;
      setIsVisible(true);
    } else if (!suggestion) {
      setIsVisible(false);
      prevSuggestionId.current = null;
    }
  }, [suggestion]);

  if (!suggestion) return null;

  const handler = MODE_HANDLERS[suggestion.suggestedMode];
  const accentColor = handler?.accentColor ?? '#4A8D77';

  const handleAccept = () => {
    if (autoDismissRef.current) {
      clearTimeout(autoDismissRef.current);
    }
    setIsVisible(false);
    onAccept(suggestion.suggestedMode);
  };

  const handleDismiss = () => {
    if (autoDismissRef.current) {
      clearTimeout(autoDismissRef.current);
    }
    setIsVisible(false);
    onDismiss();
  };

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-3 rounded-lg border-l-[3px] transition-all duration-200',
        isVisible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-2 pointer-events-none'
      )}
      style={{
        borderLeftColor: accentColor,
        backgroundColor: `${accentColor}0A`,
      }}
    >
      {/* DIA Icon */}
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ backgroundColor: `${accentColor}15` }}
      >
        <Sparkles className="h-3.5 w-3.5" style={{ color: accentColor }} />
      </div>

      {/* Message */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground leading-snug">
          {suggestion.message}
        </p>
        <div className="flex items-center gap-2 mt-2">
          <Button
            size="sm"
            className="h-7 px-3 text-xs text-white"
            style={{ backgroundColor: accentColor }}
            onClick={handleAccept}
          >
            Switch
            <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 px-2 text-xs text-muted-foreground"
            onClick={handleDismiss}
          >
            Dismiss
          </Button>
        </div>
      </div>

      {/* Close button */}
      <button
        onClick={handleDismiss}
        className="flex-shrink-0 text-muted-foreground/60 hover:text-muted-foreground transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};
