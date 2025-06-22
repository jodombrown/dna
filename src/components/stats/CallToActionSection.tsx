
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const CallToActionSection = () => {
  return (
    <section className="mb-16">
      <div className="bg-gradient-to-r from-dna-emerald to-dna-copper rounded-2xl p-8 text-center text-white">
        <h3 className="text-3xl font-bold mb-4">Ready to Tap In?</h3>
        <p className="text-xl mb-8 text-white/90">Join the movement transforming Africa's future</p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            size="lg"
            className="bg-white text-dna-emerald hover:bg-white/90 font-semibold"
          >
            Join the DNA Community
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
          <Button 
            size="lg"
            variant="outline"
            className="border-white text-white hover:bg-white/20 font-semibold"
          >
            Share Your Expertise
          </Button>
          <Button 
            size="lg"
            variant="outline"
            className="border-white text-white hover:bg-white/20 font-semibold"
          >
            Pitch a Project
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CallToActionSection;
