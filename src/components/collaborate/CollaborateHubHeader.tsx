import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ChevronDown, Sparkles, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useMobile } from '@/hooks/useMobile';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { cn } from '@/lib/utils';

interface CollaborateHubHeaderProps {
  matchedSpaceCount?: number;
  matchedOpportunityCount?: number;
  hasProfileSkills?: boolean;
  onCreateSpace: () => void;
  onPostOpportunity?: () => void;
}

export function CollaborateHubHeader({
  matchedSpaceCount = 0,
  matchedOpportunityCount = 0,
  hasProfileSkills = false,
  onCreateSpace,
  onPostOpportunity,
}: CollaborateHubHeaderProps) {
  const navigate = useNavigate();
  const { isMobile } = useMobile();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleCreateSpace = () => {
    setDrawerOpen(false);
    onCreateSpace();
  };

  const handlePostOpportunity = () => {
    setDrawerOpen(false);
    onPostOpportunity?.();
  };

  const CreateButton = () => {
    if (isMobile) {
      return (
        <>
          <Button
            size="sm"
            className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5"
            onClick={() => setDrawerOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Create
            <ChevronDown className="h-3.5 w-3.5" />
          </Button>
          <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
            <DrawerContent className="max-h-[50dvh]">
              <div className="mx-auto mt-4 h-2 w-[100px] rounded-full bg-muted" />
              <DrawerHeader>
                <DrawerTitle>Create</DrawerTitle>
              </DrawerHeader>
              <div className="px-4 pb-6 space-y-2">
                <button
                  onClick={handleCreateSpace}
                  className="w-full flex items-center gap-3 p-4 rounded-dna-lg hover:bg-accent transition-colors text-left min-h-[48px]"
                >
                  <div className="p-2 rounded-dna-md bg-primary/10">
                    <Plus className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">New Space</p>
                    <p className="text-sm text-muted-foreground">Start a new project or initiative</p>
                  </div>
                </button>
                <button
                  onClick={handlePostOpportunity}
                  className="w-full flex items-center gap-3 p-4 rounded-dna-lg hover:bg-accent transition-colors text-left min-h-[48px]"
                >
                  <div className="p-2 rounded-dna-md bg-[hsl(28,48%,45%)]/10">
                    <Plus className="h-5 w-5 text-[hsl(28,48%,45%)]" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Post Opportunity</p>
                    <p className="text-sm text-muted-foreground">Share a need or offer to the marketplace</p>
                  </div>
                </button>
              </div>
            </DrawerContent>
          </Drawer>
        </>
      );
    }

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5">
            <Plus className="h-4 w-4" />
            Create
            <ChevronDown className="h-3.5 w-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={handleCreateSpace} className="gap-2 cursor-pointer">
            <Plus className="h-4 w-4" />
            New Space
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handlePostOpportunity} className="gap-2 cursor-pointer">
            <Plus className="h-4 w-4" />
            Post Opportunity
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  return (
    <div className="space-y-3">
      {/* Title Row */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight font-heritage">
            COLLABORATE
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Build Together, Impact Together
          </p>
        </div>
        <CreateButton />
      </div>

      {/* DIA Match Strip */}
      {hasProfileSkills && (matchedSpaceCount > 0 || matchedOpportunityCount > 0) && (
        <button
          onClick={() => navigate('/dna/collaborate?tab=spaces&filter=matched')}
          className={cn(
            'w-full flex items-center gap-2.5 px-4 py-2.5 rounded-dna-lg',
            'bg-[hsl(153,43%,32%)] text-white',
            'hover:bg-[hsl(153,43%,28%)] transition-colors',
            'min-h-[44px]'
          )}
        >
          <Sparkles className="h-4 w-4 shrink-0 opacity-90" />
          <span className="text-sm font-medium flex-1 text-left">
            {matchedSpaceCount > 0 && `${matchedSpaceCount} space${matchedSpaceCount !== 1 ? 's' : ''} match your skills`}
            {matchedSpaceCount > 0 && matchedOpportunityCount > 0 && ' · '}
            {matchedOpportunityCount > 0 && `${matchedOpportunityCount} open opportunit${matchedOpportunityCount !== 1 ? 'ies' : 'y'}`}
          </span>
          <ChevronRight className="h-4 w-4 shrink-0 opacity-70" />
        </button>
      )}
    </div>
  );
}
