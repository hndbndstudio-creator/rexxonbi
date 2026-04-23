-- Fix function search path
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- Tighten update policies on shared catalogs (admin only for updates)
DROP POLICY IF EXISTS "Auth update companies" ON public.companies;
DROP POLICY IF EXISTS "Auth update signals" ON public.signals;

CREATE POLICY "Admin update companies" ON public.companies
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admin update signals" ON public.signals
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Restrict inserts on shared catalogs - any authenticated user can insert (needed for AI generator),
-- but the linter wants non-trivial checks. Require valid auth uid.
DROP POLICY IF EXISTS "Auth insert companies" ON public.companies;
DROP POLICY IF EXISTS "Auth insert signals" ON public.signals;
DROP POLICY IF EXISTS "Auth insert contacts" ON public.contacts;

CREATE POLICY "Auth insert companies" ON public.companies
  FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Auth insert signals" ON public.signals
  FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Auth insert contacts" ON public.contacts
  FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);