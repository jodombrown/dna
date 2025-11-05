import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AvatarUploader from '@/components/uploader/AvatarUploader';
import CountrySelect from '@/components/ui/CountrySelect';
import { AlertCircle } from 'lucide-react';

interface IdentityStepProps {
  data: {
    first_name: string;
    last_name: string;
    avatar_url: string;
    current_country: string;
    headline: string;
  };
  onUpdate: (field: string, value: any) => void;
  errors?: Record<string, string>;
}

const IdentityStep: React.FC<IdentityStepProps> = ({ data, onUpdate, errors = {} }) => {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-dna-forest">Welcome to DNA</h2>
        <p className="text-muted-foreground">
          Let's start with the basics. This helps the community know who you are.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-6">
          {/* Avatar Upload */}
          <div className="space-y-2">
            <Label>Profile Photo *</Label>
            <div className="flex justify-center">
              <AvatarUploader
                value={data.avatar_url}
                onUploaded={(url) => onUpdate('avatar_url', url)}
              />
            </div>
            {errors.avatar_url && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.avatar_url}
              </p>
            )}
          </div>

          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name *</Label>
              <Input
                id="first_name"
                value={data.first_name}
                onChange={(e) => onUpdate('first_name', e.target.value)}
                placeholder="Your first name"
                className={errors.first_name ? 'border-destructive' : ''}
              />
              {errors.first_name && (
                <p className="text-sm text-destructive">{errors.first_name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name *</Label>
              <Input
                id="last_name"
                value={data.last_name}
                onChange={(e) => onUpdate('last_name', e.target.value)}
                placeholder="Your last name"
                className={errors.last_name ? 'border-destructive' : ''}
              />
              {errors.last_name && (
                <p className="text-sm text-destructive">{errors.last_name}</p>
              )}
            </div>
          </div>

          {/* Headline */}
          <div className="space-y-2">
            <Label htmlFor="headline">Professional Headline *</Label>
            <Input
              id="headline"
              value={data.headline}
              onChange={(e) => onUpdate('headline', e.target.value)}
              placeholder="e.g., Software Engineer | Founder | Impact Investor"
              maxLength={200}
              className={errors.headline ? 'border-destructive' : ''}
            />
            <p className="text-xs text-muted-foreground">
              A one-line summary of who you are professionally (10-200 characters)
            </p>
            {errors.headline && (
              <p className="text-sm text-destructive">{errors.headline}</p>
            )}
          </div>

          {/* Country */}
          <div className="space-y-2">
            <Label htmlFor="current_country">Current Country *</Label>
            <CountrySelect
              value={data.current_country}
              onChange={(code, name) => onUpdate('current_country', name)}
            />
            {errors.current_country && (
              <p className="text-sm text-destructive">{errors.current_country}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IdentityStep;
