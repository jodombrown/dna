-- Drop the strict completion constraint to allow flexible onboarding
ALTER TABLE profiles 
DROP CONSTRAINT IF EXISTS profiles_required_on_completion;

-- We'll add proper field-level validation in the application layer instead