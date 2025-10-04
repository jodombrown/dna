import React from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';

interface Step4Props {
  data: any;
  onChange: (data: any) => void;
  onComplete: () => void;
  onBack: () => void;
  isSubmitting: boolean;
}

const contributionTypes = [
  { value: 'time', label: 'Time/Volunteering', description: 'Hands-on involvement' },
  { value: 'expertise', label: 'Expertise/Advising', description: 'Share knowledge' },
  { value: 'network', label: 'Network/Introductions', description: 'Make connections' },
  { value: 'capital', label: 'Capital/Funding', description: 'Financial support' },
];

export const Step4Availability: React.FC<Step4Props> = ({ 
  data, 
  onChange, 
  onComplete, 
  onBack,
  isSubmitting 
}) => {
  const toggleContributionType = (type: string) => {
    const current = data.contribution_types || [];
    onChange({
      ...data,
      contribution_types: current.includes(type)
        ? current.filter((t: string) => t !== type)
        : [...current, type]
    });
  };

  const canProceed = data.contribution_types?.length >= 1;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold">How can you contribute?</h2>
        <p className="text-muted-foreground mt-2">
          Help us match you with the right opportunities
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <Label>Hours Available Per Month</Label>
          <div className="pt-6 pb-2">
            <Slider
              value={[data.availability_hours_per_month || 0]}
              onValueChange={(value) => onChange({ ...data, availability_hours_per_month: value[0] })}
              max={40}
              step={1}
              className="w-full"
            />
          </div>
          <div className="text-center text-2xl font-bold text-primary">
            {data.availability_hours_per_month || 0} hours/month
          </div>
        </div>

        <div>
          <Label>Contribution Types * (select at least 1)</Label>
          <div className="grid gap-3 mt-2">
            {contributionTypes.map((type) => (
              <div
                key={type.value}
                onClick={() => toggleContributionType(type.value)}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  data.contribution_types?.includes(type.value)
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-5 h-5 rounded border mt-0.5 flex items-center justify-center ${
                    data.contribution_types?.includes(type.value)
                      ? 'bg-primary border-primary'
                      : 'border-border'
                  }`}>
                    {data.contribution_types?.includes(type.value) && (
                      <svg className="w-3 h-3 text-primary-foreground" fill="currentColor" viewBox="0 0 12 12">
                        <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" fill="none" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <div className="font-medium">{type.label}</div>
                    <div className="text-sm text-muted-foreground">{type.description}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label>Work Preference</Label>
          <RadioGroup
            value={data.location_preference || 'remote'}
            onValueChange={(value) => onChange({ ...data, location_preference: value })}
            className="mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="remote" id="remote" />
              <Label htmlFor="remote" className="font-normal cursor-pointer">
                Remote only
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="onsite" id="onsite" />
              <Label htmlFor="onsite" className="font-normal cursor-pointer">
                On-site only
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="hybrid" id="hybrid" />
              <Label htmlFor="hybrid" className="font-normal cursor-pointer">
                Hybrid (both remote and on-site)
              </Label>
            </div>
          </RadioGroup>
        </div>
      </div>

      <div className="flex gap-4">
        <Button onClick={onBack} variant="outline" className="flex-1">
          Back
        </Button>
        <Button 
          onClick={onComplete} 
          disabled={!canProceed || isSubmitting} 
          className="flex-1"
        >
          {isSubmitting ? 'Completing...' : 'Complete Profile'}
        </Button>
      </div>
    </div>
  );
};
