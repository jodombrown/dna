import React from 'react';
import { Users, ArrowRight } from 'lucide-react';
import MobileTouchButton from '@/components/ui/mobile-touch-button';
import MobileSectionWrapper from '@/components/ui/mobile-section-wrapper';

interface WaitlistSectionProps {
  onJoinClick: () => void;
}

const WaitlistSection = ({ onJoinClick }: WaitlistSectionProps) => {
  return (
    <MobileSectionWrapper 
      padding="lg" 
      background="gradient"
      className="bg-gradient-to-br from-dna-mint/10 via-white to-dna-emerald/5"
    >
      <div className="max-w-4xl mx-auto text-center">
        
        {/* Profile Photos Cluster */}
        <div className="flex justify-center mb-8">
          <div className="flex -space-x-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-dna-emerald to-dna-forest flex items-center justify-center text-white font-semibold text-sm border-2 border-white shadow-lg">
              AR
            </div>
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-dna-copper to-dna-gold flex items-center justify-center text-white font-semibold text-sm border-2 border-white shadow-lg">
              KM
            </div>
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-dna-forest to-dna-emerald flex items-center justify-center text-white font-semibold text-sm border-2 border-white shadow-lg">
              TN
            </div>
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-dna-gold to-dna-copper flex items-center justify-center text-white font-semibold text-sm border-2 border-white shadow-lg">
              SM
            </div>
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-dna-emerald/80 to-dna-forest/80 flex items-center justify-center text-white font-semibold text-sm border-2 border-white shadow-lg">
              JA
            </div>
            <div className="w-12 h-12 rounded-full bg-dna-copper/20 border-2 border-dna-copper/30 flex items-center justify-center">
              <Users className="w-5 h-5 text-dna-copper" />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold text-dna-forest">
            Join 2,500+ Diaspora Changemakers
          </h2>
          
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Be the first to access the DNA platform when we launch. Help us build the future of Africa through powerful connections and collaborations.
          </p>

          <MobileTouchButton
            onClick={onJoinClick}
            size="lg"
            className="bg-dna-emerald hover:bg-dna-forest text-white rounded-full hover:shadow-lg"
            touchOptimized={true}
          >
            Join Waitlist
            <ArrowRight className="w-5 h-5 ml-2" />
          </MobileTouchButton>

          <p className="text-sm text-gray-500 mt-4">
            Early access • No spam • Be part of the movement
          </p>
        </div>
      </div>
    </MobileSectionWrapper>
  );
};

export default WaitlistSection;