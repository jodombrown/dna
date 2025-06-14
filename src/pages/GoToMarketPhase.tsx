import React from 'react';
import PhaseHero from '@/components/phases/PhaseHero';
import PhaseObjectives from '@/components/phases/PhaseObjectives';
import PhaseTimeline from '@/components/phases/PhaseTimeline';
import PhaseMetrics from '@/components/phases/PhaseMetrics';
import { Megaphone, Globe, TrendingUp, BarChart3, CheckCircle, Lightbulb } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useScrollToTop } from '@/hooks/useScrollToTop';

const objectives = [
  {
    icon: <Megaphone className="w-5 h-5" />,
    title: "Global Launch",
    description: "Bring DNA platform to target diaspora communities across regions.",
    status: "Not Started",
    completion: 0
  },
  {
    icon: <Globe className="w-5 h-5" />,
    title: "International Expansion",
    description: "Establish a network of local chapters in major diaspora regions.",
    status: "Preparation",
    completion: 15
  },
  {
    icon: <TrendingUp className="w-5 h-5" />,
    title: "Growth Optimization",
    description: "Optimize marketing, onboarding, and partnerships to grow user base.",
    status: "Planning",
    completion: 10
  },
];

const timeline = [
  {
    quarter: "Q3 2026",
    title: "Market Readiness",
    items: [
      "Finalize regional launch plan",
      "Internationalize platform features",
      "Recruit and train local ambassadors"
    ],
    status: "active" as const,
  },
  {
    quarter: "Q3 2026",
    title: "Soft Launch",
    items: [
      "Roll out in select regions",
      "Early media & PR campaigns",
      "Monitor & optimize user onboarding"
    ],
    status: "upcoming" as const,
  },
  {
    quarter: "Q3 2026",
    title: "Full Launch",
    items: [
      "Go global across key markets",
      "Scale infrastructure for high demand",
      "Solidify new partnerships"
    ],
    status: "upcoming" as const,
  }
];

const metrics = [
  { label: "Global Users", value: "0", target: "50,000", color: "bg-dna-gold" },
  { label: "Monthly Revenue", value: "0", target: "1.5M", color: "bg-dna-copper" },
  { label: "Countries", value: "0", target: "25", color: "bg-dna-emerald" },
  { label: "Corporate Partners", value: "0", target: "200", color: "bg-dna-forest" }
];

const GoToMarketPhase = () => {
  useScrollToTop();
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <PhaseHero
        badge="Phase 5"
        title="Go-to-Market Phase"
        description="A global launch and marketing push to bring the DNA platform to diaspora communities worldwide and drive sustainable user growth."
        prevPhase={{ label: "Previous: Customer Discovery Phase", url: "/customer-discovery-phase" }}
        nextPhase={undefined}
        gradient="bg-gradient-to-br from-dna-gold via-dna-copper to-dna-emerald"
      />
      <PhaseObjectives objectives={objectives} color="dna-gold" />
      <PhaseTimeline milestones={timeline} color="dna-gold" />
      <PhaseMetrics phaseSlug="go-to-market" />
      <section className="py-16 bg-gradient-to-r from-dna-gold/10 to-dna-emerald/10">
        <div className="max-w-4xl mx-auto text-center px-4">
          <Lightbulb className="w-16 h-16 text-dna-gold mx-auto mb-5" />
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Let's Make DNA a Global Movement
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Partner with us, spread the word, and help us empower the African diaspora on a global scale!
          </p>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default GoToMarketPhase;
