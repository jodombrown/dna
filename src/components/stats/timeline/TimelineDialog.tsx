import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';
import { TimelineDataItem } from './timelineData';

interface TimelineDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  activeTimelineData: TimelineDataItem | undefined;
  activeTimelineYear: string;
  onNavigate: (direction: 'prev' | 'next') => void;
  canNavigatePrev: boolean;
  canNavigateNext: boolean;
}

const TimelineDialog: React.FC<TimelineDialogProps> = ({
  isOpen,
  onOpenChange,
  activeTimelineData,
  activeTimelineYear,
  onNavigate,
  canNavigatePrev,
  canNavigateNext
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {/* Isolated floating close button - completely separate from dialog content */}
      {isOpen && (
        <div className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] z-[10001] pointer-events-none w-full max-w-lg sm:max-w-[700px]">
          <button
            onClick={() => onOpenChange(false)}
            className="absolute top-4 right-4 sm:-top-6 sm:-right-6 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white border-2 border-gray-300 flex items-center justify-center hover:bg-dna-emerald hover:border-dna-emerald hover:text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-dna-emerald focus:ring-offset-2 shadow-xl pointer-events-auto z-50"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>
      )}
      
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">        
        <DialogHeader>
          <div className="text-center">
            <DialogTitle className="text-2xl font-bold text-dna-forest">
              {activeTimelineData?.expandedContent.title}
            </DialogTitle>
            <DialogDescription className="text-lg font-semibold text-dna-emerald">
              {activeTimelineYear}
            </DialogDescription>
          </div>
        </DialogHeader>
        
        <div className="mt-6">
          <p className="text-gray-700 leading-relaxed text-center">
            {activeTimelineData?.expandedContent.description}
          </p>
          
          {/* Bottom Navigation */}
          <div className={`mt-8 flex items-center gap-8 ${
            !canNavigatePrev ? 'justify-center' : 'justify-center'
          }`}>
            {canNavigatePrev && (
              <Button
                variant="ghost"
                size="lg"
                onClick={() => onNavigate('prev')}
                className="flex items-center gap-2 text-dna-emerald hover:text-dna-forest transition-all duration-300"
              >
                <ArrowLeft className="w-5 h-5 animate-[bounce_1s_ease-in-out_infinite]" style={{animationDirection: 'reverse'}} />
                <span>Previous</span>
              </Button>
            )}

            {canNavigateNext && (
              <Button
                variant="ghost"
                size="lg"
                onClick={() => onNavigate('next')}
                className="flex items-center gap-2 text-dna-emerald hover:text-dna-forest transition-all duration-300"
              >
                <span>Next</span>
                <ArrowRight className="w-5 h-5 animate-[bounce_1s_ease-in-out_infinite]" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TimelineDialog;