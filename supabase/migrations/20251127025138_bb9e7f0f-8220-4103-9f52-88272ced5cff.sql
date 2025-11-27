-- Add subtitle column to posts table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'posts' AND column_name = 'subtitle'
  ) THEN
    ALTER TABLE posts ADD COLUMN subtitle TEXT NULL;
  END IF;
END $$;