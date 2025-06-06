
import React from 'react';
import { Badge } from '@/components/ui/badge';
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

          {/* Triangle and Labels Section */}
          <div className="grid lg:grid-cols-3 gap-8 items-center mb-16">
            {/* Connect - Left */}
            <div className="text-center lg:text-right space-y-4">
              <div className="flex justify-center lg:justify-end">
                <div className="w-20 h-20 bg-gradient-to-br from-dna-emerald to-dna-forest rounded-2xl flex items-center justify-center shadow-lg">
                  <Users className="w-10 h-10 text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-dna-forest mb-3">Connect</h3>
                <p className="text-gray-600 leading-relaxed">
                  Build meaningful professional networks with diaspora professionals worldwide. 
                  Find mentors, collaborators, and friends who share your vision for Africa's future.
                </p>
              </div>
            </div>

            {/* Triangle - Center */}
            <div className="flex justify-center">
              <div className="relative w-48 h-48">
                <svg className="w-full h-full" viewBox="0 0 200 180">
                  <defs>
                    <linearGradient id="triangleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#10B981" stopOpacity="0.1"/>
                      <stop offset="50%" stopColor="#F59E0B" stopOpacity="0.1"/>
                      <stop offset="100%" stopColor="#34D399" stopOpacity="0.1"/>
                    </linearGradient>
                  </defs>
                  <path
                    d="M100 30 L160 140 L40 140 Z"
                    fill="url(#triangleGradient)"
                    stroke="#B8860B"
                    strokeWidth="3"
                  />
                  
                  {/* Connection lines */}
                  <line x1="100" y1="30" x2="160" y2="140" stroke="#B8860B" strokeWidth="2" strokeDasharray="5,5" opacity="0.5"/>
                  <line x1="160" y1="140" x2="40" y2="140" stroke="#B8860B" strokeWidth="2" strokeDasharray="5,5" opacity="0.5"/>
                  <line x1="40" y1="140" x2="100" y2="30" stroke="#B8860B" strokeWidth="2" strokeDasharray="5,5" opacity="0.5"/>
                </svg>
              </div>
            </div>

            {/* Contribute - Right */}
            <div className="text-center lg:text-left space-y-4">
              <div className="flex justify-center lg:justify-start">
                <div className="w-20 h-20 bg-gradient-to-br from-dna-mint to-dna-emerald rounded-2xl flex items-center justify-center shadow-lg">
                  <Heart className="w-10 h-10 text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-dna-emerald mb-3">Contribute</h3>
                <p className="text-gray-600 leading-relaxed">
                  Make lasting impact by contributing your skills, capital, or time where it matters most. 
                  Create measurable change across communities and industries.
                </p>
              </div>
            </div>
          </div>

          {/* Collaborate - Bottom Center */}
          <div className="max-w-md mx-auto text-center space-y-4 mb-12">
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-gradient-to-br from-dna-copper to-dna-gold rounded-2xl flex items-center justify-center shadow-lg">
                <Handshake className="w-10 h-10 text-white" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-dna-copper mb-3">Collaborate</h3>
              <p className="text-gray-600 leading-relaxed">
                Work together on meaningful projects that drive real change across Africa. 
                Join initiatives that match your expertise and passion.
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
