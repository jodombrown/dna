
import React from 'react';
import { Button } from '@/components/ui/button';
import { Search, Code, Users, Target, BarChart3, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PlatformBadges = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
      <Button 
        onClick={() => navigate('/market-research-phase')}
        variant="outline"
        className="bg-blue-500/10 text-dna-forest border-blue-500 px-4 py-3 text-sm font-semibold 
                   shadow-lg hover:shadow-xl hover:-translate-y-1 
                   transition-all duration-300 ease-out 
                   hover:bg-blue-500 hover:text-white hover:scale-105 hover:border-blue-500"
      >
        <Search className="w-4 h-4 mr-2" />
        Phase 1: Market Research
      </Button>
      <Button 
        onClick={() => navigate('/prototyping-phase')}
        variant="outline"
        className="bg-dna-emerald/10 text-dna-forest border-dna-emerald px-4 py-3 text-sm font-semibold 
                   shadow-lg hover:shadow-xl hover:-translate-y-1 
                   transition-all duration-300 ease-out delay-75
                   hover:bg-dna-emerald hover:text-white hover:scale-105 hover:border-dna-emerald
                   hover:rotate-1"
      >
        <Code className="w-4 h-4 mr-2" />
        Phase 2: Prototyping
      </Button>
      <Button 
        onClick={() => navigate('/customer-discovery-phase')}
        variant="outline"
        className="bg-green-500/10 text-dna-forest border-green-500 px-4 py-3 text-sm font-semibold 
                   shadow-lg hover:shadow-xl hover:-translate-y-1 
                   transition-all duration-300 ease-out delay-150
                   hover:bg-green-500 hover:text-white hover:scale-105 hover:border-green-500
                   hover:-rotate-1"
      >
        <Users className="w-4 h-4 mr-2" />
        Phase 3: Customer Discovery
      </Button>
      <Button 
        onClick={() => navigate('/mvp-phase')}
        variant="outline"
        className="bg-dna-copper/10 text-dna-forest border-dna-copper px-4 py-3 text-sm font-semibold 
                   shadow-lg hover:shadow-xl hover:-translate-y-1 
                   transition-all duration-300 ease-out delay-225
                   hover:bg-dna-copper hover:text-white hover:scale-105 hover:border-dna-copper
                   hover:rotate-2"
      >
        <Target className="w-4 h-4 mr-2" />
        Phase 4: MVP Build
      </Button>
      <Button 
        onClick={() => navigate('/beta-validation-phase')}
        variant="outline"
        className="bg-purple-500/10 text-dna-forest border-purple-500 px-4 py-3 text-sm font-semibold 
                   shadow-lg hover:shadow-xl hover:-translate-y-1 
                   transition-all duration-300 ease-out delay-300
                   hover:bg-purple-500 hover:text-white hover:scale-105 hover:border-purple-500
                   hover:-rotate-2"
      >
        <BarChart3 className="w-4 h-4 mr-2" />
        Phase 5: Beta Validation
      </Button>
      <Button 
        onClick={() => navigate('/go-to-market-phase')}
        variant="outline"
        className="bg-dna-gold/10 text-dna-forest border-dna-gold px-4 py-3 text-sm font-semibold 
                   shadow-lg hover:shadow-xl hover:-translate-y-1 
                   transition-all duration-300 ease-out delay-375
                   hover:bg-dna-gold hover:text-dna-forest hover:scale-105 hover:border-dna-gold
                   hover:rotate-1"
      >
        <TrendingUp className="w-4 h-4 mr-2" />
        Phase 6: Go-to-Market
      </Button>
    </div>
  );
};

export default PlatformBadges;
