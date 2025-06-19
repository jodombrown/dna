
import React from 'react';
import PhaseHero from '@/components/phases/PhaseHero';
import PhaseObjectives from '@/components/phases/PhaseObjectives';
import PhaseTimeline from '@/components/phases/PhaseTimeline';
import PhaseMetrics from '@/components/phases/PhaseMetrics';
import { Users, MessageSquare, TrendingUp, Target, Globe, Heart } from "lucide-react";
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useScrollToTop } from '@/hooks/useScrollToTop';

const objectives = [
  {
    icon: <Heart className="w-5 h-5" />,
    title: "Early Adopter Interest",
    description: "Measure early adopter interest and validation without building the full product through targeted outreach and engagement.",
    status: "Planned",
    completion: 0
  },
  {
    icon: <Users className="w-5 h-5" />,
    title: "Community Building",
    description: "Launch DNA Founders Circle and build an engaged community of early supporters and potential users.",
    status: "Planned",
    completion: 0
  },
  {
    icon: <MessageSquare className="w-5 h-5" />,
    title: "Problem Validation",
    description: "Conduct problem-oriented interviews to validate core assumptions and refine our understanding of user needs.",
    status: "Planned",
    completion: 0
  },
];

const timeline = [
  {
    quarter: "Jan 2026",
    title: "Landing Page & Outreach",
    items: [
      "Launch A/B tested landing page",
      "Offer early bird memberships",
      "Begin problem-oriented interviews",
      "Social media campaign launch"
    ],
    status: "upcoming" as const,
  },
  {
    quarter: "Feb 2026",
    title: "Community & Validation",
    items: [
      "Launch DNA Founders Circle (WhatsApp/Slack)",
      "Community engagement activities",
      "Interview summary compilation",
      "Landing page metrics analysis"
    ],
    status: "upcoming" as const,
  }
];

const fallbackMetrics = [
  {
    id: "1",
    label: "Landing Page Visitors",
    value: "0",
    target: "5000",
    icon: "globe",
    color: "bg-dna-emerald"
  },
  {
    id: "2", 
    label: "Early Bird Sign-ups",
    value: "0",
    target: "500",
    icon: "users",
    color: "bg-dna-copper"
  },
  {
    id: "3",
    label: "Founder Circle Members",
    value: "0",
    target: "100",
    icon: "heart",
    color: "bg-dna-gold"
  },
  {
    id: "4",
    label: "Problem Interviews",
    value: "0",
    target: "50",
    icon: "message-square",
    color: "bg-dna-forest"
  }
];

const CustomerDiscoveryPhase = () => {
  useScrollToTop();
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <PhaseHero
        badge="Phase 3"
        title="Customer Discovery #1 (No MVP)"
        description="Measuring early adopter interest and validation without product build through community engagement and targeted outreach."
        prevPhase={{ label: "Previous: Prototyping Phase", url: "/prototyping-phase" }}
        nextPhase={{ label: "Next: MVP Build", url: "/mvp-phase" }}
        gradient="bg-gradient-to-br from-green-500 to-green-700"
      />
      <PhaseObjectives objectives={objectives} color="green-600" />
      <PhaseTimeline milestones={timeline} color="green-600" />
      <PhaseMetrics phaseSlug="customer-discovery" fallbackMetrics={fallbackMetrics} />
      <section className="py-16 bg-gradient-to-r from-green-500/10 to-dna-emerald/10">
        <div className="max-w-4xl mx-auto text-center px-4">
          <Globe className="w-16 h-16 text-green-600 mx-auto mb-5" />
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Join the DNA Founders Circle
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Be part of our founding community and help shape the future of diaspora networking.
          </p>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default CustomerDiscoveryPhase;
