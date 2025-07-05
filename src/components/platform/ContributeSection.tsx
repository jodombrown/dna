
import React from 'react';
import { Button } from '@/components/ui/button';
import { Target, TrendingUp, Users, HandHeart, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAnimatedCounter } from '@/hooks/useAnimatedCounter';

const ContributeSection = () => {
  const navigate = useNavigate();
  const { count: totalContributed, countRef } = useAnimatedCounter({ 
    end: 127, 
    duration: 3500 
  });

  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-dna-mint to-dna-emerald rounded-xl flex items-center justify-center">
                <HandHeart className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
                Contribute
              </h2>
            </div>
            <p className="text-xl text-gray-600 mb-8">
              Discover pathways to create lasting impact. Whether through investment, expertise, time, 
              or advocacy, find purposeful ways to advance Africa's progress.
            </p>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3 p-4 bg-dna-emerald/10 rounded-lg">
                <Target className="w-5 h-5 text-dna-emerald" />
                <span className="font-medium">Seven Pathways to Impact</span>
              </div>
              <div className="flex items-center gap-3 p-4 bg-dna-emerald/10 rounded-lg">
                <Users className="w-5 h-5 text-dna-emerald" />
                <span className="font-medium">Skills-Based Contributions</span>
              </div>
              <div className="flex items-center gap-3 p-4 bg-dna-emerald/10 rounded-lg">
                <TrendingUp className="w-5 h-5 text-dna-emerald" />
                <span className="font-medium">Real-Time Impact Tracking</span>
              </div>
            </div>

            <Button 
              onClick={() => navigate('/contribute')}
              className="bg-dna-emerald hover:bg-dna-forest text-white flex items-center gap-2"
            >
              Explore Pathways to Impact
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="relative">
            <div 
              className="bg-white rounded-3xl shadow-2xl p-8 cursor-pointer hover:shadow-3xl transition-shadow"
              onClick={() => navigate('/contribute')}
            >
              <h3 className="text-xl font-semibold mb-6 text-center">Your Impact Dashboard</h3>
              
              <div className="space-y-6">
                <div className="text-center">
                  <div ref={countRef} className="text-3xl font-bold text-dna-emerald mb-2">
                    ${totalContributed}K
                  </div>
                  <div className="text-sm text-gray-600">Total Contributed</div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-dna-mint/20 rounded-xl p-4 text-center">
                    <div className="text-lg font-bold text-dna-emerald">847</div>
                    <div className="text-xs text-gray-600">Lives Impacted</div>
                  </div>
                  <div className="bg-dna-copper/20 rounded-xl p-4 text-center">
                    <div className="text-lg font-bold text-dna-copper">23</div>
                    <div className="text-xs text-gray-600">Projects Funded</div>
                  </div>
                </div>
                
                <div className="bg-dna-gold/20 rounded-xl p-4">
                  <h4 className="font-medium text-sm mb-2">Recent Contribution</h4>
                  <p className="text-xs text-gray-600 mb-2">Solar Education Initiative</p>
                  <div className="text-sm font-bold text-dna-forest">$15,000 invested</div>
                  <div className="text-xs text-dna-emerald">+12% projected impact ROI</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContributeSection;
