
import React from 'react';
import { Button } from '@/components/ui/button';

const CTASection = () => {
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

        <div className="grid sm:grid-cols-3 gap-4">
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
      </div>
    </section>
  );
};

export default CTASection;
