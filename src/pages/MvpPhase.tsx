import React from 'react';
import PhaseHero from '@/components/phases/PhaseHero';
import PhaseObjectives from '@/components/phases/PhaseObjectives';
import PhaseTimeline from '@/components/phases/PhaseTimeline';
import PhaseMetrics from '@/components/phases/PhaseMetrics';
import { Rocket, TrendingUp, Shield, Users, CheckCircle, BarChart3, Lightbulb } from "lucide-react";
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useScrollToTop } from '@/hooks/useScrollToTop';

const objectives = [
  {
    icon: <Rocket className="w-5 h-5" />,
    title: "MVP Launch",
    description: "Release the core features for our first public users and build strong onboarding.",
    status: "Live",
    completion: 70
  },
  {
    icon: <TrendingUp className="w-5 h-5" />,
    title: "Monetization Pilots",
    description: "Test payment flows, premium memberships, and partnerships.",
    status: "Ongoing",
    completion: 45
  },
  {
    icon: <Shield className="w-5 h-5" />,
    title: "Quality, Safety & Trust",
    description: "Verify user security and privacy compliance across the MVP platform.",
    status: "In Review",
    completion: 60
  }
];

const timeline = [
  {
    quarter: "Q2 2026",
    title: "MVP Release",
    items: [
      "Public launch of DNA MVP",
      "First 2,500 platform users",
      "Onboarding and verification systems",
      "Brand new opportunity marketplace"
    ],
    status: "active" as const,
  },
  {
    quarter: "Q2 2026",
    title: "Feedback & Monetization",
    items: [
      "Launch premium memberships",
      "Expand corporate partnerships",
      "Run revenue experiments"
    ],
    status: "upcoming" as const,
  },
  {
    quarter: "Q3 2026",
    title: "Feature Expansion & QA",
    items: [
      "Advanced moderation & safety tooling",
      "Community event rollouts",
      "Continuous platform improvement"
    ],
    status: "upcoming" as const,
  }
];

const fallbackMetrics = [
  {
    id: "1",
    label: "Active Users",
    value: "850",
    target: "2500",
    icon: "users",
    color: "bg-dna-emerald"
  },
  {
    id: "2",
    label: "Premium Members",
    value: "45",
    target: "250",
    icon: "star",
    color: "bg-dna-gold"
  },
  {
    id: "3",
    label: "Monthly Revenue",
    value: "$3.2K",
    target: "$15K",
    icon: "dollar-sign",
    color: "bg-dna-copper"
  },
  {
    id: "4",
    label: "User Retention",
    value: "78%",
    target: "85%",
    icon: "heart",
    color: "bg-dna-forest"
  }
];

const MvpPhase = () => {
  useScrollToTop();
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <PhaseHero
        badge="Phase 3"
        title="MVP Phase"
        description="Launching our Minimum Viable Product with the essential features, establishing revenue streams, and preparing for feedback-driven growth."
        prevPhase={{ label: "Previous: Build Phase", url: "/build-phase" }}
        nextPhase={{ label: "Next: Customer Discovery Phase", url: "/customer-discovery-phase" }}
        gradient="bg-gradient-to-br from-dna-emerald to-dna-forest"
      />
      <PhaseObjectives objectives={objectives} color="dna-emerald" />
      <PhaseTimeline milestones={timeline} color="dna-emerald" />
      <PhaseMetrics phaseSlug="mvp" fallbackMetrics={fallbackMetrics} />
      <section className="py-16 bg-gradient-to-r from-dna-mint/10 to-dna-copper/10">
        <div className="max-w-4xl mx-auto text-center px-4">
          <Lightbulb className="w-16 h-16 text-dna-copper mx-auto mb-5" />
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Want to shape the MVP with us?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Sign up for testing and give your feedback to drive our vision forward.
          </p>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default MvpPhase;
