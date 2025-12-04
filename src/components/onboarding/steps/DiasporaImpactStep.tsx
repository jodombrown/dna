import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import CountrySelect from '@/components/ui/CountrySelect';
import { TagMultiSelect } from '@/components/profile/TagMultiSelect';
import { AlertCircle } from 'lucide-react';

const INTEREST_OPTIONS = [
  'Entrepreneurship & Startups',
  'Innovation & Technology',
  'Social Impact & Development',
  'Education & Capacity Building',
  'Investment & Finance',
  'Trade & Commerce',
  'Arts & Culture',
  'Healthcare & Wellness',
  'Agriculture & Food Security',
  'Climate & Sustainability',
  'Policy & Governance',
  'Diaspora Engagement',
  'Youth Empowerment',
  'Women in Business',
  'Infrastructure Development'
];

interface DiasporaImpactStepProps {
  data: {
    country_of_origin: string;
    diaspora_origin: string;
    interests: string[];
    my_dna_statement: string;
  };
  onUpdate: (field: string, value: any) => void;
  errors?: Record<string, string>;
}

const DiasporaImpactStep: React.FC<DiasporaImpactStepProps> = ({ data, onUpdate, errors = {} }) => {
  return (
    <div className="space-y-6 max-w-2xl mx-auto px-4">
      <div className="text-center space-y-2 pt-6">
        <h2 className="text-xl sm:text-2xl font-bold text-dna-forest">Your Diaspora Story</h2>
        <p className="text-sm sm:text-base text-muted-foreground">
          Share your connection to Africa and what brings you to this community.
        </p>
      </div>

      <Card>
        <CardContent className="p-4 sm:p-6 space-y-6">
          {/* Country of Origin */}
          <div className="space-y-2">
            <Label htmlFor="country_of_origin">Country of Origin *</Label>
            <CountrySelect
              value={data.country_of_origin}
              onChange={(code, name) => onUpdate('country_of_origin', name)}
            />
            <p className="text-xs text-muted-foreground">
              The African country you identify with or have roots in
            </p>
            {errors.country_of_origin && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.country_of_origin}
              </p>
            )}
          </div>

          {/* Diaspora Origin (optional) */}
          <div className="space-y-2">
            <Label htmlFor="diaspora_origin">Diaspora Generation (Optional)</Label>
            <CountrySelect
              value={data.diaspora_origin}
              onChange={(code, name) => onUpdate('diaspora_origin', name)}
            />
            <p className="text-xs text-muted-foreground">
              E.g., if you're Nigerian-American, select USA here
            </p>
          </div>

          {/* Interests */}
          <div className="space-y-2">
            <TagMultiSelect
              label="Areas of Interest *"
              options={INTEREST_OPTIONS}
              selected={data.interests}
              onChange={(value) => onUpdate('interests', value)}
              placeholder="Select at least 2 areas you're passionate about"
              colorClass="bg-dna-gold/10 text-dna-gold border-dna-gold/20"
            />
            <p className="text-xs text-muted-foreground">
              What aspects of Africa's development are you most interested in?
            </p>
            {errors.interests && (
              <p className="text-sm text-destructive">{errors.interests}</p>
            )}
          </div>

          {/* My DNA Statement */}
          <div className="space-y-2">
            <Label htmlFor="my_dna_statement">Why DNA? *</Label>
            <Textarea
              id="my_dna_statement"
              value={data.my_dna_statement}
              onChange={(e) => onUpdate('my_dna_statement', e.target.value)}
              placeholder="What brings you to the Diaspora Network of Africa? What do you hope to contribute or achieve through this community?"
              rows={4}
              maxLength={500}
              className={errors.my_dna_statement ? 'border-destructive' : ''}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Share your vision, goals, or how you want to engage (50-500 characters)</span>
              <span>{data.my_dna_statement.length}/500</span>
            </div>
            {errors.my_dna_statement && (
              <p className="text-sm text-destructive">{errors.my_dna_statement}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DiasporaImpactStep;
