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
    <div className="flex flex-wrap gap-2 pb-4 border-b border-border/50 overflow-x-auto">
      {enabledModes.map((config) => {
        const Icon = config.icon;
        const isActive = currentMode === config.id;
        const disabled = isDisabled(config.id);

        return (
          <Button
            key={config.id}
            variant="ghost"
            size="sm"
            onClick={() => onModeChange(config.id)}
            disabled={disabled}
            className={cn(
              // Base styling
              'flex items-center gap-2 px-4 py-2 h-10 rounded-lg',
              'transition-all duration-200',
              // Unselected state
              !isActive && 'text-muted-foreground hover:text-foreground hover:bg-muted/50',
              // Selected state with mode color
              isActive && [
                config.bgSelected,
                'text-white',
                config.shadowGlow,
                'hover:opacity-90',
              ],
              // Disabled state
              disabled && 'opacity-40 cursor-not-allowed'
            )}
          >
            <Icon className="w-4 h-4" />
            <span className="font-medium">{config.label}</span>
          </Button>
        );
      })}
    </div>
  );
};
