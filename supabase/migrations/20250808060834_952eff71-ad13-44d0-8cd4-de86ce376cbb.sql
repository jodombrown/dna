-- Expanded Post Types migration
-- 1) Add new columns to posts
ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS poll_options jsonb NULL,
  ADD COLUMN IF NOT EXISTS poll_expires_at timestamptz NULL,
  ADD COLUMN IF NOT EXISTS link_url text NULL,
  ADD COLUMN IF NOT EXISTS link_metadata jsonb NULL,
  ADD COLUMN IF NOT EXISTS opportunity_type text NULL,
  ADD COLUMN IF NOT EXISTS opportunity_link text NULL;

-- 2) Ensure type has a safe default and allow new types
ALTER TABLE public.posts
  ALTER COLUMN type SET DEFAULT 'text';

-- 3) Relax and recreate the type check to include new types
ALTER TABLE public.posts DROP CONSTRAINT IF EXISTS posts_type_check;
ALTER TABLE public.posts
  ADD CONSTRAINT posts_type_check
  CHECK (
    type = ANY (ARRAY[
      'text'::text,
      'image'::text,
      'video'::text,
      'article'::text,
      'link'::text,
      'poll'::text,
      'opportunity'::text,
      'question'::text
    ])
  );