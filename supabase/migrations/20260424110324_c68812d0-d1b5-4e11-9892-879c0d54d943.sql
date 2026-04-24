-- Campaigns: creator-owned workspaces with filters, team, and goals
CREATE TABLE public.campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  sector text,
  color text NOT NULL DEFAULT 'blue',
  filters jsonb NOT NULL DEFAULT '{}'::jsonb,
  assignees uuid[] NOT NULL DEFAULT '{}'::uuid[],
  goal_claims integer NOT NULL DEFAULT 0,
  goal_meetings integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'ACTIVE',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

-- Creator full access
CREATE POLICY "Owner read campaigns" ON public.campaigns
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Owner insert campaigns" ON public.campaigns
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owner update campaigns" ON public.campaigns
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owner delete campaigns" ON public.campaigns
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- All authenticated users can read (read-only sharing)
CREATE POLICY "Auth read all campaigns" ON public.campaigns
  FOR SELECT TO authenticated USING (true);

-- Admins read all
CREATE POLICY "Admins read all campaigns" ON public.campaigns
  FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER campaigns_updated_at
  BEFORE UPDATE ON public.campaigns
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE INDEX idx_campaigns_user ON public.campaigns(user_id);
CREATE INDEX idx_campaigns_status ON public.campaigns(status);