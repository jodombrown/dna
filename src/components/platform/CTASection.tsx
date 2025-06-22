
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import StayNotifiedPanel from '@/components/StayNotifiedPanel';

const CTASection = () => {
  const [isStayNotifiedOpen, setIsStayNotifiedOpen] = useState(false);

  return (
    <>
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Let's Shape Africa's Future, Together!
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 mb-6">
            Join thousands of diaspora professionals who are already connecting, 
            collaborating, and contributing to Africa's progress.
          </p>
          
          <Button 
            onClick={() => setIsStayNotifiedOpen(true)}
            size="lg" 
            className="bg-dna-emerald hover:bg-dna-forest text-white px-8 py-4 rounded-full text-lg font-semibold"
          >
            Stay Notified
          </Button>
        </div>
      </section>

      <StayNotifiedPanel 
        isOpen={isStayNotifiedOpen} 
        onClose={() => setIsStayNotifiedOpen(false)} 
      />
    </>
  );
};

export default CTASection;
