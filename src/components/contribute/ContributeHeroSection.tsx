
import React from 'react';
import { Button } from '@/components/ui/button';
import { HandHeart, Users, Target, TrendingUp } from 'lucide-react';

interface ContributeHeroSectionProps {
  onCreateOpportunity: () => void;
  onExploreOpportunities: () => void;
}

const ContributeHeroSection: React.FC<ContributeHeroSectionProps> = ({
  onCreateOpportunity,
  onExploreOpportunities
}) => {
  return (
    <div className="bg-gradient-to-br from-dna-emerald/10 via-dna-mint/5 to-dna-copper/10 rounded-3xl p-8 mb-8">
      <div className="max-w-4xl mx-auto text-center">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-dna-emerald to-dna-mint rounded-2xl flex items-center justify-center">
            <HandHeart className="w-8 h-8 text-white" />
          </div>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Your Gateway to African Impact
        </h1>
        
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Discover meaningful ways to advance Africa's progress. Whether through funding, expertise, 
          time, or advocacy—find your pathway to lasting impact and join a community of changemakers.
        </p>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/70 backdrop-blur rounded-xl p-4">
            <Users className="w-8 h-8 text-dna-emerald mx-auto mb-2" />
            <h3 className="font-semibold text-gray-900">Join 2,847+ Contributors</h3>
            <p className="text-sm text-gray-600">Active community members</p>
          </div>
          <div className="bg-white/70 backdrop-blur rounded-xl p-4">
            <Target className="w-8 h-8 text-dna-copper mx-auto mb-2" />
            <h3 className="font-semibold text-gray-900">156 Active Opportunities</h3>
            <p className="text-sm text-gray-600">Ways to contribute today</p>
          </div>
          <div className="bg-white/70 backdrop-blur rounded-xl p-4">
            <TrendingUp className="w-8 h-8 text-dna-gold mx-auto mb-2" />
            <h3 className="font-semibold text-gray-900">$4.2M+ Impact Created</h3>
            <p className="text-sm text-gray-600">Community contributions</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            onClick={onExploreOpportunities}
            size="lg"
            className="bg-dna-emerald hover:bg-dna-forest text-white"
          >
            Explore Opportunities
          </Button>
          <Button 
            onClick={onCreateOpportunity}
            size="lg"
            variant="outline"
            className="border-dna-emerald text-dna-emerald hover:bg-dna-emerald hover:text-white"
          >
            Create Opportunity
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ContributeHeroSection;
