ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS calendar_token uuid NOT NULL DEFAULT gen_random_uuid();

CREATE UNIQUE INDEX IF NOT EXISTS profiles_calendar_token_key
  ON public.profiles (calendar_token);

-- Backfill any existing rows that somehow have NULL (defensive)
UPDATE public.profiles SET calendar_token = gen_random_uuid() WHERE calendar_token IS NULL;