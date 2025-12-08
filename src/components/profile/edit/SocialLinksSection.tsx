import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ProfileEditSectionProps } from './types';

export function SocialLinksSection({
  formData,
  onUpdate,
  errors = {},
  disabled = false,
}: ProfileEditSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Social Links</CardTitle>
        <p className="text-sm text-muted-foreground">
          Add your social profiles so others can connect with you
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="linkedin_url">LinkedIn URL</Label>
          <Input
            id="linkedin_url"
            type="url"
            placeholder="https://linkedin.com/in/yourprofile"
            value={formData.linkedin_url || ''}
            onChange={(e) => onUpdate('linkedin_url', e.target.value)}
            disabled={disabled}
            className={errors.linkedin_url ? 'border-destructive' : ''}
          />
          {errors.linkedin_url && (
            <p className="text-sm text-destructive mt-1">{errors.linkedin_url}</p>
          )}
        </div>
        <div>
          <Label htmlFor="twitter_url">Twitter/X URL</Label>
          <Input
            id="twitter_url"
            type="url"
            placeholder="https://twitter.com/yourhandle"
            value={formData.twitter_url || ''}
            onChange={(e) => onUpdate('twitter_url', e.target.value)}
            disabled={disabled}
            className={errors.twitter_url ? 'border-destructive' : ''}
          />
          {errors.twitter_url && (
            <p className="text-sm text-destructive mt-1">{errors.twitter_url}</p>
          )}
        </div>
        <div>
          <Label htmlFor="website_url">Personal Website</Label>
          <Input
            id="website_url"
            type="url"
            placeholder="https://yourwebsite.com"
            value={formData.website_url || ''}
            onChange={(e) => onUpdate('website_url', e.target.value)}
            disabled={disabled}
            className={errors.website_url ? 'border-destructive' : ''}
          />
          {errors.website_url && (
            <p className="text-sm text-destructive mt-1">{errors.website_url}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default SocialLinksSection;
