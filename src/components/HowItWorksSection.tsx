import React from 'react';
import { Users, Rocket, Workflow } from 'lucide-react';

const steps = [
  {
    title: 'Connect',
    desc: 'Join a trusted network of early adopters across the African diaspora.',
    Icon: Users,
  },
  {
    title: 'Collaborate',
    desc: 'Match on purpose-aligned projects and co-create ventures and ecosystems.',
    Icon: Workflow,
  },
  {
    title: 'Contribute',
    desc: 'Channel talent, capital, and expertise into Africa-focused outcomes.',
    Icon: Rocket,
  },
];

const HowItWorksSection: React.FC = () => {
  return (
    <section id="dna-framework" aria-labelledby="how-it-works-title" className="py-8 md:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 id="how-it-works-title" className="text-2xl md:text-3xl font-semibold text-dna-forest text-center">
          How DNA Works
        </h2>
        <p className="text-center text-gray-700 mt-2 max-w-2xl mx-auto">
          A simple, purposeful flow designed for early adopters to explore and engage.
        </p>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {steps.map(({ title, desc, Icon }, idx) => (
            <article
              key={idx}
              className="bg-white rounded-2xl border shadow-sm p-5 flex items-start gap-4 animate-fade-in hover-scale"
            >
              <div className="shrink-0 rounded-full p-3 bg-dna-emerald/10 border">
                <Icon className="w-6 h-6 text-dna-emerald" aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-dna-forest">{title}</h3>
                <p className="text-gray-700 mt-1">{desc}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
