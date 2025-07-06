import React from 'react';
import { Button } from '@/components/ui/button';
import { Users, ArrowRight } from 'lucide-react';

interface WaitlistSectionProps {
  onJoinClick: () => void;
}

const WaitlistSection = ({ onJoinClick }: WaitlistSectionProps) => {
  return (
    <section className="py-16 bg-gradient-to-br from-dna-mint/10 via-white to-dna-emerald/5">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
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
            Join 500+ Diaspora Changemakers
          </h2>
          
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Be the first to access the DNA platform when we launch. Help us build the future of Africa through meaningful connections and collaborations.
          </p>

          <Button
            onClick={onJoinClick}
            size="lg"
            className="bg-dna-emerald hover:bg-dna-forest text-white px-8 py-4 text-lg font-semibold rounded-full transition-all duration-200 hover:scale-105 hover:shadow-lg"
          >
            Join Waitlist
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>

          <p className="text-sm text-gray-500 mt-4">
            Early access • No spam • Be part of the movement
          </p>
        </div>
      </div>
    </section>
  );
};

export default WaitlistSection;