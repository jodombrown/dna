
-- Create table for phase metrics data
CREATE TABLE public.phase_metrics (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    phase_slug text NOT NULL,
    label text NOT NULL,
    value text NOT NULL,
    target text,
    icon text, -- name of the Lucide icon to display (matches lucide-react imports)
    color text, -- Tailwind CSS color (e.g. bg-dna-gold)
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS for security
ALTER TABLE public.phase_metrics ENABLE ROW LEVEL SECURITY;

-- Allow anyone to select metrics
CREATE POLICY "Allow read to all" ON public.phase_metrics FOR SELECT USING (true);

-- Only allow admin users to insert metrics (WITH CHECK only)
CREATE POLICY "Admins can insert metrics"
    ON public.phase_metrics FOR INSERT
    WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Only allow admin users to update metrics
CREATE POLICY "Admins can update metrics"
    ON public.phase_metrics FOR UPDATE
    USING (public.has_role(auth.uid(), 'admin'));

-- Only allow admin users to delete metrics
CREATE POLICY "Admins can delete metrics"
    ON public.phase_metrics FOR DELETE
    USING (public.has_role(auth.uid(), 'admin'));
