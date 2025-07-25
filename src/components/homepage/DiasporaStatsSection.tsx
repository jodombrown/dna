import React from 'react';

interface Stat {
  label: string;
  value: string;
}

interface DiasporaStatsSectionProps {
  title: string;
  stats: Stat[];
}

const DiasporaStatsSection: React.FC<DiasporaStatsSectionProps> = ({ title, stats }) => {
  return (
    <section className="py-16 bg-gradient-to-br from-dna-forest to-dna-emerald">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {title}
          </h2>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/20 transition-all duration-300">
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                  {stat.value}
                </div>
                <div className="text-dna-emerald-light text-sm md:text-base font-medium">
                  {stat.label}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DiasporaStatsSection;