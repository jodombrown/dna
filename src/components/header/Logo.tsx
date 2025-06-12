
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import HomeDropdownMenu from './HomeDropdownMenu';

const Logo = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <div className="flex items-center space-x-4">
      <button 
        onClick={() => navigate('/')}
        className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
      >
        <img 
          src="/lovable-uploads/f7ac6d60-aafb-4e52-beb5-69c903113029.png" 
          alt="DNA" 
          className="h-8 w-auto"
        />
        <span className="text-xl font-bold text-dna-forest">DNA</span>
      </button>
      
      {!isHomePage && (
        <div className="hidden md:block">
          <HomeDropdownMenu />
        </div>
      )}
    </div>
  );
};

export default Logo;
