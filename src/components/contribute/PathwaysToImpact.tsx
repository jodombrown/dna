
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
import PathwayCard from "./PathwayCard";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Target, Users as UsersIcon, Clock as ClockIcon } from 'lucide-react';

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

const impactPathwaysData = [
  {
    id: 1,
    icon: DollarSign,
    title: "Financial Capital",
    description: "Invest or donate to fund project development and implementation",
    examples: [
      "One-time donations",
      "Recurring contributions",
      "Equity investment",
      "Matching funds"
    ],
    color: "bg-emerald-500",
    bgColor: "bg-emerald-50",
    whyItMatters:
      "Every great idea needs fuel. Financial support transforms plans into real-world progress, unlocking opportunities that volunteer effort alone can’t achieve."
  },
  {
    id: 2,
    icon: BookOpen,
    title: "Knowledge & Expertise",
    description: "Share your professional skills and insights to guide projects",
    examples: [
      "Technical assistance",
      "Mentorship",
      "Strategic guidance",
      "Research support"
    ],
    color: "bg-blue-500",
    bgColor: "bg-blue-50",
    whyItMatters:
      "Lasting impact comes from good decisions. Expertise turns lessons into leverage—helping projects avoid pitfalls and grow their strengths."
  },
  {
    id: 3,
    icon: Clock,
    title: "Hands-On Work",
    description: "Volunteer your time and energy for direct project implementation",
    examples: [
      "Project implementation",
      "Event organizing",
      "Content creation",
      "Administrative support"
    ],
    color: "bg-purple-500",
    bgColor: "bg-purple-50",
    whyItMatters:
      "Progress happens because real people show up and put in the work. Volunteering builds community, trust, and delivers results that money alone can’t."
  },
  {
    id: 4,
    icon: Users,
    title: "Networks & Relationships",
    description: "Open doors by connecting projects with key people and opportunities",
    examples: [
      "Making introductions",
      "Network sharing",
      "Leveraging influence",
      "Recruiting collaborators"
    ],
    color: "bg-orange-500",
    bgColor: "bg-orange-50",
    whyItMatters:
      "Movements grow faster when connected. Relationships fast-track solutions and give projects access and legitimacy far beyond what resources alone deliver."
  },
  {
    id: 5,
    icon: Megaphone,
    title: "Visibility & Advocacy",
    description: "Amplify project reach through promotion and public support",
    examples: [
      "Social media promotion",
      "Public speaking",
      "Content creation",
      "Ambassador roles"
    ],
    color: "bg-pink-500",
    bgColor: "bg-pink-50",
    whyItMatters:
      "A powerful message wins hearts. Advocacy rallies new supporters and helps projects gain traction, strengthening voices that need to be heard."
  },
  {
    id: 6,
    icon: Gift,
    title: "In-Kind Support",
    description: "Provide tools, services, and resources instead of cash contributions",
    examples: [
      "Free venue access",
      "Professional services",
      "Software licenses",
      "Equipment loans"
    ],
    color: "bg-teal-500",
    bgColor: "bg-teal-50",
    whyItMatters:
      "Progress often depends on access to tools and space. In-kind gifts stretch resources, remove barriers, and move projects further for less."
  },
  {
    id: 7,
    icon: MessageSquare,
    title: "Data & Feedback",
    description: "Share insights and experiences to validate and improve projects",
    examples: [
      "User testing",
      "Survey participation",
      "Story sharing",
      "Pilot program feedback"
    ],
    color: "bg-indigo-500",
    bgColor: "bg-indigo-50",
    whyItMatters:
      "Feedback grounds big dreams in reality. Data and stories ensure projects actually meet needs, adapt fast, and share genuine impact—building trust."
  },
  {
    id: 8,
    icon: Eye,
    title: "Cultural Insight & Lived Experience",
    description: "Bridge communities and inform impactful, locally-rooted design",
    examples: [
      "Sharing cultural context",
      "Providing community insight",
      "Acting as a bridge/translator",
      "Explaining norms or traditions"
    ],
    color: "bg-fuchsia-600",
    bgColor: "bg-fuchsia-50",
    whyItMatters:
      "It ensures projects are rooted in real experiences—not just theory—and that they resonate with the people they aim to serve."
  },
  {
    id: 9,
    icon: Shield,
    title: "Accountability & Stewardship",
    description: "Safeguard projects’ missions and provide long-term integrity",
    examples: [
      "Serving on advisory/governance groups",
      "Monitoring progress",
      "Tracking metrics & impact",
      "Acting as a mission guardian"
    ],
    color: "bg-gray-700",
    bgColor: "bg-slate-100",
    whyItMatters:
      "Projects that last need people who protect the mission when things get tough or complex."
  }
];

const PathwaysToImpact: React.FC<PathwaysToImpactProps> = ({
  pathways,
  onContribute,
  onLearnMore
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
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {impactPathwaysData.map((pathway, i) => (
          <PathwayCard key={i} {...pathway} />
        ))}
      </div>

      {/* Projects */}
      <div className="bg-white rounded-xl p-6 border">
        <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">
          Active Projects Seeking Impact Partners
        </h3>
        <div className="space-y-6">
          {pathways.map((project) => (
            <Card key={project.id} className="overflow-hidden border-l-4 border-l-dna-emerald">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-lg font-semibold text-gray-900">{project.title}</h4>
                      <Badge className="bg-dna-emerald/20 text-dna-emerald">{project.category}</Badge>
                    </div>
                    <p className="text-gray-600 mb-3">{project.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
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
                    <Button
                      onClick={() => onLearnMore(project)}
                      variant="outline"
                    >
                      Learn More
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PathwaysToImpact;
