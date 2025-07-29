
import React, { useState, useEffect } from "react";
import { Info } from "lucide-react";

/**
 * Universal prototype phase info/feedback banner.
 * Place just below the global header or page header.
 */
const PrototypeBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger the slide-down animation after a brief delay
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div 
      className={`
        bg-gradient-to-r from-dna-emerald/15 via-dna-copper/10 to-dna-gold/10 
        border-b border-dna-emerald/30 shadow-sm
        transform transition-all duration-700 ease-out
        ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}
      `}
      style={{
        transformOrigin: 'top'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-3 flex items-start gap-2 sm:gap-3">
        <Info className="w-5 h-5 sm:w-6 sm:h-6 text-dna-emerald mt-0.5 sm:mt-1 flex-shrink-0" />
        <div>
          <h3 className="font-semibold text-sm sm:text-md md:text-lg text-dna-forest mb-0.5 leading-tight">
            You're using the DNA Platform Prototype!
          </h3>
          <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
            This is an early preview of Diaspora Network of Africa. Your ideas, feedback, and involvement
            will shape the future of our community-powered professional platform.
            <br className="hidden lg:block" />
            <span className="font-semibold">Help us build a home for Africa's Diaspora!</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrototypeBanner;
