import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Share2, ChevronLeft, ChevronRight } from 'lucide-react';
import UnifiedHeader from '@/components/UnifiedHeader';
import { useToast } from '@/hooks/use-toast';
import { useMobile } from '@/hooks/useMobile';
import { cn } from '@/lib/utils';

const PitchDeck = () => {
  const { toast } = useToast();
  const { isMobile } = useMobile();
  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const slides = [
    {
      id: 1,
      title: "DNA Platform",
      subtitle: "Diaspora Network of Africa",
      showHeader: false,
      content: (
        <div className="flex flex-col items-center justify-center h-full text-center space-y-8 animate-fade-in">
          <img 
            src="/lovable-uploads/f7ac6d60-aafb-4e52-beb5-69c903113029.png" 
            alt="DNA Logo" 
            className="h-32 md:h-48 w-auto mb-4 animate-scale-in"
          />
          <div className="text-lg md:text-xl font-semibold text-muted-foreground tracking-widest animate-fade-in" style={{ animationDelay: '0.2s' }}>
            DIASPORA NETWORK OF AFRICA
          </div>
          <p className="text-2xl md:text-4xl font-bold text-foreground max-w-3xl animate-fade-in" style={{ animationDelay: '0.4s' }}>
            Mobilizing the African Diaspora to drive systemic change through innovation and entrepreneurship
          </p>
        </div>
      )
    },
    {
      id: 2,
      title: "The Problem",
      subtitle: "Untapped potential across 200M+ diasporans worldwide",
      showHeader: true,
      content: (
        <div className="space-y-6 animate-fade-in">
          <div className="space-y-6 text-base md:text-xl text-foreground/90">
            <p className="leading-relaxed animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <strong className="text-dna-copper text-xl md:text-2xl">200+ million African diasporans</strong> worldwide possess extraordinary power:
            </p>
            <ul className="space-y-3 ml-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <li className="flex items-start gap-3">
                <span className="text-dna-emerald mt-1 text-xl">•</span>
                <span className="text-lg md:text-xl">Skills honed across continents</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-dna-emerald mt-1 text-xl">•</span>
                <span className="text-lg md:text-xl">Networks spanning the globe</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-dna-emerald mt-1 text-xl">•</span>
                <span className="text-lg md:text-xl">Knowledge bridging cultures</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-dna-emerald mt-1 text-xl">•</span>
                <span className="text-lg md:text-xl">$200B+ in annual remittances</span>
              </li>
            </ul>
            <p className="text-2xl md:text-3xl font-bold text-destructive mt-8 animate-fade-in" style={{ animationDelay: '0.4s' }}>
              Yet this power remains scattered, underutilized, and disconnected from Africa's urgent needs.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 3,
      title: "The Solution",
      subtitle: "A digital mobilization engine for collective impact",
      showHeader: true,
      content: (
        <div className="space-y-6 animate-fade-in">
          <p className="text-xl md:text-2xl font-semibold text-dna-copper animate-fade-in" style={{ animationDelay: '0.1s' }}>
            The first digital mobilization engine for the African Diaspora
          </p>
          <div className="grid grid-cols-5 gap-3 mt-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            {['CONNECT', 'CONVENE', 'COLLABORATE', 'CONTRIBUTE', 'CONVEY'].map((c, idx) => (
              <div key={c} className="bg-gradient-to-br from-dna-forest/10 to-dna-emerald/10 p-4 rounded-lg border-2 border-dna-emerald/20 hover-scale" style={{ animationDelay: `${0.3 + idx * 0.1}s` }}>
                <div className="text-3xl md:text-4xl font-bold text-dna-copper mb-1">{idx + 1}</div>
                <div className="text-sm md:text-base font-bold text-foreground">{c}</div>
              </div>
            ))}
          </div>
          <div className="bg-gradient-to-r from-dna-copper/10 to-dna-gold/10 p-6 rounded-lg border-2 border-dna-copper/20 mt-6 animate-fade-in" style={{ animationDelay: '0.8s' }}>
            <p className="text-lg md:text-xl text-foreground/90">
              We transform scattered strength into <strong>collective power</strong>, turning individual efforts into <strong>systemic change</strong>.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 4,
      title: "Market Opportunity",
      subtitle: "Riding Africa's economic boom and diaspora awakening",
      showHeader: true,
      content: (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-3 gap-6 mt-4">
            {[
              { value: '200M+', label: 'African Diasporans Worldwide', color: 'dna-copper', delay: '0.1s' },
              { value: '$200B+', label: 'Annual Diaspora Remittances', color: 'dna-emerald', delay: '0.2s' },
              { value: '$3.4T', label: "Africa's GDP by 2030", color: 'dna-gold', delay: '0.3s' }
            ].map((stat) => (
              <div key={stat.label} className={`bg-gradient-to-br from-${stat.color}/10 to-${stat.color}/5 p-6 rounded-lg border-2 border-${stat.color}/20 text-center hover-scale animate-fade-in`} style={{ animationDelay: stat.delay }}>
                <div className={`text-5xl md:text-6xl font-bold text-${stat.color} mb-3`}>{stat.value}</div>
                <div className="text-base md:text-lg font-semibold text-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
          <div className="space-y-3 text-base md:text-lg text-foreground/90 mt-6 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <p className="text-lg md:text-xl">✦ Africa is the world's <strong>fastest-growing economic region</strong></p>
            <p className="text-lg md:text-xl">✦ The diaspora is <strong>massively underutilized</strong> as a development resource</p>
            <p className="text-lg md:text-xl">✦ DNA positions diasporans as <strong>architects of Africa's future</strong></p>
          </div>
        </div>
      )
    },
    {
      id: 5,
      title: "Platform Features",
      subtitle: "Built for impact, designed for diaspora",
      showHeader: true,
      content: (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-2 gap-4">
            {[
              { title: 'Verified Profiles', desc: 'Cultural & professional identity system with skills, regions, and diaspora connections', color: 'dna-emerald', delay: '0.1s' },
              { title: 'Smart Matching', desc: 'AI-powered connections based on expertise, interests, and impact goals', color: 'dna-copper', delay: '0.2s' },
              { title: 'Collaboration Spaces', desc: 'Project hubs, events, and opportunities for coordinated action', color: 'dna-gold', delay: '0.3s' },
              { title: 'Impact Tracking', desc: 'Measure contributions, showcase outcomes, amplify success stories', color: 'dna-forest', delay: '0.4s' }
            ].map((feature) => (
              <div key={feature.title} className={`bg-card p-5 rounded-lg border-2 border-${feature.color}/20 hover-scale animate-fade-in`} style={{ animationDelay: feature.delay }}>
                <h3 className={`text-xl md:text-2xl font-bold text-${feature.color} mb-2`}>{feature.title}</h3>
                <p className="text-sm md:text-base text-foreground/80">{feature.desc}</p>
              </div>
            ))}
          </div>
          <div className="bg-gradient-to-r from-dna-copper/10 to-dna-gold/10 p-5 rounded-lg border-2 border-dna-copper/20 animate-fade-in" style={{ animationDelay: '0.5s' }}>
            <p className="text-lg md:text-xl font-semibold text-foreground">
              Currently in private beta with <strong>500+ early adopters</strong> from 40+ countries
            </p>
          </div>
        </div>
      )
    },
    {
      id: 6,
      title: "Traction & Validation",
      subtitle: "Early momentum proves the market is ready",
      showHeader: true,
      content: (
        <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              {[
                { value: '500+', label: 'Beta Users in 3 Months', color: 'dna-emerald', delay: '0.1s' },
                { value: '40+', label: 'Countries Represented', color: 'dna-copper', delay: '0.2s' },
                { value: '15+', label: 'Active Partnerships', color: 'dna-gold', delay: '0.3s' }
              ].map((stat) => (
                <div key={stat.label} className={`bg-gradient-to-br from-${stat.color}/10 to-${stat.color}/5 p-5 rounded-lg border-2 border-${stat.color}/20 hover-scale animate-fade-in`} style={{ animationDelay: stat.delay }}>
                  <div className={`text-4xl md:text-5xl font-bold text-${stat.color} mb-1`}>{stat.value}</div>
                  <div className="text-base md:text-lg font-semibold text-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
            <div className="bg-card p-5 rounded-lg border-2 border-dna-forest/20 animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <h3 className="text-xl md:text-2xl font-bold text-dna-forest mb-3">Early Feedback</h3>
              <div className="space-y-4 text-sm md:text-base text-foreground/80">
                <div>
                  <p className="italic">"Finally, a platform that understands the diaspora experience and makes it easy to give back meaningfully."</p>
                  <p className="text-xs md:text-sm text-muted-foreground mt-1">- Tech entrepreneur, San Francisco</p>
                </div>
                <div>
                  <p className="italic">"This is the missing infrastructure we've been waiting for to coordinate diaspora impact."</p>
                  <p className="text-xs md:text-sm text-muted-foreground mt-1">- Impact investor, London</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 7,
      title: "Business Model",
      subtitle: "Multiple revenue streams for sustainable growth",
      showHeader: true,
      content: (
        <div className="space-y-5 animate-fade-in">
          <div className="grid grid-cols-2 gap-4">
            {[
              { title: 'Premium Memberships', price: '$29/mo or $290/yr', features: ['Advanced matching & analytics', 'Priority event access', 'Enhanced visibility'], color: 'dna-emerald', delay: '0.1s' },
              { title: 'Enterprise Solutions', price: '$500-5000/mo', features: ['Corporate talent pipelines', 'Diaspora engagement programs', 'White-label solutions'], color: 'dna-copper', delay: '0.2s' },
              { title: 'Platform Fees', price: '5-10% transaction fee', features: ['Investment facilitation', 'Event ticketing', 'Service marketplace'], color: 'dna-gold', delay: '0.3s' },
              { title: 'Data & Insights', price: 'Custom pricing', features: ['Diaspora trend reports', 'Market intelligence', 'Research partnerships'], color: 'dna-forest', delay: '0.4s' }
            ].map((stream) => (
              <div key={stream.title} className={`bg-gradient-to-br from-${stream.color}/10 to-${stream.color}/5 p-4 rounded-lg border-2 border-${stream.color}/20 hover-scale animate-fade-in`} style={{ animationDelay: stream.delay }}>
                <h3 className={`text-lg md:text-xl font-bold text-${stream.color} mb-1`}>{stream.title}</h3>
                <p className="text-sm md:text-base text-foreground/80 mb-2 font-semibold">{stream.price}</p>
                <ul className="space-y-1 text-xs md:text-sm text-foreground/70">
                  {stream.features.map((f) => <li key={f}>• {f}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 8,
      title: "Go-to-Market Strategy",
      subtitle: "Phased growth from community to enterprise",
      showHeader: true,
      content: (
        <div className="space-y-5 animate-fade-in">
          {[
            { phase: 'Phase 1: Community Seeding', timeline: 'Now - Month 6', desc: 'Target diaspora hubs: Lagos, London, New York, Atlanta. Partner with diaspora organizations and thought leaders.', color: 'dna-emerald', delay: '0.1s' },
            { phase: 'Phase 2: Viral Growth', timeline: 'Months 7-12', desc: 'Leverage success stories, referral programs, and content marketing. Launch in 10+ major diaspora cities.', color: 'dna-copper', delay: '0.2s' },
            { phase: 'Phase 3: Enterprise Expansion', timeline: 'Year 2+', desc: 'Partner with governments, corporations, and NGOs. Scale to 100K+ users across 50+ countries.', color: 'dna-gold', delay: '0.3s' }
          ].map((phase) => (
            <div key={phase.phase} className={`bg-gradient-to-r from-${phase.color}/10 to-${phase.color}/5 p-5 rounded-lg border-l-4 border-l-${phase.color} hover-scale animate-fade-in`} style={{ animationDelay: phase.delay }}>
              <h3 className={`text-xl md:text-2xl font-bold text-${phase.color} mb-1`}>{phase.phase}</h3>
              <p className="text-sm md:text-base text-muted-foreground mb-2">{phase.timeline}</p>
              <p className="text-sm md:text-lg text-foreground/80">{phase.desc}</p>
            </div>
          ))}
        </div>
      )
    },
    {
      id: 9,
      title: "Competition & Differentiation",
      subtitle: "Why DNA wins in the diaspora engagement space",
      showHeader: true,
      content: (
        <div className="space-y-5 animate-fade-in">
          <div className="grid grid-cols-2 gap-6">
            <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <h3 className="text-xl md:text-2xl font-bold text-dna-copper mb-3">The Competition</h3>
              <div className="space-y-2 text-sm md:text-base text-foreground/80">
                <p>❌ LinkedIn: Generic networking, no diaspora focus</p>
                <p>❌ Facebook Groups: Fragmented, no action tools</p>
                <p>❌ Remittance Apps: Transactional, no community</p>
                <p>❌ Diaspora Orgs: Limited reach, offline-first</p>
              </div>
            </div>
            <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <h3 className="text-xl md:text-2xl font-bold text-dna-emerald mb-3">DNA Advantage</h3>
              <div className="space-y-2 text-sm md:text-base text-foreground/80">
                <p>✓ <strong>Diaspora-First Design:</strong> Built for our unique needs</p>
                <p>✓ <strong>Systems-Change Focus:</strong> Coordinated action, not just networking</p>
                <p>✓ <strong>Cultural Intelligence:</strong> Rooted in Ubuntu & Sankofa</p>
                <p>✓ <strong>Action-Oriented:</strong> Real opportunities, tangible outcomes</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-dna-copper/10 to-dna-gold/10 p-5 rounded-lg border-2 border-dna-copper/20 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <p className="text-lg md:text-xl font-bold text-foreground">
              Why we win: <span className="text-dna-copper">Founder-market fit + First-mover advantage + Community-led growth</span>
            </p>
          </div>
        </div>
      )
    },
    {
      id: 10,
      title: "Team",
      subtitle: "Founder-market fit rooted in diaspora experience",
      showHeader: true,
      content: (
        <div className="space-y-5 animate-fade-in">
          <div className="bg-gradient-to-br from-dna-forest/10 to-dna-emerald/10 p-6 rounded-lg border-2 border-dna-emerald/20 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <h3 className="text-2xl md:text-3xl font-bold text-dna-copper mb-1">Jaûne Odombrown</h3>
            <p className="text-lg md:text-xl font-semibold text-dna-emerald mb-3">Founder & CEO</p>
            <div className="space-y-2 text-sm md:text-base text-foreground/80">
              <p>• 10+ years building ecosystems and launching startups</p>
              <p>• Deep diaspora network across 3 continents</p>
              <p>• Previous: Ecosystem development, venture building</p>
              <p>• Mission-driven entrepreneur with lived diaspora experience</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-card p-4 rounded-lg border-2 border-dna-copper/20 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <h3 className="text-lg md:text-xl font-bold text-dna-copper mb-2">Advisors</h3>
              <p className="text-sm md:text-base text-foreground/80">Diaspora thought leaders, tech entrepreneurs, impact investors</p>
            </div>
            <div className="bg-card p-4 rounded-lg border-2 border-dna-gold/20 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <h3 className="text-lg md:text-xl font-bold text-dna-gold mb-2">Building</h3>
              <p className="text-sm md:text-base text-foreground/80">Strategic partnerships with diaspora organizations, universities, and tech platforms</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 11,
      title: "Financials & Roadmap",
      subtitle: "Clear path to $1M ARR and beyond",
      showHeader: true,
      content: (
        <div className="space-y-5 animate-fade-in">
          {[
            { quarter: 'Q1-Q2: Foundation', goals: ['Complete MVP with core features', 'Reach 2,500 beta users', 'Launch in 5 diaspora hubs', '$50K MRR from premium memberships'], color: 'dna-emerald', delay: '0.1s' },
            { quarter: 'Q3-Q4: Acceleration', goals: ['Scale to 10,000 active users', 'Launch enterprise solutions', 'Expand to 15+ cities', '$200K MRR, path to $1M ARR'], color: 'dna-copper', delay: '0.2s' }
          ].map((roadmap) => (
            <div key={roadmap.quarter} className={`bg-gradient-to-r from-${roadmap.color}/10 to-${roadmap.color}/5 p-5 rounded-lg border-l-4 border-l-${roadmap.color} hover-scale animate-fade-in`} style={{ animationDelay: roadmap.delay }}>
              <h3 className={`text-xl md:text-2xl font-bold text-${roadmap.color} mb-2`}>{roadmap.quarter}</h3>
              <ul className="space-y-1 text-sm md:text-base text-foreground/80">
                {roadmap.goals.map((g) => <li key={g}>• {g}</li>)}
              </ul>
            </div>
          ))}
          <div className="bg-gradient-to-br from-dna-gold/10 to-dna-emerald/10 p-5 rounded-lg border-2 border-dna-gold/20 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <h3 className="text-xl md:text-2xl font-bold text-dna-gold mb-3">Use of Funds</h3>
            <div className="grid grid-cols-3 gap-3 text-base md:text-lg text-foreground/80">
              <div><strong>40%</strong> Product Development</div>
              <div><strong>35%</strong> Marketing & Growth</div>
              <div><strong>25%</strong> Operations & Team</div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 12,
      title: "The Ask",
      subtitle: "Join us in mobilizing Africa's greatest asset",
      showHeader: true,
      content: (
        <div className="flex flex-col items-center justify-center h-full space-y-6 text-center animate-fade-in">
          <div className="bg-gradient-to-br from-dna-copper/10 to-dna-gold/10 p-10 rounded-lg border-2 border-dna-copper/20 max-w-4xl animate-scale-in" style={{ animationDelay: '0.1s' }}>
            <p className="text-3xl md:text-4xl font-bold text-dna-copper mb-4">
              Raising $500K Seed Round
            </p>
            <p className="text-lg md:text-xl text-foreground/90">
              To scale product development, onboard 10,000 users, and establish DNA as the premier diaspora mobilization platform
            </p>
          </div>
          <div className="space-y-3 max-w-3xl animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <p className="text-xl md:text-2xl font-bold text-foreground">
              Join us in mobilizing the world's most powerful distributed asset
            </p>
            <p className="text-lg md:text-xl text-dna-emerald">
              Together, we transform scattered strength into collective power
            </p>
          </div>
          <div className="mt-8 pt-6 border-t-2 border-border w-full max-w-2xl animate-fade-in" style={{ animationDelay: '0.5s' }}>
            <p className="text-lg font-semibold text-foreground mb-3">Contact</p>
            <p className="text-base text-foreground/80">Jaûne Odombrown</p>
            <p className="text-base text-dna-copper font-semibold">jaune@diasporanetwork.africa</p>
            <p className="text-base text-foreground/80 mt-2">www.diasporanetwork.africa</p>
          </div>
        </div>
      )
    }
  ];

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'DNA Platform - Pitch Deck',
          text: 'Discover the Diaspora Network of Africa - mobilizing the African Diaspora for systemic change.',
          url: window.location.href,
        });
        toast({
          title: "Shared successfully!",
          description: "Thank you for sharing the DNA pitch deck",
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.log('Share failed:', err);
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Link copied!",
          description: "Pitch deck link copied to clipboard",
        });
      } catch (err) {
        toast({
          title: "Could not copy",
          description: "Please copy the URL manually",
          variant: "destructive",
        });
      }
    }
  };

  const scrollToSlide = (index: number) => {
    setCurrentSlide(index);
    if (!isMobile && scrollContainerRef.current) {
      const slideWidth = scrollContainerRef.current.offsetWidth;
      scrollContainerRef.current.scrollTo({
        left: slideWidth * index,
        behavior: 'smooth'
      });
    }
  };

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      scrollToSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      scrollToSlide(currentSlide - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <UnifiedHeader />
      
      {/* Header Actions */}
      <div className="fixed top-20 right-4 z-50 flex gap-2 print:hidden">
        <Button variant="outline" size="sm" onClick={handleShare} className="gap-2 bg-background/95 backdrop-blur">
          <Share2 className="h-4 w-4" />
          Share
        </Button>
        <Button variant="outline" size="sm" onClick={handlePrint} className="gap-2 bg-background/95 backdrop-blur">
          <Download className="h-4 w-4" />
          Download
        </Button>
      </div>

      {/* Navigation Controls - Desktop */}
      {!isMobile && (
        <>
          <Button
            variant="outline"
            size="icon"
            className="fixed left-4 top-1/2 -translate-y-1/2 z-50 bg-background/95 backdrop-blur print:hidden"
            onClick={prevSlide}
            disabled={currentSlide === 0}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="fixed right-4 top-1/2 -translate-y-1/2 z-50 bg-background/95 backdrop-blur print:hidden"
            onClick={nextSlide}
            disabled={currentSlide === slides.length - 1}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </>
      )}

      {/* Slide Indicators */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex gap-2 print:hidden">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollToSlide(index)}
            className={cn(
              "w-2 h-2 rounded-full transition-all",
              currentSlide === index 
                ? "bg-dna-copper w-8" 
                : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
            )}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Slides Container */}
      <div className="pt-20">
        {isMobile ? (
          // Mobile: Vertical scroll
          <div className="space-y-4 px-4 pb-20">
            {slides.map((slide, index) => (
              <div
                key={slide.id}
                className="aspect-video bg-card rounded-lg shadow-lg p-6 md:p-8 flex flex-col"
              >
                {slide.showHeader && (
                  <div className="flex items-start justify-between mb-4 animate-fade-in">
                    <div className="flex-1">
                      <h2 className="text-xl md:text-2xl font-bold text-foreground mb-1">{slide.title}</h2>
                      <p className="text-xs md:text-sm text-muted-foreground">{slide.subtitle}</p>
                    </div>
                    <img 
                      src="/lovable-uploads/f7ac6d60-aafb-4e52-beb5-69c903113029.png" 
                      alt="DNA Logo" 
                      className="h-8 md:h-12 w-auto ml-3 flex-shrink-0"
                    />
                  </div>
                )}
                <div className="flex-1 overflow-auto">
                  {slide.content}
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Desktop: Horizontal scroll
          <div
            ref={scrollContainerRef}
            className="flex overflow-x-auto snap-x snap-mandatory h-[calc(100vh-5rem)] scroll-smooth print:block print:overflow-visible"
            style={{ 
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
            onScroll={(e) => {
              const slideWidth = e.currentTarget.offsetWidth;
              const scrollLeft = e.currentTarget.scrollLeft;
              const newSlide = Math.round(scrollLeft / slideWidth);
              if (newSlide !== currentSlide) {
                setCurrentSlide(newSlide);
              }
            }}
          >
            {slides.map((slide) => (
              <div
                key={slide.id}
                className="min-w-full h-full snap-center flex items-center justify-center px-8 py-4 print:min-w-0 print:page-break-after-always"
              >
                <div className="w-full aspect-video max-h-full bg-card rounded-lg shadow-2xl p-8 md:p-12 flex flex-col overflow-hidden">
                  {slide.showHeader && (
                    <div className="flex items-start justify-between mb-6 animate-fade-in">
                      <div className="flex-1">
                        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-1">{slide.title}</h2>
                        <p className="text-sm md:text-base text-muted-foreground">{slide.subtitle}</p>
                      </div>
                      <img 
                        src="/lovable-uploads/f7ac6d60-aafb-4e52-beb5-69c903113029.png" 
                        alt="DNA Logo" 
                        className="h-12 md:h-16 w-auto ml-4 flex-shrink-0"
                      />
                    </div>
                  )}
                  <div className="flex-1 overflow-auto">
                    {slide.content}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @media print {
          @page {
            size: landscape;
            margin: 0;
          }
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
        }
        
        /* Hide scrollbar for Chrome, Safari and Opera */
        .overflow-x-auto::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default PitchDeck;
