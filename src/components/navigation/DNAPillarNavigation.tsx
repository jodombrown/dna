import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Home, 
  Users, 
  Handshake, 
  Heart,
  Search,
  MessageSquare,
  UserPlus,
  Calendar
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface DNAPillarNavigationProps {
  className?: string;
  variant?: 'horizontal' | 'vertical';
  showDescriptions?: boolean;
}

const pillars = [
  {
    id: 'feed',
    label: 'Feed',
    description: 'Latest updates and community insights',
    icon: Home,
    href: '/app/dashboard',
    color: 'dna-forest',
    actions: [
      { label: 'Browse Posts', icon: Search, href: '/app/feed' },
      { label: 'Create Post', icon: MessageSquare, href: '/app/posts/create' }
    ]
  },
  {
    id: 'connect',
    label: 'Connect',
    description: 'Build meaningful professional relationships',
    icon: Users,
    href: '/app/connect',
    color: 'dna-emerald',
    actions: [
      { label: 'Discover People', icon: Search, href: '/app/connect/discover' },
      { label: 'My Network', icon: Users, href: '/app/connect/network' },
      { label: 'Messages', icon: MessageSquare, href: '/app/messages' },
      { label: 'Connect Requests', icon: UserPlus, href: '/app/connect/requests' }
    ]
  },
  {
    id: 'collaborate',
    label: 'Collaborate',
    description: 'Partner on projects and opportunities',
    icon: Handshake,
    href: '/app/collaborate',
    color: 'dna-copper',
    actions: [
      { label: 'Active Projects', icon: Handshake, href: '/app/collaborate/projects' },
      { label: 'Find Partners', icon: Search, href: '/app/collaborate/partners' },
      { label: 'Events', icon: Calendar, href: '/app/collaborate/events' }
    ]
  },
  {
    id: 'contribute',
    label: 'Contribute',
    description: 'Give back and create lasting impact',
    icon: Heart,
    href: '/app/contribute',
    color: 'dna-gold',
    actions: [
      { label: 'Impact Opportunities', icon: Heart, href: '/app/contribute/opportunities' },
      { label: 'My Contributions', icon: Users, href: '/app/contribute/my-contributions' }
    ]
  }
];

const getPillarColorClasses = (color: string, isActive: boolean) => {
  const colorMap = {
    'dna-forest': isActive 
      ? 'bg-dna-forest text-white border-dna-forest' 
      : 'hover:bg-dna-forest/10 hover:border-dna-forest/30 hover:text-dna-forest',
    'dna-emerald': isActive 
      ? 'bg-dna-emerald text-white border-dna-emerald' 
      : 'hover:bg-dna-emerald/10 hover:border-dna-emerald/30 hover:text-dna-emerald',
    'dna-copper': isActive 
      ? 'bg-dna-copper text-white border-dna-copper' 
      : 'hover:bg-dna-copper/10 hover:border-dna-copper/30 hover:text-dna-copper',
    'dna-gold': isActive 
      ? 'bg-dna-gold text-black border-dna-gold' 
      : 'hover:bg-dna-gold/10 hover:border-dna-gold/30 hover:text-dna-gold'
  };
  return colorMap[color as keyof typeof colorMap] || colorMap['dna-forest'];
};

export const DNAPillarNavigation: React.FC<DNAPillarNavigationProps> = ({
  className = '',
  variant = 'horizontal',
  showDescriptions = true
}) => {
  const location = useLocation();
  
  const isActivePillar = (href: string) => {
    if (href === '/app/dashboard') {
      return location.pathname === '/app/dashboard' || location.pathname === '/app/feed';
    }
    return location.pathname.startsWith(href);
  };

  if (variant === 'vertical') {
    return (
      <Card className={`p-4 space-y-4 ${className}`}>
        <h2 className="text-lg font-semibold text-foreground">DNA Pillars</h2>
        <div className="space-y-2">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            const isActive = isActivePillar(pillar.href);
            
            return (
              <div key={pillar.id} className="space-y-2">
                <Link to={pillar.href}>
                  <Button
                    variant="ghost"
                    className={`w-full justify-start gap-3 h-auto p-3 transition-all ${
                      getPillarColorClasses(pillar.color, isActive)
                    }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <div className="text-left flex-1">
                      <div className="font-medium">{pillar.label}</div>
                      {showDescriptions && (
                        <div className="text-xs opacity-80 mt-0.5">
                          {pillar.description}
                        </div>
                      )}
                    </div>
                    {isActive && (
                      <Badge variant="secondary" className="text-xs">
                        Active
                      </Badge>
                    )}
                  </Button>
                </Link>
                
                {isActive && pillar.actions && (
                  <div className="ml-8 space-y-1">
                    {pillar.actions.map((action) => {
                      const ActionIcon = action.icon;
                      return (
                        <Link key={action.href} to={action.href}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start gap-2 text-xs h-8"
                          >
                            <ActionIcon className="w-3 h-3" />
                            {action.label}
                          </Button>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    );
  }

  // Horizontal variant
  return (
    <Card className={`p-3 sm:p-4 ${className}`}>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
        {pillars.map((pillar) => {
          const Icon = pillar.icon;
          const isActive = isActivePillar(pillar.href);
          
          return (
            <Link key={pillar.id} to={pillar.href}>
              <Button
                variant="ghost"
                className={`w-full h-auto p-3 sm:p-4 flex-col gap-2 sm:gap-3 transition-all ${
                  getPillarColorClasses(pillar.color, isActive)
                }`}
              >
                <Icon className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
                <div className="text-center">
                  <div className="font-medium text-xs sm:text-sm">
                    {pillar.label}
                  </div>
                  {showDescriptions && (
                    <div className="text-xs opacity-80 mt-1 hidden sm:block">
                      {pillar.description.split(' ').slice(0, 3).join(' ')}...
                    </div>
                  )}
                </div>
                {isActive && (
                  <Badge variant="secondary" className="text-xs">
                    Active
                  </Badge>
                )}
              </Button>
            </Link>
          );
        })}
      </div>
    </Card>
  );
};