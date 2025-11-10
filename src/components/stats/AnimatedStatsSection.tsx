
import React from 'react';
import { useAnimatedCounter } from '@/hooks/useAnimatedCounter';

const AnimatedStat = ({ value, suffix, label, description, bgGradient }: {
  value: number;
  suffix: string;
  label: string;
  description: string;
  bgGradient: string;
}) => {
  const { count, countRef } = useAnimatedCounter({ end: value, duration: 2500 });

  return (
    <div className={`${bgGradient} rounded-xl p-6 text-center shadow-lg`}>
      <div ref={countRef} className="text-4xl font-bold text-white mb-2">
        {count}{suffix}
      </div>
      <div className="text-lg font-medium text-white/90 mb-1">{label}</div>
      <div className="text-sm text-white/80">{description}</div>
    </div>
  );
};

const AnimatedStatsSection = () => {
  return (
    <section className="relative bg-gradient-to-br from-dna-forest via-dna-emerald to-dna-copper rounded-3xl overflow-hidden mb-16">
      <div className="absolute inset-0 bg-black/40"></div>
      <div className="relative z-10 px-8 py-16 text-center text-white">
        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold font-serif mb-12 leading-tight">
          The African Diaspora: A $100 B+ Engine for Change
        </h2>
        
        {/* Three Statistics Cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <AnimatedStat
            value={200}
            suffix="M+"
            label="People of African Descent"
            description="Living outside Africa, projected to comprise 25% of global population"
            bgGradient="bg-gradient-to-br from-dna-emerald/80 to-dna-forest/80"
          />
          
          <AnimatedStat
            value={100}
            suffix="B+"
            label="Annual Remittances (2024)"
            description="Fueling economic growth across African nations"
            bgGradient="bg-gradient-to-br from-dna-copper/80 to-dna-gold/80"
          />
          
          <AnimatedStat
            value={60}
            suffix="%"
            label="Highly Educated"
            description="Advanced degrees and specialized skills driving innovation"
            bgGradient="bg-gradient-to-br from-dna-mint/80 to-dna-emerald/80"
          />
        </div>
      </div>
    </section>
  );
};

export default AnimatedStatsSection;
