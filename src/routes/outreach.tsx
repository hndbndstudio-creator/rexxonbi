import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DashboardShell } from '@/components/dashboard-shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/use-auth';
import { Sparkles, Copy, Send, Mail, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { SIGNAL_TYPE_LABELS, getInitials } from '@/lib/types';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

export const Route = createFileRoute('/outreach')({
  component: OutreachPage,
});

type DraftRow = {
  id: string;
  signal_id: string;
  contact_id: string | null;
  subject: string;
  body: string;
  tone: 'PROFESSIONAL' | 'DIRECT' | 'CASUAL' | 'FOLLOWUP';
  persona: 'AE' | 'SDR' | 'VP_SALES' | 'AGENCY';
  status: 'PENDING' | 'EDITED' | 'SENT';
  created_at: string;
  signal?: {
    id: string;
    title: string;
    ai_insight: string;
    signal_type: string;
    company?: { name: string; domain: string } | null;
  } | null;
};

function OutreachPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data: drafts = [], isLoading } = useQuery({
    queryKey: ['outreach-drafts', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('outreach_drafts')
        .select(`*, signal:signals!outreach_drafts_signal_id_fkey(id,title,ai_insight,signal_type,company:companies!signals_company_id_fkey(name,domain))`)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as DraftRow[];
    },
  });

  const selected = drafts.find((d) => d.id === selectedId) ?? drafts[0] ?? null;

  const updateDraft = useMutation({
    mutationFn: async (patch: Partial<DraftRow> & { id: string }) => {
      const { id, ...rest } = patch;
      const { error } = await supabase
        .from('outreach_drafts')
        .update({ ...rest, status: 'EDITED' as const })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['outreach-drafts'] }),
  });

  const markSent = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('outreach_drafts').update({ status: 'SENT' as const }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Marked as sent');
      qc.invalidateQueries({ queryKey: ['outreach-drafts'] });
    },
  });

  const regenerate = useMutation({
    mutationFn: async (draft: DraftRow) => {
      const { data, error } = await supabase.functions.invoke('generate-outreach', {
        body: {
          signalId: draft.signal_id,
          contactId: draft.contact_id,
          tone: draft.tone,
          persona: draft.persona,
          draftId: draft.id,
        },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Draft regenerated');
      qc.invalidateQueries({ queryKey: ['outreach-drafts'] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : 'Failed to regenerate'),
  });

  const counts = {
    total: drafts.length,
    pending: drafts.filter((d) => d.status === 'PENDING').length,
    edited: drafts.filter((d) => d.status === 'EDITED').length,
    sent: drafts.filter((d) => d.status === 'SENT').length,
  };

  return (
    <DashboardShell>
      {/* Agent header */}
      <div className="border-b border-border bg-card/30">
        <div className="px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-brand/15 text-brand">
              <Mail className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight">Outreach Agent</h1>
                <span className="rounded-full bg-green-500/15 px-2 py-0.5 text-[10px] font-medium text-green-300">
                  Active
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Drafts hyper-relevant outreach for every signal — verified contact, buyer context, ready to send.
              </p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-6 text-xs">
            <Stat label="Drafts" value={counts.total} />
            <Stat label="Pending" value={counts.pending} accent="text-amber-300" />
            <Stat label="Edited" value={counts.edited} accent="text-blue-300" />
            <Stat label="Sent" value={counts.sent} accent="text-green-300" />
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-9rem)]">
        {/* Left panel — drafts list */}
        <aside className="w-80 shrink-0 border-r border-border bg-card/30 overflow-y-auto">
          <div className="sticky top-0 z-10 border-b border-border bg-card/80 backdrop-blur px-4 py-3">
            <h2 className="text-sm font-semibold">All drafts</h2>
            <p className="text-xs text-muted-foreground">{drafts.length} total</p>
          </div>
          {isLoading ? (
            <div className="p-4 text-sm text-muted-foreground">Loading…</div>
          ) : drafts.length === 0 ? (
            <div className="p-6 text-center">
              <Mail className="mx-auto h-8 w-8 text-muted-foreground/40" />
              <p className="mt-2 text-sm text-muted-foreground">No drafts yet.</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Click "Draft Outreach" on a signal to create one.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {drafts.map((d) => (
                <button
                  key={d.id}
                  onClick={() => setSelectedId(d.id)}
                  className={cn(
                    'w-full text-left px-4 py-3 hover:bg-accent/40 transition-colors',
                    selected?.id === d.id && 'bg-accent/60'
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-medium text-sm truncate">{d.signal?.company?.name ?? 'Unknown'}</div>
                    <StatusBadge status={d.status} />
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground truncate">{d.subject}</div>
                  <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                      {SIGNAL_TYPE_LABELS[d.signal?.signal_type as keyof typeof SIGNAL_TYPE_LABELS] ?? d.signal?.signal_type}
                    </Badge>
                    <span>{formatDistanceToNow(new Date(d.created_at), { addSuffix: true })}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </aside>

        {/* Right panel — editor */}
        <div className="flex-1 overflow-y-auto">
          {!selected ? (
            <div className="flex h-full items-center justify-center p-8 text-center">
              <div className="max-w-md">
                <Mail className="mx-auto h-12 w-12 text-muted-foreground/30" />
                <h3 className="mt-4 text-lg font-semibold">Your Outreach Agent is ready</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  When you draft from a signal, the agent writes opener, body, and CTA tuned to the buying moment.
                  Pick a draft on the left to review and send.
                </p>
              </div>
            </div>
          ) : (
            <DraftEditor
              key={selected.id}
              draft={selected}
              onSave={(patch) => updateDraft.mutate({ id: selected.id, ...patch })}
              onRegenerate={() => regenerate.mutate(selected)}
              onSend={() => markSent.mutate(selected.id)}
              regenerating={regenerate.isPending}
            />
          )}
        </div>
      </div>
    </DashboardShell>
  );
}

function Stat({ label, value, accent }: { label: string; value: number; accent?: string }) {
  return (
    <div className="flex items-baseline gap-1.5">
      <span className={cn('font-bold tabular-nums text-base', accent ?? 'text-foreground')}>{value}</span>
      <span className="text-muted-foreground">{label}</span>
    </div>
  );
}

function StatusBadge({ status }: { status: DraftRow['status'] }) {
  const map = {
    PENDING: 'bg-muted text-muted-foreground',
    EDITED: 'bg-amber-500/15 text-amber-300',
    SENT: 'bg-green-500/15 text-green-300',
  };
  return (
    <span className={cn('rounded px-1.5 py-0.5 text-[10px] font-medium', map[status])}>
      {status}
    </span>
  );
}

function DraftEditor({
  draft,
  onSave,
  onRegenerate,
  onSend,
  regenerating,
}: {
  draft: DraftRow;
  onSave: (patch: Partial<DraftRow>) => void;
  onRegenerate: () => void;
  onSend: () => void;
  regenerating: boolean;
}) {
  const [subject, setSubject] = useState(draft.subject);
  const [body, setBody] = useState(draft.body);
  const [tone, setTone] = useState(draft.tone);
  const [persona, setPersona] = useState(draft.persona);

  const copy = async () => {
    await navigator.clipboard.writeText(`Subject: ${subject}\n\n${body}`);
    toast.success('Copied to clipboard');
  };

  return (
    <div className="mx-auto max-w-3xl p-6 space-y-5">
      {/* Signal context */}
      <div className="rounded-lg border border-border bg-card/50 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-brand/15 text-xs font-semibold text-brand">
            {getInitials(draft.signal?.company?.name ?? '?')}
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-semibold text-sm">{draft.signal?.company?.name}</div>
            <div className="text-xs text-muted-foreground">{draft.signal?.title}</div>
          </div>
          <Badge variant="outline">
            {SIGNAL_TYPE_LABELS[draft.signal?.signal_type as keyof typeof SIGNAL_TYPE_LABELS] ?? draft.signal?.signal_type}
          </Badge>
        </div>
        <p className="mt-3 text-xs text-muted-foreground leading-relaxed">{draft.signal?.ai_insight}</p>
      </div>

      {/* Tone & persona */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Tone</label>
          <Select value={tone} onValueChange={(v) => { setTone(v as DraftRow['tone']); onSave({ tone: v as DraftRow['tone'] }); }}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="PROFESSIONAL">Professional</SelectItem>
              <SelectItem value="DIRECT">Direct</SelectItem>
              <SelectItem value="CASUAL">Casual</SelectItem>
              <SelectItem value="FOLLOWUP">Follow-up</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Persona</label>
          <Select value={persona} onValueChange={(v) => { setPersona(v as DraftRow['persona']); onSave({ persona: v as DraftRow['persona'] }); }}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="AE">Account Executive</SelectItem>
              <SelectItem value="SDR">SDR</SelectItem>
              <SelectItem value="VP_SALES">VP Sales</SelectItem>
              <SelectItem value="AGENCY">Agency</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Subject */}
      <div>
        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Subject</label>
        <Input value={subject} onChange={(e) => setSubject(e.target.value)} onBlur={() => onSave({ subject })} />
      </div>

      {/* Body */}
      <div>
        <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Body</label>
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onBlur={() => onSave({ body })}
          rows={14}
          className="font-mono text-sm"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between gap-2 pt-2">
        <Button variant="outline" onClick={onRegenerate} disabled={regenerating}>
          {regenerating ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
          Regenerate
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={copy}>
            <Copy className="mr-2 h-4 w-4" />
            Copy
          </Button>
          <Button onClick={onSend} disabled={draft.status === 'SENT'}>
            <Send className="mr-2 h-4 w-4" />
            {draft.status === 'SENT' ? 'Sent' : 'Mark sent'}
          </Button>
        </div>
      </div>
    </div>
  );
}
