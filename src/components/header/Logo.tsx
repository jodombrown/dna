
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
          src="/lovable-uploads/f7ac6d60-aafb-4e52-beb5-69c903113029.png" 
          alt="DNA" 
          className="h-8 w-auto"
        />
      </button>
    </div>
  );
};

export default Logo;
