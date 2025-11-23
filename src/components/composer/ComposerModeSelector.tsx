import { ComposerMode, ComposerContext } from '@/hooks/useUniversalComposer';
import { Button } from '@/components/ui/button';
import { COMPOSER_MODE_CONFIG } from '@/config/composerModes';
import { 
  MessageSquare, 
  FileText, 
  Calendar, 
  HandHeart, 
  Rocket, 
  Users 
} from 'lucide-react';

interface ComposerModeSelectorProps {
  currentMode: ComposerMode;
  onModeChange: (mode: ComposerMode) => void;
  context: ComposerContext;
}

export const ComposerModeSelector = ({
  currentMode,
  onModeChange,
  context,
}: ComposerModeSelectorProps) => {
  // Mode icon mapping
  const modeIcons: Record<ComposerMode, any> = {
    post: MessageSquare,
    story: FileText,
    event: Calendar,
    need: HandHeart,
    space: Rocket,
    community: Users,
  };

  // Mode label mapping
  const modeLabels: Record<ComposerMode, string> = {
    post: 'Post',
    story: 'Story',
    event: 'Event',
    need: 'Need/Offer',
    space: 'Space',
    community: 'Community',
  };

  // Build modes array from config - only show enabled modes
  const modes: Array<{
    id: ComposerMode;
    label: string;
    icon: any;
    disabled?: boolean;
  }> = Object.values(COMPOSER_MODE_CONFIG)
    .filter((config) => config.enabled)
    .map((config) => ({
      id: config.id,
      label: modeLabels[config.id],
      icon: modeIcons[config.id],
      // Context-based disabling
      disabled: 
        (config.id === 'event' && !!context.eventId) ||
        (config.id === 'space' && !!context.spaceId) ||
        (config.id === 'community' && !context.communityId) ||
        (config.id === 'need' && !context.spaceId),
    }));

  return (
    <div className="flex flex-wrap gap-2">
      {modes.map((mode) => {
        const Icon = mode.icon;
        return (
          <Button
            key={mode.id}
            variant={currentMode === mode.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => onModeChange(mode.id)}
            disabled={mode.disabled}
            className="flex items-center gap-2"
          >
            <Icon className="w-4 h-4" />
            {mode.label}
          </Button>
        );
      })}
    </div>
  );
};
