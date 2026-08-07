ALTER TABLE public._bd279_p4b_archive ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public._bd279_p4b_archive FROM anon, authenticated;
GRANT ALL ON public._bd279_p4b_archive TO service_role;
DROP POLICY IF EXISTS "Admins only: p4b archive" ON public._bd279_p4b_archive;
CREATE POLICY "Admins only: p4b archive"
ON public._bd279_p4b_archive
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));