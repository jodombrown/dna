import { useState, useCallback } from 'react';
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

export const useAutoEmbedDetection = () => {
  const [loading, setLoading] = useState(false);
  const [embedData, setEmbedData] = useState<EmbedMetadata | null>(null);
  const { toast } = useToast();

  const isValidUrl = (string: string): boolean => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const extractUrls = (text: string): string[] => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const matches = text.match(urlRegex);
    return matches ? matches.filter(isValidUrl) : [];
  };

  const fetchEmbedData = async (url: string): Promise<EmbedMetadata | null> => {
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
      // Don't show toast for auto-detection failures to avoid spam
      setEmbedData(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleContentChange = useCallback(async (content: string) => {
    const urls = extractUrls(content);
    
    if (urls.length > 0) {
      // Use the first URL found
      const url = urls[0];
      await fetchEmbedData(url);
    } else {
      setEmbedData(null);
    }
  }, []);

  const clearEmbedData = () => {
    setEmbedData(null);
  };

  return {
    loading,
    embedData,
    handleContentChange,
    clearEmbedData
  };
};