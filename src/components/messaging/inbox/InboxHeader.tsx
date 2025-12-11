import React from 'react';
import { ArrowLeft, Search, MoreVertical, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface InboxHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onBack?: () => void;
  showBackButton?: boolean;
  onNewMessage?: () => void;
}

export const InboxHeader: React.FC<InboxHeaderProps> = ({
  searchTerm,
  onSearchChange,
  onBack,
  showBackButton = false,
  onNewMessage,
}) => {
  return (
    <div className="border-b border-border bg-card">
      {/* Title Bar */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          {showBackButton && onBack && (
            <Button variant="ghost" size="icon" onClick={onBack} className="h-8 w-8">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <h1 className="text-xl font-bold">Messages</h1>
        </div>
        <div className="flex items-center gap-2">
          {onNewMessage && (
            <Button variant="ghost" size="icon" onClick={onNewMessage} className="h-8 w-8">
              <Edit className="h-5 w-5" />
            </Button>
          )}
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-4 pb-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search messages"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 bg-muted/50 border-0 focus-visible:ring-1"
          />
        </div>
      </div>
    </div>
  );
};
