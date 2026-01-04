/**
 * ComposerModeSelector - Tab-style mode selector for Universal Composer
 * 
 * Design System v1.0 Implementation:
 * - 5 modes with signature colors
 * - Horizontal tabs with icon + label
 * - Selected: white text, mode color background, subtle glow
 * - 200ms transition for smooth switching
 */

import { ComposerMode, ComposerContext } from '@/hooks/useUniversalComposer';
import { Button } from '@/components/ui/button';
import { COMPOSER_MODE_CONFIG } from '@/config/composerModes';
import { cn } from '@/lib/utils';
import { 
  MessageSquare, 
  BookOpen, 
  Calendar, 
  Rocket, 
  Lightbulb,
  LucideIcon
} from 'lucide-react';

interface ComposerModeSelectorProps {
  currentMode: ComposerMode;
  onModeChange: (mode: ComposerMode) => void;
  context: ComposerContext;
}

// Mode configuration per PRD Design System
interface ModeConfig {
  id: ComposerMode;
  label: string;
  icon: LucideIcon;
  colorClass: string;
  bgSelected: string;
  shadowGlow: string;
}

const modeConfigs: ModeConfig[] = [
  {
    id: 'post',
    label: 'Post',
    icon: MessageSquare,
    colorClass: 'text-dna-emerald',
    bgSelected: 'bg-dna-emerald',
    shadowGlow: 'shadow-[0_0_12px_rgba(74,141,119,0.4)]',
  },
  {
    id: 'story',
    label: 'Story',
    icon: BookOpen,
    colorClass: 'text-teal-600',
    bgSelected: 'bg-teal-600',
    shadowGlow: 'shadow-[0_0_12px_rgba(13,148,136,0.4)]',
  },
  {
    id: 'event',
    label: 'Event',
    icon: Calendar,
    colorClass: 'text-amber-500',
    bgSelected: 'bg-amber-500',
    shadowGlow: 'shadow-[0_0_12px_rgba(245,158,11,0.4)]',
  },
  {
    id: 'space',
    label: 'Space',
    icon: Rocket,
    colorClass: 'text-violet-500',
    bgSelected: 'bg-violet-500',
    shadowGlow: 'shadow-[0_0_12px_rgba(139,92,246,0.4)]',
  },
  {
    id: 'need',
    label: 'Opportunity',
    icon: Lightbulb,
    colorClass: 'text-dna-copper',
    bgSelected: 'bg-dna-copper',
    shadowGlow: 'shadow-[0_0_12px_rgba(184,115,51,0.4)]',
  },
];

export const ComposerModeSelector = ({
  currentMode,
  onModeChange,
  context,
}: ComposerModeSelectorProps) => {
  // Filter to only enabled modes
  const enabledModes = modeConfigs.filter(
    (config) => COMPOSER_MODE_CONFIG[config.id]?.enabled
  );

  // Context-based disabling
  const isDisabled = (modeId: ComposerMode): boolean => {
    // Don't allow creating another event from an event context
    if (modeId === 'event' && context.eventId) return true;
    // Don't allow creating another space from a space context
    if (modeId === 'space' && context.spaceId) return true;
    // Opportunity mode is always enabled - users can create needs/offers globally
    return false;
  };

  return (
    <div className="flex items-center justify-between gap-1 p-1 bg-muted/50 rounded-lg mb-4">
      {enabledModes.map((config) => {
        const Icon = config.icon;
        const isActive = currentMode === config.id;
        const disabled = isDisabled(config.id);

        return (
          <button
            key={config.id}
            onClick={() => onModeChange(config.id)}
            disabled={disabled}
            className={cn(
              "flex items-center justify-center gap-1.5 py-2 rounded-md transition-all duration-200",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              isActive 
                ? "bg-background shadow-sm flex-1 px-3" 
                : "px-3 text-muted-foreground hover:text-foreground hover:bg-background/50",
              disabled && "opacity-40 cursor-not-allowed pointer-events-none"
            )}
          >
            <Icon className={cn(
              "h-4 w-4 shrink-0",
              isActive && config.colorClass
            )} />
            {isActive && (
              <span className="text-xs font-medium truncate">{config.label}</span>
            )}
          </button>
        );
      })}
    </div>
  );
};
