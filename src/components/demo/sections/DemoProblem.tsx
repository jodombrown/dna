import { forwardRef } from 'react';
import { KenteBorder } from '../KenteBorder';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { cn } from '@/lib/utils';
import { Link2, Calendar, ClipboardList, DollarSign } from 'lucide-react';

interface DemoProblemProps {
  id: string;
}

const PROBLEM_CARDS = [
  {
    icon: Link2,
    title: 'Networking in Isolation',
    description: "LinkedIn doesn't understand diaspora context. Connections lack cultural depth. Great conversations happen, then everyone goes back to their silos.",
  },
  {
    icon: Calendar,
    title: 'Events Without Continuity',
    description: "Powerful gatherings end with no follow-up. Relationships formed at conferences dissolve. Community momentum dissipates.",
  },
  {
    icon: ClipboardList,
    title: 'Projects Without Accountability',
    description: "Asana doesn't have community pressure. Initiatives fizzle. Good intentions never become impact.",
  },
  {
    icon: DollarSign,
    title: "Resources Can't Find Needs",
    description: "Skills, time, and capital go unmatched. Diaspora wealth flows to middlemen instead of community projects.",
  },
];

export const DemoProblem = forwardRef<HTMLElement, DemoProblemProps>(
  ({ id }, ref) => {
    const { ref: animationRef, isVisible } = useScrollAnimation();

    return (
      <section 
        ref={ref}
        id={id}
        className="min-h-screen py-16 md:py-20 flex items-center"
        style={{ background: '#131920' }}
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
            <KenteBorder width="80px" height="3px" centered={false} className="mb-8" />

            {/* Headline */}
            <h2 
              className="font-display font-semibold mb-6"
              style={{ fontSize: 'clamp(28px, 5vw, 48px)' }}
            >
              Scattered Potential. <span className="text-[#E07A5F]">Fragmented Power.</span>
            </h2>

            {/* Supporting Text */}
            <p className="font-body font-light text-white/70 max-w-2xl mb-12 leading-relaxed text-base md:text-lg">
              Today, diaspora potential is trapped in disconnected silos. Ideas die in DMs. 
              Connections fade after events. Projects stall without accountability. 
              Contributions can't find their targets.
            </p>

            {/* Problem Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {PROBLEM_CARDS.map((card, index) => (
                <div 
                  key={index}
                  className={cn(
                    "bg-[#0D1117] border border-white/10 rounded-xl p-6 transition-all duration-500",
                    isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                  )}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-[#E07A5F]/10 flex items-center justify-center flex-shrink-0">
                      <card.icon className="w-6 h-6 text-[#E07A5F]" />
                    </div>
                    <div>
                      <h3 className="font-display font-medium text-lg md:text-xl mb-2">
                        {card.title}
                      </h3>
                      <p className="font-body text-white/60 text-sm md:text-base leading-relaxed">
                        {card.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quote */}
            <blockquote className="mt-12 border-l-2 border-[#E07A5F] pl-6">
              <p className="font-body italic text-white/70 text-base md:text-lg">
                "The diaspora has more PhDs, more capital, more expertise than ever before. 
                What we lack is coordination."
              </p>
            </blockquote>
          </div>
        </div>
      </section>
    );
  }
);

DemoProblem.displayName = 'DemoProblem';
