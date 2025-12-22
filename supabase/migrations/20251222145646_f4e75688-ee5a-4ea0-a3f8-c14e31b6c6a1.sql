-- Make feedback-media bucket public so images display correctly
UPDATE storage.buckets SET public = true WHERE id = 'feedback-media';