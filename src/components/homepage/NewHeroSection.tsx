import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface CTAButton {
  label: string;
  link_to: string;
  style: 'primary' | 'secondary';
}

interface NewHeroSectionProps {
  headline: string;
  subheadline: string;
  cta_buttons: CTAButton[];
  onJoinBeta: () => void;
}

const NewHeroSection: React.FC<NewHeroSectionProps> = ({ 
  headline, 
  subheadline, 
  cta_buttons,
  onJoinBeta 
}) => {
  const navigate = useNavigate();

  const handleButtonClick = (button: CTAButton) => {
    if (button.link_to === '/waitlist') {
      onJoinBeta();
    } else {
      navigate(button.link_to);
    }
  };

  return (
    <section className="relative min-h-[80vh] bg-gradient-to-br from-dna-forest via-dna-emerald to-dna-copper flex items-center">
      <div className="absolute inset-0 bg-black/20"></div>
      
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
            {headline}
          </h1>
          
          <p className="text-xl md:text-2xl text-white/90 leading-relaxed mb-12 max-w-3xl mx-auto">
            {subheadline}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {cta_buttons.map((button, index) => (
              <Button
                key={index}
                size="lg"
                variant={button.style === 'primary' ? 'default' : 'outline'}
                className={
                  button.style === 'primary'
                    ? 'bg-white text-dna-forest hover:bg-gray-100 hover:scale-105 transition-all duration-300 font-semibold px-8 py-3'
                    : 'border-2 border-white text-white hover:bg-white hover:text-dna-forest hover:scale-105 transition-all duration-300 font-semibold px-8 py-3'
                }
                onClick={() => handleButtonClick(button)}
              >
                {button.label}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewHeroSection;