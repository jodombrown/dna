
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  ArrowRight,
  Lightbulb
} from 'lucide-react';

interface EnhancedPathwaysGridProps {
  onExplorePathway: (pathway: string) => void;
}

const EnhancedPathwaysGrid: React.FC<EnhancedPathwaysGridProps> = ({ onExplorePathway }) => {
  const pathways = [
    {
      id: 'funding',
      icon: DollarSign,
      title: 'Financial Investment',
      description: 'Direct financial support for validated projects and ventures',
      opportunities: 45,
      averageContribution: '$2,500',
      impactMetric: '23 projects funded this quarter',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      examples: ['Angel investing', 'Crowdfunding', 'Grant matching', 'Microfinance support']
    },
    {
      id: 'skills',
      icon: BookOpen,
      title: 'Skills & Expertise',
      description: 'Share your professional expertise to accelerate project success',
      opportunities: 67,
      averageContribution: '8 hours/month',
      impactMetric: '156 skills partnerships active',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      examples: ['Technical consulting', 'Strategy advising', 'Design services', 'Legal guidance']
    },
    {
      id: 'time',
      icon: Clock,
      title: 'Time & Volunteering',
      description: 'Contribute your time to meaningful causes and initiatives',
      opportunities: 34,
      averageContribution: '12 hours/month',
      impactMetric: '89 volunteers engaged',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      examples: ['Project management', 'Event organization', 'Content creation', 'Community building']
    },
    {
      id: 'network',
      icon: Users,
      title: 'Network & Connections',
      description: 'Leverage your professional network to open doors',
      opportunities: 28,
      averageContribution: '3 introductions/month',
      impactMetric: '234 strategic connections made',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      examples: ['Strategic introductions', 'Partnership facilitation', 'Investor connections', 'Mentor matching']
    },
    {
      id: 'advocacy',
      icon: Megaphone,
      title: 'Advocacy & Awareness',
      description: 'Amplify important causes and drive policy change',
      opportunities: 19,
      averageContribution: '5 shares/week',
      impactMetric: '1.2M people reached',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      examples: ['Social media campaigns', 'Policy advocacy', 'Public speaking', 'Content amplification']
    },
    {
      id: 'resources',
      icon: Gift,
      title: 'In-Kind Resources',
      description: 'Contribute equipment, software, or other valuable resources',
      opportunities: 22,
      averageContribution: '$1,800 value',
      impactMetric: '78 resource donations made',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      examples: ['Equipment donations', 'Software licenses', 'Office space', 'Training materials']
    }
  ];

  return (
    <div className="mb-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Seven Pathways to Impact</h2>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Choose how you want to contribute to Africa's progress. Each pathway offers unique 
          opportunities to make a meaningful difference based on your strengths and availability.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pathways.map((pathway) => (
          <Card key={pathway.id} className="group hover:shadow-lg transition-all duration-200">
            <CardHeader className="pb-4">
              <div className={`w-12 h-12 ${pathway.bgColor} rounded-xl flex items-center justify-center mb-4`}>
                <pathway.icon className={`w-6 h-6 ${pathway.color}`} />
              </div>
              <CardTitle className="text-lg">{pathway.title}</CardTitle>
              <p className="text-gray-600 text-sm">{pathway.description}</p>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Opportunities</span>
                  <p className="font-semibold">{pathway.opportunities} active</p>
                </div>
                <div>
                  <span className="text-gray-500">Avg. Contribution</span>
                  <p className="font-semibold">{pathway.averageContribution}</p>
                </div>
              </div>

              <div className={`p-3 ${pathway.bgColor} rounded-lg`}>
                <p className={`text-sm font-medium ${pathway.color}`}>
                  {pathway.impactMetric}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700">Popular ways to contribute:</h4>
                <div className="flex flex-wrap gap-1">
                  {pathway.examples.slice(0, 2).map((example, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {example}
                    </Badge>
                  ))}
                  <Badge variant="outline" className="text-xs text-gray-500">
                    +{pathway.examples.length - 2} more
                  </Badge>
                </div>
              </div>

              <Button 
                onClick={() => onExplorePathway(pathway.id)}
                className="w-full group-hover:bg-dna-emerald group-hover:text-white transition-colors"
                variant="outline"
              >
                Explore Opportunities
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 p-6 bg-gradient-to-r from-dna-emerald/10 to-dna-mint/10 rounded-xl">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-dna-gold rounded-xl flex items-center justify-center flex-shrink-0">
            <Lightbulb className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Don't see the right opportunity?
            </h3>
            <p className="text-gray-600 mb-4">
              Create your own contribution pathway and invite others to join your mission. 
              Our community thrives when members identify new ways to make an impact.
            </p>
            <Button className="bg-dna-emerald hover:bg-dna-forest text-white">
              <MessageSquare className="w-4 h-4 mr-2" />
              Suggest New Pathway
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedPathwaysGrid;
