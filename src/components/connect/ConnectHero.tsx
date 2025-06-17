
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Users, Globe, Target } from 'lucide-react';

const ConnectHero = () => {
  return (
    <div className="bg-gradient-to-br from-dna-emerald via-dna-forest to-dna-copper">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white">
              Connect
            </h1>
          </div>
          
          <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
            Build meaningful professional relationships across the diaspora. 
            Discover opportunities, expand your network, and find your tribe through purpose-driven connections.
          </p>
          
          <div className="flex justify-center gap-4 mb-8">
            <Badge className="bg-white/20 text-white border-white/30 text-sm px-4 py-2">
              <Globe className="w-4 h-4 mr-2" />
              50K+ Global Professionals
            </Badge>
            <Badge className="bg-white/20 text-white border-white/30 text-sm px-4 py-2">
              <Target className="w-4 h-4 mr-2" />
              Smart Matching
            </Badge>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 max-w-2xl mx-auto">
            <p className="text-white/80 text-sm">
              🧭 <strong>Platform Preview - Prototype Stage:</strong> Experience our vision for diaspora networking. 
              This demonstrates the seamless connection capabilities we're developing to unite the African diaspora globally.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectHero;
