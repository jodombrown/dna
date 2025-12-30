import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Tracks a post view when the element becomes visible in viewport (once per mount)
// Uses RPC log_post_view which dedupes within 24h per user/post.
export function usePostViewTracker(postId: string) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (!postId) return;
    if (sent) return;

    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      async (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && !sent) {
          setSent(true);
          try {
            await supabase.rpc('log_post_view', { p_post_id: postId });
          } catch {
            // Silently ignore; analytics shouldn't block UX
          }
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [postId, sent]);

  return ref;
}
