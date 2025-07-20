import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Upload, Camera, X, Loader2 } from 'lucide-react';

interface ImageUploadProps {
  currentImageUrl?: string;
  onImageChange: (url: string) => void;
  type: 'avatar' | 'banner';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  currentImageUrl,
  onImageChange,
  type,
  size = 'md',
  className = ''
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32'
  };

  const bucketName = type === 'avatar' ? 'profile-pictures' : 'profile-images';

  const uploadImage = async (file: File) => {
    if (!user?.id) {
      toast({
        title: "Authentication Required",
        description: "Please log in to upload images.",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    
    try {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        throw new Error('Please upload a valid image file (JPEG, PNG, WebP, or GIF)');
      }

      // Validate file size (5MB max)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        throw new Error('File size must be less than 5MB');
      }

      // Create a unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${type}_${Date.now()}.${fileExt}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(fileName);

      // Update the form with the new URL
      onImageChange(publicUrl);
      setPreviewUrl(null);

      toast({
        title: "Upload Successful",
        description: `Your ${type} has been uploaded successfully.`,
      });

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to upload image",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Create preview
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    // Upload the file
    uploadImage(file);
  };

  const handleRemoveImage = () => {
    onImageChange('');
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const displayUrl = previewUrl || currentImageUrl;

  if (type === 'avatar') {
    return (
      <div className={`relative ${className}`}>
        <Avatar className={`${sizeClasses[size]} border-4 border-white shadow-lg`}>
          <AvatarImage src={displayUrl} />
          <AvatarFallback className="bg-dna-emerald text-white">
            {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0).toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
        
        {/* Upload Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
             onClick={() => fileInputRef.current?.click()}>
          {uploading ? (
            <Loader2 className="h-6 w-6 text-white animate-spin" />
          ) : (
            <Camera className="h-6 w-6 text-white" />
          )}
        </div>

        {/* Remove Button */}
        {displayUrl && !uploading && (
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0"
            onClick={handleRemoveImage}
          >
            <X className="h-3 w-3" />
          </Button>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    );
  }

  // Banner type
  return (
    <div className={`relative ${className}`}>
      <div className="w-full h-32 bg-gradient-to-r from-dna-emerald to-dna-forest rounded-lg overflow-hidden border-2 border-dna-mint">
        {displayUrl ? (
          <img 
            src={displayUrl} 
            alt="Banner" 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center text-white">
              <Upload className="h-8 w-8 mx-auto mb-2 opacity-70" />
              <p className="text-sm opacity-70">Upload Banner</p>
            </div>
          </div>
        )}
        
        {/* Upload Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
             onClick={() => fileInputRef.current?.click()}>
          {uploading ? (
            <div className="text-center text-white">
              <Loader2 className="h-8 w-8 mx-auto mb-2 animate-spin" />
              <p className="text-sm">Uploading...</p>
            </div>
          ) : (
            <div className="text-center text-white">
              <Camera className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm">Change Banner</p>
            </div>
          )}
        </div>
      </div>

      {/* Remove Button */}
      {displayUrl && !uploading && (
        <Button
          type="button"
          variant="destructive"
          size="sm"
          className="absolute top-2 right-2"
          onClick={handleRemoveImage}
        >
          <X className="h-4 w-4 mr-1" />
          Remove
        </Button>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};

export default ImageUpload;