import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface PillarSection {
  title: string;
  description: string;
  link_to: string;
}

interface PillarsSectionProps {
  title: string;
  description: string;
  sections: PillarSection[];
}

const PillarsSection: React.FC<PillarsSectionProps> = ({ title, description, sections }) => {
  const navigate = useNavigate();

  const pillarColors = {
    'Connect': 'from-dna-emerald to-dna-emerald/70',
    'Collaborate': 'from-dna-copper to-dna-copper/70',
    'Contribute': 'from-dna-gold to-dna-gold/70',
  };

  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-dna-forest mb-4">
            {title}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {description}
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {sections.map((section, index) => {
            const gradientClass = pillarColors[section.title as keyof typeof pillarColors] || 'from-gray-500 to-gray-400';
            
            return (
              <div key={index} className="group">
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:-translate-y-2 border-2 border-transparent hover:border-dna-emerald/20">
                  <div className={`bg-gradient-to-br ${gradientClass} w-12 h-12 rounded-lg flex items-center justify-center mb-6`}>
                    <span className="text-white font-bold text-lg">
                      {section.title.charAt(0)}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-dna-forest mb-4">
                    {section.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-6">
                    {section.description}
                  </p>
                  <Button 
                    variant="outline" 
                    className="w-full border-dna-emerald text-dna-emerald hover:bg-dna-emerald hover:text-white"
                    onClick={() => navigate(section.link_to)}
                  >
                    Explore {section.title}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default PillarsSection;