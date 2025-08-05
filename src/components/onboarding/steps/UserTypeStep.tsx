import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Briefcase, Rocket, Heart } from 'lucide-react';

interface UserTypeStepProps {
  data: any;
  updateData: (data: any) => void;
}

const USER_TYPES = [
  {
    id: 'diaspora_professional',
    title: 'Diaspora Professional',
    icon: Briefcase,
    description: 'Experienced professional ready to mentor, share expertise, and drive impact across Africa and the diaspora.',
    benefits: ['Connect with peers', 'Share expertise', 'Find mentorship opportunities']
  },
  {
    id: 'founder',
    title: 'Founder / Entrepreneur',
    icon: Rocket,
    description: 'Building ventures, solving problems, and creating opportunities that benefit Africa and its diaspora.',
    benefits: ['Find collaborators', 'Access funding opportunities', 'Scale your impact']
  },
  {
    id: 'ally',
    title: 'Ally / Supporter',
    icon: Heart,
    description: 'Passionate about supporting African development through skills, advocacy, or resources.',
    benefits: ['Discover opportunities', 'Support meaningful projects', 'Learn and contribute']
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
          Help us personalize your DNA experience by selecting the path that best describes you.
        </p>
      </div>

      <div className="grid gap-4">
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
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="p-3 rounded-full bg-dna-copper/10">
                    <IconComponent className="w-6 h-6 text-dna-copper" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-dna-forest">
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
                    <p className="text-gray-600 mt-2 mb-3">
                      {type.description}
                    </p>
                    <ul className="text-sm text-gray-500 space-y-1">
                      {type.benefits.map((benefit, index) => (
                        <li key={index} className="flex items-center space-x-2">
                          <span className="w-1 h-1 bg-dna-copper rounded-full"></span>
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