import React from 'react';
import { useLocation } from 'react-router-dom';
import { useDashboard } from '@/contexts/DashboardContext';
import { useMobile } from '@/hooks/useMobile';
import { 
  Home, 
  Users, 
  MessageSquare, 
  Bell,
  Search,
  Menu,
  User,
  Settings
} from 'lucide-react';
import MobileButton from './MobileButton';

interface NavigationItem {
  title: string;
  view: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

const MobileNavigation = () => {
  const { setActiveView, activeView } = useDashboard();
  const location = useLocation();
  const { isMobile } = useMobile();

  // Only show on app routes, settings routes, and mobile devices
  if (!isMobile || (!location.pathname.startsWith('/app') && !location.pathname.startsWith('/settings'))) {
    return null;
  }

  const navigationItems: NavigationItem[] = [
    { title: 'Dashboard', view: 'dashboard', icon: Home },
    { title: 'Discover', view: 'search', icon: Search },
    { title: 'Network', view: 'connect', icon: Users },
    { title: 'Messages', view: 'messages', icon: MessageSquare },
    { title: 'Profile', view: 'profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 z-50 safe-area-pb">
      <div className="flex items-center justify-around w-full max-w-full mx-auto px-2 py-1">
        {navigationItems.map((item) => {
          const isActive = (location.pathname === '/app' && activeView === item.view) || 
                          (location.pathname.startsWith('/settings') && item.view === 'profile');
          const Icon = item.icon;
          
          return (
            <div key={item.title} className="relative flex-1 max-w-[80px]">
              <MobileButton
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (item.view === 'profile') {
                    window.location.href = '/app/profile';
                  } else {
                    setActiveView(item.view as any);
                  }
                }}
                fullWidth
                touchOptimized
                className={`flex flex-col items-center gap-1 h-auto py-2 transition-colors ${
                  isActive
                    ? 'text-primary bg-primary/10'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                <div className="relative">
                  <Icon className="w-5 h-5" />
                  {item.badge && item.badge > 0 && (
                    <span className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                </div>
                <span className="text-xs font-medium leading-none truncate">
                  {item.title}
                </span>
              </MobileButton>
            </div>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNavigation;