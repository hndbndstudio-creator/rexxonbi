-- Add cascading FKs on user_id columns where missing (safe: no data changes)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='profiles_user_id_fkey') THEN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='campaigns_user_id_fkey') THEN
    ALTER TABLE public.campaigns ADD CONSTRAINT campaigns_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='rfps_user_id_fkey') THEN
    ALTER TABLE public.rfps ADD CONSTRAINT rfps_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='meetings_user_id_fkey') THEN
    ALTER TABLE public.meetings ADD CONSTRAINT meetings_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='monitored_accounts_user_id_fkey') THEN
    ALTER TABLE public.monitored_accounts ADD CONSTRAINT monitored_accounts_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='revealed_contacts_user_id_fkey') THEN
    ALTER TABLE public.revealed_contacts ADD CONSTRAINT revealed_contacts_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='outreach_drafts_user_id_fkey') THEN
    ALTER TABLE public.outreach_drafts ADD CONSTRAINT outreach_drafts_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='outreach_sequences_user_id_fkey') THEN
    ALTER TABLE public.outreach_sequences ADD CONSTRAINT outreach_sequences_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='outreach_sequences_signal_id_fkey') THEN
    ALTER TABLE public.outreach_sequences ADD CONSTRAINT outreach_sequences_signal_id_fkey FOREIGN KEY (signal_id) REFERENCES public.signals(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='outreach_sequences_contact_id_fkey') THEN
    ALTER TABLE public.outreach_sequences ADD CONSTRAINT outreach_sequences_contact_id_fkey FOREIGN KEY (contact_id) REFERENCES public.contacts(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='activity_events_user_id_fkey') THEN
    ALTER TABLE public.activity_events ADD CONSTRAINT activity_events_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='territories_user_id_fkey') THEN
    ALTER TABLE public.territories ADD CONSTRAINT territories_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='workspace_settings_updated_by_fkey') THEN
    ALTER TABLE public.workspace_settings ADD CONSTRAINT workspace_settings_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
END$$;

-- Helpful indexes for common query paths
CREATE INDEX IF NOT EXISTS idx_signals_company_id ON public.signals(company_id);
CREATE INDEX IF NOT EXISTS idx_signals_published_at ON public.signals(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_contacts_company_id ON public.contacts(company_id);
CREATE INDEX IF NOT EXISTS idx_monitored_accounts_user_id ON public.monitored_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_monitored_accounts_company_id ON public.monitored_accounts(company_id);
CREATE INDEX IF NOT EXISTS idx_revealed_contacts_user_id ON public.revealed_contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_outreach_drafts_user_id ON public.outreach_drafts(user_id);
CREATE INDEX IF NOT EXISTS idx_outreach_drafts_signal_id ON public.outreach_drafts(signal_id);
CREATE INDEX IF NOT EXISTS idx_activity_events_user_id ON public.activity_events(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_events_created_at ON public.activity_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_meetings_user_id ON public.meetings(user_id);
CREATE INDEX IF NOT EXISTS idx_meetings_scheduled_at ON public.meetings(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_campaigns_user_id ON public.campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_companies_industry ON public.companies(industry);
CREATE INDEX IF NOT EXISTS idx_companies_name ON public.companies(name);