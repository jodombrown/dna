
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Play, Users, Handshake, Heart, ArrowRight } from 'lucide-react';

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
          <Badge className="mb-4 bg-dna-copper text-white text-sm px-4 py-2 rounded-full">
            The DNA Framework
          </Badge>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Transform Impact Through
            <br />
            <span className="text-dna-copper">Three Core Pillars</span>
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
                Build meaningful professional networks with diaspora professionals worldwide. 
                Find mentors, collaborators, and friends who share your vision for Africa's future.
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
                Work together on meaningful projects that drive real change across Africa. 
                Join initiatives that match your expertise and passion.
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
                Make lasting impact by contributing your skills, capital, or time where it matters most. 
                Create measurable change across communities and industries.
              </p>
            </div>
          </div>

          {/* Connection Flow Visualization */}
          <div className="flex items-center justify-center mb-12 flex-wrap gap-4">
            <div className="flex items-center gap-2 bg-dna-forest text-white px-4 py-2 rounded-full text-sm font-medium">
              <Users className="w-4 h-4" />
              Connect
            </div>
            <ArrowRight className="w-5 h-5 text-dna-copper" />
            <div className="flex items-center gap-2 bg-dna-copper text-white px-4 py-2 rounded-full text-sm font-medium">
              <Handshake className="w-4 h-4" />
              Collaborate
            </div>
            <ArrowRight className="w-5 h-5 text-dna-emerald" />
            <div className="flex items-center gap-2 bg-dna-emerald text-white px-4 py-2 rounded-full text-sm font-medium">
              <Heart className="w-4 h-4" />
              Contribute
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
