
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronDown, Home } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

const HomeDropdownMenu = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const allMenuItems = [
    { name: 'About Us', path: '/about' },
    { name: 'Connect', path: '/connect' },
    { name: 'Collaborate', path: '/collaborate' },
    { name: 'Contribute', path: '/contribute' },
    { name: 'Contact', path: '/contact' },
    { name: 'Prototyping Phase', path: '/prototyping-phase' },
    { name: 'Build Phase', path: '/build-phase' },
    { name: 'MVP Phase', path: '/mvp-phase' },
    { name: 'Customer Discovery Phase', path: '/customer-discovery-phase' },
    { name: 'Go-to-Market Phase', path: '/go-to-market-phase' },
  ];

  // Filter out current page and home page
  const menuItems = allMenuItems.filter(item => 
    item.path !== location.pathname && item.path !== '/'
  );

  const handleItemClick = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  const handleHomeClick = () => {
    navigate('/');
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onClick={handleHomeClick}
        className="flex items-center space-x-2 text-dna-forest hover:text-dna-copper transition-colors duration-200 px-3 py-2 rounded-md hover:bg-dna-mint/20"
      >
        <Home className="w-4 h-4" />
        <span>Back to Home</span>
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
          className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50 animate-slide-in-right"
        >
          <ScrollArea className="max-h-80">
            <div className="py-2">
              <button
                onClick={handleHomeClick}
                className="w-full text-left px-4 py-2 text-gray-700 hover:bg-dna-mint/20 hover:text-dna-forest transition-colors duration-150 font-medium border-b border-gray-100"
              >
                🏠 Home
              </button>
              {menuItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => handleItemClick(item.path)}
                  className="w-full text-left px-4 py-2 text-gray-700 hover:bg-dna-mint/20 hover:text-dna-forest transition-colors duration-150"
                >
                  {item.name}
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
};

export default HomeDropdownMenu;
