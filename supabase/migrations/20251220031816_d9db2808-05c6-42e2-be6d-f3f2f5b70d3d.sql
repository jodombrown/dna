-- Generate unsubscribe tokens for existing users without one
UPDATE public.adin_preferences
SET unsubscribe_token = gen_random_uuid()
WHERE unsubscribe_token IS NULL;

-- Update the trigger function to also generate unsubscribe token
CREATE OR REPLACE FUNCTION public.handle_new_user_adin_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.adin_preferences (
    user_id, 
    email_enabled, 
    in_app_enabled,
    email_connections,
    email_comments,
    email_reactions,
    email_mentions,
    email_messages,
    email_events,
    email_stories,
    unsubscribe_token
  )
  VALUES (
    NEW.id, 
    true, 
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    true,
    gen_random_uuid()
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;