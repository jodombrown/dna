/**
 * FeedQuickLinks - Quick navigation links for feed left sidebar
 * Provides fast access to key Five C's modules
 */

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  Calendar, 
  Layers, 
  HandHeart, 
  FileText,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickLink {
  icon: React.ElementType;
  label: string;
  path: string;
  description: string;
}

const quickLinks: QuickLink[] = [
  {
    icon: Users,
    label: 'Connect',
    path: '/dna/connect',
    description: 'Grow your network',
  },
  {
    icon: Calendar,
    label: 'Convene',
    path: '/dna/convene',
    description: 'Discover events',
  },
  {
    icon: Layers,
    label: 'Collaborate',
    path: '/dna/collaborate',
    description: 'Join spaces',
  },
  {
    icon: HandHeart,
    label: 'Contribute',
    path: '/dna/contribute',
    description: 'Make impact',
  },
  {
    icon: FileText,
    label: 'Convey',
    path: '/dna/convey',
    description: 'Share stories',
  },
];

export const FeedQuickLinks: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Card>
      <CardHeader className="pb-2 pt-3 px-3">
        <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Explore DNA
        </CardTitle>
      </CardHeader>
      <CardContent className="px-2 pb-2">
        <nav className="space-y-0.5">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname.startsWith(link.path);
            
            return (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                className={cn(
                  "w-full flex items-center gap-2.5 px-2 py-2 rounded-md text-left transition-colors",
                  "hover:bg-muted group",
                  isActive && "bg-primary/10 text-primary"
                )}
              >
                <Icon className={cn(
                  "h-4 w-4 shrink-0",
                  isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                )} />
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "text-sm font-medium",
                    isActive ? "text-primary" : "text-foreground"
                  )}>
                    {link.label}
                  </p>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            );
          })}
        </nav>
      </CardContent>
    </Card>
  );
};
