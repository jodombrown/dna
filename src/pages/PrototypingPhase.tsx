
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
    icon: <Code className="w-5 h-5" />,
    title: "Create Product Experience",
    description: "Build and test the product experience through wireframes and interactive prototypes before full development.",
    status: "Upcoming",
    completion: 0
  },
  {
    icon: <Users className="w-5 h-5" />,
    title: "Usability Testing",
    description: "Conduct comprehensive usability tests to identify friction points and optimize user experience.",
    status: "Planned",
    completion: 0
  },
  {
    icon: <Target className="w-5 h-5" />,
    title: "Feature Prioritization",
    description: "Use AI-powered analysis to prioritize features based on user feedback and business impact.",
    status: "Planned",
    completion: 0
  },
];

const timeline = [
  {
    quarter: "Oct 2025",
    title: "Design & Wireframing",
    items: [
      "Wireframes by UI/UX AI agent",
      "Design system development",
      "User flow mapping",
      "Initial prototype framework"
    ],
    status: "upcoming" as const,
  },
  {
    quarter: "Nov 2025",
    title: "Prototype Development",
    items: [
      "AI-assisted interactive prototype (Figma)",
      "Clickable prototype creation",
      "Feature interaction testing",
      "User testing preparation"
    ],
    status: "upcoming" as const,
  },
  {
    quarter: "Dec 2025",
    title: "Testing & Refinement",
    items: [
      "10-20 usability tests with friction point identification",
      "AI-powered feature prioritization",
      "Usability report compilation",
      "Updated product roadmap"
    ],
    status: "upcoming" as const,
  }
];

const fallbackMetrics = [
  {
    id: "1",
    label: "Wireframes Created",
    value: "0",
    target: "25",
    icon: "code",
    color: "bg-dna-emerald"
  },
  {
    id: "2", 
    label: "Usability Tests",
    value: "0",
    target: "20",
    icon: "users",
    color: "bg-dna-copper"
  },
  {
    id: "3",
    label: "Prototype Iterations",
    value: "0",
    target: "5",
    icon: "target",
    color: "bg-dna-gold"
  },
  {
    id: "4",
    label: "Feature Priorities",
    value: "0",
    target: "15",
    icon: "star",
    color: "bg-dna-forest"
  }
];

const PrototypingPhase = () => {
  useScrollToTop();
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <PhaseHero
        badge="Phase 2"
        title="Prototyping & Concept Testing"
        description="Creating and testing the product experience through interactive prototypes and comprehensive usability testing before building the full platform."
        prevPhase={{ label: "Previous: Market Research", url: "/market-research-phase" }}
        nextPhase={{ label: "Next: Customer Discovery #1", url: "/customer-discovery-phase" }}
        gradient="bg-gradient-to-br from-dna-mint to-dna-emerald"
      />
      <PhaseObjectives objectives={objectives} color="dna-emerald" />
      <PhaseTimeline milestones={timeline} color="dna-copper" />
      <PhaseMetrics phaseSlug="prototyping" fallbackMetrics={fallbackMetrics} />
      <section className="py-16 bg-gradient-to-r from-dna-emerald/10 to-dna-copper/10">
        <div className="max-w-4xl mx-auto text-center px-4">
          <Lightbulb className="w-16 h-16 text-dna-copper mx-auto mb-5" />
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Be Part of the Design Process
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join our prototype testing community and help shape the DNA platform experience.
          </p>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default PrototypingPhase;
