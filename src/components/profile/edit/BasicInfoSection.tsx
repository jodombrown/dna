import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import CountryCombobox from '@/components/ui/CountryCombobox';
import { ProfileEditSectionProps } from './types';

export function BasicInfoSection({
  formData,
  onUpdate,
  errors = {},
  disabled = false,
}: ProfileEditSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Basic Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="full_name">Full Name *</Label>
            <Input
              id="full_name"
              value={formData.full_name || ''}
              onChange={(e) => onUpdate('full_name', e.target.value)}
              required
              disabled={disabled}
              className={errors.full_name ? 'border-destructive' : ''}
            />
            {errors.full_name && (
              <p className="text-sm text-destructive mt-1">{errors.full_name}</p>
            )}
          </div>
          <div>
            <Label htmlFor="headline">Professional Headline</Label>
            <Input
              id="headline"
              placeholder="e.g., Software Engineer at Tech Company"
              value={formData.headline || ''}
              onChange={(e) => onUpdate('headline', e.target.value)}
              disabled={disabled}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            placeholder="Tell us about yourself, your background, and what you're passionate about..."
            value={formData.bio || ''}
            onChange={(e) => onUpdate('bio', e.target.value)}
            rows={4}
            disabled={disabled}
          />
          <p className="text-xs text-muted-foreground mt-1">
            {formData.bio?.length || 0}/500 characters
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="current_location">Current Location</Label>
            <Input
              id="current_location"
              placeholder="City, Region"
              value={formData.current_location || ''}
              onChange={(e) => onUpdate('current_location', e.target.value)}
              disabled={disabled}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Your city or region (e.g., "Oakland, CA")
            </p>
          </div>
          <div>
            <Label>Current Country *</Label>
            <CountryCombobox
              value={formData.current_country || ''}
              onChange={(code, name) => onUpdate('current_country', name)}
              placeholder="Select your current country"
              disabled={disabled}
              error={!!errors.current_country}
            />
            {errors.current_country && (
              <p className="text-sm text-destructive mt-1">{errors.current_country}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default BasicInfoSection;
