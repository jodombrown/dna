-- Add missing columns to events table for enhanced Event Composer
ALTER TABLE events ADD COLUMN IF NOT EXISTS subtitle text;
ALTER TABLE events ADD COLUMN IF NOT EXISTS agenda jsonb DEFAULT '[]';
ALTER TABLE events ADD COLUMN IF NOT EXISTS dress_code text;
ALTER TABLE events ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';