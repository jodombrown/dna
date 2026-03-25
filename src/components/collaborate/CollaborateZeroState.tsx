import React from 'react';
import { Users, Search, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CollaborateZeroStateProps {
  onDiscoverSpaces: () => void;
  onCreateSpace: () => void;
}

export function CollaborateZeroState({ onDiscoverSpaces, onCreateSpace }: CollaborateZeroStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-5">
        <Users className="h-8 w-8 text-primary" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">
        The diaspora is building
      </h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-6">
        Find where your skills are needed most. Join spaces, contribute to initiatives, and build impact together.
      </p>
      <div className="w-full max-w-xs space-y-2.5">
        <Button
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
          onClick={onDiscoverSpaces}
        >
          <Search className="h-4 w-4" />
          Discover Spaces For You
        </Button>
        <Button
          variant="outline"
          className="w-full gap-2"
          onClick={onCreateSpace}
        >
          <Plus className="h-4 w-4" />
          Create Your First Space
        </Button>
      </div>
    </div>
  );
}
