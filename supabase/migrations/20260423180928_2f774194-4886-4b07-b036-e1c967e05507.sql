-- 1. Replace the new-user role trigger to auto-promote the first signup
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_count int;
BEGIN
  SELECT count(*) INTO user_count FROM public.user_roles;
  IF user_count = 0 THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  END IF;
  RETURN NEW;
END;
$$;

-- 2. Workspace settings (single-row config controlled by admin)
CREATE TABLE IF NOT EXISTS public.workspace_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  default_ai_model text NOT NULL DEFAULT 'google/gemini-2.5-flash',
  slack_enabled boolean NOT NULL DEFAULT false,
  slack_default_channel text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid
);

-- Seed a single row so we always have settings to read
INSERT INTO public.workspace_settings (default_ai_model)
SELECT 'google/gemini-2.5-flash'
WHERE NOT EXISTS (SELECT 1 FROM public.workspace_settings);

ALTER TABLE public.workspace_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins read workspace settings"
ON public.workspace_settings
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update workspace settings"
ON public.workspace_settings
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER touch_workspace_settings_updated_at
BEFORE UPDATE ON public.workspace_settings
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- 3. Allow admins to view all profiles (for super-user dashboard)
CREATE POLICY "Admins view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 4. Allow admins to view all user_roles (so they can manage them)
CREATE POLICY "Admins view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 5. Allow admins to view all activity events for analytics
CREATE POLICY "Admins read all activity"
ON public.activity_events
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 6. Allow admins to view all outreach drafts (counts)
CREATE POLICY "Admins read all outreach"
ON public.outreach_drafts
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));