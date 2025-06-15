
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, 
  BookOpen, 
  Clock, 
  Users, 
  Megaphone, 
  Gift, 
  MessageSquare,
  Target
} from 'lucide-react';

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
  onLearnMore
}) => {
  const impactPathways = [
    {
      id: 1,
      icon: DollarSign,
      title: "Financial Capital",
      description: "Invest or donate to fund project development and implementation",
      examples: ["One-time donations", "Recurring contributions", "Equity investment", "Matching funds"],
      color: "bg-emerald-500",
      bgColor: "bg-emerald-50"
    },
    {
      id: 2,
      icon: BookOpen,
      title: "Knowledge & Expertise",
      description: "Share your professional skills and insights to guide projects",
      examples: ["Technical assistance", "Mentorship", "Strategic guidance", "Research support"],
      color: "bg-blue-500",
      bgColor: "bg-blue-50"
    },
    {
      id: 3,
      icon: Clock,
      title: "Hands-On Work",
      description: "Volunteer your time and energy for direct project implementation",
      examples: ["Project implementation", "Event organizing", "Content creation", "Administrative support"],
      color: "bg-purple-500",
      bgColor: "bg-purple-50"
    },
    {
      id: 4,
      icon: Users,
      title: "Networks & Relationships",
      description: "Open doors by connecting projects with key people and opportunities",
      examples: ["Making introductions", "Network sharing", "Leveraging influence", "Recruiting collaborators"],
      color: "bg-orange-500",
      bgColor: "bg-orange-50"
    },
    {
      id: 5,
      icon: Megaphone,
      title: "Visibility & Advocacy",
      description: "Amplify project reach through promotion and public support",
      examples: ["Social media promotion", "Public speaking", "Content creation", "Ambassador roles"],
      color: "bg-pink-500",
      bgColor: "bg-pink-50"
    },
    {
      id: 6,
      icon: Gift,
      title: "In-Kind Support",
      description: "Provide tools, services, and resources instead of cash contributions",
      examples: ["Free venue access", "Professional services", "Software licenses", "Equipment loans"],
      color: "bg-teal-500",
      bgColor: "bg-teal-50"
    },
    {
      id: 7,
      icon: MessageSquare,
      title: "Data & Feedback",
      description: "Share insights and experiences to validate and improve projects",
      examples: ["User testing", "Survey participation", "Story sharing", "Pilot program feedback"],
      color: "bg-indigo-500",
      bgColor: "bg-indigo-50"
    }
  ];

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

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {impactPathways.map((pathway) => {
          const IconComponent = pathway.icon;
          return (
            <Card key={pathway.id} className={`${pathway.bgColor} border-l-4 border-l-gray-300 hover:border-l-gray-500 transition-colors`}>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-10 h-10 ${pathway.color} rounded-lg flex items-center justify-center`}>
                    <IconComponent className="w-5 h-5 text-white" />
                  </div>
                  <CardTitle className="text-lg">{pathway.title}</CardTitle>
                </div>
                <p className="text-sm text-gray-600">{pathway.description}</p>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-gray-900">Ways to contribute:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {pathway.examples.map((example, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full flex-shrink-0" />
                        {example}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

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
                        <Users className="w-4 h-4" />
                        <span>{project.contributors} contributors</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
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
