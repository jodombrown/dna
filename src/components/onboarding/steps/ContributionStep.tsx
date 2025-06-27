
import React from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

interface ContributionStepProps {
  data: any;
  updateData: (data: any) => void;
}

const CONTRIBUTION_TYPES = [
  {
    id: 'financial',
    label: 'Financial Capital',
    description: 'Investments, donations, funding support'
  },
  {
    id: 'mentorship',
    label: 'Mentorship',
    description: 'Knowledge sharing and professional guidance'
  },
  {
    id: 'volunteering',
    label: 'Volunteering',
    description: 'Hands-on work and time contribution'
  },
  {
    id: 'networks',
    label: 'Networks',
    description: 'Introductions, relationships, influence'
  },
  {
    id: 'advocacy',
    label: 'Advocacy',
    description: 'Public support, visibility, promotion'
  },
  {
    id: 'in-kind',
    label: 'In-Kind Support',
    description: 'Services, resources, equipment'
  },
  {
    id: 'feedback',
    label: 'Feedback',
    description: 'Testing, validation, data insights'
  },
  {
    id: 'cultural-guidance',
    label: 'Cultural Guidance',
    description: 'Context, community bridging, local knowledge'
  },
  {
    id: 'accountability',
    label: 'Accountability',
    description: 'Governance, oversight, stewardship'
  }
];

const ContributionStep: React.FC<ContributionStepProps> = ({ data, updateData }) => {
  const toggleContribution = (contributionId: string) => {
    const currentTypes = data.contribution_types || [];
    const newTypes = currentTypes.includes(contributionId)
      ? currentTypes.filter((id: string) => id !== contributionId)
      : [...currentTypes, contributionId];
    
    updateData({ contribution_types: newTypes });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-dna-forest mb-2">How You Want to Contribute</h3>
        <p className="text-gray-600">Select the ways you'd like to make an impact (choose at least one)</p>
      </div>

      <div className="space-y-4">
        {CONTRIBUTION_TYPES.map((type) => (
          <div key={type.id} className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
            <Checkbox
              id={type.id}
              checked={data.contribution_types?.includes(type.id) || false}
              onCheckedChange={() => toggleContribution(type.id)}
              className="mt-1"
            />
            <div className="flex-1">
              <Label htmlFor={type.id} className="text-base font-medium cursor-pointer">
                {type.label}
              </Label>
              <p className="text-sm text-gray-600 mt-1">{type.description}</p>
            </div>
          </div>
        ))}
      </div>

      {data.contribution_types?.length > 0 && (
        <div className="bg-dna-mint/20 p-4 rounded-lg">
          <p className="text-sm text-dna-forest">
            <strong>Selected:</strong> {data.contribution_types.length} contribution type{data.contribution_types.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  );
};

export default ContributionStep;
