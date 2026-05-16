-- 1. Campaigns: remove permissive cross-user read
DROP POLICY IF EXISTS "Auth read all campaigns" ON public.campaigns;

-- 2. Contacts: restrict reads to admins (PII protection)
DROP POLICY IF EXISTS "Auth read contacts" ON public.contacts;
CREATE POLICY "Admins read contacts"
ON public.contacts
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 3. Lock down inserts on shared tables to admins only
DROP POLICY IF EXISTS "Auth insert companies" ON public.companies;
CREATE POLICY "Admins insert companies"
ON public.companies
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Auth insert contacts" ON public.contacts;
CREATE POLICY "Admins insert contacts"
ON public.contacts
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Auth insert signals" ON public.signals;
CREATE POLICY "Admins insert signals"
ON public.signals
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 4. Revoke public EXECUTE on SECURITY DEFINER helpers
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.has_active_subscription(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.has_active_subscription(uuid, text) TO authenticated, service_role;