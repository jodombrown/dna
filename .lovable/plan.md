

# Show who liked a post (LinkedIn-style)

## Problem
Two issues prevent users from seeing who liked their posts:

1. **`usePostLikes.ts`** fetches only `user_id` from `post_likes` -- it never joins profile data, so `likedBy` entries have empty `full_name`, `username`, and `avatar_url`.
2. **`PostCard.tsx`** imports `LikedByModal` and has `showLikedByModal` state wired up, but the `<LikedByModal />` component is never rendered in the JSX.

## Changes

### 1. Fix the data: join profiles in `usePostLikes.ts`
- Change the query from `.select('user_id')` to `.select('user_id, profiles:user_id(full_name, username, avatar_url, headline)')`.
- Map the joined profile data into the `likedBy` array so each entry has real names, avatars, and headlines.

### 2. Render the modal: add `<LikedByModal />` to `PostCard.tsx`
- Add the missing `<LikedByModal isOpen={showLikedByModal} onClose={() => setShowLikedByModal(false)} likedBy={likedBy} />` in the JSX, near the other dialogs at the bottom of the component.

### Files
- `src/hooks/usePostLikes.ts` -- fix query to join profiles
- `src/components/posts/PostCard.tsx` -- render `<LikedByModal />`

