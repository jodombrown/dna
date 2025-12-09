import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface EmbedMetadata {
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
  // Video-specific detection
  is_video?: boolean;
}

// Supported video providers for beta
const VIDEO_URL_PATTERNS = [
  // YouTube
  /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/,
  // Vimeo
  /vimeo\.com\/(?:video\/)?(\d+)/,
];

export const isVideoUrl = (url: string): boolean => {
  return VIDEO_URL_PATTERNS.some(pattern => pattern.test(url));
};

export const useAutoEmbedDetection = () => {
  const [loading, setLoading] = useState(false);
  const [embedData, setEmbedData] = useState<EmbedMetadata | null>(null);
  const lastFetchedUrl = useRef<string | null>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const isValidUrl = (string: string): boolean => {
    try {
      const url = new URL(string);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const extractUrls = (text: string): string[] => {
    const urlRegex = /(https?:\/\/[^\s<>"{}|\\^`[\]]+)/g;
    const matches = text.match(urlRegex);
    return matches ? matches.filter(isValidUrl) : [];
  };

  const fetchEmbedData = useCallback(async (url: string): Promise<EmbedMetadata | null> => {
    // Skip if we've already fetched this URL
    if (lastFetchedUrl.current === url) {
      return embedData;
    }

    setLoading(true);
    lastFetchedUrl.current = url;

    try {
      const { data, error } = await supabase.functions.invoke('oembed-proxy', {
        body: { url }
      });

      if (error) {
        throw error;
      }

      // Determine if this is a video
      const isVideo = isVideoUrl(url) || data?.type === 'video';

      const enrichedData: EmbedMetadata = {
        ...data,
        is_video: isVideo,
      };

      setEmbedData(enrichedData);
      return enrichedData;
    } catch (error) {
      console.error('Embed fetch error:', error);
      setEmbedData(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, [embedData]);

  const handleContentChange = useCallback((content: string) => {
    // Clear any pending debounce
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    const urls = extractUrls(content);
    
    if (urls.length > 0) {
      // Use the first URL found, prioritize video URLs
      const videoUrl = urls.find(isVideoUrl);
      const urlToFetch = videoUrl || urls[0];
      
      // Debounce the fetch to avoid hammering the API while typing
      debounceTimer.current = setTimeout(() => {
        fetchEmbedData(urlToFetch);
      }, 500);
    } else {
      setEmbedData(null);
      lastFetchedUrl.current = null;
    }
  }, [fetchEmbedData]);

  const clearEmbedData = useCallback(() => {
    setEmbedData(null);
    lastFetchedUrl.current = null;
  }, []);

  return {
    loading,
    embedData,
    handleContentChange,
    clearEmbedData,
    isVideoEmbed: embedData?.is_video ?? false,
  };
};