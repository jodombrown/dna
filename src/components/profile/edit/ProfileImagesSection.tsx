import React, { useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Camera, Image, Loader2, Info } from 'lucide-react';

interface ProfileImagesSectionProps {
  avatarUrl: string | null;
  bannerUrl: string | null;
  uploadingAvatar: boolean;
  uploadingBanner: boolean;
  onAvatarUpload: (file: File) => void;
  onBannerUpload: (file: File) => void;
  disabled?: boolean;
}

export function ProfileImagesSection({
  avatarUrl,
  bannerUrl,
  uploadingAvatar,
  uploadingBanner,
  onAvatarUpload,
  onBannerUpload,
  disabled = false,
}: ProfileImagesSectionProps) {
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onAvatarUpload(file);
    }
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onBannerUpload(file);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Profile Images
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-4 w-4 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent>
              <p>A complete profile with images gets 3x more visibility</p>
            </TooltipContent>
          </Tooltip>
        </CardTitle>
        <CardDescription>Add a profile photo and banner to stand out</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Avatar Upload */}
        <div>
          <Label className="flex items-center gap-2 mb-2">
            Profile Photo
            <span className="text-xs text-muted-foreground">(Recommended: 400×400px, JPG/PNG, max 5MB)</span>
          </Label>
          <div className="flex items-center gap-4">
            <div className="relative w-24 h-24 rounded-full overflow-hidden bg-muted border-2 border-dashed border-border">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="flex items-center justify-center w-full h-full">
                  <Camera className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => avatarInputRef.current?.click()}
                disabled={uploadingAvatar || disabled}
              >
                {uploadingAvatar ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Camera className="h-4 w-4 mr-2" />
                )}
                {avatarUrl ? 'Change Photo' : 'Upload Photo'}
              </Button>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleAvatarChange}
                disabled={disabled}
              />
            </div>
          </div>
        </div>

        {/* Banner Upload */}
        <div>
          <Label className="flex items-center gap-2 mb-2">
            Profile Banner
            <span className="text-xs text-muted-foreground">(Recommended: 1500×500px, JPG/PNG, max 10MB)</span>
          </Label>
          <div
            className="relative w-full h-32 rounded-lg overflow-hidden bg-muted border-2 border-dashed border-border cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => !disabled && bannerInputRef.current?.click()}
          >
            {bannerUrl ? (
              <img src={bannerUrl} alt="Banner" className="w-full h-full object-cover" />
            ) : (
              <div className="flex flex-col items-center justify-center w-full h-full">
                <Image className="h-8 w-8 text-muted-foreground mb-2" />
                <span className="text-sm text-muted-foreground">Click to upload banner (1500×500px)</span>
              </div>
            )}
            {uploadingBanner && (
              <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            )}
          </div>
          <input
            ref={bannerInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleBannerChange}
            disabled={disabled}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Your banner appears at the top of your profile. Use an image that represents you or your work.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default ProfileImagesSection;
