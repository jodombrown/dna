import React from 'react';
import PhaseHero from '@/components/phases/PhaseHero';
import PhaseObjectives from '@/components/phases/PhaseObjectives';
import PhaseTimeline from '@/components/phases/PhaseTimeline';
import PhaseMetrics from '@/components/phases/PhaseMetrics';
import { Code, Users, Zap, Settings, Hammer, Database, CheckCircle, BarChart3, Lightbulb } from "lucide-react";
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useScrollToTop } from '@/hooks/useScrollToTop';

const objectives = [
  {
    icon: <Code className="w-5 h-5" />,
    title: "Full-Stack Development",
    description: "Build a robust, scalable backend & UI for foundational DNA features.",
    status: "Foundational",
    completion: 40
  },
  {
    icon: <Users className="w-5 h-5" />,
    title: "User Systems",
    description: "Implement authentication, authorization, and advanced user management.",
    status: "Design",
    completion: 32
  },
  {
    icon: <Zap className="w-5 h-5" />,
    title: "Collaboration Tools",
    description: "Add real-time messaging, notifications, and team tools to enhance engagement.",
    status: "Upcoming",
    completion: 12
  },
  {
    icon: <Settings className="w-5 h-5" />,
    title: "Administrative Systems",
    description: "Create admin, analytics, and moderation features for safe scaling.",
    status: "Planning",
    completion: 16
  },
];

const timeline = [
  {
    quarter: "Q1 2026",
    title: "Foundation & Setup",
    items: [
      "Complete backend API development",
      "Authentication & user architecture",
      "Set up scalable infrastructure",
      "Initial real-time feature scaffolding"
    ],
    status: "active" as const,
  },
  {
    quarter: "Q2 2026",
    title: "Core Feature Build",
    items: [
      "Messaging, notifications & search",
      "Beta platform launch (<1000 users)",
      "Early project collaboration tools",
      "First analytics dashboard"
    ],
    status: "upcoming" as const,
  },
  {
    quarter: "Q3 2026",
    title: "Refinement & Optimization",
    items: [
      "User feedback implementation",
      "Performance & reliability tuning",
      "Mobile app optimization"
    ],
    status: "upcoming" as const,
  }
];

const metrics = [
  { label: "Code Modules Complete", value: "18", target: "50", color: "bg-dna-copper" },
  { label: "Beta Testers", value: "210", target: "1000", color: "bg-dna-gold" },
  { label: "Admin Features", value: "4", target: "10", color: "bg-dna-emerald" },
  { label: "Stable Deployments", value: "5", target: "20", color: "bg-dna-forest" }
];

const BuildPhase = () => {
  useScrollToTop();
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <PhaseHero
        badge="Phase 2"
        title="Build Phase"
        description="Transforming validated concepts into a scalable, production-ready DNA platform with cutting-edge technology and features."
        prevPhase={{ label: "Previous: Prototyping", url: "/prototyping-phase" }}
        nextPhase={{ label: "Next: MVP Phase", url: "/mvp-phase" }}
        gradient="bg-gradient-to-br from-dna-copper to-dna-gold"
      />
      <PhaseObjectives objectives={objectives} color="dna-copper" />
      <PhaseTimeline milestones={timeline} color="dna-copper" />
      <PhaseMetrics phaseSlug="build" />
      <section className="py-16 bg-gradient-to-r from-dna-copper/10 to-dna-mint/10">
        <div className="max-w-4xl mx-auto text-center px-4">
          <Lightbulb className="w-16 h-16 text-dna-emerald mx-auto mb-5" />
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to See DNA Go Live?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Help us build and test new features—join our beta community!
          </p>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default BuildPhase;
