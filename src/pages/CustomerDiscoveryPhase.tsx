
import React from 'react';
import PhaseHero from '@/components/phases/PhaseHero';
import PhaseObjectives from '@/components/phases/PhaseObjectives';
import PhaseTimeline from '@/components/phases/PhaseTimeline';
import PhaseMetrics from '@/components/phases/PhaseMetrics';
import { Search, Users, MessageSquare, Target, CheckCircle, BarChart3, Lightbulb } from "lucide-react";
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const objectives = [
  {
    icon: <Search className="w-5 h-5" />,
    title: "Market Research & Validation",
    description: "Conduct deep research to understand diaspora needs, pain points, and the competition.",
    status: "Ongoing",
    completion: 85
  },
  {
    icon: <Users className="w-5 h-5" />,
    title: "Community Engagement",
    description: "Engage and build relationships with communities and key stakeholders.",
    status: "Active",
    completion: 65
  },
  {
    icon: <MessageSquare className="w-5 h-5" />,
    title: "User Interviews & Feedback",
    description: "Gather insights via surveys, interviews, and focus groups.",
    status: "Interviewing",
    completion: 95
  },
  {
    icon: <Target className="w-5 h-5" />,
    title: "Problem-Solution Fit",
    description: "Validate that our platform addresses real, urgent diaspora pain points.",
    status: "Review",
    completion: 60
  }
];

const timeline = [
  {
    quarter: "Q3 2025",
    title: "Discovery & Validation",
    items: [
      "Complete 500+ user surveys",
      "100+ stakeholder interviews",
      "Global diaspora ecosystem mapping",
      "Key opportunity & pain point analysis"
    ],
    status: "active"
  },
  {
    quarter: "Q4 2025",
    title: "Concept Refinement",
    items: [
      "Validate problem-solution fit with target users",
      "Refine platform and value proposition",
      "Build strategic partnerships"
    ],
    status: "upcoming"
  },
  {
    quarter: "Q1 2026",
    title: "Stakeholder Buy-In",
    items: [
      "Showcase insights to major diaspora organizations",
      "Finalize MVP requirements via user feedback"
    ],
    status: "upcoming"
  }
];

const metrics = [
  { label: "User Surveys Completed", value: "430", target: "500", color: "bg-dna-emerald" },
  { label: "Stakeholder Interviews", value: "97", target: "100", color: "bg-dna-copper" },
  { label: "Community Partners", value: "32", target: "50", color: "bg-dna-gold" },
  { label: "Countries Researched", value: "17", target: "25", color: "bg-dna-forest" }
];

const CustomerDiscoveryPhase = () => (
  <div className="min-h-screen bg-gray-50 flex flex-col">
    <Header />
    <PhaseHero
      badge="Phase 4"
      title="Customer Discovery Phase"
      description="Deep-diving into the African diaspora ecosystem to understand needs, validate our approach, and lay the groundwork for a platform that truly serves our community."
      prevPhase={{ label: "Previous: MVP Phase", url: "/mvp-phase" }}
      nextPhase={{ label: "Next: Go-to-Market Phase", url: "/go-to-market-phase" }}
      gradient="bg-gradient-to-br from-dna-emerald to-dna-forest"
    />
    <PhaseObjectives objectives={objectives} color="dna-emerald" />
    <PhaseTimeline milestones={timeline} color="dna-copper" />
    <PhaseMetrics metrics={metrics} />
    <section className="py-16 bg-gradient-to-r from-dna-emerald/10 to-dna-copper/10">
      <div className="max-w-4xl mx-auto text-center px-4">
        <Lightbulb className="w-16 h-16 text-dna-copper mx-auto mb-5" />
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Help Shape the Future of Diaspora Connection
        </h2>
        <p className="text-xl text-gray-600 mb-8">
          Your insights are crucial—join our research cohort and help us build a better DNA platform.
        </p>
      </div>
    </section>
    <Footer />
  </div>
);

export default CustomerDiscoveryPhase;
