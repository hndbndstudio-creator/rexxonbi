import { supabase } from '@/integrations/supabase/client';

export type ActivityType =
  | 'SIGNAL_CLAIMED'
  | 'SIGNAL_DISMISSED'
  | 'DRAFT_CREATED'
  | 'DRAFT_SENT'
  | 'BRIEF_GENERATED'
  | 'SEQUENCE_STARTED'
  | 'CRM_PUSHED'
  | 'CSV_EXPORTED'
  | 'CONTACT_REVEALED'
  | 'ACCOUNT_MONITORED';

export type ActivityEvent = {
  id: string;
  user_id: string;
  type: ActivityType;
  entity_type: string | null;
  entity_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
};

export async function logActivity(
  userId: string,
  type: ActivityType,
  opts: { entity_type?: string; entity_id?: string; metadata?: Record<string, unknown> } = {}
) {
  // Fire-and-forget: never block UI on activity logging.
  try {
    await (supabase.from('activity_events' as any) as any).insert({
      user_id: userId,
      type,
      entity_type: opts.entity_type ?? null,
      entity_id: opts.entity_id ?? null,
      metadata: opts.metadata ?? {},
    });
  } catch {
    // swallow
  }
}

export async function fetchActivity(userId: string, limit = 25): Promise<ActivityEvent[]> {
  const { data, error } = await (supabase.from('activity_events' as any) as any)
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as ActivityEvent[];
}

export const ACTIVITY_LABELS: Record<ActivityType, string> = {
  SIGNAL_CLAIMED: 'Claimed a signal',
  SIGNAL_DISMISSED: 'Dismissed a signal',
  DRAFT_CREATED: 'Drafted outreach',
  DRAFT_SENT: 'Marked draft as sent',
  BRIEF_GENERATED: 'Generated AI brief',
  SEQUENCE_STARTED: 'Started a sequence',
  CRM_PUSHED: 'Pushed to CRM',
  CSV_EXPORTED: 'Exported CSV',
  CONTACT_REVEALED: 'Revealed a contact',
  ACCOUNT_MONITORED: 'Toggled monitor',
};
