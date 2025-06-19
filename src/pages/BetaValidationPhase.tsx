
import React from 'react';
import PhaseHero from '@/components/phases/PhaseHero';
import PhaseObjectives from '@/components/phases/PhaseObjectives';
import PhaseTimeline from '@/components/phases/PhaseTimeline';
import PhaseMetrics from '@/components/phases/PhaseMetrics';
import { Users, BarChart3, MessageSquare, Target, TrendingUp, CheckCircle } from "lucide-react";
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useScrollToTop } from '@/hooks/useScrollToTop';

const objectives = [
  {
    icon: <BarChart3 className="w-5 h-5" />,
    title: "MVP Performance Validation",
    description: "Validate MVP performance, user retention, and overall product-market fit through comprehensive beta testing.",
    status: "Planned",
    completion: 0
  },
  {
    icon: <Users className="w-5 h-5" />,
    title: "Beta User Engagement",
    description: "Launch with 200-500 beta users and track engagement, usage patterns, and user satisfaction metrics.",
    status: "Planned",
    completion: 0
  },
  {
    icon: <Target className="w-5 h-5" />,
    title: "Monetization Readiness",
    description: "Test and validate monetization strategies and revenue model assumptions with real user behavior data.",
    status: "Planned",
    completion: 0
  },
];

const timeline = [
  {
    quarter: "Aug 2026",
    title: "Beta Launch & User Onboarding",
    items: [
      "Beta launch with 200-500 users",
      "User onboarding optimization",
      "AI cohort tracking setup",
      "Initial usage reports generation"
    ],
    status: "upcoming" as const,
  }
];

const fallbackMetrics = [
  {
    id: "1",
    label: "Beta Users",
    value: "0",
    target: "500",
    icon: "users",
    color: "bg-dna-emerald"
  },
  {
    id: "2", 
    label: "NPS Score",
    value: "0",
    target: "50",
    icon: "thumbs-up",
    color: "bg-dna-copper"
  },
  {
    id: "3",
    label: "Usage Reports",
    value: "0",
    target: "20",
    icon: "bar-chart",
    color: "bg-dna-gold"
  },
  {
    id: "4",
    label: "Feedback Sessions",
    value: "0",
    target: "25",
    icon: "message-square",
    color: "bg-dna-forest"
  }
];

const BetaValidationPhase = () => {
  useScrollToTop();
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <PhaseHero
        badge="Phase 5"
        title="Customer Discovery #2 (Beta MVP)"
        description="Validating MVP performance, retention, and monetization readiness through comprehensive beta testing with real users."
        prevPhase={{ label: "Previous: MVP Build", url: "/mvp-phase" }}
        nextPhase={{ label: "Next: Go-to-Market", url: "/go-to-market-phase" }}
        gradient="bg-gradient-to-br from-purple-500 to-purple-700"
      />
      <PhaseObjectives objectives={objectives} color="purple-600" />
      <PhaseTimeline milestones={timeline} color="purple-600" />
      <PhaseMetrics phaseSlug="beta-validation" fallbackMetrics={fallbackMetrics} />
      <section className="py-16 bg-gradient-to-r from-purple-500/10 to-dna-emerald/10">
        <div className="max-w-4xl mx-auto text-center px-4">
          <CheckCircle className="w-16 h-16 text-purple-600 mx-auto mb-5" />
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Join Our Beta Testing Community
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Be among the first to experience DNA and help us perfect the platform before public launch.
          </p>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default BetaValidationPhase;
