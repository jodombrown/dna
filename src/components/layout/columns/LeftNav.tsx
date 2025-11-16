import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Users, Calendar, MessageCircle, Briefcase, Target, Newspaper } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * LeftNav - Standard left navigation for DNA platform
 * Used in DASHBOARD_HOME, CONNECT_MODE, and CONVEY_MODE
 */
export function LeftNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: Users, label: 'Connect', path: '/dna/connect' },
    { icon: Calendar, label: 'Convene', path: '/dna/convene' },
    { icon: Briefcase, label: 'Collaborate', path: '/dna/collaborate' },
    { icon: Target, label: 'Contribute', path: '/dna/contribute' },
    { icon: Newspaper, label: 'Convey', path: '/dna/convey' },
    { icon: MessageCircle, label: 'Messages', path: '/dna/messages' },
  ];

  return (
    <div className="space-y-2 sticky top-4">
      <Card className="p-3">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            
            return (
              <Button
                key={item.path}
                variant={isActive ? 'secondary' : 'ghost'}
                className="w-full justify-start"
                onClick={() => navigate(item.path)}
              >
                <Icon className="w-4 h-4 mr-2" />
                {item.label}
              </Button>
            );
          })}
        </nav>
      </Card>
    </div>
  );
}
