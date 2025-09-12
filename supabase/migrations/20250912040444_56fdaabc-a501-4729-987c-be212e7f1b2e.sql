-- Enhance profiles table for African Diaspora networking
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS connection_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS profile_views_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS headline TEXT,
ADD COLUMN IF NOT EXISTS professional_summary TEXT,
ADD COLUMN IF NOT EXISTS networking_goals TEXT[],
ADD COLUMN IF NOT EXISTS diaspora_story TEXT,
ADD COLUMN IF NOT EXISTS mentorship_offering BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS seeking_mentorship BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS open_to_opportunities BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS profile_completion_score INTEGER DEFAULT 0;

-- Update profile completion score function
CREATE OR REPLACE FUNCTION calculate_profile_completion_score(profile_id UUID)
RETURNS INTEGER AS $$
DECLARE
    score INTEGER := 0;
    profile_record RECORD;
BEGIN
    SELECT * INTO profile_record FROM profiles WHERE id = profile_id;
    
    -- Basic info (30 points)
    IF profile_record.full_name IS NOT NULL AND LENGTH(profile_record.full_name) > 0 THEN
        score := score + 10;
    END IF;
    
    IF profile_record.bio IS NOT NULL AND LENGTH(profile_record.bio) > 50 THEN
        score := score + 10;
    END IF;
    
    IF profile_record.headline IS NOT NULL AND LENGTH(profile_record.headline) > 0 THEN
        score := score + 10;
    END IF;
    
    -- Professional info (40 points)
    IF profile_record.profession IS NOT NULL AND LENGTH(profile_record.profession) > 0 THEN
        score := score + 10;
    END IF;
    
    IF profile_record.company IS NOT NULL AND LENGTH(profile_record.company) > 0 THEN
        score := score + 10;
    END IF;
    
    IF profile_record.skills IS NOT NULL AND array_length(profile_record.skills, 1) >= 3 THEN
        score := score + 20;
    END IF;
    
    -- Diaspora info (30 points)
    IF profile_record.country_of_origin IS NOT NULL AND LENGTH(profile_record.country_of_origin) > 0 THEN
        score := score + 10;
    END IF;
    
    IF profile_record.location IS NOT NULL AND LENGTH(profile_record.location) > 0 THEN
        score := score + 10;
    END IF;
    
    IF profile_record.diaspora_story IS NOT NULL AND LENGTH(profile_record.diaspora_story) > 0 THEN
        score := score + 10;
    END IF;
    
    RETURN score;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update completion score
CREATE OR REPLACE FUNCTION update_profile_completion_score()
RETURNS TRIGGER AS $$
BEGIN
    NEW.profile_completion_score := calculate_profile_completion_score(NEW.id);
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_profile_completion ON profiles;
CREATE TRIGGER trigger_update_profile_completion
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_profile_completion_score();