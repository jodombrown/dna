-- ========================================
-- DNA DASHBOARD SEED DATA
-- Run this SQL in Supabase SQL Editor to add test data
-- ========================================

-- Note: This creates opportunities only since profiles require auth.users entries
-- To add test user profiles, create them through the normal signup process

-- Insert 3 sample opportunities using the current authenticated user
INSERT INTO opportunities (
  created_by,
  title,
  description,
  location,
  time_commitment_hours,
  duration_months,
  status,
  type,
  visibility,
  created_at
)
SELECT
  auth.uid(),
  'Frontend Developer for Learning Platform',
  'Help us build a React-based e-learning platform for 10,000+ African students. We need someone who can dedicate 10-15 hours per week for 3 months to build core features including video playback, quizzes, and progress tracking.',
  'Remote',
  15,
  3,
  'active',
  'technical',
  'public',
  NOW() - INTERVAL '2 days'
WHERE auth.uid() IS NOT NULL
ON CONFLICT DO NOTHING;

INSERT INTO opportunities (
  created_by,
  title,
  description,
  location,
  time_commitment_hours,
  duration_months,
  status,
  type,
  visibility,
  created_at
)
SELECT
  auth.uid(),
  'UX Designer for Solar Customer Portal',
  'Design a mobile-first customer portal for solar microgrid users to monitor energy usage, pay bills, and request maintenance. 8-12 hours/month commitment.',
  'Remote (GMT+1 timezone preferred)',
  10,
  2,
  'active',
  'creative',
  'public',
  NOW() - INTERVAL '5 days'
WHERE auth.uid() IS NOT NULL
ON CONFLICT DO NOTHING;

INSERT INTO opportunities (
  created_by,
  title,
  description,
  location,
  time_commitment_hours,
  duration_months,
  status,
  type,
  visibility,
  created_at
)
SELECT
  auth.uid(),
  'Fundraising Advisor for Maternal Health Expansion',
  'Seeking experienced fundraiser to help secure $500K in grants for expanding maternal health clinics. Need someone with experience in health sector fundraising and grant writing.',
  'Hybrid (Lagos + Remote)',
  5,
  6,
  'active',
  'business',
  'public',
  NOW() - INTERVAL '1 week'
WHERE auth.uid() IS NOT NULL
ON CONFLICT DO NOTHING;

-- Verify the insertions
SELECT 
  id,
  title,
  type,
  location,
  time_commitment_hours,
  created_at
FROM opportunities
WHERE created_by = auth.uid()
ORDER BY created_at DESC
LIMIT 10;
