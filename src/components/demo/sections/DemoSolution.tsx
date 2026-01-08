import { forwardRef } from 'react';
import { KenteBorder } from '../KenteBorder';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { motion } from 'framer-motion';

interface DemoSolutionProps {
  id: string;
}

// Five C's color mapping using DNA brand colors
const C_COLORS: Record<string, string> = {
  CONNECT: 'hsl(var(--dna-emerald))',
  CONVENE: 'hsl(var(--dna-terra))',
  COLLABORATE: 'hsl(var(--dna-royal))',
  CONTRIBUTE: 'hsl(var(--dna-purple))',
  CONVEY: 'hsl(var(--dna-ochre))',
};

const C_BG_COLORS: Record<string, string> = {
  CONNECT: 'bg-dna-emerald/10',
  CONVENE: 'bg-dna-terra/10',
  COLLABORATE: 'bg-dna-royal/10',
  CONTRIBUTE: 'bg-dna-purple/10',
  CONVEY: 'bg-dna-ochre/10',
};

const FIVE_CS = [
  {
    name: 'CONNECT',
    icon: '🤝',
    tagline: 'Build Your Diaspora Network',
    description: 'Professional profiles that understand diaspora identity. Smart discovery based on heritage, skills, and aspirations.',
    features: ['Professional Profiles', 'Smart Discovery', 'Direct Messaging'],
    benchmark: 'LinkedIn for the Diaspora',
  },
  {
    name: 'CONVENE',
    icon: '🎪',
    tagline: 'Gather With Purpose',
    description: 'Host and discover events that matter. From intimate dinners to international summits.',
    features: ['Event Creation', 'Ticket Management', 'QR Check-in'],
    benchmark: 'Eventbrite + Luma',
  },
  {
    name: 'COLLABORATE',
    icon: '⚡',
    tagline: 'Work Together, Win Together',
    description: 'Project spaces with built-in accountability. Turn ideas into impact with community pressure.',
    features: ['Project Spaces', 'Task Management', 'Accountability Nudges'],
    benchmark: 'Asana with Community',
  },
  {
    name: 'CONTRIBUTE',
    icon: '💎',
    tagline: 'Give What You Have, Get What You Need',
    description: 'A marketplace for diaspora value exchange. Skills, capital, time, and network flowing freely.',
    features: ['Needs & Offers', 'Skill Matching', 'Investment Opportunities'],
    benchmark: 'Multi-Dimensional Marketplace',
  },
  {
    name: 'CONVEY',
    icon: '📢',
    tagline: 'Share Your Story, Amplify Your Voice',
    description: 'Native publishing for diaspora narratives. Stories that inspire action.',
    features: ['Stories & Posts', 'Content Discovery', 'Amplification Tools'],
    benchmark: 'Medium + Substack',
  },
];

export const DemoSolution = forwardRef<HTMLElement, DemoSolutionProps>(
  ({ id }, ref) => {
    const { ref: animationRef, isVisible } = useScrollAnimation();

    return (
      <section 
        ref={ref}
        id={id}
        className="min-h-screen py-16 md:py-20 bg-white"
      >
        <div className="max-w-[1200px] mx-auto px-4 md:px-6">
          <div ref={animationRef}>
            {/* Kente Border */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6 } as const}
            >
              <KenteBorder width="80px" height="3px" className="mb-8" />
            </motion.div>

            {/* Headline */}
            <motion.h2 
              className="font-cormorant font-semibold text-center text-dna-dark mb-4"
              style={{ fontSize: 'clamp(28px, 5vw, 48px)' }}
              initial={{ opacity: 0, y: 30 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 } as const}
            >
              One Platform. <span className="text-dna-emerald">Five Dimensions.</span>
            </motion.h2>

            {/* Supporting Text */}
            <motion.p 
              className="font-outfit font-light text-dna-gray text-center max-w-2xl mx-auto mb-12 leading-relaxed text-base md:text-lg"
              initial={{ opacity: 0, y: 30 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 } as const}
            >
              DNA unifies five essential activities into one interconnected system. 
              Each strengthens the others. Together, they transform scattered potential into coordinated power.
            </motion.p>

            {/* Five C's Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {FIVE_CS.map((c, index) => {
                const color = C_COLORS[c.name];
                const bgClass = C_BG_COLORS[c.name];
                return (
                  <motion.div 
                    key={c.name}
                    className="bg-dna-pearl border border-dna-light-gray rounded-xl p-6 hover:-translate-y-2 hover:shadow-lg transition-all duration-300 group"
                    initial={{ opacity: 0, y: 40 }}
                    animate={isVisible ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5, delay: 0.3 + index * 0.1 } as const}
                  >
                    {/* Icon Container */}
                    <div 
                      className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-4 ${bgClass}`}
                    >
                      {c.icon}
                    </div>

                    {/* C Name */}
                    <h3 
                      className="font-cormorant font-semibold text-xl mb-1"
                      style={{ color }}
                    >
                      {c.name}
                    </h3>

                    {/* Tagline */}
                    <p className="font-outfit text-dna-gray text-sm mb-3">
                      {c.tagline}
                    </p>

                    {/* Description */}
                    <p className="font-outfit text-dna-dark/70 text-sm leading-relaxed mb-4">
                      {c.description}
                    </p>

                    {/* Feature Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {c.features.map((feature) => (
                        <span 
                          key={feature}
                          className={`px-2 py-1 rounded-full text-xs font-outfit ${bgClass}`}
                          style={{ color }}
                        >
                          {feature}
                        </span>
                      ))}
                    </div>

                    {/* Benchmark */}
                    <p className="font-outfit text-dna-gray/60 text-xs italic">
                      Think: {c.benchmark}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    );
  }
);

DemoSolution.displayName = 'DemoSolution';
