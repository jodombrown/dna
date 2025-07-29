import React from 'react';
import { useLocation } from 'react-router-dom';
import { useDashboard } from '@/contexts/DashboardContext';
import { 
  Home, 
  Users, 
  MessageSquare, 
  Bell,
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

const MobileBottomNav = () => {
  const { setActiveView, activeView } = useDashboard();
  const location = useLocation();
  const isMobile = useIsMobile();

  // Only show on app routes and mobile devices
  if (!isMobile || !location.pathname.startsWith('/app')) {
    return null;
  }

  const navigationItems = [
    { title: 'Home', view: 'dashboard', icon: Home },
    { title: 'Network', view: 'network', icon: Users },
    { title: 'Search', view: 'search', icon: Search },
    { title: 'Messages', view: 'messaging', icon: MessageSquare },
    { title: 'Alerts', view: 'notifications', icon: Bell },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 px-1 py-2 safe-area-pb">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navigationItems.map((item) => {
          const isActive = location.pathname === '/app' && activeView === item.view;
          return (
            <Button
              key={item.title}
              variant="ghost"
              size="sm"
              onClick={() => setActiveView(item.view as any)}
              className={`flex flex-col items-center px-3 py-3 h-auto min-w-0 flex-1 transition-colors ${
                isActive
                  ? 'text-dna-forest bg-dna-mint/20'
                  : 'text-gray-600 hover:text-dna-forest'
              }`}
            >
              <item.icon className={`w-6 h-6 mb-1 ${isActive ? 'text-dna-forest' : ''}`} />
              <span className="text-sm font-medium leading-none">{item.title}</span>
            </Button>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;