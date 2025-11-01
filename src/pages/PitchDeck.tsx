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
      content: (
        <div className="flex flex-col items-center justify-center h-full text-center space-y-8">
          <img 
            src="/lovable-uploads/f7ac6d60-aafb-4e52-beb5-69c903113029.png" 
            alt="DNA Logo" 
            className="h-32 md:h-48 w-auto mb-4"
          />
          <div className="text-lg md:text-xl font-semibold text-muted-foreground tracking-widest">
            DIASPORA NETWORK OF AFRICA
          </div>
          <p className="text-2xl md:text-4xl font-bold text-foreground max-w-3xl">
            Mobilizing the African Diaspora to drive systemic change through innovation and entrepreneurship
          </p>
        </div>
      )
    },
    {
      id: 2,
      title: "The Problem",
      content: (
        <div className="space-y-8">
          <h2 className="text-4xl md:text-6xl font-bold text-foreground">The Problem</h2>
          <div className="space-y-6 text-lg md:text-2xl text-foreground/90">
            <p className="leading-relaxed">
              <strong className="text-dna-copper">200+ million African diasporans</strong> worldwide possess extraordinary power:
            </p>
            <ul className="space-y-4 ml-6">
              <li className="flex items-start gap-3">
                <span className="text-dna-emerald mt-2">•</span>
                <span>Skills honed across continents</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-dna-emerald mt-2">•</span>
                <span>Networks spanning the globe</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-dna-emerald mt-2">•</span>
                <span>Knowledge bridging cultures</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-dna-emerald mt-2">•</span>
                <span>$200B+ in annual remittances</span>
              </li>
            </ul>
            <p className="text-3xl md:text-4xl font-bold text-destructive mt-8">
              Yet this power remains scattered, underutilized, and disconnected from Africa's urgent needs.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 3,
      title: "The Solution",
      content: (
        <div className="space-y-8">
          <h2 className="text-4xl md:text-6xl font-bold text-foreground">The Solution</h2>
          <p className="text-2xl md:text-3xl font-semibold text-dna-copper">
            The first digital mobilization engine for the African Diaspora
          </p>
          <div className="grid md:grid-cols-5 gap-4 mt-8">
            {['CONNECT', 'CONVENE', 'COLLABORATE', 'CONTRIBUTE', 'CONVEY'].map((c, idx) => (
              <div key={c} className="bg-gradient-to-br from-dna-forest/10 to-dna-emerald/10 p-6 rounded-lg border-2 border-dna-emerald/20">
                <div className="text-5xl font-bold text-dna-copper mb-2">{idx + 1}</div>
                <div className="text-xl font-bold text-foreground">{c}</div>
              </div>
            ))}
          </div>
          <div className="bg-gradient-to-r from-dna-copper/10 to-dna-gold/10 p-8 rounded-lg border-2 border-dna-copper/20 mt-8">
            <p className="text-xl md:text-2xl text-foreground/90">
              We transform scattered strength into <strong>collective power</strong>, turning individual efforts into <strong>systemic change</strong>.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 4,
      title: "Market Opportunity",
      content: (
        <div className="space-y-8">
          <h2 className="text-4xl md:text-6xl font-bold text-foreground">Market Opportunity</h2>
          <div className="grid md:grid-cols-3 gap-8 mt-8">
            <div className="bg-gradient-to-br from-dna-forest/10 to-dna-emerald/10 p-8 rounded-lg border-2 border-dna-emerald/20 text-center">
              <div className="text-6xl md:text-7xl font-bold text-dna-copper mb-4">200M+</div>
              <div className="text-xl font-semibold text-foreground">African Diasporans Worldwide</div>
            </div>
            <div className="bg-gradient-to-br from-dna-emerald/10 to-dna-gold/10 p-8 rounded-lg border-2 border-dna-gold/20 text-center">
              <div className="text-6xl md:text-7xl font-bold text-dna-emerald mb-4">$200B+</div>
              <div className="text-xl font-semibold text-foreground">Annual Diaspora Remittances</div>
            </div>
            <div className="bg-gradient-to-br from-dna-copper/10 to-dna-gold/10 p-8 rounded-lg border-2 border-dna-copper/20 text-center">
              <div className="text-6xl md:text-7xl font-bold text-dna-gold mb-4">$3.4T</div>
              <div className="text-xl font-semibold text-foreground">Africa's GDP by 2030</div>
            </div>
          </div>
          <div className="space-y-4 text-lg md:text-xl text-foreground/90 mt-8">
            <p>Africa is the world's <strong>fastest-growing economic region</strong></p>
            <p>The diaspora is <strong>massively underutilized</strong> as a development resource</p>
            <p>DNA positions diasporans as <strong>architects of Africa's future</strong></p>
          </div>
        </div>
      )
    },
    {
      id: 5,
      title: "Product / Platform",
      content: (
        <div className="space-y-8">
          <h2 className="text-4xl md:text-6xl font-bold text-foreground">Platform Features</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-card p-6 rounded-lg border-2 border-dna-emerald/20">
              <h3 className="text-2xl font-bold text-dna-emerald mb-3">Verified Profiles</h3>
              <p className="text-lg text-foreground/80">Cultural & professional identity system with skills, regions, and diaspora connections</p>
            </div>
            <div className="bg-card p-6 rounded-lg border-2 border-dna-copper/20">
              <h3 className="text-2xl font-bold text-dna-copper mb-3">Smart Matching</h3>
              <p className="text-lg text-foreground/80">AI-powered connections based on expertise, interests, and impact goals</p>
            </div>
            <div className="bg-card p-6 rounded-lg border-2 border-dna-gold/20">
              <h3 className="text-2xl font-bold text-dna-gold mb-3">Collaboration Spaces</h3>
              <p className="text-lg text-foreground/80">Project hubs, events, and opportunities for coordinated action</p>
            </div>
            <div className="bg-card p-6 rounded-lg border-2 border-dna-forest/20">
              <h3 className="text-2xl font-bold text-dna-forest mb-3">Impact Tracking</h3>
              <p className="text-lg text-foreground/80">Measure contributions, showcase outcomes, amplify success stories</p>
            </div>
          </div>
          <div className="bg-gradient-to-r from-dna-copper/10 to-dna-gold/10 p-6 rounded-lg border-2 border-dna-copper/20 mt-6">
            <p className="text-xl font-semibold text-foreground">
              Currently in private beta with <strong>500+ early adopters</strong> from 40+ countries
            </p>
          </div>
        </div>
      )
    },
    {
      id: 6,
      title: "Traction & Validation",
      content: (
        <div className="space-y-8">
          <h2 className="text-4xl md:text-6xl font-bold text-foreground">Traction & Validation</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-dna-emerald/10 to-dna-forest/10 p-6 rounded-lg border-2 border-dna-emerald/20">
                <div className="text-5xl font-bold text-dna-emerald mb-2">500+</div>
                <div className="text-lg font-semibold text-foreground">Beta Users in 3 Months</div>
              </div>
              <div className="bg-gradient-to-br from-dna-copper/10 to-dna-gold/10 p-6 rounded-lg border-2 border-dna-copper/20">
                <div className="text-5xl font-bold text-dna-copper mb-2">40+</div>
                <div className="text-lg font-semibold text-foreground">Countries Represented</div>
              </div>
              <div className="bg-gradient-to-br from-dna-gold/10 to-dna-emerald/10 p-6 rounded-lg border-2 border-dna-gold/20">
                <div className="text-5xl font-bold text-dna-gold mb-2">15+</div>
                <div className="text-lg font-semibold text-foreground">Active Partnerships</div>
              </div>
            </div>
            <div className="bg-card p-6 rounded-lg border-2 border-dna-forest/20">
              <h3 className="text-2xl font-bold text-dna-forest mb-4">Early Feedback</h3>
              <div className="space-y-4 text-foreground/80">
                <p className="italic">"Finally, a platform that understands the diaspora experience and makes it easy to give back meaningfully."</p>
                <p className="text-sm text-muted-foreground">- Tech entrepreneur, San Francisco</p>
                <p className="italic mt-4">"This is the missing infrastructure we've been waiting for to coordinate diaspora impact."</p>
                <p className="text-sm text-muted-foreground">- Impact investor, London</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 7,
      title: "Business Model",
      content: (
        <div className="space-y-8">
          <h2 className="text-4xl md:text-6xl font-bold text-foreground">Revenue Streams</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-dna-emerald/10 to-dna-forest/10 p-6 rounded-lg border-2 border-dna-emerald/20">
              <h3 className="text-2xl font-bold text-dna-emerald mb-3">Premium Memberships</h3>
              <p className="text-lg text-foreground/80 mb-4">$29/month or $290/year</p>
              <ul className="space-y-2 text-foreground/80">
                <li>• Advanced matching & analytics</li>
                <li>• Priority event access</li>
                <li>• Enhanced visibility</li>
              </ul>
            </div>
            <div className="bg-gradient-to-br from-dna-copper/10 to-dna-gold/10 p-6 rounded-lg border-2 border-dna-copper/20">
              <h3 className="text-2xl font-bold text-dna-copper mb-3">Enterprise Solutions</h3>
              <p className="text-lg text-foreground/80 mb-4">$500-5000/month</p>
              <ul className="space-y-2 text-foreground/80">
                <li>• Corporate talent pipelines</li>
                <li>• Diaspora engagement programs</li>
                <li>• White-label solutions</li>
              </ul>
            </div>
            <div className="bg-gradient-to-br from-dna-gold/10 to-dna-emerald/10 p-6 rounded-lg border-2 border-dna-gold/20">
              <h3 className="text-2xl font-bold text-dna-gold mb-3">Platform Fees</h3>
              <p className="text-lg text-foreground/80 mb-4">5-10% transaction fee</p>
              <ul className="space-y-2 text-foreground/80">
                <li>• Investment facilitation</li>
                <li>• Event ticketing</li>
                <li>• Service marketplace</li>
              </ul>
            </div>
            <div className="bg-gradient-to-br from-dna-forest/10 to-dna-copper/10 p-6 rounded-lg border-2 border-dna-forest/20">
              <h3 className="text-2xl font-bold text-dna-forest mb-3">Data & Insights</h3>
              <p className="text-lg text-foreground/80 mb-4">Custom pricing</p>
              <ul className="space-y-2 text-foreground/80">
                <li>• Diaspora trend reports</li>
                <li>• Market intelligence</li>
                <li>• Research partnerships</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 8,
      title: "Go-to-Market Strategy",
      content: (
        <div className="space-y-8">
          <h2 className="text-4xl md:text-6xl font-bold text-foreground">Growth Strategy</h2>
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-dna-emerald/10 to-dna-forest/10 p-6 rounded-lg border-l-4 border-l-dna-emerald">
              <h3 className="text-2xl font-bold text-dna-emerald mb-3">Phase 1: Community Seeding (Now - Month 6)</h3>
              <p className="text-lg text-foreground/80">Target diaspora hubs: Lagos, London, New York, Atlanta. Partner with diaspora organizations and thought leaders.</p>
            </div>
            <div className="bg-gradient-to-r from-dna-copper/10 to-dna-gold/10 p-6 rounded-lg border-l-4 border-l-dna-copper">
              <h3 className="text-2xl font-bold text-dna-copper mb-3">Phase 2: Viral Growth (Months 7-12)</h3>
              <p className="text-lg text-foreground/80">Leverage success stories, referral programs, and content marketing. Launch in 10+ major diaspora cities.</p>
            </div>
            <div className="bg-gradient-to-r from-dna-gold/10 to-dna-emerald/10 p-6 rounded-lg border-l-4 border-l-dna-gold">
              <h3 className="text-2xl font-bold text-dna-gold mb-3">Phase 3: Enterprise Expansion (Year 2+)</h3>
              <p className="text-lg text-foreground/80">Partner with governments, corporations, and NGOs. Scale to 100K+ users across 50+ countries.</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 9,
      title: "Competition & Differentiation",
      content: (
        <div className="space-y-8">
          <h2 className="text-4xl md:text-6xl font-bold text-foreground">Our Unfair Advantage</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-2xl font-bold text-dna-copper mb-4">The Competition</h3>
              <div className="space-y-3 text-lg text-foreground/80">
                <p>❌ LinkedIn: Generic networking, no diaspora focus</p>
                <p>❌ Facebook Groups: Fragmented, no action tools</p>
                <p>❌ Remittance Apps: Transactional, no community</p>
                <p>❌ Diaspora Orgs: Limited reach, offline-first</p>
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-dna-emerald mb-4">DNA Advantage</h3>
              <div className="space-y-3 text-lg text-foreground/80">
                <p>✓ <strong>Diaspora-First Design:</strong> Built for our unique needs</p>
                <p>✓ <strong>Systems-Change Focus:</strong> Coordinated action, not just networking</p>
                <p>✓ <strong>Cultural Intelligence:</strong> Rooted in Ubuntu & Sankofa</p>
                <p>✓ <strong>Action-Oriented:</strong> Real opportunities, tangible outcomes</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-dna-copper/10 to-dna-gold/10 p-8 rounded-lg border-2 border-dna-copper/20 mt-6">
            <p className="text-2xl font-bold text-foreground">
              Why we win: <span className="text-dna-copper">Founder-market fit + First-mover advantage + Community-led growth</span>
            </p>
          </div>
        </div>
      )
    },
    {
      id: 10,
      title: "Team",
      content: (
        <div className="space-y-8">
          <h2 className="text-4xl md:text-6xl font-bold text-foreground">The Team</h2>
          <div className="bg-gradient-to-br from-dna-forest/10 to-dna-emerald/10 p-8 rounded-lg border-2 border-dna-emerald/20">
            <div className="flex items-start gap-6">
              <div className="flex-1">
                <h3 className="text-3xl font-bold text-dna-copper mb-2">Jaûne Odombrown</h3>
                <p className="text-xl font-semibold text-dna-emerald mb-4">Founder & CEO</p>
                <div className="space-y-3 text-lg text-foreground/80">
                  <p>• 10+ years building ecosystems and launching startups</p>
                  <p>• Deep diaspora network across 3 continents</p>
                  <p>• Previous: Ecosystem development, venture building</p>
                  <p>• Mission-driven entrepreneur with lived diaspora experience</p>
                </div>
              </div>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-6 mt-8">
            <div className="bg-card p-6 rounded-lg border-2 border-dna-copper/20">
              <h3 className="text-xl font-bold text-dna-copper mb-3">Advisors</h3>
              <p className="text-foreground/80">Diaspora thought leaders, tech entrepreneurs, impact investors</p>
            </div>
            <div className="bg-card p-6 rounded-lg border-2 border-dna-gold/20">
              <h3 className="text-xl font-bold text-dna-gold mb-3">Building</h3>
              <p className="text-foreground/80">Strategic partnerships with diaspora organizations, universities, and tech platforms</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 11,
      title: "Financials & Roadmap",
      content: (
        <div className="space-y-8">
          <h2 className="text-4xl md:text-6xl font-bold text-foreground">12-Month Roadmap</h2>
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-dna-emerald/10 to-dna-forest/10 p-6 rounded-lg border-l-4 border-l-dna-emerald">
              <h3 className="text-2xl font-bold text-dna-emerald mb-2">Q1-Q2: Foundation</h3>
              <ul className="space-y-2 text-lg text-foreground/80">
                <li>• Complete MVP with core features</li>
                <li>• Reach 2,500 beta users</li>
                <li>• Launch in 5 diaspora hubs</li>
                <li>• $50K MRR from premium memberships</li>
              </ul>
            </div>
            <div className="bg-gradient-to-r from-dna-copper/10 to-dna-gold/10 p-6 rounded-lg border-l-4 border-l-dna-copper">
              <h3 className="text-2xl font-bold text-dna-copper mb-2">Q3-Q4: Acceleration</h3>
              <ul className="space-y-2 text-lg text-foreground/80">
                <li>• Scale to 10,000 active users</li>
                <li>• Launch enterprise solutions</li>
                <li>• Expand to 15+ cities</li>
                <li>• $200K MRR, path to $1M ARR</li>
              </ul>
            </div>
          </div>
          <div className="bg-gradient-to-br from-dna-gold/10 to-dna-emerald/10 p-8 rounded-lg border-2 border-dna-gold/20 mt-8">
            <h3 className="text-2xl font-bold text-dna-gold mb-4">Use of Funds</h3>
            <div className="grid md:grid-cols-3 gap-4 text-lg text-foreground/80">
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
      content: (
        <div className="flex flex-col items-center justify-center h-full space-y-8 text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-foreground">The Ask</h2>
          <div className="bg-gradient-to-br from-dna-copper/10 to-dna-gold/10 p-12 rounded-lg border-2 border-dna-copper/20 max-w-4xl">
            <p className="text-3xl md:text-5xl font-bold text-dna-copper mb-6">
              Raising $500K Seed Round
            </p>
            <p className="text-xl md:text-2xl text-foreground/90 mb-8">
              To scale product development, onboard 10,000 users, and establish DNA as the premier diaspora mobilization platform
            </p>
          </div>
          <div className="space-y-4 max-w-3xl">
            <p className="text-2xl md:text-3xl font-bold text-foreground">
              Join us in mobilizing the world's most powerful distributed asset
            </p>
            <p className="text-xl md:text-2xl text-dna-emerald">
              Together, we transform scattered strength into collective power
            </p>
          </div>
          <div className="mt-12 pt-8 border-t-2 border-border w-full max-w-2xl">
            <p className="text-xl font-semibold text-foreground mb-4">Contact</p>
            <p className="text-lg text-foreground/80">Jaûne Odombrown</p>
            <p className="text-lg text-dna-copper">jaune@diasporanetwork.africa</p>
            <p className="text-lg text-foreground/80 mt-4">www.diasporanetwork.africa</p>
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
                className="min-h-[calc(100vh-8rem)] bg-card rounded-lg shadow-lg p-8 md:p-12 flex items-center justify-center"
              >
                <div className="w-full max-w-5xl">
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
                className="min-w-full h-full snap-center flex items-center justify-center px-16 py-8 print:min-w-0 print:page-break-after-always"
              >
                <div className="w-full h-full max-w-7xl bg-card rounded-lg shadow-2xl p-12 md:p-16 flex items-center justify-center">
                  <div className="w-full">
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
