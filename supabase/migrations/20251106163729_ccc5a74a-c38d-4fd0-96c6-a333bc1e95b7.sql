-- Comprehensive Storage Bucket Configuration
-- This migration ensures all buckets have proper public access, size limits, and MIME type restrictions

-- Update user-posts bucket
UPDATE storage.buckets 
SET 
  public = true,
  file_size_limit = 10485760, -- 10MB
  allowed_mime_types = ARRAY[
    'image/jpeg', 
    'image/jpg',
    'image/png', 
    'image/gif', 
    'image/webp', 
    'video/mp4', 
    'video/quicktime',
    'video/webm'
  ]
WHERE id = 'user-posts';

-- Update profile-images bucket (for avatars and banners)
UPDATE storage.buckets 
SET 
  public = true,
  file_size_limit = 5242880, -- 5MB (smaller for profile images)
  allowed_mime_types = ARRAY[
    'image/jpeg', 
    'image/jpg',
    'image/png', 
    'image/gif', 
    'image/webp'
  ]
WHERE id = 'profile-images';

-- Update profile-pictures bucket (if different from profile-images)
UPDATE storage.buckets 
SET 
  public = true,
  file_size_limit = 5242880, -- 5MB
  allowed_mime_types = ARRAY[
    'image/jpeg', 
    'image/jpg',
    'image/png', 
    'image/gif', 
    'image/webp'
  ]
WHERE id = 'profile-pictures';

-- Update event-images bucket
UPDATE storage.buckets 
SET 
  public = true,
  file_size_limit = 10485760, -- 10MB
  allowed_mime_types = ARRAY[
    'image/jpeg', 
    'image/jpg',
    'image/png', 
    'image/gif', 
    'image/webp',
    'video/mp4',
    'video/quicktime',
    'video/webm'
  ]
WHERE id = 'event-images';

-- Ensure post-media bucket is properly configured (redundant but ensures consistency)
UPDATE storage.buckets 
SET 
  public = true,
  file_size_limit = 10485760, -- 10MB
  allowed_mime_types = ARRAY[
    'image/jpeg', 
    'image/jpg',
    'image/png', 
    'image/gif', 
    'image/webp', 
    'video/mp4', 
    'video/quicktime',
    'video/webm',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
WHERE id = 'post-media';