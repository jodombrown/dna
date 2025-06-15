
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Target, Users as UsersIcon, Clock as ClockIcon } from "lucide-react";

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

interface ActiveProjectsSectionProps {
  pathways: ContributionPathway[];
  onContribute: () => void;
  onLearnMore: (pathway: ContributionPathway) => void;
}

const ActiveProjectsSection: React.FC<ActiveProjectsSectionProps> = ({
  pathways,
  onContribute,
  onLearnMore,
}) => (
  <div className="bg-white rounded-xl p-6 border">
    <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">
      Active Projects Seeking Impact Partners
    </h3>
    <div className="space-y-6">
      {pathways.map((project) => (
        <Card
          key={project.id}
          className="overflow-hidden border-l-4 border-l-dna-emerald"
        >
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <h4 className="text-lg font-semibold text-gray-900 break-words">
                    {project.title}
                  </h4>
                  <Badge className="bg-dna-emerald/20 text-dna-emerald">
                    {project.category}
                  </Badge>
                </div>
                <p className="text-gray-600 mb-3 break-words max-w-full">
                  {project.description}
                </p>
                <div className="flex items-center gap-4 text-sm text-gray-500 flex-wrap">
                  <div className="flex items-center gap-1">
                    <Target className="w-4 h-4" />
                    <span>{project.impactMetric}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <UsersIcon className="w-4 h-4" />
                    <span>{project.contributors} contributors</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ClockIcon className="w-4 h-4" />
                    <span>{project.timeLeft} remaining</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={onContribute}
                  className="bg-dna-emerald hover:bg-dna-forest text-white"
                >
                  Choose Your Pathway
                </Button>
                <Button onClick={() => onLearnMore(project)} variant="outline">
                  Learn More
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

export default ActiveProjectsSection;
