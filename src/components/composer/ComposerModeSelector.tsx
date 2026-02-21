/**
 * ComposerModeSelector — Horizontal scrolling chips with C-module accent colors
 *
 * Per PRD Section 2.1 & 7.2:
 * - Selected chip: filled background with C-module accent color, white text
 * - Unselected: outlined, DNA text color
 * - Horizontal scroll on mobile (no wrapping)
 * - Switching modes preserves base fields
 * - 200ms ease transition
 *
 * Sprint 3A: Uses MODE_HANDLERS for labels (hybrid desktop/mobile).
 * Desktop: "Share a Post", "Tell a Story", etc.
 * Mobile: "Share", "Tell", "Host", "Start", "Post"
 */

import { ComposerMode, ComposerContext } from '@/hooks/useUniversalComposer';
import { COMPOSER_MODE_CONFIG } from '@/config/composerModes';
import { MODE_HANDLERS } from './modeHandlers';
import { cn } from '@/lib/utils';
import { useMobile } from '@/hooks/useMobile';
import {
  MessageSquare,
  BookOpen,
  Calendar,
  Rocket,
  Lightbulb,
  LucideIcon,
} from 'lucide-react';

interface ComposerModeSelectorProps {
  currentMode: ComposerMode;
  onModeChange: (mode: ComposerMode) => void;
  context: ComposerContext;
}

interface ModeChipConfig {
  id: ComposerMode;
  icon: LucideIcon;
  activeBgClass: string;
}

const modeChips: ModeChipConfig[] = [
  { id: 'post', icon: MessageSquare, activeBgClass: 'bg-[#4A8D77]' },
  { id: 'story', icon: BookOpen, activeBgClass: 'bg-[#2A7A8C]' },
  { id: 'event', icon: Calendar, activeBgClass: 'bg-[#C4942A]' },
  { id: 'space', icon: Rocket, activeBgClass: 'bg-[#2D5A3D]' },
  { id: 'need', icon: Lightbulb, activeBgClass: 'bg-[#B87333]' },
];

export const ComposerModeSelector = ({
  currentMode,
  onModeChange,
  context,
}: ComposerModeSelectorProps) => {
  const { isMobile } = useMobile();

  const enabledChips = modeChips.filter(
    (chip) => COMPOSER_MODE_CONFIG[chip.id]?.enabled
  );

  const isDisabled = (modeId: ComposerMode): boolean => {
    // Can't create event FROM an event
    if (modeId === 'event' && context.eventId) return true;
    // Can't create space FROM a space
    if (modeId === 'space' && context.spaceId) return true;
    // Opportunities are creatable from ANY context
    return false;
  };

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide pb-1 -mx-1 px-1">
      {enabledChips.map((chip) => {
        const Icon = chip.icon;
        const handler = MODE_HANDLERS[chip.id];
        const isActive = currentMode === chip.id;
        const disabled = isDisabled(chip.id);
        const chipLabel = isMobile ? handler.shortLabel : handler.label;

        return (
          <button
            key={chip.id}
            onClick={() => onModeChange(chip.id)}
            disabled={disabled}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap',
              'transition-all duration-200 ease-out min-h-[44px]',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              isActive
                ? `${chip.activeBgClass} text-white shadow-sm`
                : 'bg-transparent border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30',
              disabled && 'opacity-40 cursor-not-allowed pointer-events-none'
            )}
          >
            <Icon className="h-3.5 w-3.5 shrink-0" />
            <span>{chipLabel}</span>
          </button>
        );
      })}
    </div>
  );
};
