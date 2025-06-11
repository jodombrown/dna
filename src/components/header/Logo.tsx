
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Logo = () => {
  const navigate = useNavigate();

  return (
    <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={() => navigate('/')}>
      <img 
        src="/lovable-uploads/f7ac6d60-aafb-4e52-beb5-69c903113029.png" 
        alt="DNA" 
        className="h-10 w-auto"
        loading="eager"
        fetchPriority="high"
      />
    </div>
  );
};

export default Logo;
