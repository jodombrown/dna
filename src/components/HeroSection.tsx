import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import DiasporaStats from '@/components/DiasporaStats';
import { TYPOGRAPHY } from '@/lib/typography.config';
import MainPageFeedbackPanel from '@/components/MainPageFeedbackPanel';
import PatternBackground from '@/components/ui/PatternBackground';

const HeroSection = () => {
  const navigate = useNavigate();
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  return (
    <>
      {/* Main Hero Section - LinkedIn-inspired clean design */}
      <PatternBackground pattern="kente" intensity="subtle" className="relative bg-gradient-to-br from-white via-dna-terra-light/5 to-white pt-16 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-8">
            
            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-dna-forest leading-tight">
              Welcome to your
              <br />
              professional community
            </h1>

            {/* Auth Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto">
              <Button 
                variant="outline"
                size="lg" 
                onClick={() => navigate('/auth')}
                className="w-full sm:w-auto min-w-[140px] border-2 border-dna-emerald text-dna-emerald hover:bg-dna-emerald hover:text-white"
              >
                Sign in
              </Button>
              <Button 
                variant="default" 
                size="lg"
                onClick={() => navigate('/auth')}
                className="w-full sm:w-auto min-w-[140px] bg-dna-emerald hover:bg-dna-forest"
              >
                Join for free
              </Button>
            </div>

            {/* Legal Disclaimer */}
            <p className="text-sm text-gray-600 max-w-2xl mx-auto px-4">
              By clicking Continue to join or sign in, you agree to DNA's{' '}
              <a href="/legal/user-agreement" className="text-dna-copper hover:underline font-medium">
                User Agreement
              </a>
              ,{' '}
              <a href="/legal/privacy-policy" className="text-dna-copper hover:underline font-medium">
                Privacy Policy
              </a>
              , and{' '}
              <a href="/legal/terms" className="text-dna-copper hover:underline font-medium">
                Terms & Conditions
              </a>
              .
            </p>
          </div>
        </div>

        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10 opacity-30">
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-dna-sunset/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/3 left-1/4 w-64 h-64 bg-dna-terra/10 rounded-full blur-3xl"></div>
        </div>
      </PatternBackground>

      {/* Statistics Section with Mudcloth pattern */}
      <PatternBackground pattern="mudcloth" intensity="subtle" className="py-10 bg-gradient-to-r from-dna-terra/10 to-dna-sunset/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <DiasporaStats />
        </div>
      </PatternBackground>


      <MainPageFeedbackPanel 
        isOpen={isFeedbackOpen} 
        onClose={() => setIsFeedbackOpen(false)} 
      />
    </>
  );
};

export default HeroSection;
