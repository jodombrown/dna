import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
interface EmbedMetadata {
  url: string;
  version: string;
  type: string;
  provider_name?: string;
  provider_url?: string;
  html?: string;
  width?: number;
  height?: number;
  title?: string;
  author_name?: string;
  author_url?: string;
  thumbnail_url?: string;
  thumbnail_width?: number;
  thumbnail_height?: number;
  cache_age?: number;
  fetched_at?: string;
}

export const useEmbedPreview = () => {
  const [loading, setLoading] = useState(false);
  const [embedData, setEmbedData] = useState<EmbedMetadata | null>(null);
  const { toast } = useToast();

  const fetchEmbedData = async (url: string): Promise<EmbedMetadata | null> => {
    if (!url.trim()) {
      setEmbedData(null);
      return null;
    }

    // Basic URL validation
    try {
      new URL(url);
    } catch {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL",
        variant: "destructive",
      });
      return null;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('oembed-proxy', {
        body: { url }
      });

      if (error) {
        throw error;
      }

      setEmbedData(data as EmbedMetadata);
      return data as EmbedMetadata;
    } catch (error) {
      toast({
        title: "Embed fetch failed",
        description: "Could not fetch preview for this URL",
        variant: "destructive",
      });
      setEmbedData(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const clearEmbedData = () => {
    setEmbedData(null);
  };

  return {
    loading,
    embedData,
    fetchEmbedData,
    clearEmbedData
  };
};