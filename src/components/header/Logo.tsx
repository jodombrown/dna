
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
          src="/lovable-uploads/c1ba44bd-c5a7-432e-8341-3ce5576c120f.png" 
          alt="DNA" 
          className="h-8 w-auto"
        />
      </button>
    </div>
  );
};

export default Logo;
