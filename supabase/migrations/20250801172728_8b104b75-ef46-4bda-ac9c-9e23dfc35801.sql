-- Fix function search path security warnings
-- Setting search_path to 'public' for security

-- Fix handle_referral_signup function
CREATE OR REPLACE FUNCTION public.handle_referral_signup(new_user_id uuid, referral_code_param text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  invite_record RECORD;
BEGIN
  -- Find the invite by referral code
  SELECT * INTO invite_record 
  FROM public.invites 
  WHERE referral_code = referral_code_param 
    AND status = 'pending' 
    AND expires_at > NOW();
  
  IF invite_record IS NOT NULL THEN
    -- Update the invite as used
    UPDATE public.invites 
    SET 
      status = 'used',
      used_by_id = new_user_id,
      used_at = NOW(),
      updated_at = NOW()
    WHERE id = invite_record.id;
    
    -- Update the new user's profile with referrer info
    UPDATE public.profiles 
    SET referrer_id = invite_record.referrer_id
    WHERE id = new_user_id;
    
    -- Award points to referrer
    INSERT INTO public.impact_log (user_id, type, target_type, target_id, pillar, points)
    VALUES (invite_record.referrer_id, 'referral', 'user', new_user_id, 'connect', 10);
  END IF;
END;
$function$;

-- Fix update_username function
CREATE OR REPLACE FUNCTION public.update_username(new_username text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  current_changes INTEGER;
BEGIN
  -- Check limit
  SELECT username_changes_left INTO current_changes 
  FROM profiles 
  WHERE id = auth.uid();

  IF current_changes <= 0 THEN
    RAISE EXCEPTION 'Username can no longer be changed';
  END IF;

  -- Update username and decrement counter
  UPDATE profiles
  SET username = new_username,
      username_changes_left = username_changes_left - 1
  WHERE id = auth.uid();
END;
$function$;

-- Fix update_group_conversation_last_message function
CREATE OR REPLACE FUNCTION public.update_group_conversation_last_message()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.group_conversations 
  SET last_message_at = NEW.created_at, updated_at = NEW.created_at
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$function$;