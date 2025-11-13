import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Building2, User, AlertCircle } from 'lucide-react';

const ORG_CATEGORIES = [
  'Startup / Tech Company',
  'Non-Profit / NGO',
  'Social Enterprise',
  'Investment Fund / VC',
  'Corporate / Enterprise',
  'Foundation / Philanthropic Org',
  'Government / Public Sector',
  'Academic / Research Institution',
  'Professional Association',
  'Other'
];

interface UserTypeStepProps {
  data: {
    user_type: string;
    organization_name: string;
    organization_category: string;
  };
  onUpdate: (field: string, value: any) => void;
  errors?: Record<string, string>;
}

const UserTypeStep: React.FC<UserTypeStepProps> = ({ data, onUpdate, errors = {} }) => {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-dna-forest">How are you joining DNA?</h2>
        <p className="text-muted-foreground">
          This helps us customize your experience and connect you with the right opportunities.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-6">
          {/* User Type Selection */}
          <div className="space-y-4">
            <Label>I'm joining as *</Label>
            <RadioGroup
              value={data.user_type}
              onValueChange={(value) => onUpdate('user_type', value)}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <label
                htmlFor="individual"
                className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  data.user_type === 'individual'
                    ? 'border-dna-copper bg-dna-copper/5'
                    : 'border-border hover:border-dna-copper/50'
                }`}
              >
                <RadioGroupItem value="individual" id="individual" className="mt-1" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <User className="h-5 w-5 text-dna-copper" />
                    <span className="font-semibold">Individual</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    I'm here as a professional, entrepreneur, or community member
                  </p>
                </div>
              </label>

              <label
                htmlFor="organization"
                className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  data.user_type === 'organization'
                    ? 'border-dna-copper bg-dna-copper/5'
                    : 'border-border hover:border-dna-copper/50'
                }`}
              >
                <RadioGroupItem value="organization" id="organization" className="mt-1" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Building2 className="h-5 w-5 text-dna-copper" />
                    <span className="font-semibold">Organization</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    I represent a company, non-profit, or institution
                  </p>
                </div>
              </label>
            </RadioGroup>
            {errors.user_type && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.user_type}
              </p>
            )}
          </div>

          {/* Organization Fields (only if organization is selected) */}
          {data.user_type === 'organization' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="organization_name">Organization Name *</Label>
                <Input
                  id="organization_name"
                  value={data.organization_name}
                  onChange={(e) => onUpdate('organization_name', e.target.value)}
                  placeholder="e.g., Acme Foundation, TechCorp Africa"
                  className={errors.organization_name ? 'border-destructive' : ''}
                />
                {errors.organization_name && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.organization_name}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="organization_category">Organization Type *</Label>
                <select
                  id="organization_category"
                  value={data.organization_category}
                  onChange={(e) => onUpdate('organization_category', e.target.value)}
                  className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                    errors.organization_category ? 'border-destructive' : ''
                  }`}
                >
                  <option value="">Select organization type...</option>
                  {ORG_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                {errors.organization_category && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.organization_category}
                  </p>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserTypeStep;