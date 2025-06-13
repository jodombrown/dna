
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Upload, Image, Info, Link } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useImageUpload } from './ImageUploadHandler';

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
  const { user } = useAuth();
  const { uploadImage } = useImageUpload();
  const [uploadMethod, setUploadMethod] = useState<'url' | 'file'>('file');
  const [bannerUploadMethod, setBannerUploadMethod] = useState<'url' | 'file'>('file');
  const [uploading, setUploading] = useState(false);
  const [bannerUploading, setBannerUploading] = useState(false);
  const defaultBanner = "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=400&q=80";

  const handleAvatarFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && user) {
      setUploading(true);
      const url = await uploadImage(file, user.id, 'avatar');
      if (url) {
        onAvatarChange(url);
      }
      setUploading(false);
    }
  };

  const handleBannerFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && user && onBannerChange) {
      setBannerUploading(true);
      const url = await uploadImage(file, user.id, 'banner');
      if (url) {
        onBannerChange(url);
      }
      setBannerUploading(false);
    }
  };

  return (
    <Card className="overflow-hidden border-2 border-dna-mint/20 bg-gradient-to-br from-white to-dna-mint/5">
      <CardHeader className="bg-gradient-to-r from-dna-forest/5 to-dna-emerald/5">
        <CardTitle className="text-dna-forest flex items-center gap-2">
          <Camera className="w-5 h-5 text-dna-copper" />
          Profile Images
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-8 p-6">
        {/* Image Size Guidelines */}
        <Alert className="border-dna-copper/20 bg-dna-copper/5">
          <Info className="h-4 w-4 text-dna-copper" />
          <AlertDescription className="text-sm">
            <strong>Recommended Image Sizes:</strong><br />
            • Profile Picture: 400x400px (square, max 2MB)<br />
            • Banner Image: 1200x400px (3:1 ratio, max 5MB)<br />
            Supported formats: JPG, PNG, WebP
          </AlertDescription>
        </Alert>

        {/* Banner Image */}
        {onBannerChange && (
          <div className="space-y-4">
            <Label className="text-lg font-semibold text-dna-forest flex items-center gap-2">
              <Image className="w-5 h-5 text-dna-emerald" />
              Banner Image
            </Label>
            
            {/* Banner Preview */}
            <div className="relative h-40 rounded-xl overflow-hidden border-3 border-dna-emerald/20 shadow-lg group">
              <img
                src={bannerUrl || defaultBanner}
                alt="Profile banner"
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 text-white">
                <p className="text-sm font-medium">Your Story Banner</p>
              </div>
            </div>

            {/* Banner Upload Options */}
            <Tabs value={bannerUploadMethod} onValueChange={(value) => setBannerUploadMethod(value as 'url' | 'file')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="url" className="flex items-center gap-2">
                  <Link className="w-4 h-4" />
                  URL
                </TabsTrigger>
                <TabsTrigger value="file" className="flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Upload
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="url" className="space-y-2">
                <Input
                  type="url"
                  placeholder="https://example.com/your-banner-image.jpg"
                  value={bannerUrl || ''}
                  onChange={(e) => onBannerChange(e.target.value)}
                  className="border-dna-emerald/20 focus:border-dna-emerald"
                />
              </TabsContent>
              
              <TabsContent value="file" className="space-y-2">
                <div className="border-2 border-dashed border-dna-emerald/30 rounded-lg p-6 text-center hover:border-dna-emerald/50 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleBannerFileUpload}
                    className="hidden"
                    id="banner-upload"
                    disabled={bannerUploading}
                  />
                  <label htmlFor="banner-upload" className="cursor-pointer">
                    <Upload className="w-8 h-8 text-dna-emerald mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      {bannerUploading ? 'Uploading...' : 'Click to upload banner image'}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">1200x400px recommended</p>
                  </label>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* Profile Picture */}
        <div className="space-y-4">
          <Label className="text-lg font-semibold text-dna-forest flex items-center gap-2">
            <Camera className="w-5 h-5 text-dna-copper" />
            Profile Picture
          </Label>
          
          {/* Profile Picture Preview */}
          <div className="flex items-center gap-6">
            <div className="relative group">
              <div className="w-24 h-24 rounded-2xl overflow-hidden border-4 border-dna-copper/20 shadow-lg">
                <Avatar className="w-full h-full rounded-none">
                  <AvatarImage src={avatarUrl} alt={fullName} className="object-cover" />
                  <AvatarFallback className="bg-gradient-to-br from-dna-copper to-dna-gold text-white text-2xl font-bold rounded-none">
                    {fullName?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-dna-copper rounded-full flex items-center justify-center shadow-md">
                <Camera className="w-4 h-4 text-white" />
              </div>
            </div>
            
            <div className="flex-1 space-y-3">
              <div className="text-sm text-gray-600">
                Choose how you'd like to add your profile picture
              </div>
              
              {/* Avatar Upload Options */}
              <Tabs value={uploadMethod} onValueChange={(value) => setUploadMethod(value as 'url' | 'file')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="url" className="flex items-center gap-2">
                    <Link className="w-4 h-4" />
                    URL
                  </TabsTrigger>
                  <TabsTrigger value="file" className="flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    Upload
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="url" className="space-y-2">
                  <Input
                    type="url"
                    placeholder="https://example.com/your-profile-image.jpg"
                    value={avatarUrl}
                    onChange={(e) => onAvatarChange(e.target.value)}
                    className="border-dna-copper/20 focus:border-dna-copper"
                  />
                </TabsContent>
                
                <TabsContent value="file" className="space-y-2">
                  <div className="border-2 border-dashed border-dna-copper/30 rounded-lg p-4 text-center hover:border-dna-copper/50 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarFileUpload}
                      className="hidden"
                      id="avatar-upload"
                      disabled={uploading}
                    />
                    <label htmlFor="avatar-upload" className="cursor-pointer">
                      <Upload className="w-6 h-6 text-dna-copper mx-auto mb-1" />
                      <p className="text-sm text-gray-600">
                        {uploading ? 'Uploading...' : 'Click to upload'}
                      </p>
                      <p className="text-xs text-gray-400">400x400px recommended</p>
                    </label>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfilePictureSection;
