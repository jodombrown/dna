import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { TYPOGRAPHY } from '@/lib/typography.config';

const WhoIsDNAForSection = () => {
  const navigate = useNavigate();

  const useCases = [
    "Connect with diaspora professionals across the globe",
    "Find impact opportunities in Africa",
    "Build ventures that transform communities",
    "Access capacity building and mentorship"
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Who is DNA for? */}
        <div className="mb-12">
          <h2 className={`${TYPOGRAPHY.h2} text-dna-copper mb-4`}>
            Who is DNA for?
          </h2>
          <p className="text-lg text-gray-700 mb-8">
            Anyone committed to Africa's transformation through innovation and entrepreneurship.
          </p>

          {/* Use Cases */}
          <div className="space-y-3">
            {useCases.map((useCase, index) => (
              <button
                key={index}
                onClick={() => navigate('/auth')}
                className="w-full flex items-center justify-between p-5 bg-white hover:bg-gray-50 rounded-lg border border-gray-200 transition-all duration-200 group text-left"
              >
                <span className="text-gray-900 font-medium">{useCase}</span>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-dna-copper transition-colors" />
              </button>
            ))}
          </div>
        </div>

        {/* Final CTA */}
        <div className="bg-white rounded-2xl p-8 sm:p-12 border border-gray-200 shadow-sm text-center">
          <h3 className={`${TYPOGRAPHY.h3} text-gray-900 mb-4`}>
            Join the African diaspora movement
          </h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Connect with visionary leaders, builders, and changemakers dedicated to accelerating Africa's development.
          </p>
          <Button 
            size="lg"
            onClick={() => navigate('/auth')}
            className="bg-dna-emerald hover:bg-dna-forest text-white px-8 py-3"
          >
            Get started
          </Button>
        </div>
      </div>
    </section>
  );
};

export default WhoIsDNAForSection;
