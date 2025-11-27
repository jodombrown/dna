import { useAuth } from '@/contexts/AuthContext';
import { UniversalFeedInfinite } from '@/components/feed/UniversalFeedInfinite';

export default function DebugUniversalFeed() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold mb-2">Debug Universal Feed</h1>
        <p>You must be signed in to run this debug view.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Debug Universal Feed</h1>
      <p className="text-sm text-muted-foreground">
        This view uses UniversalFeedInfinite directly with tab="all" and no postType filter.
        Watch the browser console for [DEBUG_FEED] logs.
      </p>

      <UniversalFeedInfinite
        viewerId={user.id}
        tab="all"
        surface="home"
        emptyMessage="No items returned by universal feed."
      />
    </div>
  );
}
