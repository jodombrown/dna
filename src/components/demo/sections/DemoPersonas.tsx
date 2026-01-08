import { forwardRef } from 'react';
import { KenteBorder } from '../KenteBorder';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { cn } from '@/lib/utils';

interface DemoPersonasProps {
  id: string;
}

const C_COLORS: Record<string, string> = {
  CONNECT: '#4A8D77',
  CONVENE: '#E07A5F',
  COLLABORATE: '#3D5A80',
  CONTRIBUTE: '#9B5DE5',
  CONVEY: '#F4A261',
};

const PERSONAS = [
  {
    name: 'The Professional',
    description: 'Diaspora professionals seeking meaningful connections and ways to contribute expertise to African development.',
    needs: ['Find peers with shared heritage', 'Contribute skills to meaningful projects', 'Build professional reputation in diaspora community'],
    primaryCs: ['CONNECT', 'CONTRIBUTE', 'CONVEY'],
  },
  {
    name: 'The Entrepreneur',
    description: 'Founders looking for partners, investors, and talent within the diaspora to build Africa-focused ventures.',
    needs: ['Find co-founders and advisors', 'Access diaspora capital', 'Recruit talented team members'],
    primaryCs: ['CONNECT', 'COLLABORATE', 'CONTRIBUTE'],
  },
  {
    name: 'The Community Builder',
    description: 'Event organizers and connectors who bring the diaspora together for impact and belonging.',
    needs: ['Host meaningful gatherings', 'Build lasting community', 'Document community stories'],
    primaryCs: ['CONVENE', 'COLLABORATE', 'CONVEY'],
  },
  {
    name: 'The Investor',
    description: 'Diaspora members looking to deploy capital into African markets with trusted partners.',
    needs: ['Find vetted opportunities', 'Connect with co-investors', 'Due diligence support'],
    primaryCs: ['CONTRIBUTE', 'CONNECT', 'COLLABORATE'],
  },
  {
    name: 'The Returner',
    description: 'Those planning permanent or periodic return to the continent, seeking connections and opportunities.',
    needs: ['Build network before return', 'Find opportunities on ground', 'Connect with fellow returners'],
    primaryCs: ['CONNECT', 'CONVENE', 'CONTRIBUTE'],
  },
  {
    name: 'The Student/Early Career',
    description: 'Young diaspora building professional identity and seeking mentorship from established professionals.',
    needs: ['Find mentors', 'Join learning communities', 'Build portfolio of contributions'],
    primaryCs: ['CONNECT', 'COLLABORATE', 'CONVEY'],
  },
];

export const DemoPersonas = forwardRef<HTMLElement, DemoPersonasProps>(
  ({ id }, ref) => {
    const { ref: animationRef, isVisible } = useScrollAnimation();

    return (
      <section 
        ref={ref}
        id={id}
        className="min-h-screen py-16 md:py-20"
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
            <KenteBorder width="80px" height="3px" className="mb-8" />

            {/* Headline */}
            <h2 
              className="font-display font-semibold text-center mb-4"
              style={{ fontSize: 'clamp(28px, 5vw, 48px)' }}
            >
              The <span className="text-[#4A8D77]">DNA Community</span>
            </h2>

            {/* Supporting Text */}
            <p className="font-body font-light text-white/70 text-center max-w-2xl mx-auto mb-12 leading-relaxed text-base md:text-lg">
              DNA serves the full spectrum of diaspora engagement—from early-career professionals 
              to seasoned investors, from event organizers to returnees.
            </p>

            {/* Personas Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {PERSONAS.map((persona, index) => (
                <div 
                  key={persona.name}
                  className={cn(
                    "bg-[#0D1117] border border-white/10 rounded-xl p-6 transition-all duration-400 hover:-translate-y-2",
                    isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                  )}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  {/* Persona Name */}
                  <h3 className="font-display font-semibold text-lg text-[#4A8D77] mb-3">
                    {persona.name}
                  </h3>

                  {/* Description */}
                  <p className="font-body text-white/70 text-sm leading-relaxed mb-4">
                    {persona.description}
                  </p>

                  {/* Key Needs */}
                  <div className="mb-4">
                    <h4 className="font-body text-white/50 text-xs uppercase tracking-wider mb-2">
                      Key Needs
                    </h4>
                    <ul className="space-y-1">
                      {persona.needs.map((need, needIndex) => (
                        <li key={needIndex} className="font-body text-white/60 text-sm flex items-start gap-2">
                          <span className="text-[#4A8D77]">•</span>
                          {need}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Primary C's */}
                  <div>
                    <h4 className="font-body text-white/50 text-xs uppercase tracking-wider mb-2">
                      Primary C's
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {persona.primaryCs.map((c) => (
                        <span 
                          key={c}
                          className="px-2 py-1 rounded-full text-xs font-body font-medium"
                          style={{ 
                            backgroundColor: `${C_COLORS[c]}20`,
                            color: C_COLORS[c],
                          }}
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }
);

DemoPersonas.displayName = 'DemoPersonas';
