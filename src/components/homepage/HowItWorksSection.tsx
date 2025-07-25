import React from 'react';
import { UserPlus, Rocket, HeartHandshake } from 'lucide-react';

const iconMap = {
  'user-plus': UserPlus,
  'rocket': Rocket,
  'heart-hand': HeartHandshake,
};

interface Step {
  icon: keyof typeof iconMap;
  title: string;
  description: string;
}

interface HowItWorksSectionProps {
  title: string;
  steps: Step[];
}

const HowItWorksSection: React.FC<HowItWorksSectionProps> = ({ title, steps }) => {
  return (
    <section className="py-16 bg-gradient-to-br from-white to-dna-emerald/5">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-dna-forest mb-4">
            {title}
          </h2>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => {
            const IconComponent = iconMap[step.icon];
            return (
              <div key={index} className="text-center group">
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:-translate-y-2">
                  <div className="bg-gradient-to-br from-dna-emerald to-dna-copper w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-dna-forest mb-4">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;