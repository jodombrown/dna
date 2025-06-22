
import React, { useState } from 'react';
import { useAnimatedCounter } from '@/hooks/useAnimatedCounter';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ArrowRight, ExternalLink } from 'lucide-react';

const AnimatedStat = ({ value, suffix, label, description, bgGradient }: {
  value: number;
  suffix: string;
  label: string;
  description: string;
  bgGradient: string;
}) => {
  const { count, countRef } = useAnimatedCounter({ end: value, duration: 2500 });

  return (
    <div className={`${bgGradient} rounded-xl p-6 text-center shadow-lg`}>
      <div ref={countRef} className="text-4xl font-bold text-white mb-2">
        {count}{suffix}
      </div>
      <div className="text-lg font-medium text-white/90 mb-1">{label}</div>
      <div className="text-sm text-white/80">{description}</div>
    </div>
  );
};

const TimelineItem = ({ year, events, isActive, onClick }: {
  year: string;
  events: string[];
  isActive: boolean;
  onClick: () => void;
}) => (
  <div 
    className={`cursor-pointer p-4 rounded-lg transition-all duration-300 ${
      isActive ? 'bg-dna-emerald text-white shadow-lg' : 'bg-white/50 hover:bg-white/70'
    }`}
    onClick={onClick}
  >
    <div className="font-bold text-lg mb-2">{year}</div>
    {events.map((event, idx) => (
      <div key={idx} className="text-sm mb-1">• {event}</div>
    ))}
  </div>
);

const TestimonialCard = ({ quote, author, title, image }: {
  quote: string;
  author: string;
  title: string;
  image: string;
}) => (
  <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg min-h-[200px] flex flex-col justify-between">
    <blockquote className="text-lg italic text-gray-700 mb-4 flex-grow">
      "{quote}"
    </blockquote>
    <div className="flex items-center gap-4">
      <img src={image} alt={author} className="w-12 h-12 rounded-full object-cover" />
      <div>
        <div className="font-semibold text-dna-forest">{author}</div>
        <div className="text-sm text-gray-600">{title}</div>
      </div>
    </div>
  </div>
);

const DiasporaStats = () => {
  const [activeTimelineYear, setActiveTimelineYear] = useState('2024');
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const timelineData = [
    {
      year: '2014',
      events: ['Remittances: $71B', 'Digital banking emergence', 'First diaspora investment funds']
    },
    {
      year: '2016',
      events: ['Remittances: $80B', 'Mobile money expansion', '100+ diaspora organizations']
    },
    {
      year: '2018',
      events: ['Remittances: $90B', '250+ organizations', 'Tech startup boom begins']
    },
    {
      year: '2020',
      events: ['COVID-19 resilience', 'Digital transformation', 'Virtual collaboration tools']
    },
    {
      year: '2022',
      events: ['Remittances: $95B', 'Fintech revolution', '1000+ active projects']
    },
    {
      year: '2024',
      events: ['Remittances: $100B+', '40% return migration increase', 'AI-powered platforms']
    }
  ];

  const testimonials = [
    {
      quote: "I launched my agritech startup with support from the diaspora network. Today, we're transforming farming across West Africa.",
      author: "Ngozi Adebayo",
      title: "CEO, FarmTech Solutions",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b37c?w=100&h=100&fit=crop&crop=face"
    },
    {
      quote: "My remittances now fund a solar energy project that powers 50 schools in rural Kenya. This is the impact we can create together.",
      author: "Samuel Thompson",
      title: "Architect & Impact Investor",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face"
    },
    {
      quote: "The diaspora network connected me with mentors who helped scale my fintech company from idea to serving 100k+ users.",
      author: "Amara Diallo",
      title: "Founder, PayConnect Africa",
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop&crop=face"
    }
  ];

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Hero Section with Background Image */}
      <section className="relative bg-gradient-to-br from-dna-forest via-dna-emerald to-dna-copper rounded-3xl overflow-hidden mb-16">
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative z-10 px-8 py-16 text-center text-white">
          <h2 className="text-5xl md:text-6xl font-bold mb-12 leading-tight">
            The African Diaspora: A $100 B+ Engine for Change
          </h2>
          
          {/* Three Statistics Cards */}
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <AnimatedStat
              value={200}
              suffix="M+"
              label="People of African Descent"
              description="Living outside Africa, projected to comprise 25% of global population"
              bgGradient="bg-gradient-to-br from-dna-emerald/80 to-dna-forest/80"
            />
            
            <AnimatedStat
              value={100}
              suffix="B+"
              label="Annual Remittances (2024)"
              description="Fueling economic growth across African nations"
              bgGradient="bg-gradient-to-br from-dna-copper/80 to-dna-gold/80"
            />
            
            <AnimatedStat
              value={60}
              suffix="%"
              label="Highly Educated"
              description="Advanced degrees and specialized skills driving innovation"
              bgGradient="bg-gradient-to-br from-dna-mint/80 to-dna-emerald/80"
            />
          </div>
        </div>
      </section>

      {/* Interactive Timeline */}
      <section className="mb-16">
        <div className="text-center mb-8">
          <h3 className="text-3xl font-bold text-dna-forest mb-4">Interactive Timeline (2014 – 2024)</h3>
          <p className="text-lg text-gray-600">Explore a decade of diaspora growth and impact</p>
        </div>
        
        <div className="bg-gray-50 rounded-2xl p-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {timelineData.map((item) => (
              <TimelineItem
                key={item.year}
                year={item.year}
                events={item.events}
                isActive={activeTimelineYear === item.year}
                onClick={() => setActiveTimelineYear(item.year)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* "What You're Missing" Infographic */}
      <section className="mb-16">
        <div className="text-center mb-8">
          <h3 className="text-3xl font-bold text-dna-forest mb-4">What You're Missing</h3>
          <p className="text-lg text-gray-600">The untapped potential of fragmented networks</p>
        </div>
        
        <div className="bg-gradient-to-r from-dna-crimson/10 to-dna-copper/10 rounded-2xl p-8">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <div className="bg-white rounded-lg p-6 shadow-lg">
                <h4 className="font-bold text-xl text-dna-crimson mb-4">Current Challenges</h4>
                <ul className="space-y-2 text-gray-700">
                  <li>• 250+ hidden diaspora organizations</li>
                  <li>• Less than $2B equivalent in coordinated investment</li>
                  <li>• Fragmented platforms limiting collaboration</li>
                  <li>• 98% of potential connections unmade</li>
                </ul>
              </div>
            </div>
            
            <div className="space-y-6">
              {/* Gauge Chart Representation */}
              <div className="bg-white rounded-lg p-6 shadow-lg text-center">
                <h5 className="font-semibold mb-4">Network Utilization</h5>
                <div className="relative w-32 h-16 mx-auto mb-4">
                  <div className="absolute inset-0 border-8 border-gray-200 rounded-t-full"></div>
                  <div className="absolute inset-0 border-8 border-dna-crimson rounded-t-full" style={{clipPath: 'polygon(0 0, 2% 0, 2% 100%, 0% 100%)'}}></div>
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-2xl font-bold text-dna-crimson">2%</div>
                </div>
                <p className="text-sm text-gray-600">of diaspora potential currently connected</p>
              </div>
              
              {/* Bar Chart Representation */}
              <div className="bg-white rounded-lg p-6 shadow-lg">
                <h5 className="font-semibold mb-4">Remittances Growth</h5>
                <div className="flex items-end justify-between h-20 mb-2">
                  <div className="flex flex-col items-center">
                    <div className="w-8 bg-gray-300 h-12 rounded-t"></div>
                    <span className="text-xs mt-1">2014</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-8 bg-dna-emerald h-20 rounded-t"></div>
                    <span className="text-xs mt-1">2024</span>
                  </div>
                </div>
                <div className="text-center text-sm text-gray-600">$71B → $100B+</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Real Voices Carousel */}
      <section className="mb-16">
        <div className="text-center mb-8">
          <h3 className="text-3xl font-bold text-dna-forest mb-4">Real Voices</h3>
          <p className="text-lg text-gray-600">Stories from diaspora changemakers</p>
        </div>
        
        <div className="relative bg-gradient-to-r from-dna-mint/20 to-dna-emerald/20 rounded-2xl p-8">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="icon"
              onClick={prevTestimonial}
              className="rounded-full"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            <div className="flex-1 mx-8">
              <TestimonialCard {...testimonials[currentTestimonial]} />
            </div>
            
            <Button
              variant="outline"
              size="icon"
              onClick={nextTestimonial}
              className="rounded-full"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Dots Indicator */}
          <div className="flex justify-center mt-6 space-x-2">
            {testimonials.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentTestimonial(idx)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  idx === currentTestimonial ? 'bg-dna-emerald' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Call-to-Action Band */}
      <section className="mb-16">
        <div className="bg-gradient-to-r from-dna-emerald to-dna-copper rounded-2xl p-8 text-center text-white">
          <h3 className="text-3xl font-bold mb-4">Ready to Tap In?</h3>
          <p className="text-xl mb-8 text-white/90">Join the movement transforming Africa's future</p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              className="bg-white text-dna-emerald hover:bg-white/90 font-semibold"
            >
              Join the DNA Community
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white/20 font-semibold"
            >
              Share Your Expertise
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white/20 font-semibold"
            >
              Pitch a Project
            </Button>
          </div>
        </div>
      </section>

      {/* Sources & Further Reading */}
      <section className="border-t border-gray-200 pt-8">
        <h4 className="text-lg font-semibold text-gray-800 mb-4">Sources & Further Reading</h4>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <ExternalLink className="w-4 h-4" />
            <span>World Bank, Migration & Development Brief, Apr 2025</span>
          </div>
          <div className="flex items-center gap-2">
            <ExternalLink className="w-4 h-4" />
            <span>Brookings, "Diaspora & Investment Flows," 2024</span>
          </div>
          <div className="flex items-center gap-2">
            <ExternalLink className="w-4 h-4" />
            <span>UNESCO, "Global Skills Mobility Report," 2023</span>
          </div>
          <div className="flex items-center gap-2">
            <ExternalLink className="w-4 h-4" />
            <span>AfDB, "Annual Remittances Report," 2024</span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DiasporaStats;
