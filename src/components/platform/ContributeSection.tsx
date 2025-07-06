
import React from 'react';
import { Button } from '@/components/ui/button';
import { Target, TrendingUp, Users, HandHeart, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAnimatedCounter } from '@/hooks/useAnimatedCounter';
import { useBreathingAnimation } from '@/hooks/useBreathingAnimation';

const ContributeSection = () => {
  const navigate = useNavigate();
  const { count: totalContributed, countRef } = useAnimatedCounter({ 
    end: 127, 
    duration: 5000 
  });
  const cardRef = useBreathingAnimation();

  return (
    <section className="py-12 sm:py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-6 sm:gap-8 lg:gap-16 items-center">
          <div className="order-2 md:order-1">
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-dna-mint to-dna-emerald rounded-xl flex items-center justify-center">
                <HandHeart className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">
                Contribute
              </h2>
            </div>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 sm:mb-8 leading-relaxed">
              Discover pathways to create lasting impact. Whether through investment, expertise, time, 
              or advocacy, find purposeful ways to advance Africa's progress.
            </p>
            
            <div className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
              <div className="flex items-center gap-3 p-3 sm:p-4 bg-dna-emerald/10 rounded-lg">
                <Target className="w-4 h-4 sm:w-5 sm:h-5 text-dna-emerald flex-shrink-0" />
                <span className="font-medium text-sm sm:text-base">Seven Pathways to Impact</span>
              </div>
              <div className="flex items-center gap-3 p-3 sm:p-4 bg-dna-emerald/10 rounded-lg">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-dna-emerald flex-shrink-0" />
                <span className="font-medium text-sm sm:text-base">Skills-Based Contributions</span>
              </div>
              <div className="flex items-center gap-3 p-3 sm:p-4 bg-dna-emerald/10 rounded-lg">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-dna-emerald flex-shrink-0" />
                <span className="font-medium text-sm sm:text-base">Real-Time Impact Tracking</span>
              </div>
            </div>

            <Button 
              onClick={() => navigate('/contribute')}
              className="bg-dna-emerald hover:bg-dna-forest text-white flex items-center gap-2 min-h-[48px] px-6 py-3 text-base font-semibold touch-manipulation"
            >
              Explore Pathways to Impact
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="relative order-1 md:order-2">
            <div 
              ref={cardRef.elementRef}
              className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 lg:p-8 cursor-pointer hover:shadow-3xl transition-shadow touch-manipulation"
              onClick={() => navigate('/contribute')}
            >
              <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-center">Your Impact Dashboard</h3>
              
              <div className="space-y-4 sm:space-y-6">
                <div className="text-center">
                  <div ref={countRef} className="text-2xl sm:text-3xl font-bold text-dna-emerald mb-2">
                    ${totalContributed}K
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600">Total Contributed</div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div className="bg-dna-mint/20 rounded-xl p-3 sm:p-4 text-center">
                    <div className="text-base sm:text-lg font-bold text-dna-emerald">847</div>
                    <div className="text-xs text-gray-600">Lives Impacted</div>
                  </div>
                  <div className="bg-dna-copper/20 rounded-xl p-3 sm:p-4 text-center">
                    <div className="text-base sm:text-lg font-bold text-dna-copper">23</div>
                    <div className="text-xs text-gray-600">Projects Funded</div>
                  </div>
                </div>
                
                <div className="bg-dna-gold/20 rounded-xl p-3 sm:p-4">
                  <h4 className="font-medium text-xs sm:text-sm mb-2">Recent Contribution</h4>
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
