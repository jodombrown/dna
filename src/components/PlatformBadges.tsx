
import React from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Target, Calendar, Search, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PlatformBadges = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
      <Button 
        onClick={() => navigate('/prototyping-phase')}
        variant="outline"
        className="bg-dna-mint/20 text-dna-forest border-dna-mint px-3 py-2 text-xs font-semibold hover:bg-dna-mint hover:text-white transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 animate-pulse"
      >
        <Sparkles className="w-3 h-3 mr-1 text-dna-mint" />
        Phase 1: Prototyping
      </Button>
      <Button 
        onClick={() => navigate('/build-phase')}
        variant="outline"
        className="bg-dna-copper/10 text-dna-forest border-dna-copper px-3 py-2 text-xs font-semibold hover:bg-dna-copper hover:text-white transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 animate-bounce"
      >
        <Target className="w-3 h-3 mr-1 text-dna-copper" />
        Phase 2: Build (Current)
      </Button>
      <Button 
        onClick={() => navigate('/mvp-phase')}
        variant="outline"
        className="bg-dna-emerald/10 text-dna-forest border-dna-emerald px-3 py-2 text-xs font-semibold hover:bg-dna-emerald hover:text-white transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 hover:rotate-1"
      >
        <Calendar className="w-3 h-3 mr-1 text-dna-emerald" />
        Phase 3: MVP Launch
      </Button>
      <Button 
        onClick={() => navigate('/customer-discovery-phase')}
        variant="outline"
        className="bg-dna-forest/10 text-dna-forest border-dna-forest px-3 py-2 text-xs font-semibold hover:bg-dna-forest hover:text-white transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 animate-pulse"
      >
        <Search className="w-3 h-3 mr-1 text-dna-forest" />
        Phase 4: Customer Discovery
      </Button>
      <Button 
        onClick={() => navigate('/go-to-market-phase')}
        variant="outline"
        className="bg-dna-gold/10 text-dna-forest border-dna-gold px-3 py-2 text-xs font-semibold hover:bg-dna-gold hover:text-white transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 hover:-rotate-1"
      >
        <TrendingUp className="w-3 h-3 mr-1 text-dna-gold" />
        Phase 5: Go-to-Market
      </Button>
    </div>
  );
};

export default PlatformBadges;
