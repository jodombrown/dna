import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Users, Briefcase, Lightbulb, Handshake, TrendingUp, Heart } from 'lucide-react';

interface ProfileEditOpenToProps {
  availableFor: string[];
  onAvailableForChange: (value: string[]) => void;
}

const COLLABORATION_TYPES = [
  { value: 'advisory', label: 'Advisory', icon: Lightbulb, description: 'Provide strategic advice and guidance' },
  { value: 'hiring', label: 'Hiring', icon: Briefcase, description: 'Looking to hire talent for your team' },
  { value: 'investing', label: 'Investing', icon: TrendingUp, description: 'Looking to invest in ventures' },
  { value: 'job_seeking', label: 'Job Seeking', icon: Briefcase, description: 'Open to new job opportunities' },
  { value: 'mentoring', label: 'Mentoring', icon: Users, description: 'Guide and support others in their journey' },
  { value: 'partnerships', label: 'Partnerships', icon: Handshake, description: 'Explore business or project partnerships' },
  { value: 'seeking_investment', label: 'Seeking Investment', icon: TrendingUp, description: 'Looking for investment for your venture' },
  { value: 'volunteering', label: 'Volunteering / Pro bono', icon: Heart, description: 'Contribute time and skills for impact' },
];

const ProfileEditOpenTo: React.FC<ProfileEditOpenToProps> = ({
  availableFor,
  onAvailableForChange,
}) => {
  const handleToggle = (value: string, checked: boolean) => {
    if (checked) {
      onAvailableForChange([...availableFor, value]);
    } else {
      onAvailableForChange(availableFor.filter((v) => v !== value));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Handshake className="h-5 w-5" />
          Open To
        </CardTitle>
        <CardDescription>
          Let others know how you're available to collaborate
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {COLLABORATION_TYPES.map((type) => {
            const isChecked = availableFor.includes(type.value);
            return (
              <label
                key={type.value}
                htmlFor={`open-to-${type.value}`}
                className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all hover:bg-muted/50 ${
                  isChecked ? 'border-primary bg-primary/5' : ''
                }`}
              >
                <Checkbox
                  id={`open-to-${type.value}`}
                  checked={isChecked}
                  onCheckedChange={(checked) => handleToggle(type.value, !!checked)}
                  className="mt-0.5"
                />
                <div className="flex-1 pointer-events-none">
                  <div className="flex items-center gap-2">
                    <type.icon className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-sm">
                      {type.label}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{type.description}</p>
                </div>
              </label>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileEditOpenTo;
