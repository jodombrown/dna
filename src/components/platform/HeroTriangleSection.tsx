
import React from 'react';
import { Button } from '@/components/ui/button';
import { Play, Users, Handshake, Heart } from 'lucide-react';

const HeroTriangleSection = () => {
  const scrollToConnectSection = () => {
    const connectSection = document.getElementById('connect-section');
    if (connectSection) {
      connectSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-gray-900 mb-8 leading-tight">
            The DNA Framework
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-20">
            Our framework transforms how Africa's diaspora creates change. 
            Each pillar strengthens the others, multiplying your impact across the continent.
          </p>

          {/* Three Pillars Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {/* Connect Pillar */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-dna-emerald to-dna-forest rounded-xl flex items-center justify-center">
                  <Users className="w-8 h-8 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-dna-forest mb-4">Connect</h3>
              <p className="text-gray-600 leading-relaxed">
                Build powerful relationships across the global African Diaspora. Engage with leaders, innovators, and change agents working to unlock Africa's full potential. This is where shared heritage meets collective ambition.
              </p>
            </div>

            {/* Collaborate Pillar */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-dna-copper to-dna-gold rounded-xl flex items-center justify-center">
                  <Handshake className="w-8 h-8 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-dna-copper mb-4">Collaborate</h3>
              <p className="text-gray-600 leading-relaxed">
                Be part of bold initiatives driving Africa's transformation. From breakthrough technologies to grassroots solutions, amplify your impact by working side by side with mission-aligned peers.
              </p>
            </div>

            {/* Contribute Pillar */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-dna-mint to-dna-emerald rounded-xl flex items-center justify-center">
                  <Heart className="w-8 h-8 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-dna-emerald mb-4">Contribute</h3>
              <p className="text-gray-600 leading-relaxed">
                Turn insight into action and purpose into progress. Offer your expertise, invest in ideas that matter, and help shape a legacy that spans borders and generations. Your unique skills and resources become catalysts for sustainable development.
              </p>
            </div>
          </div>

          <Button 
            onClick={scrollToConnectSection}
            className="bg-gray-800 hover:bg-gray-900 text-white rounded-full px-8 py-3 flex items-center gap-2 mx-auto"
          >
            <Play className="w-4 h-4" />
            See how it works
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HeroTriangleSection;
