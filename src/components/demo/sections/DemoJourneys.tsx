import { forwardRef, useState } from 'react';
import { KenteBorder } from '../KenteBorder';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { cn } from '@/lib/utils';

interface DemoJourneysProps {
  id: string;
}

const C_COLORS: Record<string, string> = {
  CONNECT: '#4A8D77',
  CONVENE: '#E07A5F',
  COLLABORATE: '#3D5A80',
  CONTRIBUTE: '#9B5DE5',
  CONVEY: '#F4A261',
};

const JOURNEYS = [
  {
    title: 'The Conference Spark',
    persona: 'Amara',
    role: 'Ghanaian-American Tech Executive',
    goal: 'Launch a mentorship program for diaspora youth in STEM',
    flow: ['CONVENE', 'CONNECT', 'COLLABORATE', 'CONTRIBUTE', 'CONVEY'],
    steps: [
      { c: 'CONVENE', action: 'Attends AfroTech Summit', detail: 'Registers via DNA, meets 50 attendees' },
      { c: 'CONNECT', action: 'Discovers aligned professionals', detail: '12 with mentorship experience' },
      { c: 'COLLABORATE', action: "Creates 'STEM Mentorship Initiative'", detail: 'Private Space, 8 founding members' },
      { c: 'CONTRIBUTE', action: 'Recruits volunteer mentors', detail: 'Posts need, 25 mentors join' },
      { c: 'CONVEY', action: 'Documents first cohort success', detail: "'How We Built a 100-Youth Program'" },
    ],
  },
  {
    title: 'The Co-Founder Search',
    persona: 'Olumide',
    role: 'Nigerian Fintech Founder in Lagos',
    goal: 'Find a diaspora co-founder for US market expansion',
    flow: ['CONNECT', 'COLLABORATE', 'CONVENE', 'CONVEY', 'CONTRIBUTE'],
    steps: [
      { c: 'CONNECT', action: 'Searches for diaspora fintech talent', detail: 'Finds 15 with US market experience' },
      { c: 'COLLABORATE', action: "Creates 'PayAfrica Expansion' Space", detail: 'Due diligence with top 3 candidates' },
      { c: 'CONVENE', action: 'Plans launch event', detail: "'PayAfrica US Launch - Atlanta Mixer'" },
      { c: 'CONVEY', action: 'Shares the journey', detail: "'How I Found My Co-Founder on DNA'" },
      { c: 'CONTRIBUTE', action: 'Posts job opportunities', detail: 'Hiring diaspora professionals' },
    ],
  },
  {
    title: 'The Content Movement',
    persona: 'Blessing',
    role: 'Cameroonian Policy Researcher in Brussels',
    goal: 'Coordinate diaspora response to EU-Africa policy',
    flow: ['CONVEY', 'CONNECT', 'COLLABORATE', 'CONVENE', 'CONTRIBUTE'],
    steps: [
      { c: 'CONVEY', action: 'Publishes policy analysis', detail: '200+ reactions, 50+ comments' },
      { c: 'CONNECT', action: 'Identifies key voices', detail: '15 with relevant expertise' },
      { c: 'COLLABORATE', action: 'Creates Advocacy Coalition', detail: 'Public Space for coordination' },
      { c: 'CONVENE', action: 'Hosts virtual town hall', detail: '300 RSVPs' },
      { c: 'CONTRIBUTE', action: 'Recruits specific skills', detail: 'Translators, designers join' },
    ],
  },
  {
    title: 'The Investment Syndicate',
    persona: 'Tariq',
    role: 'Somali-Canadian Real Estate Developer',
    goal: 'Form diaspora investment group for Nairobi development',
    flow: ['CONTRIBUTE', 'CONNECT', 'COLLABORATE', 'CONVEY'],
    steps: [
      { c: 'CONTRIBUTE', action: 'Posts investment opportunity', detail: 'Seeking partners' },
      { c: 'CONNECT', action: 'Reviews interested profiles', detail: '12 interested, 8 serious' },
      { c: 'COLLABORATE', action: 'Creates Investment Syndicate Space', detail: 'Private due diligence' },
      { c: 'CONVEY', action: 'Documents the journey', detail: "'How 8 Diaspora Investors Built in Kenya'" },
    ],
  },
  {
    title: 'The Skill Circle',
    persona: 'Chioma',
    role: 'Nigerian-British UX Designer',
    goal: 'Create peer learning group for African designers',
    flow: ['CONNECT', 'COLLABORATE', 'CONTRIBUTE', 'CONVENE', 'CONVEY'],
    steps: [
      { c: 'CONNECT', action: 'Discovers designer connections', detail: '15+ across DNA' },
      { c: 'COLLABORATE', action: "Creates 'African Designers Collective'", detail: 'Skill-Building template' },
      { c: 'CONTRIBUTE', action: 'Members help each other', detail: 'Portfolio reviews, feedback' },
      { c: 'CONVENE', action: 'Hosts quarterly showcases', detail: 'Open to recruiters' },
      { c: 'CONVEY', action: 'Publishes collective content', detail: "'10 African Designers to Watch'" },
    ],
  },
];

export const DemoJourneys = forwardRef<HTMLElement, DemoJourneysProps>(
  ({ id }, ref) => {
    const { ref: animationRef, isVisible } = useScrollAnimation();
    const [activeJourney, setActiveJourney] = useState(0);
    const journey = JOURNEYS[activeJourney];

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
              See It <span className="text-[#4A8D77]">In Action</span>
            </h2>

            {/* Supporting Text */}
            <p className="font-body font-light text-white/70 text-center max-w-2xl mx-auto mb-8 leading-relaxed text-base md:text-lg">
              Real journeys through DNA. Each story shows how the Five C's work together 
              to transform an idea into impact.
            </p>

            {/* Journey Tabs */}
            <div className="flex overflow-x-auto gap-2 pb-4 mb-8 scrollbar-hide">
              {JOURNEYS.map((j, index) => (
                <button
                  key={index}
                  onClick={() => setActiveJourney(index)}
                  className={cn(
                    "px-4 py-2 rounded-lg font-body text-sm whitespace-nowrap transition-all duration-300",
                    activeJourney === index
                      ? "bg-[#4A8D77] text-white"
                      : "bg-[#131920] text-white/60 hover:text-white border border-white/10"
                  )}
                >
                  {j.title}
                </button>
              ))}
            </div>

            {/* Active Journey Card */}
            <div className="bg-[#131920] border border-white/10 rounded-xl p-6 md:p-8">
              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="font-display font-semibold text-xl md:text-2xl mb-1">
                    {journey.title}
                  </h3>
                  <p className="font-body text-white/60 text-sm">
                    <span className="text-[#4A8D77]">{journey.persona}</span> • {journey.role}
                  </p>
                </div>
                <div className="bg-[#0D1117] rounded-lg px-4 py-2">
                  <span className="font-body text-white/50 text-xs">GOAL</span>
                  <p className="font-body text-white/80 text-sm">{journey.goal}</p>
                </div>
              </div>

              {/* Flow Visualization */}
              <div className="flex flex-wrap items-center gap-2 mb-8">
                {journey.flow.map((c, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span 
                      className="px-3 py-1 rounded-full text-xs font-body font-medium"
                      style={{ 
                        backgroundColor: `${C_COLORS[c]}20`,
                        color: C_COLORS[c],
                      }}
                    >
                      {c}
                    </span>
                    {index < journey.flow.length - 1 && (
                      <span className="text-white/30">→</span>
                    )}
                  </div>
                ))}
              </div>

              {/* Steps Timeline */}
              <div className="relative pl-6 border-l border-white/20">
                {journey.steps.map((step, index) => (
                  <div key={index} className="relative pb-6 last:pb-0">
                    {/* Dot */}
                    <div 
                      className="absolute -left-[25px] w-4 h-4 rounded-full"
                      style={{ backgroundColor: C_COLORS[step.c] }}
                    />
                    
                    {/* Content */}
                    <div className="ml-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span 
                          className="text-xs font-body font-medium"
                          style={{ color: C_COLORS[step.c] }}
                        >
                          {step.c}
                        </span>
                      </div>
                      <p className="font-body text-white/90 text-sm md:text-base">
                        {step.action}
                      </p>
                      <p className="font-body text-white/50 text-xs md:text-sm mt-1">
                        {step.detail}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }
);

DemoJourneys.displayName = 'DemoJourneys';
