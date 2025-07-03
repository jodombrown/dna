
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { publicNavItems } from './navigationConfig';

const DesktopNavigation = () => {
  return (
    <nav className="hidden md:flex items-center space-x-8">
      {publicNavItems.map((item) => (
        <Link
          key={item.name}
          to={item.path}
          className="text-gray-700 hover:text-dna-forest font-medium transition-colors"
        >
          {item.name}
        </Link>
      ))}
      <div className="flex items-center space-x-4 ml-8">
        <Link to="/auth">
          <Button variant="outline" className="border-dna-emerald text-dna-emerald hover:bg-dna-emerald hover:text-white">
            Sign In
          </Button>
        </Link>
        <Link to="/auth">
          <Button className="bg-dna-emerald hover:bg-dna-forest text-white">
            Join DNA
          </Button>
        </Link>
      </div>
    </nav>
  );
};

export default DesktopNavigation;
