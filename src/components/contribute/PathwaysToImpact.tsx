import React from 'react';
import {
  DollarSign,
  BookOpen,
  Clock,
  Users,
  Megaphone,
  Gift,
  MessageSquare,
  Eye,
  Shield
} from 'lucide-react';
import PathwayGrid from "./PathwayGrid";
import ActiveProjectsSection from "./ActiveProjectsSection";

interface ContributionPathway {
  id: number;
  title: string;
  description: string;
  type: string;
  targetAmount: number;
  currentAmount: number;
  contributors: number;
  timeLeft: string;
  impactMetric: string;
  category: string;
  urgency: string;
}

interface PathwaysToImpactProps {
  pathways: ContributionPathway[];
  onContribute: () => void;
  onLearnMore: (pathway: ContributionPathway) => void;
}

const PathwaysToImpact: React.FC<PathwaysToImpactProps> = ({
  pathways,
  onContribute,
  onLearnMore,
}) => {
  return (
    <div className="mb-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
          Pathways to Impact
        </h2>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          There are many ways to contribute to Africa's progress beyond financial investment.
          Discover how your unique skills, network, and resources can create meaningful impact.
        </p>
      </div>

      {/* Pathway Grid */}
      <PathwayGrid />

      {/* Projects */}
      <ActiveProjectsSection
        pathways={pathways}
        onContribute={onContribute}
        onLearnMore={onLearnMore}
      />
    </div>
  );
};

export default PathwaysToImpact;
