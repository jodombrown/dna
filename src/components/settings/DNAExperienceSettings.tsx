import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, HandHeart, Lightbulb } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useUpdateProfile } from '@/hooks/useProfiles';
import { useToast } from '@/hooks/use-toast';

const PILLARS = [
  {
    id: 'connect',
    title: 'Connect',
    icon: Users,
    description: 'Build meaningful relationships across the African diaspora. Network with professionals, mentors, and collaborators who share your vision.',
    benefits: [
      'Get matched with professionals in your industry',
      'Receive personalized networking recommendations',
      'Access curated connection opportunities',
      'Join location-based diaspora communities'
    ],
    color: 'dna-emerald'
  },
  {
    id: 'collaborate',
    title: 'Collaborate',
    icon: HandHeart,
    description: 'Join forces on projects, ventures, and initiatives that drive impact. Work together to solve challenges and create opportunities.',
    benefits: [
      'Discover partnership opportunities in your field',
      'Get notified about relevant projects seeking collaborators',
      'Access exclusive collaboration spaces and tools',
      'Connect with co-founders and business partners'
    ],
    color: 'dna-copper'
  },
  {
    id: 'contribute',
    title: 'Contribute',
    icon: Lightbulb,
    description: 'Share your expertise, resources, and knowledge to uplift the community. Make your mark on Africa\'s development story.',
    benefits: [
      'Showcase your expertise to potential mentees',
      'Get featured in community spotlights',
      'Access exclusive contributor recognition programs',
      'Connect with organizations seeking your skills'
    ],
    color: 'dna-gold'
  }
];

interface DNAExperienceSettingsProps {
  selectedPillars: string[];
  onPillarsChange: (pillars: string[]) => void;
}

const DNAExperienceSettings: React.FC<DNAExperienceSettingsProps> = ({ 
  selectedPillars, 
  onPillarsChange 
}) => {
  const { toast } = useToast();

  const togglePillar = (pillarId: string) => {
    const currentPillars = [...selectedPillars];
    const index = currentPillars.indexOf(pillarId);
    
    if (index > -1) {
      currentPillars.splice(index, 1);
    } else {
      currentPillars.push(pillarId);
    }
    
    onPillarsChange(currentPillars);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customize Your DNA Experience</CardTitle>
        <p className="text-sm text-muted-foreground">
          Your pillar selections shape your entire platform experience - from who you're matched with to what opportunities you see.
        </p>
        <div className="bg-dna-emerald/10 p-4 rounded-lg">
          <p className="text-sm text-dna-forest font-medium">
            💡 <strong>Smart Matching:</strong> The more pillars you select, the better we can personalize your connections, content, and collaboration opportunities.
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {PILLARS.map((pillar) => {
          const IconComponent = pillar.icon;
          const isSelected = selectedPillars.includes(pillar.id);
          
          return (
            <Card 
              key={pillar.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                isSelected 
                  ? `ring-2 ring-${pillar.color} bg-${pillar.color}/5` 
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => togglePillar(pillar.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className={`p-3 rounded-full bg-${pillar.color}/10`}>
                    <IconComponent className={`w-6 h-6 text-${pillar.color}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-dna-forest">
                        {pillar.title}
                      </h3>
                      <Button
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        className={isSelected ? `bg-${pillar.color} hover:bg-${pillar.color}/90` : ''}
                      >
                        {isSelected ? 'Selected' : 'Select'}
                      </Button>
                    </div>
                    <p className="text-gray-600 mt-2 mb-3">
                      {pillar.description}
                    </p>
                    
                    {/* Benefits list */}
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        What you'll get:
                      </p>
                      <ul className="space-y-1">
                        {pillar.benefits.map((benefit, index) => (
                          <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                            <span className={`text-${pillar.color} font-bold text-xs mt-1`}>✓</span>
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {selectedPillars.length > 0 && (
          <div className="text-center space-y-2">
            <div className="text-sm font-medium text-dna-forest">
              ✨ Perfect! You've selected {selectedPillars.length} pillar{selectedPillars.length > 1 ? 's' : ''}
            </div>
            <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded-lg">
              Your feed will now show targeted content, you'll receive smarter connection recommendations, 
              and we'll notify you about relevant opportunities in your selected areas.
            </div>
          </div>
        )}
        
        {selectedPillars.length === 0 && (
          <div className="text-center">
            <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
              💭 Select at least one pillar to unlock personalized matching and recommendations
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DNAExperienceSettings;