-- Update existing profiles with default display information for testing
UPDATE profiles 
SET 
  display_name = COALESCE(display_name, full_name, email),
  full_name = COALESCE(full_name, email),
  profession = COALESCE(profession, 'Professional'),
  location = COALESCE(location, 'Global')
WHERE display_name IS NULL OR full_name IS NULL OR profession IS NULL OR location IS NULL;