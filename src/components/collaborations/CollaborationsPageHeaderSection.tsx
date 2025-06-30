
import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

const CollaborationsPageHeaderSection = () => {
  const isMobile = useIsMobile();

  return (
    <div className="bg-gradient-to-br from-dna-forest to-dna-emerald text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className={`text-center ${isMobile ? 'space-y-4' : 'space-y-6'}`}>
          <h1 className={`font-bold ${isMobile ? 'text-3xl' : 'text-4xl lg:text-5xl'} leading-tight`}>
            Build Africa's Future
            <span className="block text-dna-mint">Together</span>
          </h1>
          <p className={`max-w-3xl mx-auto ${isMobile ? 'text-base' : 'text-lg lg:text-xl'} text-gray-100 leading-relaxed`}>
            Join high-impact initiatives across the continent. Whether you're bringing funding, expertise, 
            networks, or passion—your contribution shapes Africa's tomorrow.
          </p>
          <div className={`flex ${isMobile ? 'flex-col space-y-3' : 'flex-row space-x-4'} justify-center items-center ${isMobile ? 'mt-6' : 'mt-8'}`}>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-dna-copper rounded-full"></div>
              <span className={`${isMobile ? 'text-sm' : 'text-base'} font-medium`}>Find Your Mission</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-dna-gold rounded-full"></div>
              <span className={`${isMobile ? 'text-sm' : 'text-base'} font-medium`}>Make Real Impact</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-dna-mint rounded-full"></div>
              <span className={`${isMobile ? 'text-sm' : 'text-base'} font-medium`}>Build Your Legacy</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollaborationsPageHeaderSection;
