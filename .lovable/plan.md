

# Fix Notification Navigation, Styling, and Profile Connection Count

## Three Issues Identified

### Issue 1: Notification clicks don't open the right post
**Root cause**: The `notify_post_like` DB trigger stores the post ID in the `related_entity_type` and `related_entity_id` columns. But the `get_user_notifications` RPC reads from `payload->>'entity_type'` and `payload->>'entity_id'` (which are empty), so it defaults to `'notification'` and the notification's own ID. The click handler checks `entity_type === 'post'` which never matches.

**Fix (two parts)**:
1. **New migration**: Update `get_user_notifications` to read from `related_entity_type` and `related_entity_id` columns (falling back to payload fields). Also use `related_user_id` for actor lookup alongside the existing payload keys.
2. **Frontend fallback**: Update `NotificationItem.tsx` click handler to also try `action_url` before defaulting to `/dna/feed`. Update the `notify_post_like` and `notify_post_comment` triggers to set `action_url` to `/dna/feed?post={post_id}` so even existing logic works.

### Issue 2: Notification hover color clashes with text
The notification row uses `hover:bg-accent` which creates a brownish/tan highlight that clashes with the rose icon badges visible in the screenshot.

**Fix**: Change the hover to a softer, neutral highlight: `hover:bg-muted/50` in `NotificationItem.tsx`.

### Issue 3: Profile shows "0 followers · 1 following" but no connection count
The `ProfileV2Hero` only displays follower/following counts from the `useFollow` hook. Connection count (which is 10) is available in `activity.connections_count` and shown in `ProfileV2QuickStats`, but the hero section never displays it.

**Fix**: Update `ProfileV2Hero` to accept and display `connectionsCount` alongside followers/following. The parent component already has `activity.connections_count` from the profile bundle. Show format: **10 connections · 0 followers · 1 following**.

## Files to Change

| File | Change |
|------|--------|
| `supabase/migrations/[new].sql` | Update `get_user_notifications` to use `related_entity_type`, `related_entity_id`, and `related_user_id` columns. Update `notify_post_like` and `notify_post_comment` to include post ID in `action_url`. |
| `src/components/notifications/NotificationItem.tsx` | Fix hover style from `hover:bg-accent` to `hover:bg-muted/50`. Improve click handler to prefer `action_url` for post types. |
| `src/components/profile-v2/ProfileV2Hero.tsx` | Add `connectionsCount` prop, display it in the meta row before followers/following. |
| Parent component(s) rendering `ProfileV2Hero` | Pass `activity.connections_count` as the new prop. |

## Technical Details

The `get_user_notifications` RPC currently does:
```sql
COALESCE(n.payload->>'entity_type', 'notification') AS entity_type
```
This misses the `related_entity_type` column entirely. The fix:
```sql
COALESCE(n.related_entity_type, n.payload->>'entity_type', 'notification') AS entity_type,
COALESCE(n.related_entity_id, (n.payload->>'entity_id')::UUID, (n.payload->>'post_id')::UUID, n.id) AS entity_id
```

Similarly for actor lookup, add `n.related_user_id` to the COALESCE chain.

