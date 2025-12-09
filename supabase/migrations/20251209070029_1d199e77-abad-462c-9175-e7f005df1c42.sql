-- Add link_metadata column to posts table for storing video embed data
ALTER TABLE posts ADD COLUMN IF NOT EXISTS link_metadata jsonb DEFAULT NULL;