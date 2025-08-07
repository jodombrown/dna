import React from 'react';
import { useDashboard } from '../../contexts/DashboardV1Context';
import { useLocation } from 'react-router-dom';
import { Home, Search, Users, User, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const MobileNavigation = () => {
  const { setActiveView, activeView } = useDashboard();
  const location = useLocation();

  const navigationItems = [
    { title: 'Home', view: 'dashboard' as const, icon: Home },
    { title: 'Search', view: 'search' as const, icon: Search },
    { title: 'Connect', view: 'connect' as const, icon: Users },
    { title: 'Profile', view: 'profile' as const, icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 lg:hidden">
      <div className="flex items-center justify-around py-2">
        {navigationItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = location.pathname.includes(item.view === 'dashboard' ? '/dashboard' : `/${item.view}`);
          
          return (
            <button
              key={item.view}
              onClick={() => setActiveView(item.view)}
              className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
                isActive 
                  ? 'text-dna-copper bg-dna-copper/5' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <IconComponent className="w-5 h-5 mb-1" />
              <span className="text-xs font-medium">{item.title}</span>
              <span className="text-xs text-amber-600 font-bold">v1</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export const MobilePostButton = () => {
  return (
    <Button
      size="icon"
      className="fixed bottom-20 right-4 w-14 h-14 rounded-full bg-dna-copper hover:bg-dna-copper/90 shadow-lg lg:hidden"
    >
      <Plus className="w-6 h-6 text-white" />
    </Button>
  );
};