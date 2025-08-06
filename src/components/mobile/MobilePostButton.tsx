import React, { useState } from 'react';
import { Plus, Edit3, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PostComposer } from '@/components/social-feed/PostComposer';
import { useMobile } from '@/hooks/useMobile';
import { cn } from '@/lib/utils';

const MobilePostButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isMobile } = useMobile();

  if (!isMobile) return null;

  const handlePostCreated = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Floating Action Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-20 right-4 z-40 h-14 w-14 rounded-full shadow-lg",
          "bg-dna-forest hover:bg-dna-forest/90 text-white",
          "transition-all duration-200 hover:scale-105 active:scale-95"
        )}
        size="icon"
      >
        <Plus className="h-6 w-6" />
      </Button>

      {/* Full Screen Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="w-full h-full max-w-full max-h-full m-0 p-0 rounded-none border-0">
          <div className="flex flex-col h-full">
            {/* Header */}
            <DialogHeader className="flex-row items-center justify-between p-4 border-b bg-white">
              <DialogTitle className="flex items-center gap-2 text-lg font-semibold text-dna-forest">
                <Edit3 className="h-5 w-5" />
                Create Post
              </DialogTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogHeader>

            {/* Content */}
            <div className="flex-1 overflow-auto bg-gray-50">
              <div className="p-4">
                <PostComposer 
                  onPostCreated={handlePostCreated}
                  defaultPillar="connect"
                />
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MobilePostButton;