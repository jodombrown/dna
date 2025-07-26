import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Users, ArrowRight } from 'lucide-react';

const CallToActionSection = () => {
  const navigate = useNavigate();

  const openWaitlistModal = () => {
    window.dispatchEvent(new CustomEvent('openWaitlist'));
  };

  return (
    <section className="py-16 bg-gradient-to-br from-dna-emerald/10 via-white to-dna-copper/10">
      <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl md:text-5xl font-bold text-dna-forest mb-6">
          The Diaspora isn't waiting — we're building.
        </h2>
        
        <p className="text-xl md:text-2xl text-gray-700 mb-8 leading-relaxed">
          Tap into a purpose-driven network of professionals committed to real change. From bold ideas to scalable solutions, DNA is where vision becomes reality.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            size="lg" 
            className="bg-dna-emerald hover:bg-dna-forest text-white px-8 py-4 text-lg font-semibold rounded-full"
            onClick={openWaitlistModal}
          >
            <Users className="w-5 h-5 mr-2" />
            Join the Beta
          </Button>
          <Button 
            variant="outline" 
            size="lg"
            className="border-dna-copper text-dna-copper hover:bg-dna-copper hover:text-white px-8 py-4 text-lg font-semibold rounded-full"
            onClick={() => navigate('/collaborate')}
          >
            <ArrowRight className="w-5 h-5 mr-2" />
            Explore Projects
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CallToActionSection;