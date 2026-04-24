import { supabase } from '@/integrations/supabase/client';
import type { SignalType } from '@/lib/types';

export type CampaignFilters = {
  signal_types?: SignalType[];
  min_confidence?: number;
  industries?: string[];
  geographies?: string[];
  employee_min?: number | null;
  employee_max?: number | null;
  role_categories?: string[];
  seniority_levels?: string[];
  named_domains?: string[];
};

export type CampaignRow = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  sector: string | null;
  color: string;
  filters: CampaignFilters;
  assignees: string[];
  goal_claims: number;
  goal_meetings: number;
  status: 'ACTIVE' | 'PAUSED' | 'ARCHIVED';
  created_at: string;
  updated_at: string;
};

export const CAMPAIGN_COLORS = [
  { value: 'blue', label: 'Blue', class: 'bg-blue-500' },
  { value: 'green', label: 'Green', class: 'bg-emerald-500' },
  { value: 'purple', label: 'Purple', class: 'bg-purple-500' },
  { value: 'amber', label: 'Amber', class: 'bg-amber-500' },
  { value: 'rose', label: 'Rose', class: 'bg-rose-500' },
  { value: 'cyan', label: 'Cyan', class: 'bg-cyan-500' },
] as const;

export const SECTOR_PRESETS = [
  'Enterprise',
  'Mid-Market',
  'SMB',
  'Federal / Public Sector',
  'Healthcare',
  'FinServ',
  'Tech / Software',
  'Retail / eCom',
  'Manufacturing',
];

export async function fetchCampaigns(): Promise<CampaignRow[]> {
  const { data, error } = await supabase
    .from('campaigns' as any)
    .select('*')
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as CampaignRow[];
}

export async function createCampaign(
  userId: string,
  payload: Omit<CampaignRow, 'id' | 'user_id' | 'created_at' | 'updated_at'>
) {
  const { data, error } = await supabase
    .from('campaigns' as any)
    .insert({ ...payload, user_id: userId })
    .select('*')
    .single();
  if (error) throw error;
  return data as unknown as CampaignRow;
}

export async function updateCampaign(id: string, patch: Partial<CampaignRow>) {
  const { data, error } = await supabase
    .from('campaigns' as any)
    .update(patch)
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;
  return data as unknown as CampaignRow;
}

export async function deleteCampaign(id: string) {
  const { error } = await supabase.from('campaigns' as any).delete().eq('id', id);
  if (error) throw error;
}

/** Compute progress against goals from existing signals/meetings. */
export async function fetchCampaignProgress(filters: CampaignFilters) {
  // Claims: signals matching filters with status CLAIMED
  let q = supabase.from('signals').select('id,status,confidence_score,signal_type,role_category,seniority_level', { count: 'exact', head: false });
  if (filters.signal_types?.length) q = q.in('signal_type', filters.signal_types as any);
  if (filters.min_confidence) q = q.gte('confidence_score', filters.min_confidence);
  if (filters.role_categories?.length) q = q.in('role_category', filters.role_categories);
  if (filters.seniority_levels?.length) q = q.in('seniority_level', filters.seniority_levels as any);
  const { data, error } = await q.limit(500);
  if (error) throw error;
  const claims = (data ?? []).filter((s: any) => s.status === 'CLAIMED').length;
  return { claims, meetings: 0 };
}
