
import React from 'react';
import PhaseHero from '@/components/phases/PhaseHero';
import PhaseObjectives from '@/components/phases/PhaseObjectives';
import PhaseTimeline from '@/components/phases/PhaseTimeline';
import PhaseMetrics from '@/components/phases/PhaseMetrics';
import { Users, Code, Target, CheckCircle, BarChart3, Lightbulb } from "lucide-react";
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useScrollToTop } from '@/hooks/useScrollToTop';

const objectives = [
  {
    icon: <Users className="w-5 h-5" />,
    title: "Community Validation",
    description: "Work directly with early adopters and DNA community members to validate our framework and gather actionable feedback.",
    status: "Ongoing",
    completion: 70
  },
  {
    icon: <Code className="w-5 h-5" />,
    title: "Core Infrastructure",
    description: "Develop and test the technical foundations needed to build and scale the DNA platform.",
    status: "In Progress",
    completion: 65
  },
  {
    icon: <Target className="w-5 h-5" />,
    title: "Product-Market Fit",
    description: "Refine the value proposition and key features to ensure our solution meets real-world diaspora needs.",
    status: "Active",
    completion: 50
  },
];

const timeline = [
  {
    quarter: "Q3 2025",
    title: "Community & Prototype Launch",
    items: [
      "Early adopter feedback gathering",
      "Core concept prototyping and validation",
      "Initial outreach to diaspora groups",
      "First version of matching algorithm",
    ],
    status: "active" as const,
  },
  {
    quarter: "Q4 2025",
    title: "Refinement & Early Growth",
    items: [
      "Prototype iterations and bug fixing",
      "Beta user expansion",
      "Feature refinement based on feedback",
      "Growth of core community"
    ],
    status: "upcoming" as const,
  }
];

const fallbackMetrics = [
  {
    id: "1",
    label: "Beta Testers",
    value: "245",
    target: "500",
    icon: "users",
    color: "bg-dna-emerald"
  },
  {
    id: "2", 
    label: "Feedback Sessions",
    value: "18",
    target: "50",
    icon: "message-square",
    color: "bg-dna-copper"
  },
  {
    id: "3",
    label: "Feature Prototypes",
    value: "8",
    target: "15",
    icon: "code",
    color: "bg-dna-gold"
  },
  {
    id: "4",
    label: "Community Partners",
    value: "12",
    target: "25",
    icon: "handshake",
    color: "bg-dna-forest"
  }
];

const PrototypingPhase = () => {
  useScrollToTop();
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <PhaseHero
        badge="Phase 1"
        title="Prototyping Phase"
        description="The foundation stage where we validate our DNA framework concept, gather early community feedback, and establish core functionalities for the journey ahead."
        prevPhase={undefined}
        nextPhase={{ label: "Next: Build Phase", url: "/build-phase" }}
        gradient="bg-gradient-to-br from-dna-mint to-dna-emerald"
      />
      <PhaseObjectives objectives={objectives} color="dna-emerald" />
      <PhaseTimeline milestones={timeline} color="dna-copper" />
      <PhaseMetrics phaseSlug="prototyping" fallbackMetrics={fallbackMetrics} />
      <section className="py-16 bg-gradient-to-r from-dna-emerald/10 to-dna-copper/10">
        <div className="max-w-4xl mx-auto text-center px-4">
          <Lightbulb className="w-16 h-16 text-dna-copper mx-auto mb-5" />
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Join Us at the Start of the DNA Journey
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Be part of our prototyping community and make your voice heard.
          </p>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default PrototypingPhase;
