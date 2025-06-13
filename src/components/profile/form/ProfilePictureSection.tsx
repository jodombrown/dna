
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Upload } from 'lucide-react';

interface ProfilePictureSectionProps {
  avatarUrl: string;
  bannerUrl?: string;
  fullName: string;
  onAvatarChange: (url: string) => void;
  onBannerChange?: (url: string) => void;
}

const ProfilePictureSection: React.FC<ProfilePictureSectionProps> = ({
  avatarUrl,
  bannerUrl,
  fullName,
  onAvatarChange,
  onBannerChange
}) => {
  const defaultBanner = "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=400&q=80";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-dna-forest">Profile Pictures</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Banner Image */}
        {onBannerChange && (
          <div>
            <Label htmlFor="banner-url" className="text-sm font-medium text-gray-700">
              Banner Image
            </Label>
            <div className="mt-2">
              <div className="relative h-32 rounded-lg overflow-hidden border-2 border-dashed border-gray-300 hover:border-dna-copper transition-colors">
                <img
                  src={bannerUrl || defaultBanner}
                  alt="Profile banner"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <Upload className="w-6 h-6 text-white" />
                </div>
              </div>
              <Input
                id="banner-url"
                type="url"
                placeholder="https://example.com/banner-image.jpg"
                value={bannerUrl || ''}
                onChange={(e) => onBannerChange(e.target.value)}
                className="mt-2"
              />
              <p className="text-xs text-gray-500 mt-1">
                Add a banner image URL to showcase your personality or heritage
              </p>
            </div>
          </div>
        )}

        {/* Profile Avatar */}
        <div>
          <Label htmlFor="avatar-url" className="text-sm font-medium text-gray-700">
            Profile Picture
          </Label>
          <div className="mt-2 flex items-center gap-4">
            <div className="relative">
              <Avatar className="w-20 h-20">
                <AvatarImage src={avatarUrl} alt={fullName} />
                <AvatarFallback className="bg-dna-copper text-white text-xl">
                  {fullName?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-dna-copper rounded-full flex items-center justify-center">
                <Camera className="w-3 h-3 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <Input
                id="avatar-url"
                type="url"
                placeholder="https://example.com/profile-image.jpg"
                value={avatarUrl}
                onChange={(e) => onAvatarChange(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">
                Add a profile picture URL or upload an image
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfilePictureSection;
