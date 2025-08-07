import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Briefcase, Rocket, Heart, GraduationCap, Palette, Building, Users, Globe } from 'lucide-react';

interface UserTypeStepProps {
  data: any;
  updateData: (data: any) => void;
}

const USER_TYPES = [
  {
    id: 'established_professional',
    title: 'Established Professional',
    icon: Briefcase,
    description: 'Experienced professional ready to mentor, share expertise, and drive impact across Africa and the diaspora.',
    benefits: ['Connect with peers', 'Share expertise', 'Find mentorship opportunities'],
    examples: 'C-suite executives, senior managers, consultants, specialists'
  },
  {
    id: 'entrepreneur_founder',
    title: 'Entrepreneur / Founder',
    icon: Rocket,
    description: 'Building ventures, solving problems, and creating opportunities that benefit Africa and its diaspora.',
    benefits: ['Find co-founders', 'Access funding networks', 'Scale your impact'],
    examples: 'Startup founders, business owners, serial entrepreneurs'
  },
  {
    id: 'emerging_professional',
    title: 'Emerging Professional',
    icon: GraduationCap,
    description: 'Early-career professional or recent graduate looking to build networks and advance your career.',
    benefits: ['Find mentors', 'Expand your network', 'Discover opportunities'],
    examples: 'Recent graduates, junior professionals, career changers'
  },
  {
    id: 'creative_innovator',
    title: 'Creative / Innovator',
    icon: Palette,
    description: 'Artist, designer, content creator, or innovator using creativity to tell African stories and drive change.',
    benefits: ['Showcase your work', 'Collaborate on projects', 'Find creative partners'],
    examples: 'Artists, designers, writers, filmmakers, musicians'
  },
  {
    id: 'community_builder',
    title: 'Community Builder',
    icon: Users,
    description: 'Organizer, activist, or advocate working to strengthen communities and drive social change.',
    benefits: ['Organize initiatives', 'Find volunteers', 'Amplify your cause'],
    examples: 'Non-profit leaders, activists, community organizers'
  },
  {
    id: 'institutional_leader',
    title: 'Institutional Leader',
    icon: Building,
    description: 'Leader in government, academia, or large organizations looking to create systemic change.',
    benefits: ['Policy influence', 'Institutional partnerships', 'Research collaboration'],
    examples: 'Government officials, university leaders, NGO executives'
  },
  {
    id: 'ally_supporter',
    title: 'Ally / Supporter',
    icon: Heart,
    description: 'Passionate about supporting African development through skills, advocacy, or resources.',
    benefits: ['Discover opportunities', 'Support meaningful projects', 'Learn and contribute'],
    examples: 'Non-African allies, diaspora supporters, philanthropists'
  },
  {
    id: 'global_connector',
    title: 'Global Connector',
    icon: Globe,
    description: 'International business leader, investor, or connector with networks that can benefit Africa.',
    benefits: ['Facilitate partnerships', 'Investment opportunities', 'Cross-border collaboration'],
    examples: 'Investors, international business leaders, diplomats'
  }
];

const UserTypeStep: React.FC<UserTypeStepProps> = ({ data, updateData }) => {
  const selectedType = data.user_type;

  const selectUserType = (typeId: string) => {
    updateData({ user_type: typeId });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-dna-forest mb-2">
          Choose Your Path
        </h2>
        <p className="text-gray-600">
          Select the category that best represents your current role and goals. This helps us connect you with the right opportunities and community.
        </p>
      </div>

      <div className="grid gap-3 max-h-96 overflow-y-auto pr-2">
        {USER_TYPES.map((type) => {
          const IconComponent = type.icon;
          const isSelected = selectedType === type.id;
          
          return (
            <Card 
              key={type.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                isSelected 
                  ? 'ring-2 ring-dna-copper bg-dna-copper/5' 
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => selectUserType(type.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="p-2 rounded-full bg-dna-copper/10 flex-shrink-0">
                    <IconComponent className="w-5 h-5 text-dna-copper" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-semibold text-dna-forest">
                        {type.title}
                      </h3>
                      <Button
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        className={isSelected ? 'bg-dna-copper hover:bg-dna-copper/90' : ''}
                      >
                        {isSelected ? 'Selected' : 'Select'}
                      </Button>
                    </div>
                    <p className="text-gray-600 text-sm mt-1 mb-2">
                      {type.description}
                    </p>
                    {type.examples && (
                      <p className="text-xs text-gray-500 mb-2 italic">
                        Examples: {type.examples}
                      </p>
                    )}
                    <ul className="text-xs text-gray-500 space-y-0.5">
                      {type.benefits.map((benefit, index) => (
                        <li key={index} className="flex items-center space-x-1.5">
                          <span className="w-1 h-1 bg-dna-copper rounded-full flex-shrink-0"></span>
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default UserTypeStep;