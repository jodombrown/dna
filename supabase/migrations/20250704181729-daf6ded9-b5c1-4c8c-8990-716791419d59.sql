-- Add missing RLS policy for communities table
CREATE POLICY "Communities are viewable by everyone" 
ON public.communities 
FOR SELECT 
USING (is_active = true);

-- Add missing RLS policies for events table  
CREATE POLICY "Users can update own events" 
ON public.events 
FOR UPDATE 
USING (auth.uid() = created_by);

CREATE POLICY "Users can delete own events" 
ON public.events 
FOR DELETE 
USING (auth.uid() = created_by);