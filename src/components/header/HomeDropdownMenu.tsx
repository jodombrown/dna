
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

const HomeDropdownMenu = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { name: 'Home', path: '/' },
    { name: 'About Us', path: '/about' },
    { name: 'Connect', path: '/connect' },
    { name: 'Collaborate', path: '/collaborate' },
    { name: 'Contribute', path: '/contribute' },
    { name: 'Contact', path: '/contact' },
  ];

  const handleItemClick = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        className="flex items-center space-x-1 text-dna-forest hover:text-dna-copper transition-colors duration-200"
      >
        <span>Back to Home</span>
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
          className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 animate-slide-in-right"
        >
          <ScrollArea className="max-h-64">
            <div className="py-2">
              {menuItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => handleItemClick(item.path)}
                  className="w-full text-left px-4 py-2 text-gray-700 hover:bg-dna-mint/10 hover:text-dna-forest transition-colors duration-150"
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
