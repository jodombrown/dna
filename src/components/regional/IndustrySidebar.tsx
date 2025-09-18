import React from 'react';
import { X, TrendingUp, DollarSign, Users, MapPin, Globe, Star, ArrowUpRight, Building2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface IndustryData {
  name: string;
  marketSize: string;
  growth: string;
  employment: string;
  keyPlayers: string[];
  diasporaOpportunities: string[];
  investmentRequirements: string;
  marketEntry: 'Easy' | 'Medium' | 'Complex';
  roi: string;
  emergingTrends: string[];
  skillsNeeded: string[];
  governmentSupport: string;
  challenges: string[];
  successStories: {
    company: string;
    story: string;
    impact: string;
  }[];
}

const industryData: Record<string, IndustryData> = {
  'Energy & Mining': {
    name: 'Energy & Mining',
    marketSize: '$420B',
    growth: '+8.5%',
    employment: '2.8M',
    keyPlayers: ['OCP Group', 'Sonatrach', 'Egyptian General Petroleum'],
    diasporaOpportunities: [
      'Renewable energy technology transfer',
      'Mining equipment supply chains',
      'Green hydrogen development',
      'Solar and wind project development'
    ],
    investmentRequirements: '$500K - $50M',
    marketEntry: 'Medium',
    roi: '15-25%',
    emergingTrends: [
      'Green energy transition',
      'Critical mineral extraction',
      'Desert solar farms',
      'Offshore wind development'
    ],
    skillsNeeded: ['Engineering', 'Project Management', 'Environmental Science', 'Finance'],
    governmentSupport: 'High - Multiple incentive programs and tax benefits',
    challenges: ['Regulatory complexity', 'Infrastructure development', 'Political stability'],
    successStories: [
      {
        company: 'Noor Ouarzazate (Morocco)',
        story: 'World\'s largest concentrated solar power complex',
        impact: 'Powers 1.3M homes, reduces CO2 by 760K tons annually'
      }
    ]
  },
  'Agriculture': {
    name: 'Agriculture',
    marketSize: '$180B',
    growth: '+4.2%',
    employment: '35M',
    keyPlayers: ['OCP Group', 'Savola Group', 'Juhayna Food Industries'],
    diasporaOpportunities: [
      'AgTech innovation and precision farming',
      'Food processing and value addition',
      'Export logistics and distribution',
      'Sustainable farming practices'
    ],
    investmentRequirements: '$50K - $5M',
    marketEntry: 'Easy',
    roi: '12-20%',
    emergingTrends: [
      'Vertical farming',
      'Smart irrigation systems',
      'Organic food production',
      'Climate-resistant crops'
    ],
    skillsNeeded: ['Agricultural Science', 'Food Technology', 'Supply Chain Management', 'Marketing'],
    governmentSupport: 'Medium - Land leasing programs and subsidies available',
    challenges: ['Water scarcity', 'Climate change', 'Market access'],
    successStories: [
      {
        company: 'Misr Hytech (Egypt)',
        story: 'Leading greenhouse technology provider',
        impact: 'Increased crop yields by 300% using hydroponic systems'
      }
    ]
  },
  'Tourism': {
    name: 'Tourism',
    marketSize: '$95B',
    growth: '+12.3%',
    employment: '8.5M',
    keyPlayers: ['EMC (Egypt)', 'Accor Hotels', 'Barceló Hotel Group'],
    diasporaOpportunities: [
      'Cultural tourism development',
      'Eco-tourism and adventure travel',
      'Digital tourism platforms',
      'Hospitality training and development'
    ],
    investmentRequirements: '$100K - $10M',
    marketEntry: 'Easy',
    roi: '18-30%',
    emergingTrends: [
      'Sustainable tourism',
      'Digital nomad destinations',
      'Heritage site preservation',
      'Medical tourism'
    ],
    skillsNeeded: ['Hospitality Management', 'Digital Marketing', 'Cultural Heritage', 'Languages'],
    governmentSupport: 'High - Tourism development funds and visa facilitation',
    challenges: ['Political stability', 'Infrastructure', 'Safety perceptions'],
    successStories: [
      {
        company: 'Djembe Tours (Morocco)',
        story: 'Community-based tourism operator',
        impact: 'Generated $2M+ for local communities in 5 years'
      }
    ]
  },
  'Manufacturing': {
    name: 'Manufacturing',
    marketSize: '$310B',
    growth: '+6.8%',
    employment: '12M',
    keyPlayers: ['Renault Morocco', 'Egytech', 'Condor Electronics'],
    diasporaOpportunities: [
      'Automotive component manufacturing',
      'Textile and garment production',
      'Electronics assembly',
      'Industrial automation'
    ],
    investmentRequirements: '$200K - $20M',
    marketEntry: 'Medium',
    roi: '14-22%',
    emergingTrends: [
      'Industry 4.0 adoption',
      'Electric vehicle manufacturing',
      'Pharmaceutical production',
      'Green manufacturing'
    ],
    skillsNeeded: ['Industrial Engineering', 'Quality Control', 'Automation', 'Supply Chain'],
    governmentSupport: 'High - Industrial zones with tax incentives',
    challenges: ['Skilled labor shortage', 'Technology transfer', 'Competition'],
    successStories: [
      {
        company: 'Renault Tangier (Morocco)',
        story: 'Largest car manufacturing plant in Africa',
        impact: 'Produces 400K vehicles annually, employs 9,000 people'
      }
    ]
  },
  'Technology': {
    name: 'Technology',
    marketSize: '$45B',
    growth: '+25.7%',
    employment: '850K',
    keyPlayers: ['Fawry', 'Swvl', 'Instabug', 'PaySky'],
    diasporaOpportunities: [
      'Fintech and mobile payments',
      'E-commerce platforms',
      'EdTech solutions',
      'HealthTech innovations'
    ],
    investmentRequirements: '$25K - $2M',
    marketEntry: 'Easy',
    roi: '25-50%',
    emergingTrends: [
      'Artificial Intelligence',
      'Blockchain applications',
      'IoT solutions',
      'Digital transformation'
    ],
    skillsNeeded: ['Software Development', 'Data Science', 'Cybersecurity', 'Product Management'],
    governmentSupport: 'High - Tech hubs and startup accelerators',
    challenges: ['Talent retention', 'Access to capital', 'Regulatory frameworks'],
    successStories: [
      {
        company: 'Fawry (Egypt)',
        story: 'Leading digital payment platform',
        impact: 'Serves 35M+ users, processes $15B+ annually'
      }
    ]
  },
  'Financial Services': {
    name: 'Financial Services',
    marketSize: '$75B',
    growth: '+9.2%',
    employment: '1.2M',
    keyPlayers: ['CIB Bank', 'Attijariwafa Bank', 'QNB ALAHLI'],
    diasporaOpportunities: [
      'Islamic banking expansion',
      'Digital banking solutions',
      'Microfinance institutions',
      'Insurance technology'
    ],
    investmentRequirements: '$500K - $15M',
    marketEntry: 'Complex',
    roi: '16-28%',
    emergingTrends: [
      'Open banking',
      'Cryptocurrency regulation',
      'Green financing',
      'Financial inclusion'
    ],
    skillsNeeded: ['Finance', 'Risk Management', 'Compliance', 'Technology'],
    governmentSupport: 'Medium - Regulatory sandboxes for fintech',
    challenges: ['Regulatory compliance', 'Banking penetration', 'Trust building'],
    successStories: [
      {
        company: 'MoneyFellows (Egypt)',
        story: 'Digital money circles platform',
        impact: 'Facilitated $200M+ in peer-to-peer savings'
      }
    ]
  }
};

interface IndustrySidebarProps {
  industry: string | null;
  onClose: () => void;
}

const IndustrySidebar: React.FC<IndustrySidebarProps> = ({ industry, onClose }) => {
  if (!industry) return null;

  const data = industryData[industry];
  if (!data) return null;

  const getEntryColor = (entry: string) => {
    switch (entry) {
      case 'Easy': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Complex': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className="absolute right-0 top-0 h-full w-full max-w-xl bg-background border-l shadow-2xl animate-slide-in-right">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-dna-emerald/10 to-dna-copper/10">
            <div className="flex items-center gap-3">
              <Building2 className="h-6 w-6 text-dna-emerald" />
              <h2 className="text-xl font-bold text-dna-forest">{data.name}</h2>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <ScrollArea className="flex-1 p-6">
            <div className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="h-4 w-4 text-dna-emerald" />
                      <span className="text-sm font-medium">Market Size</span>
                    </div>
                    <p className="text-xl font-bold text-dna-forest">{data.marketSize}</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-dna-copper" />
                      <span className="text-sm font-medium">Growth Rate</span>
                    </div>
                    <p className="text-xl font-bold text-dna-forest">{data.growth}</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-4 w-4 text-dna-emerald" />
                      <span className="text-sm font-medium">Employment</span>
                    </div>
                    <p className="text-xl font-bold text-dna-forest">{data.employment}</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Star className="h-4 w-4 text-dna-copper" />
                      <span className="text-sm font-medium">ROI Range</span>
                    </div>
                    <p className="text-xl font-bold text-dna-forest">{data.roi}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Market Entry Complexity */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Market Entry</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Complexity Level</span>
                    <Badge className={getEntryColor(data.marketEntry)}>
                      {data.marketEntry}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Investment Range: {data.investmentRequirements}
                  </p>
                </CardContent>
              </Card>

              {/* Diaspora Opportunities */}
              <Card className="border-dna-emerald/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-dna-forest">
                    <Globe className="h-4 w-4 text-dna-emerald" />
                    Diaspora Opportunities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {data.diasporaOpportunities.map((opportunity, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <ArrowUpRight className="h-3 w-3 text-dna-emerald mt-1 flex-shrink-0" />
                        <span className="text-sm">{opportunity}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Emerging Trends */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Emerging Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {data.emergingTrends.map((trend, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {trend}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Skills Needed */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">In-Demand Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {data.skillsNeeded.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Government Support */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Government Support</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{data.governmentSupport}</p>
                </CardContent>
              </Card>

              {/* Key Players */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Key Market Players</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    {data.keyPlayers.map((player, index) => (
                      <p key={index} className="text-sm text-muted-foreground">• {player}</p>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Challenges */}
              <Card className="border-orange-200">
                <CardHeader>
                  <CardTitle className="text-sm text-orange-800">Key Challenges</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    {data.challenges.map((challenge, index) => (
                      <p key={index} className="text-sm text-orange-700">⚠ {challenge}</p>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Success Stories */}
              {data.successStories.map((story, index) => (
                <Card key={index} className="border-green-200 bg-green-50/50">
                  <CardHeader>
                    <CardTitle className="text-sm text-green-800">Success Story</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <h4 className="font-semibold text-sm mb-1">{story.company}</h4>
                    <p className="text-sm text-muted-foreground mb-2">{story.story}</p>
                    <p className="text-xs text-green-700 font-medium">Impact: {story.impact}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>

          {/* Footer Actions */}
          <div className="p-6 border-t bg-gradient-to-r from-dna-mint/10 to-background">
            <div className="flex gap-3">
              <Button className="flex-1 bg-dna-emerald hover:bg-dna-emerald/90">
                Connect with Partners
              </Button>
              <Button variant="outline" className="flex-1">
                Download Report
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IndustrySidebar;