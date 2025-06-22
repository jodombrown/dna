
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, ExternalLink } from 'lucide-react';

const CallToActionSection = () => {
  return (
    <>
      {/* Call-to-Action Band */}
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

      {/* Sources & Further Reading */}
      <section className="border-t border-gray-200 pt-8">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">Sources & Further Reading</h4>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <ExternalLink className="w-4 h-4" />
            <span>World Bank, Migration & Development Brief, Apr 2025</span>
          </div>
          <div className="flex items-center gap-2">
            <ExternalLink className="w-4 h-4" />
            <span>Brookings, "Diaspora & Investment Flows," 2024</span>
          </div>
          <div className="flex items-center gap-2">
            <ExternalLink className="w-4 h-4" />
            <span>UNESCO, "Global Skills Mobility Report," 2023</span>
          </div>
          <div className="flex items-center gap-2">
            <ExternalLink className="w-4 h-4" />
            <span>AfDB, "Annual Remittances Report," 2024</span>
          </div>
        </div>
      </section>
    </>
  );
};

export default CallToActionSection;
