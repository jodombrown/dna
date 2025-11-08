import React from 'react';
import { Home, Users, Calendar, Briefcase, MessageCircle, Search, Globe } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useMobile } from '@/hooks/useMobile';
import { Badge } from '@/components/ui/badge';
import { useUnreadMessageCount } from '@/hooks/useUnreadMessageCount';

const MobileBottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isMobile } = useMobile();
  const { data: unreadCount = 0 } = useUnreadMessageCount();

  // Only show on mobile
  if (!isMobile) return null;

  const navItems = [
    { label: 'Home', icon: Home, path: '/dna/me' },
    { label: 'Discover', icon: Search, path: '/dna/discover/members' },
    { label: 'Feed', icon: Globe, path: '/dna/connect/feed' },
    { label: 'Messages', icon: MessageCircle, path: '/dna/connect/messages', badge: unreadCount },
    { label: 'Impact', icon: Briefcase, path: '/dna/contribute/opportunities' },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="md:hidden fixed bottom-0 safe-area-bottom inset-x-0 bg-background border-t border-border z-50 safe-area-pb">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={cn(
              "flex flex-col items-center justify-center gap-1 min-w-[64px] min-h-[48px] flex-1 transition-all duration-150 relative",
              isActive(item.path)
                ? "text-dna-emerald"
                : "text-muted-foreground hover:text-foreground"
            )}
            aria-label={item.label}
          >
            <div className="relative">
              <item.icon 
                className={cn(
                  "w-6 h-6 transition-transform duration-150",
                  isActive(item.path) && "scale-110"
                )} 
              />
              {item.badge && item.badge > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-2 -right-2 h-4 min-w-[16px] px-1 flex items-center justify-center text-[10px] font-bold"
                >
                  {item.badge > 9 ? '9+' : item.badge}
                </Badge>
              )}
            </div>
            <span className={cn(
              "text-[10px] font-medium",
              isActive(item.path) && "text-dna-emerald"
            )}>
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
