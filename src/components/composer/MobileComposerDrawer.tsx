import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { ComposerMode, ComposerContext, ComposerFormData } from '@/hooks/useUniversalComposer';
import { ComposerModeSelector } from './ComposerModeSelector';
import { ComposerBody } from './ComposerBody';
import { ComposerFooter } from './ComposerFooter';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Hash, Calendar, Users, Building2 } from 'lucide-react';

interface MobileComposerDrawerProps {
  isOpen: boolean;
  mode: ComposerMode;
  context: ComposerContext;
  isSubmitting: boolean;
  onClose: () => void;
  onModeChange: (mode: ComposerMode) => void;
  onSubmit: (data: ComposerFormData) => void;
}

export const MobileComposerDrawer: React.FC<MobileComposerDrawerProps> = ({
  isOpen,
  mode,
  context,
  isSubmitting,
  onClose,
  onModeChange,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<ComposerFormData>({
    content: '',
  });

  const handleSubmit = () => {
    onSubmit(formData);
    setFormData({ content: '' });
  };

  const updateFormData = (updates: Partial<ComposerFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const isValid = (): boolean => {
    if (!formData.content?.trim()) return false;

    switch (mode) {
      case 'event':
        return !!formData.title?.trim() && !!formData.eventDate;
      case 'need':
        return !!formData.title?.trim();
      case 'space':
        return !!formData.title?.trim();
      case 'story':
        return !!formData.title?.trim();
      default:
        return true;
    }
  };

  const getSubheader = (mode: ComposerMode): string => {
    switch (mode) {
      case 'post': return "What's on your mind?";
      case 'story': return 'Tell a longer narrative';
      case 'event': return 'Host something for the community';
      case 'need': return 'Ask for help or offer support';
      case 'space': return 'Create a collaboration space';
      case 'community': return 'Share with the community';
      default: return '';
    }
  };

  const getContextBadge = (context: ComposerContext) => {
    if (context.spaceId) {
      return (
        <Badge variant="secondary" className="gap-1">
          <Hash className="w-3 h-3" />
          Space
        </Badge>
      );
    }
    if (context.eventId) {
      return (
        <Badge variant="secondary" className="gap-1">
          <Calendar className="w-3 h-3" />
          Event
        </Badge>
      );
    }
    if (context.communityId) {
      return (
        <Badge variant="secondary" className="gap-1">
          <Users className="w-3 h-3" />
          Community
        </Badge>
      );
    }
    return null;
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent 
        side="right" 
        className="w-full p-0 flex flex-col"
      >
        <SheetHeader className="px-4 py-3 border-b">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-base">
              {getSubheader(mode)}
            </SheetTitle>
            {getContextBadge(context)}
          </div>
          
          {/* Mode Selector */}
          <div className="pt-2">
            <ComposerModeSelector
              currentMode={mode}
              onModeChange={onModeChange}
              context={context}
            />
          </div>
        </SheetHeader>

        {/* Composer Body - Scrollable */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <ComposerBody
            mode={mode}
            context={context}
            formData={formData}
            onChange={updateFormData}
          />
        </div>

        {/* Footer - Fixed at bottom */}
        <div className="border-t px-4 py-3">
          <ComposerFooter
            mode={mode}
            isValid={isValid()}
            isSubmitting={isSubmitting}
            onSubmit={handleSubmit}
            onCancel={onClose}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
};
