import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

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
      const response = await fetch(
        `https://ybhssuehmfnxrzneobok.supabase.co/functions/v1/oembed-proxy?url=${encodeURIComponent(url)}`,
        {
          headers: {
            'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InliaHNzdWVobWZueHJ6bmVvYm9rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwMTI0NzMsImV4cCI6MjA2NDU4ODQ3M30.Uur_V4TYm4yCYtDQAa4diIpdsKoKb5Bkuo0cWNZAY-Y`
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch embed data: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setEmbedData(data);
      return data;
    } catch (error) {
      console.error('Embed fetch error:', error);
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