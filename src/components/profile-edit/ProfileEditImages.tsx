import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Camera, Image, Info, Pencil } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { AvatarUploadModal } from '@/components/profile/AvatarUploadModal';
import { BannerUploadModal } from '@/components/profile/BannerUploadModal';
import { BANNER_GRADIENTS, BannerGradientKey } from '@/lib/constants/bannerGradients';

interface BannerUpdateData {
  type: 'gradient' | 'solid' | 'image';
  gradient?: string;
  url?: string;
  overlay: boolean;
}

interface ProfileEditImagesProps {
  userId: string;
  avatarUrl: string | null;
  bannerUrl: string | null;
  bannerType?: 'gradient' | 'solid' | 'image';
  bannerGradient?: string;
  bannerOverlay?: boolean;
  onAvatarChange: (url: string) => void;
  onBannerChange: (url: string) => void;
  onBannerUpdate?: (data: BannerUpdateData) => void;
  userDisplayName?: string;
}

const ProfileEditImages: React.FC<ProfileEditImagesProps> = ({
  userId,
  avatarUrl,
  bannerUrl,
  bannerType = 'gradient',
  bannerGradient = 'dna',
  bannerOverlay = false,
  onAvatarChange,
  onBannerChange,
  onBannerUpdate,
  userDisplayName,
}) => {
  const queryClient = useQueryClient();

  // Modal visibility state
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [bannerModalOpen, setBannerModalOpen] = useState(false);

  const handleAvatarUploadComplete = (url: string) => {
    onAvatarChange(url);
    queryClient.invalidateQueries({ queryKey: ['profile', userId] });
    queryClient.invalidateQueries({ queryKey: ['profile-v2'] });
  };

  const handleBannerUploadComplete = (data: BannerUpdateData) => {
    queryClient.invalidateQueries({ queryKey: ['profile', userId] });
    queryClient.invalidateQueries({ queryKey: ['profile-v2'] });
    // Refetch to get the new banner data
    queryClient.refetchQueries({ queryKey: ['profile', userId] });
    // Pass the data up so parent can update local state immediately
    onBannerUpdate?.(data);
  };

  // Get banner display style
  const getBannerStyle = (): React.CSSProperties => {
    if (bannerType === 'image' && bannerUrl) {
      return { 
        backgroundImage: `url(${bannerUrl})`, 
        backgroundSize: 'cover', 
        backgroundPosition: 'center' 
      };
    }
    if (bannerType === 'gradient' && bannerGradient) {
      const gradient = BANNER_GRADIENTS[bannerGradient as BannerGradientKey];
      return { background: gradient?.css || BANNER_GRADIENTS.dna.css };
    }
    return { background: BANNER_GRADIENTS.dna.css };
  };

  // Check if banner has content (gradient or image)
  const hasBannerContent = bannerType === 'image' ? !!bannerUrl : !!bannerGradient;

  return (
    <>
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
              <span className="text-xs text-muted-foreground">(Min 400×400px, JPG/PNG/WebP, max 5MB)</span>
            </Label>
            <div className="flex items-center gap-4">
              <div
                className="relative w-24 h-24 rounded-full overflow-hidden bg-muted border-2 border-dashed border-border cursor-pointer hover:border-primary/50 transition-colors group"
                onClick={() => setAvatarModalOpen(true)}
              >
                {avatarUrl ? (
                  <>
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Pencil className="h-5 w-5 text-white" />
                    </div>
                  </>
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
                  onClick={() => setAvatarModalOpen(true)}
                >
                  <Camera className="h-4 w-4 mr-2" />
                  {avatarUrl ? 'Change Photo' : 'Upload Photo'}
                </Button>
                <p className="text-xs text-muted-foreground">
                  Crop and position your photo
                </p>
              </div>
            </div>
          </div>

          {/* Banner Upload */}
          <div>
            <Label className="flex items-center gap-2 mb-2">
              Profile Banner
              <span className="text-xs text-muted-foreground">(Min 1200×400px, JPG/PNG/WebP, max 10MB)</span>
            </Label>
            <div
              className="relative w-full h-32 rounded-lg overflow-hidden bg-muted border-2 border-dashed border-border cursor-pointer hover:border-primary/50 transition-colors group"
              onClick={() => setBannerModalOpen(true)}
              style={hasBannerContent ? getBannerStyle() : undefined}
            >
              {hasBannerContent ? (
                <>
                  {/* Overlay preview */}
                  {bannerOverlay && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Pencil className="h-6 w-6 text-white" />
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center w-full h-full">
                  <Image className="h-8 w-8 text-muted-foreground mb-2" />
                  <span className="text-sm text-muted-foreground">Click to customize banner</span>
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Choose a gradient template or upload a custom image with crop & zoom.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Avatar Upload Modal */}
      <AvatarUploadModal
        open={avatarModalOpen}
        onOpenChange={setAvatarModalOpen}
        currentAvatarUrl={avatarUrl || undefined}
        userId={userId}
        onUploadComplete={handleAvatarUploadComplete}
      />

      {/* Banner Upload Modal */}
      <BannerUploadModal
        open={bannerModalOpen}
        onOpenChange={setBannerModalOpen}
        userId={userId}
        currentBanner={{
          type: bannerType,
          value: bannerType === 'image' ? (bannerUrl || '') : (bannerGradient || 'dna'),
          overlay: bannerOverlay
        }}
        onUploadComplete={handleBannerUploadComplete}
        userDisplayName={userDisplayName}
        userAvatarUrl={avatarUrl || undefined}
      />
    </>
  );
};

export default ProfileEditImages;
