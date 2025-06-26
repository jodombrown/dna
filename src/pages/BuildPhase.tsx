
import React from 'react';
import PhaseHero from '@/components/phases/PhaseHero';
import PhaseObjectives from '@/components/phases/PhaseObjectives';
import PhaseTimeline from '@/components/phases/PhaseTimeline';
import PhaseMetrics from '@/components/phases/PhaseMetrics';
import { Code, Users, Zap, Settings, Hammer, Database, CheckCircle, BarChart3, Lightbulb } from "lucide-react";
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useScrollToTop } from '@/hooks/useScrollToTop';
import PrototypeBanner from '@/components/PrototypeBanner';

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

const fallbackMetrics = [
  {
    id: "1",
    label: "Code Modules Complete",
    value: "18",
    target: "50",
    icon: "code",
    color: "bg-dna-copper"
  },
  {
    id: "2",
    label: "Beta Testers",
    value: "210",
    target: "1000",
    icon: "users",
    color: "bg-dna-gold"
  },
  {
    id: "3",
    label: "Admin Features",
    value: "4",
    target: "10",
    icon: "settings",
    color: "bg-dna-emerald"
  },
  {
    id: "4",
    label: "Stable Deployments",
    value: "5",
    target: "20",
    icon: "rocket",
    color: "bg-dna-forest"
  }
];

const BuildPhase = () => {
  useScrollToTop();
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <PrototypeBanner />
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
      <PhaseMetrics phaseSlug="build" fallbackMetrics={fallbackMetrics} />
      <section className="py-16 bg-gradient-to-r from-dna-copper/10 to-dna-mint/10">
        <div className="w-full text-center px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 border border-dna-mint/30 max-w-5xl mx-auto">
            <Lightbulb className="w-16 h-16 text-dna-emerald mx-auto mb-5" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Ready to See DNA Go Live?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Help us build and test new features—join our beta community!
            </p>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default BuildPhase;
