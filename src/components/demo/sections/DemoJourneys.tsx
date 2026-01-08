import { forwardRef, useState } from 'react';
import { KenteBorder } from '../KenteBorder';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { cn } from '@/lib/utils';
import { Users, Calendar, Layers, Gift, PenTool } from 'lucide-react';

interface DemoJourneysProps {
  id: string;
}

const C_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  CONNECT: { bg: 'bg-dna-emerald/10', text: 'text-dna-emerald', dot: 'bg-dna-emerald' },
  CONVENE: { bg: 'bg-dna-terra/10', text: 'text-dna-terra', dot: 'bg-dna-terra' },
  COLLABORATE: { bg: 'bg-dna-ocean/10', text: 'text-dna-ocean', dot: 'bg-dna-ocean' },
  CONTRIBUTE: { bg: 'bg-dna-purple/10', text: 'text-dna-purple', dot: 'bg-dna-purple' },
  CONVEY: { bg: 'bg-dna-ochre/10', text: 'text-dna-ochre', dot: 'bg-dna-ochre' },
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
    const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation({ threshold: 0.2 });
    const { ref: contentRef, isVisible: contentVisible } = useScrollAnimation({ threshold: 0.1 });
    const [activeJourney, setActiveJourney] = useState(0);
    const journey = JOURNEYS[activeJourney];

    return (
      <section 
        ref={ref}
        id={id}
        className="min-h-screen py-16 md:py-24 bg-background"
      >
        <div className="max-w-[1200px] mx-auto px-4 md:px-6">
          {/* Header */}
          <div 
            ref={headerRef}
            className={cn(
              "text-center mb-12 transition-all duration-700",
              headerVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-12"
            )}
          >
            <KenteBorder width="80px" height="3px" className="mb-8" />

            <h2 
              className="font-display font-semibold text-foreground mb-4"
              style={{ fontSize: 'clamp(28px, 5vw, 48px)' }}
            >
              See It <span className="text-dna-emerald">In Action</span>
            </h2>

            <p className="font-body font-light text-muted-foreground max-w-2xl mx-auto leading-relaxed text-base md:text-lg">
              Real journeys through DNA. Each story shows how the Five C's work together 
              to transform an idea into impact.
            </p>
          </div>

          <div ref={contentRef}>
            {/* Journey Tabs */}
            <div 
              className={cn(
                "flex overflow-x-auto gap-2 pb-4 mb-8 scrollbar-hide transition-all duration-700",
                contentVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-8"
              )}
            >
              {JOURNEYS.map((j, index) => (
                <button
                  key={index}
                  onClick={() => setActiveJourney(index)}
                  className={cn(
                    "px-4 py-2 rounded-lg font-body text-sm whitespace-nowrap transition-all duration-300",
                    activeJourney === index
                      ? "bg-dna-emerald text-white"
                      : "bg-dna-pearl text-muted-foreground hover:text-foreground border border-border"
                  )}
                >
                  {j.title}
                </button>
              ))}
            </div>

            {/* Active Journey Card */}
            <div 
              className={cn(
                "bg-background border border-border rounded-xl p-6 md:p-8 shadow-sm transition-all duration-700 delay-200",
                contentVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-8"
              )}
            >
              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="font-display font-semibold text-foreground text-xl md:text-2xl mb-1">
                    {journey.title}
                  </h3>
                  <p className="font-body text-muted-foreground text-sm">
                    <span className="text-dna-emerald font-medium">{journey.persona}</span> • {journey.role}
                  </p>
                </div>
                <div className="bg-dna-pearl rounded-lg px-4 py-2">
                  <span className="font-body text-muted-foreground text-xs uppercase tracking-wide">Goal</span>
                  <p className="font-body text-foreground text-sm">{journey.goal}</p>
                </div>
              </div>

              {/* Flow Visualization */}
              <div className="flex flex-wrap items-center gap-2 mb-8">
                {journey.flow.map((c, index) => {
                  const styles = C_STYLES[c];
                  return (
                    <div key={index} className="flex items-center gap-2">
                      <span 
                        className={cn(
                          "px-3 py-1 rounded-full text-xs font-body font-medium",
                          styles.bg, styles.text
                        )}
                      >
                        {c}
                      </span>
                      {index < journey.flow.length - 1 && (
                        <span className="text-muted-foreground">→</span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Steps Timeline */}
              <div className="relative pl-6 border-l-2 border-border">
                {journey.steps.map((step, index) => {
                  const styles = C_STYLES[step.c];
                  return (
                    <div 
                      key={index} 
                      className={cn(
                        "relative pb-6 last:pb-0 transition-all duration-500",
                        contentVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
                      )}
                      style={{ transitionDelay: contentVisible ? `${400 + index * 100}ms` : '0ms' }}
                    >
                      {/* Dot */}
                      <div className={cn("absolute -left-[25px] w-4 h-4 rounded-full", styles.dot)} />
                      
                      {/* Content */}
                      <div className="ml-4">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={cn("text-xs font-body font-medium", styles.text)}>
                            {step.c}
                          </span>
                        </div>
                        <p className="font-body text-foreground text-sm md:text-base">
                          {step.action}
                        </p>
                        <p className="font-body text-muted-foreground text-xs md:text-sm mt-1">
                          {step.detail}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }
);

DemoJourneys.displayName = 'DemoJourneys';
