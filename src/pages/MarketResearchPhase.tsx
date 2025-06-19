
import React from 'react';
import PhaseHero from '@/components/phases/PhaseHero';
import PhaseObjectives from '@/components/phases/PhaseObjectives';
import PhaseTimeline from '@/components/phases/PhaseTimeline';
import PhaseMetrics from '@/components/phases/PhaseMetrics';
import { Search, Users, FileText, Target, TrendingUp, MessageSquare } from "lucide-react";
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useScrollToTop } from '@/hooks/useScrollToTop';

const objectives = [
  {
    icon: <Users className="w-5 h-5" />,
    title: "Understand Diaspora Needs",
    description: "Deep dive into diaspora motivations, behaviors, and unmet needs through comprehensive research and stakeholder engagement.",
    status: "In Progress",
    completion: 85
  },
  {
    icon: <Target className="w-5 h-5" />,
    title: "Validate DNA Concept",
    description: "Test and validate our core platform concept and potential market fit through structured feedback and analysis.",
    status: "Active",
    completion: 70
  },
  {
    icon: <TrendingUp className="w-5 h-5" />,
    title: "Market Size Validation",
    description: "Quantify market opportunity and size using public data sources and proprietary research methodologies.",
    status: "Active",
    completion: 60
  },
];

const timeline = [
  {
    quarter: "Jun 2025",
    title: "Research Foundation & Setup",
    items: [
      "AI-led research & synthesis of diaspora trends",
      "Competitive landscape mapping",
      "Research methodology framework",
      "Stakeholder identification and outreach"
    ],
    status: "active" as const,
  },
  {
    quarter: "Jul-Aug 2025",
    title: "Data Collection & Analysis",
    items: [
      "50+ stakeholder interviews (auto-scheduled, transcribed)",
      "Sentiment analysis on surveys",
      "Persona development workshops",
      "Journey mapping sessions"
    ],
    status: "upcoming" as const,
  },
  {
    quarter: "Sep 2025",
    title: "Synthesis & Validation",
    items: [
      "Research report compilation",
      "Market size validation",
      "Validation memo creation",
      "Phase 2 planning and transition"
    ],
    status: "upcoming" as const,
  }
];

const fallbackMetrics = [
  {
    id: "1",
    label: "Stakeholder Interviews",
    value: "32",
    target: "50",
    icon: "message-square",
    color: "bg-dna-emerald"
  },
  {
    id: "2", 
    label: "Survey Responses",
    value: "127",
    target: "200",
    icon: "users",
    color: "bg-dna-copper"
  },
  {
    id: "3",
    label: "Research Hours",
    value: "240",
    target: "400",
    icon: "clock",
    color: "bg-dna-gold"
  },
  {
    id: "4",
    label: "Personas Created",
    value: "3",
    target: "5",
    icon: "target",
    color: "bg-dna-forest"
  }
];

const MarketResearchPhase = () => {
  useScrollToTop();
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <PhaseHero
        badge="Phase 1"
        title="Market Research & Validation"
        description="Understanding diaspora needs, motivations, and behaviors to validate DNA's concept and market fit through comprehensive research and stakeholder engagement."
        prevPhase={undefined}
        nextPhase={{ label: "Next: Prototyping Phase", url: "/prototyping-phase" }}
        gradient="bg-gradient-to-br from-blue-500 to-blue-700"
      />
      <PhaseObjectives objectives={objectives} color="dna-emerald" />
      <PhaseTimeline milestones={timeline} color="blue-600" />
      <PhaseMetrics phaseSlug="market-research" fallbackMetrics={fallbackMetrics} />
      <section className="py-16 bg-gradient-to-r from-blue-500/10 to-dna-emerald/10">
        <div className="max-w-4xl mx-auto text-center px-4">
          <Search className="w-16 h-16 text-blue-600 mx-auto mb-5" />
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Help Shape DNA Through Research
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join our research community and contribute to building a platform that truly serves the African diaspora.
          </p>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default MarketResearchPhase;
