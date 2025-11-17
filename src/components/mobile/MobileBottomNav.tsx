import React, { useState } from 'react';
import { Home, Users, Plus, Calendar, Menu } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useMobile } from '@/hooks/useMobile';
import { Badge } from '@/components/ui/badge';
import { useUnreadNotificationCount } from '@/hooks/useUnreadNotificationCount';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useAuth } from '@/contexts/AuthContext';
import { useUniversalComposer } from '@/hooks/useUniversalComposer';
import { UniversalComposer } from '@/components/composer/UniversalComposer';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  MessageSquare, 
  Settings, 
  Bell,
  Handshake,
  Heart,
  BookOpen,
  LogOut
} from 'lucide-react';

const MobileBottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isMobile } = useMobile();
  const { user, profile, signOut } = useAuth();
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const { data: unreadCount = 0 } = useUnreadNotificationCount();
  const composer = useUniversalComposer();

  // Only show on mobile
  if (!isMobile) return null;

  // 5C Framework as PRIMARY navigation
  const navItems = [
    { 
      label: 'Connect', 
      pillar: 'connect',
      icon: Users, 
      path: '/dna/connect', 
      type: 'nav' as const,
      description: 'Build network'
    },
    { 
      label: 'Convene', 
      pillar: 'convene',
      icon: Calendar, 
      path: '/dna/convene', 
      type: 'nav' as const,
      description: 'Join events'
    },
    { 
      label: 'Feed', 
      icon: Home, 
      path: '/dna/feed', 
      type: 'nav' as const,
      description: 'Home'
    },
    { 
      label: 'Collaborate', 
      pillar: 'collaborate',
      icon: Handshake, 
      path: '/dna/collaborate', 
      type: 'nav' as const,
      description: 'Work together'
    },
    { 
      label: 'More', 
      icon: Menu, 
      type: 'menu' as const,
      description: 'More options'
    },
  ];

  const moreMenuItems = [
    { 
      label: 'Contribute', 
      pillar: 'contribute',
      icon: Heart, 
      path: '/dna/contribute',
      description: 'Give back & support'
    },
    { 
      label: 'Convey', 
      pillar: 'convey',
      icon: BookOpen, 
      path: '/dna/convey',
      description: 'Share your story'
    },
    { 
      label: 'Messages', 
      icon: MessageSquare, 
      path: '/dna/messages',
      description: 'Direct conversations'
    },
    { 
      label: 'Notifications', 
      icon: Bell, 
      path: '/dna/notifications',
      description: 'Activity updates',
      badge: unreadCount
    },
    { 
      label: 'Settings', 
      icon: Settings, 
      path: '/dna/settings/profile',
      description: 'Account settings'
    },
  ];

  const isActive = (path?: string) => {
    if (!path) return false;
    return location.pathname.startsWith(path);
  };

  const handleItemClick = (item: typeof navItems[0]) => {
    if (item.type === 'menu') {
      setShowMoreMenu(true);
    } else if (item.path) {
      navigate(item.path);
    }
  };

  return (
    <>
      {/* Fixed bottom navigation bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50 safe-area-pb">
        <div className="flex justify-around items-center h-16 px-2">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => handleItemClick(item)}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors relative",
                isActive(item.path)
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-primary"
              )}
            >
              <item.icon className="w-5 h-5" strokeWidth={isActive(item.path) ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{item.label}</span>
              
              {/* Active indicator */}
              {isActive(item.path) && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-primary rounded-b-full" />
              )}
              
              {/* Pillar badge for 5C items */}
              {'pillar' in item && item.pillar && isActive(item.path) && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-pulse" />
              )}
              
              {/* Notification badge for More menu */}
              {item.type === 'menu' && unreadCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-4 min-w-4 flex items-center justify-center p-0 text-[10px]"
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Badge>
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* Universal Composer */}
      <UniversalComposer
        isOpen={composer.isOpen}
        mode={composer.mode}
        context={composer.context}
        isSubmitting={composer.isSubmitting}
        onClose={composer.close}
        onModeChange={composer.switchMode}
        onSubmit={composer.submit}
      />

      {/* More Menu Sheet */}
      <Sheet open={showMoreMenu} onOpenChange={setShowMoreMenu}>
        <SheetContent side="bottom" className="h-[80vh] rounded-t-2xl">
          <SheetHeader className="pb-4">
            <SheetTitle className="text-left">Menu</SheetTitle>
          </SheetHeader>

          {/* Profile Section */}
          <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg mb-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={profile?.avatar_url || ''} alt={profile?.full_name || ''} />
              <AvatarFallback>{profile?.full_name?.[0] || 'U'}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{profile?.full_name}</p>
              <p className="text-xs text-muted-foreground truncate">@{profile?.username}</p>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => {
                setShowMoreMenu(false);
                navigate(`/dna/profile/${profile?.username}`);
              }}
            >
              View Profile
            </Button>
          </div>

          <Separator className="my-4" />

          {/* Menu Items */}
          <div className="space-y-1">
            {moreMenuItems.map((item) => (
              <button
                key={item.label}
                onClick={() => {
                  setShowMoreMenu(false);
                  navigate(item.path);
                }}
                className="w-full flex items-center gap-4 p-4 hover:bg-muted/50 rounded-lg transition-colors"
              >
                <div className="relative">
                  <item.icon className="w-5 h-5 text-muted-foreground" />
                  {item.badge && item.badge > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-2 -right-2 h-4 min-w-4 flex items-center justify-center p-0 text-[10px]"
                    >
                      {item.badge > 9 ? '9+' : item.badge}
                    </Badge>
                  )}
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium text-sm">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
              </button>
            ))}
          </div>

          <Separator className="my-4" />

          {/* Sign Out */}
          <Button
            variant="ghost"
            className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={async () => {
              await signOut();
              setShowMoreMenu(false);
              navigate('/');
            }}
          >
            <LogOut className="w-5 h-5 mr-3" />
            Sign Out
          </Button>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default MobileBottomNav;
