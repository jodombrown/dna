
import React from "react";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

/**
 * Universal prototype phase info/feedback banner.
 * Place just below the global header or page header.
 */
const PrototypeBanner: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-gradient-to-r from-dna-emerald/15 via-dna-copper/10 to-dna-gold/10 border-b border-dna-emerald/30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-4">
        <div className="flex items-start gap-3">
          <Info className="w-6 h-6 text-dna-emerald mt-1 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-md md:text-lg text-dna-forest mb-0.5">
              You're using the DNA Platform Prototype!
            </h3>
            <p className="text-xs md:text-sm text-gray-700">
              This is an early preview of Diaspora Network of Africa—your ideas, feedback, and involvement
              will shape the future of our community-powered professional platform.
              <br className="hidden md:block" />
              <span className="font-semibold">Help us build a home for Africa's Diaspora!</span>
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            size="sm"
            onClick={() => navigate('/contribute')}
            className="bg-dna-copper hover:bg-dna-gold text-white"
          >
            Give Feedback
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PrototypeBanner;
