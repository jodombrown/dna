
-- Create saved_items table
CREATE TABLE public.saved_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  target_type TEXT NOT NULL CHECK (target_type IN ('post', 'event', 'opportunity')),
  target_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Prevent duplicate saves for the same item by the same user
  UNIQUE(user_id, target_type, target_id)
);

-- Enable RLS on saved_items table
ALTER TABLE public.saved_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for saved_items table
CREATE POLICY "Users can view their own saved items" ON public.saved_items
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own saved items" ON public.saved_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved items" ON public.saved_items
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_saved_items_user_id ON public.saved_items(user_id);
CREATE INDEX idx_saved_items_target ON public.saved_items(target_type, target_id);
CREATE INDEX idx_saved_items_user_target ON public.saved_items(user_id, target_type, target_id);
