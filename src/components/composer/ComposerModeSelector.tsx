/**
 * ComposerModeSelector — Horizontal scrolling chips with C-module accent colors
 *
 * Per PRD Section 2.1 & 7.2:
 * - Selected chip: filled background with C-module accent color, white text
 * - Unselected: outlined, DNA text color
 * - Horizontal scroll on mobile (no wrapping)
 * - Switching modes preserves base fields
 * - 200ms ease transition
 */

import { ComposerMode, ComposerContext } from '@/hooks/useUniversalComposer';
import { COMPOSER_MODE_CONFIG } from '@/config/composerModes';
import { cn } from '@/lib/utils';
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
  label: string;
  icon: LucideIcon;
  /** Tailwind text color for icon when active */
  activeTextClass: string;
  /** Tailwind bg color when active */
  activeBgClass: string;
  /** Inline accent color from C-module palette */
  accentColor: string;
}

const modeChips: ModeChipConfig[] = [
  {
    id: 'post',
    label: 'Share a Thought',
    icon: MessageSquare,
    activeTextClass: 'text-white',
    activeBgClass: 'bg-[#4A8D77]',
    accentColor: '#4A8D77', // DNA Emerald — CONNECT
  },
  {
    id: 'story',
    label: 'Tell a Story',
    icon: BookOpen,
    activeTextClass: 'text-white',
    activeBgClass: 'bg-[#2A7A8C]',
    accentColor: '#2A7A8C', // Deep Teal — CONVEY
  },
  {
    id: 'event',
    label: 'Host an Event',
    icon: Calendar,
    activeTextClass: 'text-white',
    activeBgClass: 'bg-[#C4942A]',
    accentColor: '#C4942A', // Warm Amber-Gold — CONVENE
  },
  {
    id: 'space',
    label: 'Start a Project',
    icon: Rocket,
    activeTextClass: 'text-white',
    activeBgClass: 'bg-[#2D5A3D]',
    accentColor: '#2D5A3D', // Forest Green — COLLABORATE
  },
  {
    id: 'need',
    label: 'Post an Opportunity',
    icon: Lightbulb,
    activeTextClass: 'text-white',
    activeBgClass: 'bg-[#B87333]',
    accentColor: '#B87333', // Copper — CONTRIBUTE
  },
];

export const ComposerModeSelector = ({
  currentMode,
  onModeChange,
  context,
}: ComposerModeSelectorProps) => {
  const enabledChips = modeChips.filter(
    (chip) => COMPOSER_MODE_CONFIG[chip.id]?.enabled
  );

  const isDisabled = (modeId: ComposerMode): boolean => {
    if (modeId === 'event' && context.eventId) return true;
    if (modeId === 'space' && context.spaceId) return true;
    return false;
  };

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide pb-1 -mx-1 px-1">
      {enabledChips.map((chip) => {
        const Icon = chip.icon;
        const isActive = currentMode === chip.id;
        const disabled = isDisabled(chip.id);

        return (
          <button
            key={chip.id}
            onClick={() => onModeChange(chip.id)}
            disabled={disabled}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap',
              'transition-all duration-200 ease-out',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              isActive
                ? `${chip.activeBgClass} ${chip.activeTextClass} shadow-sm`
                : 'bg-transparent border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30',
              disabled && 'opacity-40 cursor-not-allowed pointer-events-none'
            )}
          >
            <Icon className="h-3.5 w-3.5 shrink-0" />
            <span className={cn(!isActive && 'hidden sm:inline')}>
              {isActive ? chip.label : chip.label.split(' ').pop()}
            </span>
          </button>
        );
      })}
    </div>
  );
};
