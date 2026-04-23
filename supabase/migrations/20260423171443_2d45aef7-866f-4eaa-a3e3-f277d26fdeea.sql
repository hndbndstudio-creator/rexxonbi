
-- Sequence status enum
DO $$ BEGIN
  CREATE TYPE public.sequence_status AS ENUM ('DRAFT','ACTIVE','PAUSED','COMPLETED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Outreach sequences
CREATE TABLE IF NOT EXISTS public.outreach_sequences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  signal_id uuid,
  contact_id uuid,
  steps jsonb NOT NULL DEFAULT '[]'::jsonb,
  status public.sequence_status NOT NULL DEFAULT 'DRAFT',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.outreach_sequences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Own sequence read" ON public.outreach_sequences
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Own sequence insert" ON public.outreach_sequences
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Own sequence update" ON public.outreach_sequences
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Own sequence delete" ON public.outreach_sequences
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER trg_outreach_sequences_touch
  BEFORE UPDATE ON public.outreach_sequences
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Activity events
CREATE TABLE IF NOT EXISTS public.activity_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL,
  entity_type text,
  entity_id uuid,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.activity_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Own activity read" ON public.activity_events
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Own activity insert" ON public.activity_events
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Own activity delete" ON public.activity_events
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_activity_user_created ON public.activity_events (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sequences_user ON public.outreach_sequences (user_id, created_at DESC);
