
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Play, Users, Handshake, Heart } from 'lucide-react';

const HeroTriangleSection = () => {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-dna-copper text-white text-sm px-4 py-2 rounded-full">
            The DNA Framework
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Connect. Collaborate.
            <br />
            <span className="text-dna-copper">Contribute.</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-12">
            The triangular framework that powers Africa's diaspora network. 
            Each pillar strengthens the others, creating unstoppable momentum for impact.
          </p>

          {/* DNA Triangle Visual */}
          <div className="relative max-w-md mx-auto mb-12">
            <div className="relative w-64 h-64 mx-auto">
              {/* Triangle outline */}
              <svg className="w-full h-full" viewBox="0 0 200 180">
                <path
                  d="M100 20 L170 150 L30 150 Z"
                  fill="none"
                  stroke="#B8860B"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                />
              </svg>
              
              {/* Connect */}
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
                <div className="w-16 h-16 bg-gradient-to-br from-dna-emerald to-dna-forest rounded-2xl flex items-center justify-center shadow-lg">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <p className="text-sm font-semibold mt-2 text-dna-forest">Connect</p>
              </div>
              
              {/* Collaborate */}
              <div className="absolute bottom-8 left-4">
                <div className="w-16 h-16 bg-gradient-to-br from-dna-copper to-dna-gold rounded-2xl flex items-center justify-center shadow-lg">
                  <Handshake className="w-8 h-8 text-white" />
                </div>
                <p className="text-sm font-semibold mt-2 text-dna-copper">Collaborate</p>
              </div>
              
              {/* Contribute */}
              <div className="absolute bottom-8 right-4">
                <div className="w-16 h-16 bg-gradient-to-br from-dna-mint to-dna-emerald rounded-2xl flex items-center justify-center shadow-lg">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <p className="text-sm font-semibold mt-2 text-dna-emerald">Contribute</p>
              </div>
            </div>
          </div>

          <Button className="bg-gray-800 hover:bg-gray-900 text-white rounded-full px-8 py-3 flex items-center gap-2 mx-auto">
            <Play className="w-4 h-4" />
            See how it works
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HeroTriangleSection;
