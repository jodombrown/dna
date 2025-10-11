import React from 'react';
import { Home, Users, Calendar, User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useMobile } from '@/hooks/useMobile';

const MobileBottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isMobile } = useMobile();

  // Only show on mobile
  if (!isMobile) return null;

  const navItems = [
    { label: 'Home', icon: Home, path: '/dna/me' },
    { label: 'Discover', icon: Users, path: '/dna/connect' },
    { label: 'Events', icon: Calendar, path: '/dna/events' },
    { label: 'Profile', icon: User, path: '/app/profile/edit' },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 bg-background border-t border-border z-50 safe-area-pb">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={cn(
              "flex flex-col items-center justify-center gap-1 min-w-[64px] min-h-[48px] flex-1 transition-all duration-150",
              isActive(item.path)
                ? "text-dna-emerald"
                : "text-muted-foreground hover:text-foreground"
            )}
            aria-label={item.label}
          >
            <item.icon 
              className={cn(
                "w-6 h-6 transition-transform duration-150",
                isActive(item.path) && "scale-110"
              )} 
            />
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
