import { useState, useEffect, useCallback } from 'react';

interface LinkPreviewData {
  url: string;
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
}

// Simple URL detection regex
const URL_REGEX = /https?:\/\/[^\s<]+[^<.,:;"')\]\s]/gi;

/**
 * Hook to detect URLs in text and fetch preview data
 */
export const useLinkPreview = (text: string) => {
  const [urls, setUrls] = useState<string[]>([]);
  const [previews, setPreviews] = useState<LinkPreviewData[]>([]);
  const [loading, setLoading] = useState(false);

  // Extract URLs from text
  useEffect(() => {
    const matches = text.match(URL_REGEX) || [];
    const uniqueUrls = [...new Set(matches)];
    setUrls(uniqueUrls);
  }, [text]);

  // Fetch preview for a single URL (basic metadata extraction)
  const fetchPreview = useCallback(async (url: string): Promise<LinkPreviewData | null> => {
    try {
      // For now, return basic preview with domain info
      // In production, you'd use a link preview API or edge function
      const urlObj = new URL(url);
      const domain = urlObj.hostname.replace('www.', '');
      
      // Check for known video platforms
      if (domain.includes('youtube.com') || domain.includes('youtu.be')) {
        const videoId = extractYouTubeId(url);
        if (videoId) {
          return {
            url,
            title: 'YouTube Video',
            siteName: 'YouTube',
            image: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
          };
        }
      }

      if (domain.includes('vimeo.com')) {
        return {
          url,
          title: 'Vimeo Video',
          siteName: 'Vimeo',
        };
      }

      // Default preview
      return {
        url,
        siteName: domain,
      };
    } catch {
      return null;
    }
  }, []);

  // Fetch previews for all URLs
  useEffect(() => {
    if (urls.length === 0) {
      setPreviews([]);
      return;
    }

    const fetchAll = async () => {
      setLoading(true);
      const results = await Promise.all(urls.map(fetchPreview));
      setPreviews(results.filter((p): p is LinkPreviewData => p !== null));
      setLoading(false);
    };

    fetchAll();
  }, [urls, fetchPreview]);

  return { urls, previews, loading };
};

// Helper to extract YouTube video ID
function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s?]+)/,
    /youtube\.com\/shorts\/([^&\s?]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

/**
 * Detect if text contains URLs
 */
export const containsUrl = (text: string): boolean => {
  return URL_REGEX.test(text);
};

/**
 * Extract first URL from text
 */
export const extractFirstUrl = (text: string): string | null => {
  const match = text.match(URL_REGEX);
  return match ? match[0] : null;
};
