
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useImageUpload = () => {
  const { toast } = useToast();

  const uploadImage = async (file: File, userId: string, type: 'avatar' | 'banner' | 'event-images'): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      let fileName: string;
      let bucketName: string;

      if (type === 'event-images') {
        bucketName = 'event-images';
        fileName = `${userId}/event-${Date.now()}.${fileExt}`;
      } else {
        bucketName = 'profile-images';
        fileName = `${userId}/${type}-${Date.now()}.${fileExt}`;
      }

      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        console.error('Upload error:', error);
        toast({
          title: "Upload Failed",
          description: "Failed to upload image. Please try again.",
          variant: "destructive",
        });
        return null;
      }

      // Get the public URL
      const { data: urlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(data.path);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Unexpected upload error:', error);
      toast({
        title: "Upload Error",
        description: "An unexpected error occurred during upload.",
        variant: "destructive",
      });
      return null;
    }
  };

  return { uploadImage };
};
