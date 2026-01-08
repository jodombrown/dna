-- Seed a test event for CONVENE testing
INSERT INTO events (
  title,
  slug,
  description,
  short_description,
  organizer_id,
  event_type,
  format,
  start_time,
  end_time,
  timezone,
  location_name,
  location_address,
  location_city,
  location_country,
  meeting_url,
  meeting_platform,
  max_attendees,
  is_public,
  status,
  visibility,
  allow_guests,
  requires_approval,
  cover_image_url,
  created_at,
  updated_at
) VALUES (
  'DNA Platform Launch Party',
  'dna-platform-launch-party',
  'Join us for the official launch of the DNA Platform! Connect with diaspora professionals, learn about our Five C''s methodology, and celebrate our mission to mobilize the Global African Diaspora toward Africa''s economic transformation.

This hybrid event welcomes both in-person and virtual attendees. Network with fellow diaspora members, hear from inspiring speakers, and be part of history as we launch the operating system for the Global African Diaspora.',
  'Celebrate the launch of DNA Platform with networking and inspiring speakers.',
  'f2c1d415-254b-4881-99bc-988657ffc562',
  'networking',
  'hybrid',
  NOW() + INTERVAL '7 days',
  NOW() + INTERVAL '7 days' + INTERVAL '4 hours',
  'America/New_York',
  'DNA Innovation Hub',
  '123 Diaspora Way, Suite 500',
  'New York',
  'United States',
  'https://zoom.us/j/dna-launch-party',
  'zoom',
  100,
  true,
  'published',
  'public',
  true,
  false,
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200',
  NOW(),
  NOW()
);

-- Add yourself as an attendee with correct enum value (trigger will auto-generate qr_code_token)
INSERT INTO event_attendees (
  event_id,
  user_id,
  status,
  source
) 
SELECT 
  e.id,
  'f2c1d415-254b-4881-99bc-988657ffc562',
  'going'::rsvp_status,
  'host'
FROM events e 
WHERE e.slug = 'dna-platform-launch-party';

-- Add a couple more test attendees for realistic testing
INSERT INTO event_attendees (event_id, user_id, status, source)
SELECT e.id, p.id, 'going'::rsvp_status, 'organic'
FROM events e, profiles p
WHERE e.slug = 'dna-platform-launch-party'
  AND p.id != 'f2c1d415-254b-4881-99bc-988657ffc562'
LIMIT 5;