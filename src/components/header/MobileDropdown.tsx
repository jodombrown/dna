
import React from 'react';
import { ChevronDown, Home } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ScrollArea } from '@/components/ui/scroll-area';
import { publicNavItems, phases } from './navigationConfig';

interface MobileDropdownProps {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}

const MobileDropdown: React.FC<MobileDropdownProps> = ({ isOpen, onToggle, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;
  const isHomePage = currentPath === '/';

  // Filter out current page from nav items
  const filteredNavItems = publicNavItems.filter(item => item.path !== currentPath);

  const handleNavClick = (item: { name: string; path: string }) => {
    navigate(item.path);
    onClose();
  };

  const handleHomeClick = () => {
    navigate('/');
    onClose();
  };

  if (isHomePage) return null;

  return (
    <div className="relative md:hidden">
      <button
        onClick={onToggle}
        className="flex items-center space-x-2 text-dna-forest hover:text-dna-copper transition-colors duration-200 px-3 py-2 rounded-md hover:bg-dna-mint/20"
      >
        <Home className="w-4 h-4" />
        <span>Back</span>
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <ScrollArea className="max-h-80">
            <div className="py-2">
              <button
                onClick={handleHomeClick}
                className="w-full text-left px-4 py-2 text-gray-700 hover:bg-dna-mint/20 hover:text-dna-forest transition-colors duration-150 font-medium border-b border-gray-100"
              >
                🏠 Home
              </button>
              
              {/* Main Navigation Items */}
              {filteredNavItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => handleNavClick(item)}
                  className="w-full text-left px-4 py-2 text-gray-700 hover:bg-dna-mint/20 hover:text-dna-forest transition-colors duration-150"
                >
                  {item.name}
                </button>
              ))}
              
              {/* Separator */}
              <div className="border-t border-gray-100 my-2"></div>
              
              {/* Development Phase Items */}
              <div className="px-4 py-2 text-xs text-gray-500 uppercase tracking-wide font-medium">
                Development Phases
              </div>
              {phases.map((phase) => (
                <button
                  key={phase.path}
                  onClick={() => {
                    navigate(phase.path);
                    onClose();
                  }}
                  className="w-full text-left px-4 py-2 text-gray-700 hover:bg-dna-mint/20 hover:text-dna-forest transition-colors duration-150 text-sm"
                >
                  {phase.name}
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
};

export default MobileDropdown;
