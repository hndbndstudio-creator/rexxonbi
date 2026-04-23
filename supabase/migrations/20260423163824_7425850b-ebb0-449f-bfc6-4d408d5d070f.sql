-- Drop old AssetWise tables and types
DROP TABLE IF EXISTS public.asset_assignments CASCADE;
DROP TABLE IF EXISTS public.assets CASCADE;
DROP TABLE IF EXISTS public.asset_categories CASCADE;
DROP TABLE IF EXISTS public.employees CASCADE;
DROP TYPE IF EXISTS public.asset_condition CASCADE;

-- Enums for Rexxon
CREATE TYPE public.signal_type AS ENUM ('GROWTH','COMPLIANCE','TECH_EXPANSION','SALES_OPS','LEADERSHIP','FUNDING','EARNINGS');
CREATE TYPE public.signal_source AS ENUM ('LINKEDIN','INDEED','CRUNCHBASE','SEC_EDGAR','BUSINESS_WIRE','GOOGLE_NEWS','SEEKING_ALPHA','GREENHOUSE','LEVER','ISACA','CYBERSEEK');
CREATE TYPE public.signal_status AS ENUM ('NEW','CLAIMED','CONVERTED','DISMISSED');
CREATE TYPE public.seniority_level AS ENUM ('C_LEVEL','VP','DIRECTOR','MANAGER','IC');
CREATE TYPE public.outreach_tone AS ENUM ('PROFESSIONAL','DIRECT','CASUAL','FOLLOWUP');
CREATE TYPE public.outreach_persona AS ENUM ('AE','SDR','VP_SALES','AGENCY');
CREATE TYPE public.outreach_status AS ENUM ('PENDING','EDITED','SENT');

-- Companies (shared catalog)
CREATE TABLE public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  domain TEXT NOT NULL UNIQUE,
  industry TEXT,
  employee_count INTEGER,
  employee_range TEXT,
  funding_stage TEXT,
  total_funding BIGINT,
  hq_city TEXT,
  hq_state TEXT,
  hq_country TEXT NOT NULL DEFAULT 'US',
  description TEXT,
  linkedin_url TEXT,
  tech_stack TEXT[] NOT NULL DEFAULT '{}',
  brief JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Signals (shared catalog)
CREATE TABLE public.signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  signal_type public.signal_type NOT NULL,
  source public.signal_source NOT NULL,
  title TEXT NOT NULL,
  ai_insight TEXT NOT NULL,
  spend_categories TEXT[] NOT NULL DEFAULT '{}',
  vendor_suggestions TEXT[] NOT NULL DEFAULT '{}',
  confidence_score INTEGER NOT NULL DEFAULT 75,
  seniority_level public.seniority_level,
  role_category TEXT,
  hiring_manager_contact_id UUID,
  is_read BOOLEAN NOT NULL DEFAULT false,
  status public.signal_status NOT NULL DEFAULT 'NEW',
  published_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_signals_company ON public.signals(company_id);
CREATE INDEX idx_signals_published ON public.signals(published_at DESC);

-- Contacts (shared catalog)
CREATE TABLE public.contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  title TEXT,
  email TEXT,
  phone TEXT,
  linkedin_url TEXT,
  signal_context TEXT,
  is_enriched BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_contacts_company ON public.contacts(company_id);

-- FK from signals.hiring_manager
ALTER TABLE public.signals ADD CONSTRAINT signals_hiring_manager_fk
  FOREIGN KEY (hiring_manager_contact_id) REFERENCES public.contacts(id) ON DELETE SET NULL;

-- Per-user state tables
CREATE TABLE public.monitored_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, company_id)
);

CREATE TABLE public.revealed_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  field TEXT NOT NULL CHECK (field IN ('email','phone')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, contact_id, field)
);

CREATE TABLE public.outreach_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  signal_id UUID NOT NULL REFERENCES public.signals(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  tone public.outreach_tone NOT NULL DEFAULT 'PROFESSIONAL',
  persona public.outreach_persona NOT NULL DEFAULT 'AE',
  status public.outreach_status NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.territories (
  user_id UUID PRIMARY KEY,
  industries TEXT[] NOT NULL DEFAULT '{}',
  employee_min INTEGER,
  employee_max INTEGER,
  funding_stages TEXT[] NOT NULL DEFAULT '{}',
  geographies TEXT[] NOT NULL DEFAULT '{}',
  signal_types TEXT[] NOT NULL DEFAULT '{}',
  min_confidence INTEGER NOT NULL DEFAULT 60,
  role_categories TEXT[] NOT NULL DEFAULT '{}',
  named_domains TEXT[] NOT NULL DEFAULT '{}',
  notify_slack BOOLEAN NOT NULL DEFAULT false,
  slack_channel TEXT,
  email_digest TEXT NOT NULL DEFAULT 'DAILY',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monitored_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revealed_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outreach_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.territories ENABLE ROW LEVEL SECURITY;

-- Shared catalog: any authenticated user can read; inserts allowed for signed-in users (used by AI signal generator)
CREATE POLICY "Auth read companies" ON public.companies FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth insert companies" ON public.companies FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth update companies" ON public.companies FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Auth read signals" ON public.signals FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth insert signals" ON public.signals FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth update signals" ON public.signals FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Auth read contacts" ON public.contacts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth insert contacts" ON public.contacts FOR INSERT TO authenticated WITH CHECK (true);

-- Per-user tables
CREATE POLICY "Own monitored read" ON public.monitored_accounts FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Own monitored insert" ON public.monitored_accounts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Own monitored delete" ON public.monitored_accounts FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Own reveal read" ON public.revealed_contacts FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Own reveal insert" ON public.revealed_contacts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Own outreach read" ON public.outreach_drafts FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Own outreach insert" ON public.outreach_drafts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Own outreach update" ON public.outreach_drafts FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Own outreach delete" ON public.outreach_drafts FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Own territory read" ON public.territories FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Own territory insert" ON public.territories FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Own territory update" ON public.territories FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Update trigger for companies and outreach
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER trg_companies_updated BEFORE UPDATE ON public.companies
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER trg_outreach_updated BEFORE UPDATE ON public.outreach_drafts
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER trg_territory_updated BEFORE UPDATE ON public.territories
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();