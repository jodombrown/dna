
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const CTASection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          Ready to join the DNA Triangle?
        </h2>
        <p className="text-lg sm:text-xl text-gray-600 mb-8">
          Start with any pillar - connect with professionals, join a collaboration, 
          or contribute to a project. Your journey begins here.
        </p>
        <p className="text-base text-gray-500 mb-12">
          Be among the first to experience the platform that's reshaping how Africa's diaspora creates impact together.
        </p>

        <div className="grid sm:grid-cols-3 gap-4 mb-12">
          <Button 
            size="lg" 
            className="bg-dna-emerald hover:bg-dna-forest text-white px-6 sm:px-8 py-4 rounded-full text-base sm:text-lg"
          >
            Start Connecting
          </Button>
          <Button 
            size="lg" 
            className="bg-dna-copper hover:bg-dna-gold text-white px-6 sm:px-8 py-4 rounded-full text-base sm:text-lg"
          >
            Find Collaborations
          </Button>
          <Button 
            size="lg" 
            className="bg-dna-mint hover:bg-dna-emerald text-white px-6 sm:px-8 py-4 rounded-full text-base sm:text-lg"
          >
            Make Contributions
          </Button>
        </div>

        {/* Development Journey Section */}
        <div className="border-t border-gray-200 pt-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Follow Our Development Journey
          </h3>
          <p className="text-gray-600 mb-8">
            Learn about our three-phase approach to building the ultimate diaspora platform
          </p>
          <div className="grid sm:grid-cols-3 gap-4">
            <Button 
              onClick={() => navigate('/prototype-phase')}
              variant="outline"
              className="border-dna-emerald text-dna-emerald hover:bg-dna-emerald hover:text-white"
            >
              Phase 1: Prototype
            </Button>
            <Button 
              onClick={() => navigate('/building-phase')}
              variant="outline"
              className="border-dna-copper text-dna-copper hover:bg-dna-copper hover:text-white"
            >
              Phase 2: Building
            </Button>
            <Button 
              onClick={() => navigate('/mvp-phase')}
              variant="outline"
              className="border-dna-gold text-dna-gold hover:bg-dna-gold hover:text-white"
            >
              Phase 3: MVP
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
