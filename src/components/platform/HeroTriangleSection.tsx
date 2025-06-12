
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
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            The DNA Framework
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-16">
            Our framework transforms how Africa's diaspora creates change. 
            Each pillar strengthens the others, multiplying your impact across the continent.
          </p>

          {/* Three Pillars Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {/* Connect Pillar */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-dna-emerald to-dna-forest rounded-xl flex items-center justify-center">
                  <Users className="w-8 h-8 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-dna-forest mb-4">Connect</h3>
              <p className="text-gray-600 leading-relaxed">
                Transform your career and amplify your voice by joining Africa's most influential diaspora network. 
                Connect with visionary leaders, innovative entrepreneurs, and passionate changemakers who share 
                your commitment to Africa's renaissance and global impact.
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
                Join forces on game-changing initiatives that reshape Africa's future. From fintech innovations 
                to sustainable agriculture, healthcare breakthroughs to educational transformation—collaborate 
                on projects that leverage your unique skills while creating lasting continental impact.
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
                Make your mark on Africa's transformation story. Whether through strategic investments, 
                professional mentorship, or sharing your expertise, create measurable impact that resonates 
                across communities, industries, and generations while building a legacy of positive change.
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
