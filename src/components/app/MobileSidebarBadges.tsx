import React from 'react';
import { Bell, Users, MessageCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface MobileSidebarBadgesProps {
  leftSidebarOpen: boolean;
  rightSidebarOpen: boolean;
  onLeftToggle: () => void;
  onRightToggle: () => void;
  notifications?: {
    messages: number;
    connections: number;
    activities: number;
  };
}

const MobileSidebarBadges = ({
  leftSidebarOpen,
  rightSidebarOpen,
  onLeftToggle,
  onRightToggle,
  notifications
}: MobileSidebarBadgesProps) => {
  const totalLeft = (notifications?.messages || 0) + (notifications?.activities || 0);
  const totalRight = notifications?.connections || 0;

  return (
    <div className="md:hidden fixed top-20 left-0 right-0 z-30 pointer-events-none">
      {/* Left Sidebar Badge */}
      {!leftSidebarOpen && totalLeft > 0 && (
        <Button
          onClick={onLeftToggle}
          variant="secondary"
          size="sm"
          className="
            absolute left-4 top-4 pointer-events-auto
            bg-white shadow-lg border border-gray-200
            hover:bg-gray-50 text-dna-forest
            animate-fade-in hover-scale
          "
        >
          <Bell className="h-4 w-4 mr-2" />
          {totalLeft > 9 ? '9+' : totalLeft}
        </Button>
      )}

      {/* Right Sidebar Badge */}
      {!rightSidebarOpen && totalRight > 0 && (
        <Button
          onClick={onRightToggle}
          variant="secondary"
          size="sm"
          className="
            absolute right-4 top-4 pointer-events-auto
            bg-white shadow-lg border border-gray-200
            hover:bg-gray-50 text-dna-emerald
            animate-fade-in hover-scale
          "
        >
          <Users className="h-4 w-4 mr-2" />
          {totalRight > 9 ? '9+' : totalRight}
        </Button>
      )}
    </div>
  );
};

export default MobileSidebarBadges;