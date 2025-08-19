-- Fix security warning: Set explicit search_path for track_skill_changes function
CREATE OR REPLACE FUNCTION public.track_skill_changes()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    old_skills TEXT[];
    new_skills TEXT[];
    added_skills TEXT[];
    removed_skills TEXT[];
    skill TEXT;
BEGIN
    -- Get old and new skills
    old_skills := COALESCE(OLD.skills, ARRAY[]::TEXT[]);
    new_skills := COALESCE(NEW.skills, ARRAY[]::TEXT[]);
    
    -- Find added skills
    SELECT ARRAY(
        SELECT unnest(new_skills)
        EXCEPT
        SELECT unnest(old_skills)
    ) INTO added_skills;
    
    -- Find removed skills
    SELECT ARRAY(
        SELECT unnest(old_skills)
        EXCEPT
        SELECT unnest(new_skills)
    ) INTO removed_skills;
    
    -- Track added skills
    FOREACH skill IN ARRAY added_skills
    LOOP
        INSERT INTO public.skill_analytics (skill_name, user_id, action_type, profile_updated_at)
        VALUES (skill, NEW.id, 'added', now());
    END LOOP;
    
    -- Track removed skills
    FOREACH skill IN ARRAY removed_skills
    LOOP
        INSERT INTO public.skill_analytics (skill_name, user_id, action_type, profile_updated_at)
        VALUES (skill, NEW.id, 'removed', now());
    END LOOP;
    
    RETURN NEW;
END;
$function$