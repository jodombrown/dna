
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Target, Calendar } from 'lucide-react';

const PlatformBadges = () => {
  return (
    <div className="flex flex-wrap items-center justify-center gap-6 mb-8">
      <Badge className="bg-dna-copper/10 text-dna-forest border-dna-copper px-4 py-2 text-sm font-semibold hover:bg-dna-copper/20">
        <Sparkles className="w-4 h-4 mr-2 text-dna-copper" />
        Prototype: June 2025
      </Badge>
      <Badge className="bg-dna-emerald/10 text-dna-forest border-dna-emerald px-4 py-2 text-sm font-semibold hover:bg-dna-emerald/20">
        <Target className="w-4 h-4 mr-2 text-dna-emerald" />
        Building Phase: Now
      </Badge>
      <Badge className="bg-dna-mint/20 text-dna-forest border-dna-mint px-4 py-2 text-sm font-semibold hover:bg-dna-mint/30">
        <Calendar className="w-4 h-4 mr-2 text-dna-forest" />
        MVP Phase Launch: November 2025
      </Badge>
    </div>
  );
};

export default PlatformBadges;
