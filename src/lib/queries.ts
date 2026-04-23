import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

export type CompanyRow = Database['public']['Tables']['companies']['Row'];
export type SignalRow = Database['public']['Tables']['signals']['Row'];
export type ContactRow = Database['public']['Tables']['contacts']['Row'];

export type SignalWithRelations = SignalRow & {
  company: Pick<CompanyRow, 'id' | 'name' | 'domain' | 'industry' | 'employee_range' | 'hq_city' | 'hq_country' | 'funding_stage'> | null;
  hiring_manager: Pick<ContactRow, 'id' | 'first_name' | 'last_name' | 'title' | 'email'> | null;
};

export async function fetchSignals(opts: {
  type?: string;
  minConfidence?: number;
  companyId?: string;
  limit?: number;
}): Promise<SignalWithRelations[]> {
  let q = supabase
    .from('signals')
    .select(
      `*,
       company:companies!signals_company_id_fkey(id,name,domain,industry,employee_range,hq_city,hq_country,funding_stage),
       hiring_manager:contacts!signals_hiring_manager_fk(id,first_name,last_name,title,email)`
    )
    .order('published_at', { ascending: false })
    .limit(opts.limit ?? 50);

  if (opts.type && opts.type !== 'ALL') q = q.eq('signal_type', opts.type as any);
  if (opts.minConfidence) q = q.gte('confidence_score', opts.minConfidence);
  if (opts.companyId) q = q.eq('company_id', opts.companyId);

  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as unknown as SignalWithRelations[];
}

export async function fetchCompanies(opts: { search?: string; industry?: string; limit?: number }) {
  let q = supabase
    .from('companies')
    .select('*')
    .order('name', { ascending: true })
    .limit(opts.limit ?? 100);

  if (opts.search) q = q.ilike('name', `%${opts.search}%`);
  if (opts.industry && opts.industry !== 'ALL') q = q.eq('industry', opts.industry);

  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

export async function fetchCompanyById(id: string) {
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function fetchCompanySignalCounts() {
  const { data, error } = await supabase.from('signals').select('company_id,published_at');
  if (error) throw error;
  const counts = new Map<string, { count: number; latest: string }>();
  (data ?? []).forEach((s) => {
    const cur = counts.get(s.company_id);
    if (!cur || s.published_at > cur.latest) {
      counts.set(s.company_id, { count: (cur?.count ?? 0) + 1, latest: s.published_at });
    } else {
      counts.set(s.company_id, { count: cur.count + 1, latest: cur.latest });
    }
  });
  return counts;
}

export async function fetchContacts(opts: { companyId?: string; search?: string; limit?: number }) {
  let q = supabase
    .from('contacts')
    .select('*, company:companies!contacts_company_id_fkey(id,name,domain)')
    .order('created_at', { ascending: false })
    .limit(opts.limit ?? 100);
  if (opts.companyId) q = q.eq('company_id', opts.companyId);
  if (opts.search) q = q.or(`first_name.ilike.%${opts.search}%,last_name.ilike.%${opts.search}%`);
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

export async function fetchMonitoredAccountIds(userId: string) {
  const { data, error } = await supabase
    .from('monitored_accounts')
    .select('company_id')
    .eq('user_id', userId);
  if (error) throw error;
  return new Set((data ?? []).map((r) => r.company_id));
}

export async function toggleMonitor(userId: string, companyId: string, on: boolean) {
  if (on) {
    const { error } = await supabase
      .from('monitored_accounts')
      .insert({ user_id: userId, company_id: companyId });
    if (error && !/duplicate/i.test(error.message)) throw error;
  } else {
    const { error } = await supabase
      .from('monitored_accounts')
      .delete()
      .eq('user_id', userId)
      .eq('company_id', companyId);
    if (error) throw error;
  }
}

export async function fetchRevealedFields(userId: string) {
  const { data, error } = await supabase
    .from('revealed_contacts')
    .select('contact_id,field')
    .eq('user_id', userId);
  if (error) throw error;
  const map = new Map<string, Set<string>>();
  (data ?? []).forEach((r) => {
    const set = map.get(r.contact_id) ?? new Set();
    set.add(r.field);
    map.set(r.contact_id, set);
  });
  return map;
}

export async function revealField(userId: string, contactId: string, field: 'email' | 'phone') {
  const { error } = await supabase
    .from('revealed_contacts')
    .insert({ user_id: userId, contact_id: contactId, field });
  if (error && !/duplicate/i.test(error.message)) throw error;
}
