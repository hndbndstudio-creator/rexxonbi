-- Create rfps table for both buyer-issued and vendor-response RFPs
CREATE TABLE public.rfps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  mode text NOT NULL DEFAULT 'BUYER' CHECK (mode IN ('BUYER', 'VENDOR_RESPONSE')),
  title text NOT NULL,
  industry text NOT NULL DEFAULT 'IT',
  -- Wizard inputs (denormalized for easy editing)
  inputs jsonb NOT NULL DEFAULT '{}'::jsonb,
  -- Generated structured content
  content jsonb,
  generated_at timestamp with time zone,
  status text NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'GENERATED', 'FINALIZED')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.rfps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Own rfps read" ON public.rfps FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Own rfps insert" ON public.rfps FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Own rfps update" ON public.rfps FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Own rfps delete" ON public.rfps FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins read all rfps" ON public.rfps FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER rfps_touch_updated_at
BEFORE UPDATE ON public.rfps
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE INDEX idx_rfps_user_created ON public.rfps(user_id, created_at DESC);