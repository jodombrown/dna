import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface EmbedMetadata {
  url: string;
  type: 'article' | 'video' | 'image' | 'website' | 'rich';
  title?: string;
  description?: string;
  image?: string;
  site_name?: string;
  author?: string;
  favicon?: string;
  // Video-specific
  embed_html?: string;
  video_url?: string;
  thumbnail_url?: string;
  provider_name?: string;
  // Metadata
  fetched_at?: string;
  // Legacy compatibility
  author_name?: string;
  is_video?: boolean;
}

// Supported video providers
const VIDEO_URL_PATTERNS = [
  // YouTube
  /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/,
  // Vimeo
  /vimeo\.com\/(?:video\/)?(\d+)/,
  // Twitter/X video
  /(?:twitter|x)\.com\/.*\/video/,
  // TikTok
  /tiktok\.com/,
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
    // More permissive URL regex to catch URLs without trailing content
    const urlRegex = /(https?:\/\/[^\s<>"{}|\\^`[\]]+)/g;
    const matches = text.match(urlRegex);
    return matches ? matches.filter(isValidUrl) : [];
  };

  const fetchEmbedData = useCallback(async (url: string): Promise<EmbedMetadata | null> => {
    // Skip if we've already fetched this URL
    if (lastFetchedUrl.current === url) {
      return embedData;
    }

    console.log('[useAutoEmbedDetection] Fetching preview for:', url);
    setLoading(true);
    lastFetchedUrl.current = url;

    try {
      // Use new link-preview function that supports all URLs
      const { data, error } = await supabase.functions.invoke('link-preview', {
        body: { url }
      });

      console.log('[useAutoEmbedDetection] Response:', { data, error });

      if (error) {
        console.error('[useAutoEmbedDetection] Error:', error);
        throw error;
      }

      // Check if service returned an error
      if (data?.error) {
        console.warn('[useAutoEmbedDetection] Service error:', data.error);
        setEmbedData(null);
        return null;
      }

      // Determine if this is a video
      const isVideo = data?.type === 'video' || isVideoUrl(url);

      const enrichedData: EmbedMetadata = {
        url: data?.url || url,
        type: data?.type || 'website',
        title: data?.title,
        description: data?.description,
        image: data?.image,
        site_name: data?.site_name,
        author: data?.author,
        favicon: data?.favicon,
        thumbnail_url: data?.thumbnail_url || data?.image,
        provider_name: data?.provider_name || data?.site_name,
        embed_html: data?.embed_html,
        fetched_at: data?.fetched_at,
        // Legacy compatibility fields
        author_name: data?.author,
        is_video: isVideo,
      };

      console.log('[useAutoEmbedDetection] Enriched data:', enrichedData);
      setEmbedData(enrichedData);
      return enrichedData;
    } catch (error) {
      console.error('[useAutoEmbedDetection] Fetch error:', error);
      
      // Fallback: create basic preview from URL
      try {
        const urlObj = new URL(url);
        const fallbackData: EmbedMetadata = {
          url,
          type: isVideoUrl(url) ? 'video' : 'website',
          site_name: urlObj.hostname.replace('www.', ''),
          favicon: `${urlObj.origin}/favicon.ico`,
          is_video: isVideoUrl(url),
        };
        setEmbedData(fallbackData);
        return fallbackData;
      } catch {
        setEmbedData(null);
        return null;
      }
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
    console.log('[useAutoEmbedDetection] Detected URLs:', urls);
    
    if (urls.length > 0) {
      // Use the first URL found, prioritize video URLs
      const videoUrl = urls.find(isVideoUrl);
      const urlToFetch = videoUrl || urls[0];
      
      console.log('[useAutoEmbedDetection] Will fetch:', urlToFetch, 'isVideo:', isVideoUrl(urlToFetch));
      
      // Debounce the fetch to avoid hammering the API while typing
      debounceTimer.current = setTimeout(() => {
        fetchEmbedData(urlToFetch);
      }, 800); // Increased debounce to 800ms for better UX
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
    isVideoEmbed: embedData?.is_video ?? embedData?.type === 'video',
  };
};
