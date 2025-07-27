import { supabase } from "@/integrations/supabase/client";

export const uploadMedia = async (
  file: File, 
  userId: string, 
  bucket: 'user-posts' | 'profile-pictures' | 'profile-images' | 'event-images'
) => {
  const filePath = `${userId}/${Date.now()}-${file.name}`;
  const { data, error } = await supabase.storage.from(bucket).upload(filePath, file);
  
  if (error) throw error;

  const { data: publicUrl } = supabase.storage.from(bucket).getPublicUrl(filePath);
  return publicUrl.publicUrl;
};