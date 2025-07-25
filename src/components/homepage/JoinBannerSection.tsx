import React from 'react';
import { Button } from '@/components/ui/button';

interface JoinBannerSectionProps {
  text: string;
  button_text: string;
  button_link: string;
  onJoinClick: () => void;
}

const JoinBannerSection: React.FC<JoinBannerSectionProps> = ({ 
  text, 
  button_text, 
  onJoinClick 
}) => {
  return (
    <section className="py-16 bg-gradient-to-r from-dna-emerald via-dna-copper to-dna-gold">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 md:p-12">
          <p className="text-xl md:text-2xl font-medium text-white leading-relaxed mb-8">
            {text}
          </p>
          <Button 
            size="lg"
            className="bg-white text-dna-forest hover:bg-gray-100 hover:scale-105 transition-all duration-300 font-semibold px-8 py-3"
            onClick={onJoinClick}
          >
            {button_text}
          </Button>
        </div>
      </div>
    </section>
  );
};

export default JoinBannerSection;