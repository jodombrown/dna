
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
    <div className={`${bgGradient} rounded-xl p-6 text-center`}>
      <div ref={countRef} className="text-3xl font-bold text-dna-forest mb-2">
        {count}{suffix}
      </div>
      <div className="text-sm font-medium text-gray-700 mb-1">{label}</div>
      <div className="text-xs text-gray-600">{description}</div>
    </div>
  );
};

const DiasporaStats = () => {
  return (
    <div className="max-w-4xl mx-auto mb-12">
      <p className="text-base md:text-lg mb-8 text-gray-700 leading-relaxed">
        The African Diaspora represents one of the most powerful untapped resources for global development:
      </p>

      {/* Statistics Grid */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <AnimatedStat
          value={200}
          suffix="M+"
          label="People of African Descent"
          description="Living outside Africa, projected to comprise 25% of global population"
          bgGradient="bg-gradient-to-br from-dna-emerald/10 to-dna-forest/10"
        />
        
        <AnimatedStat
          value={100}
          suffix="B+"
          label="Annual Remittances (2024)"
          description="Fueling economic growth across African nations"
          bgGradient="bg-gradient-to-br from-dna-copper/10 to-dna-gold/10"
        />
        
        <AnimatedStat
          value={60}
          suffix="%"
          label="Highly Educated"
          description="Advanced degrees and specialized skills driving innovation"
          bgGradient="bg-gradient-to-br from-dna-mint/10 to-dna-emerald/10"
        />
      </div>

      {/* Historical Context */}
      <div className="bg-white rounded-2xl p-6 mb-8 shadow-sm border">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Historical Impact & Growth</h4>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h5 className="font-medium text-gray-800 mb-2">Past Decade (2014-2024)</h5>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Remittances grew from $71B to $100B+ annually</li>
              <li>• Diaspora-led startups raised $3.2B in funding</li>
              <li>• 40% increase in diaspora professionals returning to Africa</li>
              <li>• 250+ diaspora-founded organizations created</li>
            </ul>
          </div>
          <div>
            <h5 className="font-medium text-gray-800 mb-2">Current Challenges</h5>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Fragmented networks limit collaboration</li>
              <li>• Skills and capital underutilized</li>
              <li>• Limited platforms for meaningful connection</li>
              <li>• Difficulty accessing Africa-focused opportunities</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="text-center space-y-6">
        <p className="text-base md:text-lg text-gray-700 leading-relaxed">
          Yet, despite this immense potential, the full power of the African Diaspora remains untapped. DNA is here to change that.
        </p>

        <p className="text-base md:text-lg text-gray-700 leading-relaxed">
          We're in the early stages of building a transformative platform designed to elevate the African Diaspora's role in Africa's development. This isn't just about joining a network—it's about co-creating, co-investing, and co-executing the infrastructure that empowers us to connect, collaborate, and contribute meaningful change across Africa and beyond.
        </p>

        <div className="bg-gradient-to-r from-dna-emerald/10 to-dna-copper/10 rounded-xl p-6">
          <p className="text-base md:text-lg font-medium text-dna-forest mb-2">
            Your expertise matters. Your voice matters.
          </p>
          <p className="text-sm md:text-base text-gray-700">
            Let's build a future where the African Diaspora thrives and where Africa's potential is fully realized.
          </p>
        </div>

        <p className="text-lg md:text-xl font-semibold text-dna-forest">
          Join me on this journey. Let's build this together.
        </p>
      </div>
    </div>
  );
};

export default DiasporaStats;
