import { supabase } from '@/integrations/supabase/client';

export type SequenceStep = {
  day_offset: number;
  subject: string;
  body: string;
};

export type SequenceStatus = 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED';

export type SequenceRow = {
  id: string;
  user_id: string;
  name: string;
  signal_id: string | null;
  contact_id: string | null;
  steps: SequenceStep[];
  status: SequenceStatus;
  created_at: string;
  updated_at: string;
};

export async function fetchSequences(userId: string): Promise<SequenceRow[]> {
  const { data, error } = await (supabase.from('outreach_sequences' as any) as any)
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as SequenceRow[];
}

export async function setSequenceStatus(id: string, status: SequenceStatus) {
  const { error } = await (supabase.from('outreach_sequences' as any) as any)
    .update({ status })
    .eq('id', id);
  if (error) throw error;
}

export async function deleteSequence(id: string) {
  const { error } = await (supabase.from('outreach_sequences' as any) as any).delete().eq('id', id);
  if (error) throw error;
}
