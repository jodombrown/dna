
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
  ArrowRight,
  Lightbulb,
  Star,
  TrendingUp
} from 'lucide-react';

interface PathwaysEducationGridProps {
  onSuggestPathway: () => void;
}

const PathwaysEducationGrid: React.FC<PathwaysEducationGridProps> = ({
  onSuggestPathway
}) => {
  const pathways = [
    {
      id: 'funding',
      icon: DollarSign,
      title: 'Financial Investment',
      description: 'Direct financial support for validated projects and ventures across Africa',
      opportunities: 45,
      averageContribution: '$2,500',
      impactMetric: '23 projects funded this quarter',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      examples: ['Angel investing', 'Crowdfunding', 'Grant matching', 'Microfinance support'],
      successStory: {
        title: 'Solar Schools Initiative',
        impact: '$250K raised, 50+ schools powered',
        contributor: 'Dr. Amina Hassan'
      }
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
      examples: ['Technical consulting', 'Strategy advising', 'Design services', 'Legal guidance'],
      successStory: {
        title: 'FinTech Mentorship Program',
        impact: '25 startups guided to funding',
        contributor: 'Sarah Mbeki'
      }
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
      examples: ['Project management', 'Event organization', 'Content creation', 'Community building'],
      successStory: {
        title: 'Youth Leadership Program',
        impact: '500+ young leaders trained',
        contributor: 'Community Network'
      }
    },
    {
      id: 'network',
      icon: Users,
      title: 'Network & Connections',
      description: 'Leverage your professional network to open doors and create opportunities',
      opportunities: 28,
      averageContribution: '3 introductions/month',
      impactMetric: '234 strategic connections made',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      examples: ['Strategic introductions', 'Partnership facilitation', 'Investor connections', 'Mentor matching'],
      successStory: {
        title: 'AgriTech Partnerships',
        impact: '12 startups connected to investors',
        contributor: 'Joseph Asante'
      }
    },
    {
      id: 'advocacy',
      icon: Megaphone,
      title: 'Advocacy & Awareness',
      description: 'Amplify important causes and drive policy change across the continent',
      opportunities: 19,
      averageContribution: '5 shares/week',
      impactMetric: '1.2M people reached',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      examples: ['Social media campaigns', 'Policy advocacy', 'Public speaking', 'Content amplification'],
      successStory: {
        title: 'Clean Water Campaign',
        impact: '3 policies changed, 10K+ mobilized',
        contributor: 'Maria Santos'
      }
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
      examples: ['Equipment donations', 'Software licenses', 'Office space', 'Training materials'],
      successStory: {
        title: 'Tech Hub Equipment Drive',
        impact: '15 innovation hubs equipped',
        contributor: 'Tech Community'
      }
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Pathways to African Impact</h2>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8">
          Discover diverse ways to contribute to Africa's progress. Each pathway offers unique 
          opportunities to make a meaningful difference based on your strengths, resources, and availability.
        </p>
        <div className="flex justify-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-dna-emerald rounded-full"></div>
            <span>Active Opportunities</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-dna-copper rounded-full"></div>
            <span>Success Stories</span>
          </div>
        </div>
      </div>

      {/* Pathways Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pathways.map((pathway) => (
          <Card key={pathway.id} className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-dna-emerald/20">
            <CardHeader className="pb-4">
              <div className={`w-16 h-16 ${pathway.bgColor} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <pathway.icon className={`w-8 h-8 ${pathway.color}`} />
              </div>
              <CardTitle className="text-xl mb-2">{pathway.title}</CardTitle>
              <p className="text-gray-600 text-sm leading-relaxed">{pathway.description}</p>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500 block">Opportunities</span>
                  <p className="font-semibold text-dna-emerald">{pathway.opportunities} active</p>
                </div>
                <div>
                  <span className="text-gray-500 block">Avg. Contribution</span>
                  <p className="font-semibold">{pathway.averageContribution}</p>
                </div>
              </div>

              {/* Impact Metric */}
              <div className={`p-3 ${pathway.bgColor} rounded-lg`}>
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className={`w-4 h-4 ${pathway.color}`} />
                  <span className="text-sm font-medium text-gray-700">Recent Impact</span>
                </div>
                <p className={`text-sm font-semibold ${pathway.color}`}>
                  {pathway.impactMetric}
                </p>
              </div>

              {/* Success Story */}
              <div className="bg-dna-copper/10 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-4 h-4 text-dna-copper" />
                  <span className="text-sm font-medium text-gray-700">Success Story</span>
                </div>
                <h4 className="font-semibold text-sm text-gray-900 mb-1">
                  {pathway.successStory.title}
                </h4>
                <p className="text-xs text-gray-600 mb-1">{pathway.successStory.impact}</p>
                <p className="text-xs text-dna-copper font-medium">
                  by {pathway.successStory.contributor}
                </p>
              </div>

              {/* Popular Contribution Types */}
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

              {/* CTA Button */}
              <Button 
                className="w-full group-hover:bg-dna-emerald group-hover:text-white transition-colors"
                variant="outline"
              >
                Explore {pathway.title}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Suggest New Pathway CTA */}
      <div className="mt-12 p-8 bg-gradient-to-r from-dna-emerald/10 to-dna-mint/10 rounded-2xl">
        <div className="flex items-start gap-6">
          <div className="w-16 h-16 bg-dna-gold rounded-2xl flex items-center justify-center flex-shrink-0">
            <Lightbulb className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">
              Don't see the right pathway for you?
            </h3>
            <p className="text-gray-600 mb-6 text-lg">
              Your unique skills and resources might open up entirely new ways to create impact. 
              Help us expand our pathways by sharing your ideas with the community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={onSuggestPathway}
                className="bg-dna-emerald hover:bg-dna-forest text-white"
              >
                <Lightbulb className="w-4 h-4 mr-2" />
                Suggest New Pathway
              </Button>
              <Button variant="outline">
                View All Success Stories
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Impact Statistics */}
      <div className="grid md:grid-cols-4 gap-6 mt-12">
        <div className="text-center">
          <div className="text-3xl font-bold text-dna-emerald mb-2">156</div>
          <div className="text-sm text-gray-600">Active Pathways</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-dna-copper mb-2">2,847</div>
          <div className="text-sm text-gray-600">Contributors</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-dna-gold mb-2">$4.2M</div>
          <div className="text-sm text-gray-600">Total Impact</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-dna-mint mb-2">847K</div>
          <div className="text-sm text-gray-600">Lives Touched</div>
        </div>
      </div>
    </div>
  );
};

export default PathwaysEducationGrid;
