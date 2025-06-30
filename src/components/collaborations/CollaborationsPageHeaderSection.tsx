
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Users, Zap } from 'lucide-react';

const CollaborationsPageHeaderSection = () => {
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Users className="w-8 h-8 text-dna-copper" />
            <Zap className="w-6 h-6 text-dna-gold" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Discover Impact Initiatives
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join meaningful projects driving positive change across Africa. 
            Your unique skills, global network, and diaspora perspective can create lasting impact.
          </p>
          <div className="flex items-center justify-center gap-4 mt-6">
            <Badge className="bg-dna-emerald text-white px-4 py-2">
              🌍 Pan-African Focus
            </Badge>
            <Badge className="bg-dna-copper text-white px-4 py-2">
              🤝 Diaspora-Led
            </Badge>
            <Badge className="bg-dna-gold text-white px-4 py-2">
              📈 Impact-Driven
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollaborationsPageHeaderSection;
