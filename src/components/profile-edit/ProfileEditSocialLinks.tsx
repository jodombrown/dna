import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Linkedin, Twitter, Globe, AlertCircle } from 'lucide-react';

interface ProfileEditSocialLinksProps {
  linkedinUrl: string;
  twitterUrl: string;
  websiteUrl: string;
  onLinkedinChange: (value: string) => void;
  onTwitterChange: (value: string) => void;
  onWebsiteChange: (value: string) => void;
}

// URL validation helper - only allows http/https protocols
const isValidUrl = (url: string): boolean => {
  if (!url) return true; // Empty is valid (optional field)
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
};

const ProfileEditSocialLinks: React.FC<ProfileEditSocialLinksProps> = ({
  linkedinUrl,
  twitterUrl,
  websiteUrl,
  onLinkedinChange,
  onTwitterChange,
  onWebsiteChange,
}) => {
  // Memoize validation results to avoid recalculating on every render
  const linkedinValid = useMemo(() => isValidUrl(linkedinUrl), [linkedinUrl]);
  const twitterValid = useMemo(() => isValidUrl(twitterUrl), [twitterUrl]);
  const websiteValid = useMemo(() => isValidUrl(websiteUrl), [websiteUrl]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Social Links</CardTitle>
        <CardDescription>Connect your professional profiles</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="linkedin_url" className="flex items-center gap-2">
            <Linkedin className="h-4 w-4 text-[#0A66C2]" />
            LinkedIn URL
          </Label>
          <Input
            id="linkedin_url"
            type="url"
            placeholder="https://linkedin.com/in/yourprofile"
            value={linkedinUrl}
            onChange={(e) => onLinkedinChange(e.target.value)}
            className={linkedinUrl && !linkedinValid ? 'border-destructive focus-visible:ring-destructive' : ''}
            maxLength={500}
          />
          {linkedinUrl && !linkedinValid && (
            <p className="text-xs text-destructive mt-1 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              Please enter a valid URL starting with https://
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="twitter_url" className="flex items-center gap-2">
            <Twitter className="h-4 w-4 text-[#1DA1F2]" />
            Twitter/X URL
          </Label>
          <Input
            id="twitter_url"
            type="url"
            placeholder="https://twitter.com/yourhandle"
            value={twitterUrl}
            onChange={(e) => onTwitterChange(e.target.value)}
            className={twitterUrl && !twitterValid ? 'border-destructive focus-visible:ring-destructive' : ''}
            maxLength={500}
          />
          {twitterUrl && !twitterValid && (
            <p className="text-xs text-destructive mt-1 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              Please enter a valid URL starting with https://
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="website_url" className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-muted-foreground" />
            Personal Website
          </Label>
          <Input
            id="website_url"
            type="url"
            placeholder="https://yourwebsite.com"
            value={websiteUrl}
            onChange={(e) => onWebsiteChange(e.target.value)}
            className={websiteUrl && !websiteValid ? 'border-destructive focus-visible:ring-destructive' : ''}
            maxLength={500}
          />
          {websiteUrl && !websiteValid && (
            <p className="text-xs text-destructive mt-1 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              Please enter a valid URL starting with https://
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileEditSocialLinks;
