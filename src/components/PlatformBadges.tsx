
import React from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Target, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PlatformBadges = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-wrap items-center justify-center gap-6 mb-8">
      <Button 
        onClick={() => navigate('/prototype-phase')}
        variant="outline"
        className="bg-dna-copper/10 text-dna-forest border-dna-copper px-4 py-2 text-sm font-semibold hover:bg-dna-copper hover:text-white transition-colors"
      >
        <Sparkles className="w-4 h-4 mr-2 text-dna-copper" />
        Prototype: June 2025
      </Button>
      <Button 
        onClick={() => navigate('/building-phase')}
        variant="outline"
        className="bg-dna-emerald/10 text-dna-forest border-dna-emerald px-4 py-2 text-sm font-semibold hover:bg-dna-emerald hover:text-white transition-colors"
      >
        <Target className="w-4 h-4 mr-2 text-dna-emerald" />
        Building Phase: Now
      </Button>
      <Button 
        onClick={() => navigate('/mvp-phase')}
        variant="outline"
        className="bg-dna-mint/20 text-dna-forest border-dna-mint px-4 py-2 text-sm font-semibold hover:bg-dna-mint hover:text-white transition-colors"
      >
        <Calendar className="w-4 h-4 mr-2 text-dna-forest" />
        MVP Phase Launch: November 2025
      </Button>
    </div>
  );
};

export default PlatformBadges;
