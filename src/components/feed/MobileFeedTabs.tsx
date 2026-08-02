/**
 * Mobile Feed Tabs — first consumer of the LensBar primitive (BD332).
 *
 * Route-driven: the active lens is read from ?lens=<id> by LensBar itself, so
 * this surface no longer receives or holds tab state. Ids are unchanged:
 * all, for_you, network, my_posts, bookmarks.
 */

import { Newspaper, UserCheck, PenSquare, Bookmark, Compass } from 'lucide-react';
import { LensBar, type Lens } from '@/components/shell/LensBar';

/**
 * Feed lens icons. Each must be unique within this surface and is reserved per
 * docs/ICON_USAGE_GUIDE.md - enforced by scripts/check-icon-duplicates.ts.
 *
 * "My Network" uses UserCheck, not UserPlus: this lens means "from people I am
 * already connected to", not "add a person". The same meaning shares a glyph
 * across surfaces (Convene Network, Convey My Circle).
 */
const FEED_LENSES: Lens[] = [
  { id: 'all', label: 'All', icon: Newspaper, description: 'All posts from the diaspora community' },
  { id: 'for_you', label: 'For You', icon: Compass, description: 'Personalized for you' },
  { id: 'network', label: 'My Network', icon: UserCheck, description: 'Posts from your connections' },
  { id: 'my_posts', label: 'Mine', icon: PenSquare, description: 'Posts you have shared' },
  { id: 'bookmarks', label: 'Saved', icon: Bookmark, description: 'Posts you have saved' },
];

export function MobileFeedTabs() {
  return <LensBar lenses={FEED_LENSES} ariaLabel="Feed lenses" c="connect" />;
}
