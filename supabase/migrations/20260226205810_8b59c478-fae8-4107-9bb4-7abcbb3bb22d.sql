
-- Create introductions table for tracking warm introductions
CREATE TABLE public.introductions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  introducer_id UUID NOT NULL REFERENCES public.profiles(id),
  person_a_id UUID NOT NULL REFERENCES public.profiles(id),
  person_b_id UUID NOT NULL REFERENCES public.profiles(id),
  conversation_id UUID REFERENCES public.conversations_new(id),
  intro_type TEXT NOT NULL DEFAULT 'group' CHECK (intro_type IN ('group', 'separate')),
  status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'accepted', 'connected')),
  message TEXT,
  context JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_introductions_introducer ON public.introductions(introducer_id);
CREATE INDEX idx_introductions_persons ON public.introductions(person_a_id, person_b_id);

-- Enable RLS
ALTER TABLE public.introductions ENABLE ROW LEVEL SECURITY;

-- Users can view introductions they're involved in
CREATE POLICY "Users can view their introductions"
  ON public.introductions FOR SELECT
  USING (auth.uid() IN (introducer_id, person_a_id, person_b_id));

-- Users can create introductions as the introducer
CREATE POLICY "Users can create introductions"
  ON public.introductions FOR INSERT
  WITH CHECK (auth.uid() = introducer_id);

-- Introducer can update their introductions
CREATE POLICY "Introducer can update introductions"
  ON public.introductions FOR UPDATE
  USING (auth.uid() = introducer_id);
