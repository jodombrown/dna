-- Fix remaining RLS policies for performance optimization

-- organization_verification_requests - Admins can manage verification requests
DROP POLICY IF EXISTS "Admins can manage verification requests" ON public.organization_verification_requests;
CREATE POLICY "Admins can manage verification requests" ON public.organization_verification_requests
  FOR ALL USING (has_role((SELECT auth.uid()), 'admin'::app_role));

-- billing_transactions - Org owners can view their transactions
DROP POLICY IF EXISTS "Org owners can view their transactions" ON public.billing_transactions;
CREATE POLICY "Org owners can view their transactions" ON public.billing_transactions
  FOR SELECT USING (organization_id IN (
    SELECT id FROM public.organizations 
    WHERE owner_user_id = (SELECT auth.uid())
  ));

-- billing_transactions - Admins can view all transactions
DROP POLICY IF EXISTS "Admins can view all transactions" ON public.billing_transactions;
CREATE POLICY "Admins can view all transactions" ON public.billing_transactions
  FOR SELECT USING (has_role((SELECT auth.uid()), 'admin'::app_role));