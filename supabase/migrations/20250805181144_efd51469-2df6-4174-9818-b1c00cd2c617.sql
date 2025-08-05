-- Fix Auth RLS Initialization Plan issues and Multiple Permissive Policies

-- Fix profiles table RLS policy performance issue
DROP POLICY IF EXISTS "Profiles visibility policy" ON public.profiles;
CREATE POLICY "Profiles visibility policy" 
ON public.profiles 
FOR SELECT 
USING (
  is_public = true 
  OR (SELECT auth.uid()) = id 
  OR is_admin_user((SELECT auth.uid()))
);

-- Fix conversations table RLS policies
-- First drop the existing policies
DROP POLICY IF EXISTS "Conversation creation policy" ON public.conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON public.conversations;

-- Create a single optimized INSERT policy for conversations
CREATE POLICY "Users can create conversations with message access" 
ON public.conversations 
FOR INSERT 
WITH CHECK (
  can_send_messages((SELECT auth.uid())) = true 
  AND ((SELECT auth.uid()) = user_1_id OR (SELECT auth.uid()) = user_2_id)
);

-- Update other conversation policies to use SELECT auth.uid()
DROP POLICY IF EXISTS "Users can view their own conversations" ON public.conversations;
CREATE POLICY "Users can view their own conversations" 
ON public.conversations 
FOR SELECT 
USING (
  (SELECT auth.uid()) = user_1_id 
  OR (SELECT auth.uid()) = user_2_id
);

DROP POLICY IF EXISTS "Users can update their own conversations" ON public.conversations;
CREATE POLICY "Users can update their own conversations" 
ON public.conversations 
FOR UPDATE 
USING (
  (SELECT auth.uid()) = user_1_id 
  OR (SELECT auth.uid()) = user_2_id
);