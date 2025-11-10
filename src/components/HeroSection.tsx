import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import DiasporaStats from '@/components/DiasporaStats';
import { TYPOGRAPHY } from '@/lib/typography.config';
import RequestDemoDialog from '@/components/RequestDemoDialog';
import JoinBetaDialog from '@/components/JoinBetaDialog';
import PatternBackground from '@/components/ui/PatternBackground';
import heroProfessional from '@/assets/hero-professional.jpeg';

const HeroSection = () => {
  const navigate = useNavigate();
  const [isDemoDialogOpen, setIsDemoDialogOpen] = useState(false);
  const [isBetaDialogOpen, setIsBetaDialogOpen] = useState(false);

  return (
    <>
      {/* Main Hero Section with Kente pattern */}
      <PatternBackground pattern="kente" intensity="subtle" className="relative bg-gradient-to-br from-dna-terra-light/20 via-white to-dna-ochre-light/10 pt-2">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-12 xl:px-16 2xl:px-24">
          <div className="grid lg:grid-cols-2 gap-8 items-center min-h-[60vh] py-6">
            
            {/* Left Column, Main Content */}
            <div className="space-y-6 lg:space-y-8">
              {/* Main Headline */}
              <div className="text-center lg:text-left">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-dna-forest mb-6 lg:mb-8 leading-tight">
                  Welcome to the
                  <br />
                  <span className="text-dna-copper">Diaspora Network of Africa</span>
                </h1>
                
                <p className="text-lg sm:text-xl lg:text-2xl text-gray-700 mb-8 lg:mb-10 leading-relaxed">
                  Connecting Africa's diaspora professionals for transformative global impact through 
                  <span className="font-semibold text-dna-emerald"> capacity building</span>, 
                  <span className="font-semibold text-dna-copper"> venture building</span>, and 
                  <span className="font-semibold text-dna-forest"> ecosystem building</span>.
                </p>

                {/* LinkedIn-style Auth Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 lg:gap-5 justify-center lg:justify-start mb-6 lg:mb-8">
                  <Button 
                    variant="outline"
                    size="lg" 
                    onClick={() => navigate('/auth')}
                    className="border-2 border-dna-emerald text-dna-emerald hover:bg-dna-emerald hover:text-white text-base lg:text-lg px-6 lg:px-8 py-3 lg:py-4 h-auto"
                  >
                    Sign in
                  </Button>
                  <Button 
                    variant="default" 
                    size="lg"
                    onClick={() => setIsBetaDialogOpen(true)}
                    className="bg-dna-emerald hover:bg-dna-forest text-base lg:text-lg px-6 lg:px-8 py-3 lg:py-4 h-auto"
                  >
                    Join Our Beta
                  </Button>
                  <Button 
                    variant="outline"
                    size="lg" 
                    onClick={() => setIsDemoDialogOpen(true)}
                    className="border-2 border-dna-copper text-dna-copper hover:bg-dna-copper hover:text-white text-base lg:text-lg px-6 lg:px-8 py-3 lg:py-4 h-auto"
                  >
                    Request a Demo
                  </Button>
                </div>

                {/* Legal Disclaimer */}
                <p className="text-sm lg:text-base text-gray-600 mb-6 text-center lg:text-left">
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

            {/* Right Column, Hero Image */}
            <div className="relative h-full min-h-[400px] lg:min-h-[500px]">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl h-full">
                <img 
                  src={heroProfessional} 
                  alt="African diaspora professionals collaborating and working together" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Background Pattern */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
          <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-dna-sunset/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 left-1/4 w-48 h-48 bg-dna-terra/10 rounded-full blur-3xl"></div>
        </div>
      </PatternBackground>

      {/* Statistics Section with Mudcloth pattern */}
      <PatternBackground pattern="mudcloth" intensity="subtle" className="py-10 bg-gradient-to-r from-dna-terra/10 to-dna-sunset/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <DiasporaStats />
        </div>
      </PatternBackground>


      <RequestDemoDialog 
        isOpen={isDemoDialogOpen} 
        onClose={() => setIsDemoDialogOpen(false)} 
      />

      <JoinBetaDialog 
        isOpen={isBetaDialogOpen} 
        onClose={() => setIsBetaDialogOpen(false)} 
      />
    </>
  );
};

export default HeroSection;
