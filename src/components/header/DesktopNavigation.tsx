
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const DesktopNavigation = () => {
  const navigate = useNavigate();

  const publicNavItems = [
    { name: 'About Us', path: '/about' },
    { name: 'Connect', path: '/connect-example' },
    { name: 'Collaborate', path: '/collaborations-example' },
    { name: 'Contribute', path: '/contribute-example' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <nav className="hidden md:flex items-center space-x-8">
      {publicNavItems.map((item) => (
        <Button
          key={item.name}
          variant="ghost"
          onClick={() => navigate(item.path)}
          className="text-dna-forest hover:bg-dna-mint hover:text-dna-forest"
        >
          {item.name}
        </Button>
      ))}
    </nav>
  );
};

export default DesktopNavigation;
