import React from 'react';
import { Users, Handshake, Heart, Home, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface MobileBottomNavProps {
  activePillar: 'all' | 'connect' | 'collaborate' | 'contribute';
  onPillarChange: (pillar: 'all' | 'connect' | 'collaborate' | 'contribute') => void;
  onComposerToggle: () => void;
  pendingCounts?: {
    connect: number;
    collaborate: number;
    contribute: number;
  };
}

const MobileBottomNav = ({ 
  activePillar, 
  onPillarChange, 
  onComposerToggle,
  pendingCounts 
}: MobileBottomNavProps) => {
  const navItems = [
    {
      id: 'all' as const,
      label: 'Home',
      icon: Home,
      color: 'text-dna-forest',
      activeColor: 'text-dna-emerald',
      count: 0
    },
    {
      id: 'connect' as const,
      label: 'Connect',
      icon: Users,
      color: 'text-dna-emerald',
      activeColor: 'text-dna-emerald',
      count: pendingCounts?.connect || 0
    },
    {
      id: 'collaborate' as const,
      label: 'Collaborate',
      icon: Handshake,
      color: 'text-dna-copper',
      activeColor: 'text-dna-copper',
      count: pendingCounts?.collaborate || 0
    },
    {
      id: 'contribute' as const,
      label: 'Contribute',
      icon: Heart,
      color: 'text-dna-forest',
      activeColor: 'text-dna-forest',
      count: pendingCounts?.contribute || 0
    }
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
      <div className="flex items-center justify-around px-2 py-1 max-w-screen-sm mx-auto">
        {navItems.map((item) => {
          const isActive = activePillar === item.id;
          const Icon = item.icon;
          
          return (
            <Button
              key={item.id}
              variant="ghost"
              size="sm"
              onClick={() => onPillarChange(item.id)}
              className={`
                flex flex-col items-center gap-1 p-2 min-h-[60px] relative
                ${isActive ? item.activeColor : 'text-gray-500'} 
                hover:bg-gray-50 transition-colors flex-1
              `}
            >
              <div className="relative">
                <Icon className={`h-5 w-5 ${isActive ? 'scale-110' : ''} transition-transform`} />
                {item.count > 0 && (
                  <Badge 
                    variant="secondary" 
                    className={`
                      absolute -top-2 -right-2 h-4 w-4 p-0 text-xs flex items-center justify-center
                      ${item.id === 'connect' ? 'bg-dna-emerald' : 
                        item.id === 'collaborate' ? 'bg-dna-copper' : 'bg-dna-forest'} 
                      text-white border-none
                    `}
                  >
                    {item.count > 9 ? '9+' : item.count}
                  </Badge>
                )}
              </div>
              <span className={`text-xs font-medium ${isActive ? 'text-current' : 'text-gray-500'}`}>
                {item.label}
              </span>
              {isActive && (
                <div className={`
                  absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5 w-8 rounded-full
                  ${item.id === 'connect' ? 'bg-dna-emerald' : 
                    item.id === 'collaborate' ? 'bg-dna-copper' : 
                    item.id === 'contribute' ? 'bg-dna-forest' : 'bg-dna-emerald'}
                `} />
              )}
            </Button>
          );
        })}
        
        {/* Floating Action Button for Composer */}
        <Button
          onClick={onComposerToggle}
          size="sm"
          className="
            bg-dna-emerald hover:bg-dna-emerald/90 text-white 
            rounded-full h-12 w-12 p-0 shadow-lg hover-scale 
            ml-2 flex-shrink-0
          "
        >
          <Plus className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default MobileBottomNav;