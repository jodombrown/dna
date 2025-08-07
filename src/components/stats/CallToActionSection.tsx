
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const CallToActionSection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section aria-labelledby="cta-title" className="mt-10">
      <div className="bg-gradient-to-r from-dna-emerald/15 via-white to-dna-copper/10 border rounded-2xl p-6 md:p-8 shadow-sm animate-fade-in">
        <div className="text-center">
          <h2 id="cta-title" className="text-xl md:text-2xl font-semibold text-dna-forest">
            Ready to Build with DNA?
          </h2>
          <p className="text-gray-700 mt-2">
            Explore the prototype, join the journey, and partner to scale impact.
          </p>
        </div>
        <div className="mt-5 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            size="lg"
            className="bg-dna-emerald hover:bg-dna-forest text-white rounded-full px-6 hover-scale"
            onClick={() => navigate('/about')}
            aria-label="Learn about DNA"
          >
            Learn About DNA
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="border-dna-copper text-dna-copper hover:bg-dna-copper hover:text-white rounded-full px-6 hover-scale"
            onClick={() => navigate('/about')}
            aria-label="Join the waitlist"
          >
            Join the Waitlist
          </Button>
          <a
            href="mailto:feedback@diasporanetwork.africa?subject=Partner%20with%20DNA"
            className="hover-scale"
            aria-label="Email DNA to partner"
          >
            <Button variant="secondary" size="lg" className="rounded-full px-6">
              Become a Partner
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
};

export default CallToActionSection;
