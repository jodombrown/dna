import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PostComposer from './PostComposer';

interface MobileStickyComposerProps {
  isOpen: boolean;
  onToggle: () => void;
  onPostCreated?: (postId: string, pillar: string) => void;
}

const MobileStickyComposer = ({ 
  isOpen, 
  onToggle, 
  onPostCreated 
}: MobileStickyComposerProps) => {
  const handlePostCreated = (postId: string, pillar: string) => {
    onPostCreated?.(postId, pillar);
    onToggle(); // Close composer after posting
  };

  if (!isOpen) {
    return (
      <div className="md:hidden fixed bottom-20 right-4 z-40">
        <Button
          onClick={onToggle}
          size="lg"
          className="
            bg-dna-emerald hover:bg-dna-emerald/90 text-white 
            rounded-full h-14 w-14 p-0 shadow-lg hover-scale
            border-2 border-white
          "
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>
    );
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className="md:hidden fixed inset-0 bg-black/50 z-40 animate-fade-in"
        onClick={onToggle}
      />
      
      {/* Composer Modal */}
      <div className="md:hidden fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-xl shadow-xl animate-slide-in-bottom max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-dna-forest">Create Post</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="p-2"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="p-4 overflow-y-auto max-h-[calc(80vh-80px)]">
          <PostComposer onPostCreated={handlePostCreated} />
        </div>
      </div>
    </>
  );
};

export default MobileStickyComposer;