
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
            Three Pillars,
            <br />
            <span className="text-dna-copper">Infinite Impact</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-12">
            Our framework transforms how Africa's diaspora creates change. 
            Each pillar strengthens the others, multiplying your impact across the continent.
          </p>

          {/* Enhanced Triangle Visual */}
          <div className="relative max-w-md mx-auto mb-12">
            <div className="relative w-64 h-64 mx-auto">
              {/* Triangle background with gradient */}
              <svg className="w-full h-full" viewBox="0 0 200 180">
                <defs>
                  <linearGradient id="triangleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10B981" stopOpacity="0.1"/>
                    <stop offset="50%" stopColor="#F59E0B" stopOpacity="0.1"/>
                    <stop offset="100%" stopColor="#34D399" stopOpacity="0.1"/>
                  </linearGradient>
                </defs>
                <path
                  d="M100 20 L170 150 L30 150 Z"
                  fill="url(#triangleGradient)"
                  stroke="#B8860B"
                  strokeWidth="2"
                  strokeDasharray="none"
                />
              </svg>
              
              {/* Connect - Top */}
              <div className="absolute top-2 left-1/2 transform -translate-x-1/2">
                <div className="w-16 h-16 bg-gradient-to-br from-dna-emerald to-dna-forest rounded-2xl flex items-center justify-center shadow-lg border-2 border-white">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <div className="text-center mt-2">
                  <p className="text-sm font-bold text-dna-forest">Connect</p>
                  <p className="text-xs text-gray-600">Build networks</p>
                </div>
              </div>
              
              {/* Collaborate - Bottom Left */}
              <div className="absolute bottom-6 left-2">
                <div className="w-16 h-16 bg-gradient-to-br from-dna-copper to-dna-gold rounded-2xl flex items-center justify-center shadow-lg border-2 border-white">
                  <Handshake className="w-8 h-8 text-white" />
                </div>
                <div className="text-center mt-2">
                  <p className="text-sm font-bold text-dna-copper">Collaborate</p>
                  <p className="text-xs text-gray-600">Work together</p>
                </div>
              </div>
              
              {/* Contribute - Bottom Right */}
              <div className="absolute bottom-6 right-2">
                <div className="w-16 h-16 bg-gradient-to-br from-dna-mint to-dna-emerald rounded-2xl flex items-center justify-center shadow-lg border-2 border-white">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <div className="text-center mt-2">
                  <p className="text-sm font-bold text-dna-emerald">Contribute</p>
                  <p className="text-xs text-gray-600">Create impact</p>
                </div>
              </div>

              {/* Connection lines */}
              <div className="absolute top-12 left-1/2 transform -translate-x-1/2">
                <div className="flex items-center space-x-2">
                  <ArrowRight className="w-4 h-4 text-dna-gold transform rotate-45" />
                </div>
              </div>
            </div>
          </div>

          {/* Value Proposition */}
          <div className="grid md:grid-cols-3 gap-8 mb-12 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-12 h-12 bg-dna-emerald/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-dna-emerald" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Professional Networks</h3>
              <p className="text-sm text-gray-600">Find and connect with like-minded diaspora professionals worldwide</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-dna-copper/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Handshake className="w-6 h-6 text-dna-copper" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Meaningful Projects</h3>
              <p className="text-sm text-gray-600">Join collaborations that drive real change across Africa</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-dna-mint/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Heart className="w-6 h-6 text-dna-emerald" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Lasting Impact</h3>
              <p className="text-sm text-gray-600">Contribute your skills, capital, or time where it matters most</p>
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
