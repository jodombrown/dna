import React, { useState } from 'react';
import { Home, Users, Plus, Bell } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useMobile } from '@/hooks/useMobile';
import { Badge } from '@/components/ui/badge';
import { useUnreadMessageCount } from '@/hooks/useUnreadMessageCount';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { EnhancedCreatePostDialog } from '@/components/posts/EnhancedCreatePostDialog';
import { useAuth } from '@/contexts/AuthContext';

const MobileBottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isMobile } = useMobile();
  const { user } = useAuth();
  const [showPostDialog, setShowPostDialog] = useState(false);

  // Only show on mobile
  if (!isMobile) return null;

  const navItems = [
    { label: 'Home', icon: Home, path: '/dna/feed', type: 'nav' as const },
    { label: 'My DNA', icon: Users, path: '/dna/network', type: 'nav' as const },
    { label: 'Post', icon: Plus, type: 'action' as const },
    { label: 'Notifications', icon: Bell, path: '/dna/notifications', type: 'nav' as const },
  ];

  const isActive = (path?: string) => {
    if (!path) return false;
    return location.pathname === path;
  };

  const handleItemClick = (item: typeof navItems[0]) => {
    if (item.type === 'action') {
      setShowPostDialog(true);
    } else if (item.path) {
      navigate(item.path);
    }
  };

  return (
    <>
      <nav className="md:hidden sticky bottom-0 safe-area-bottom inset-x-0 bg-background border-t border-border z-50 safe-area-pb">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item, index) => (
            <button
              key={item.label}
              onClick={() => handleItemClick(item)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 min-w-[64px] min-h-[48px] flex-1 transition-all duration-150 relative",
                item.type === 'action' 
                  ? "text-dna-copper hover:text-dna-copper/80" 
                  : isActive(item.path)
                    ? "text-dna-emerald"
                    : "text-muted-foreground hover:text-foreground"
              )}
              aria-label={item.label}
            >
              <div className={cn(
                "relative",
                item.type === 'action' && "bg-dna-copper/10 rounded-full p-2"
              )}>
                <item.icon 
                  className={cn(
                    "w-6 h-6 transition-transform duration-150",
                    isActive(item.path) && "scale-110",
                    item.type === 'action' && "w-5 h-5"
                  )} 
                />
              </div>
              <span className={cn(
                "text-[10px] font-medium",
                isActive(item.path) && "text-dna-emerald",
                item.type === 'action' && "text-dna-copper"
              )}>
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </nav>

      <EnhancedCreatePostDialog
        isOpen={showPostDialog}
        onClose={() => setShowPostDialog(false)}
        currentUserId={user?.id || ''}
        onSuccess={() => {
          setShowPostDialog(false);
        }}
      />
    </>
  );
};

export default MobileBottomNav;
