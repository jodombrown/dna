import { ComposerMode, ComposerContext } from '@/hooks/useUniversalComposer';
import { Button } from '@/components/ui/button';
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
  const modes: Array<{
    id: ComposerMode;
    label: string;
    icon: any;
    disabled?: boolean;
  }> = [
    { id: 'post', label: 'Post', icon: MessageSquare },
    { id: 'story', label: 'Story', icon: FileText },
    { id: 'event', label: 'Event', icon: Calendar, disabled: !!context.eventId },
    { id: 'need', label: 'Need/Offer', icon: HandHeart },
    { id: 'space', label: 'Space', icon: Rocket, disabled: !!context.spaceId },
    { id: 'community', label: 'Community', icon: Users, disabled: !context.communityId },
  ];

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
