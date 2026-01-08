import { forwardRef } from 'react';
import { KenteBorder } from '../KenteBorder';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { cn } from '@/lib/utils';

interface DemoSolutionProps {
  id: string;
}

// Five C's color mapping
const C_COLORS: Record<string, string> = {
  CONNECT: '#4A8D77',
  CONVENE: '#E07A5F',
  COLLABORATE: '#3D5A80',
  CONTRIBUTE: '#9B5DE5',
  CONVEY: '#F4A261',
};

const FIVE_CS = [
  {
    name: 'CONNECT',
    icon: '🤝',
    tagline: 'Build Your Diaspora Network',
    description: 'Professional profiles that understand diaspora identity. Smart discovery based on heritage, skills, and aspirations. Connections that lead to real collaboration.',
    features: ['Professional Profiles', 'Smart Discovery', 'Mutual Connections', 'Direct Messaging'],
    benchmark: 'LinkedIn for the Diaspora',
  },
  {
    name: 'CONVENE',
    icon: '🎪',
    tagline: 'Gather With Purpose',
    description: 'Host and discover events that matter. From intimate dinners to international summits. Online, offline, and hybrid gatherings that build lasting bonds.',
    features: ['Event Creation', 'Ticket Management', 'QR Check-in', 'Post-Event Connections'],
    benchmark: 'Eventbrite + Luma',
  },
  {
    name: 'COLLABORATE',
    icon: '⚡',
    tagline: 'Work Together, Win Together',
    description: 'Project spaces with built-in accountability. From mentorship programs to investment syndicates. Turn ideas into impact with community pressure.',
    features: ['Project Spaces', 'Task Management', 'Accountability Nudges', 'Milestone Tracking'],
    benchmark: 'Asana with Community',
  },
  {
    name: 'CONTRIBUTE',
    icon: '💎',
    tagline: 'Give What You Have, Get What You Need',
    description: 'A marketplace for diaspora value exchange. Skills, capital, time, and network—all flowing to where they\'re needed most.',
    features: ['Needs & Offers', 'Skill Matching', 'Investment Opportunities', 'Volunteer Coordination'],
    benchmark: 'Multi-Dimensional Marketplace',
  },
  {
    name: 'CONVEY',
    icon: '📢',
    tagline: 'Share Your Story, Amplify Your Voice',
    description: 'Native publishing for diaspora narratives. Stories that inspire action. Content that builds community and attracts new connections.',
    features: ['Stories & Posts', 'Content Discovery', 'Engagement Analytics', 'Amplification Tools'],
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
        className="min-h-screen py-16 md:py-20"
        style={{ background: '#0D1117' }}
      >
        <div className="max-w-[1200px] mx-auto px-4 md:px-6">
          <div 
            ref={animationRef}
            className={cn(
              "transition-all duration-800 ease-out",
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            )}
          >
            {/* Kente Border */}
            <KenteBorder width="80px" height="3px" className="mb-8" />

            {/* Headline */}
            <h2 
              className="font-display font-semibold text-center mb-4"
              style={{ fontSize: 'clamp(28px, 5vw, 48px)' }}
            >
              One Platform. <span className="text-[#4A8D77]">Five Dimensions.</span>
            </h2>

            {/* Supporting Text */}
            <p className="font-body font-light text-white/70 text-center max-w-2xl mx-auto mb-12 leading-relaxed text-base md:text-lg">
              DNA unifies five essential activities into one interconnected system. 
              Each strengthens the others. Together, they transform scattered potential into coordinated power.
            </p>

            {/* Five C's Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {FIVE_CS.map((c, index) => {
                const color = C_COLORS[c.name];
                return (
                  <div 
                    key={c.name}
                    className={cn(
                      "bg-[#131920] border border-white/10 rounded-xl p-6 transition-all duration-400 hover:-translate-y-2 hover:border-opacity-50 group",
                      isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                    )}
                    style={{ 
                      transitionDelay: `${index * 100}ms`,
                      '--hover-color': color,
                    } as React.CSSProperties}
                  >
                    {/* Icon Container */}
                    <div 
                      className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-4"
                      style={{ backgroundColor: `${color}20` }}
                    >
                      {c.icon}
                    </div>

                    {/* C Name */}
                    <h3 
                      className="font-display font-semibold text-xl mb-1"
                      style={{ color }}
                    >
                      {c.name}
                    </h3>

                    {/* Tagline */}
                    <p className="font-body text-white/50 text-sm mb-3">
                      {c.tagline}
                    </p>

                    {/* Description */}
                    <p className="font-body text-white/70 text-sm leading-relaxed mb-4">
                      {c.description}
                    </p>

                    {/* Feature Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {c.features.map((feature) => (
                        <span 
                          key={feature}
                          className="px-2 py-1 rounded-full text-xs font-body"
                          style={{ 
                            backgroundColor: `${color}15`,
                            color: color,
                          }}
                        >
                          {feature}
                        </span>
                      ))}
                    </div>

                    {/* Benchmark */}
                    <p className="font-body text-white/40 text-xs italic">
                      Think: {c.benchmark}
                    </p>
                  </div>
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
