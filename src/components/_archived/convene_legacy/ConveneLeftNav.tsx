import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Home, Calendar, User, Users } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export function ConveneLeftNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: Home, label: 'Hub', path: '/dna/convene' },
    { icon: Calendar, label: 'All Events', path: '/dna/convene/events' },
    { icon: User, label: 'My Events', path: '/dna/convene/my-events' },
    { icon: Users, label: 'Groups', path: '/dna/convene/groups' },
  ];

  return (
    <div className="space-y-2 sticky top-4">
      <Card className="p-3">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Button
                key={item.path}
                variant={isActive ? 'default' : 'ghost'}
                className={`w-full justify-start ${
                  isActive ? 'bg-dna-emerald hover:bg-dna-forest' : ''
                }`}
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
