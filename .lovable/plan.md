

## Problem

The search in the Connect hub applies `excludeConnected()` to search results, which hides any member you're already connected to (or have a pending request with). This means you can't find people by name if you have any relationship with them. The discovery lanes also exclude connected members, which is correct for discovery but wrong for search.

Additionally, the search limit is only 20 results, which may miss members on a larger platform.

## Solution

1. **Stop excluding connected members from search results** — When a user actively searches, show ALL matching members regardless of connection status. The `excludeConnected` filter should only apply to the discovery lanes (where the goal is to find *new* connections), not to search.

2. **Increase search result limit** from 20 to 50 to ensure broader coverage.

3. **Also search by `bio` and `skills`** — The RPC searches `full_name`, `username`, `headline`, `profession`, `location`, and `country_of_origin` via ILIKE. It does NOT search `bio` or skills arrays, which limits discoverability. We'll update the RPC to also match against `bio`.

## Technical details

**File: `src/components/connect/hub/DiscoveryFeed.tsx`**
- Change `filteredSearch` (line 312-314) to use `searchResults` directly instead of wrapping with `excludeConnected()` — only filter out the current user's own profile.
- Increase `p_limit` from 20 to 50 in the search query (line 275).

**Database migration — update `discover_members` RPC:**
- Add `pr.bio ILIKE '%' || p_search_query || '%'` to the search clause so members can be found by bio content as well.

Two changes, both small and targeted.

