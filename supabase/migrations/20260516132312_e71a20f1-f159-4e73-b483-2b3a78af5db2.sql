CREATE TABLE public.knowledge_docs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  size INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.knowledge_docs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Own knowledge read"
ON public.knowledge_docs FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Own knowledge insert"
ON public.knowledge_docs FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Own knowledge delete"
ON public.knowledge_docs FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

CREATE INDEX idx_knowledge_docs_user ON public.knowledge_docs(user_id, created_at DESC);