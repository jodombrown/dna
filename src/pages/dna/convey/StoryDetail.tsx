/**
 * DNA | Legacy Story Detail Redirect
 * 
 * This component handles backward compatibility for old /dna/convey/stories/:slug URLs.
 * All stories are now stored in the posts table and should use /dna/story/:slug route.
 */

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

export default function StoryDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  // All stories are now in posts table - redirect to canonical route
  // This handles backward compatibility with old bookmarked URLs
  React.useEffect(() => {
    if (slug) {
      navigate(`/dna/story/${slug}`, { replace: true });
    }
  }, [slug, navigate]);

  // Show loading while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}
