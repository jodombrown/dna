
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Logo = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center space-x-4">
      <button 
        onClick={() => navigate('/')}
        className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
      >
        <img 
          src="/lovable-uploads/2768ac69-7468-4ee5-a1aa-3f241d1b7b25.png" 
          alt="DNA Logo" 
          className="h-12 w-auto"
          onError={(e) => {
            console.log('Logo failed to load:', e);
          }}
        />
      </button>
    </div>
  );
};

export default Logo;
