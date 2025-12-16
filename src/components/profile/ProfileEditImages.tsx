import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Camera, Image, Info, Pencil } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { AvatarUploadModal } from '@/components/profile/AvatarUploadModal';
import { BannerUploadModal } from '@/components/profile/BannerUploadModal';

interface ProfileEditImagesProps {
  userId: string;
  avatarUrl: string | null;
  bannerUrl: string | null;
  bannerType?: 'gradient' | 'solid' | 'image';
  bannerGradient?: string;
  bannerOverlay?: boolean;
  onAvatarChange: (url: string) => void;
  onBannerChange: () => void;
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

  const handleBannerUploadComplete = () => {
    onBannerChange();
    queryClient.invalidateQueries({ queryKey: ['profile', userId] });
    queryClient.invalidateQueries({ queryKey: ['profile-v2'] });
  };

  // Determine current banner value for the modal
  const currentBanner = {
    type: bannerUrl ? 'image' as const : bannerType,
    value: bannerUrl || bannerGradient || 'dna',
    overlay: bannerOverlay,
  };

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
              <span className="text-xs text-muted-foreground">(Min 200×200px, JPG/PNG/WebP, max 5MB)</span>
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
            >
              {bannerUrl ? (
                <>
                  <img src={bannerUrl} alt="Banner" className="w-full h-full object-cover" />
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
        currentBanner={currentBanner}
        onUploadComplete={handleBannerUploadComplete}
      />
    </>
  );
};

export default ProfileEditImages;
