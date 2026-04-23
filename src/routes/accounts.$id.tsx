import { createFileRoute, Link, useParams } from '@tanstack/react-router';
import { useEffect, useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/use-auth';
import { DashboardShell } from '@/components/dashboard-shell';
import {
  fetchCompanyById,
  fetchSignals,
  fetchContacts,
  fetchMonitoredAccountIds,
  fetchRevealedFields,
  toggleMonitor,
  revealField,
} from '@/lib/queries';
import { SignalCard } from '@/components/signal-card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Eye, Linkedin, Mail, Phone, Sparkles, RefreshCw, Upload, FileDown, Brain } from 'lucide-react';
import { getInitials, maskEmail, maskPhone } from '@/lib/types';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { logActivity } from '@/lib/activity';
import { downloadCSV, toCSV } from '@/lib/csv';

export const Route = createFileRoute('/accounts/$id')({
  component: AccountDetailPage,
});

type Brief = {
  summary: string;
  why_now: string;
  pain_points: string[];
  buying_committee: string[];
  conversation_starters: string[];
  competitive_risks: string[];
  generated_at?: string;
};

function AccountDetailPage() {
  return (
    <DashboardShell>
      <AccountDetail />
    </DashboardShell>
  );
}

function AccountDetail() {
  const { id } = useParams({ from: '/accounts/$id' });
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: company, isLoading } = useQuery({
    queryKey: ['company', id],
    queryFn: () => fetchCompanyById(id),
  });

  const { data: signals = [] } = useQuery({
    queryKey: ['signals', 'by-company', id],
    queryFn: () => fetchSignals({ companyId: id, limit: 50 }),
  });

  const { data: contacts = [] } = useQuery({
    queryKey: ['contacts', id],
    queryFn: () => fetchContacts({ companyId: id, limit: 100 }),
  });

  const { data: monitored = new Set<string>() } = useQuery({
    queryKey: ['monitored', user?.id],
    queryFn: () => fetchMonitoredAccountIds(user!.id),
    enabled: !!user,
  });

  const { data: revealed = new Map<string, Set<string>>() } = useQuery({
    queryKey: ['revealed', user?.id],
    queryFn: () => fetchRevealedFields(user!.id),
    enabled: !!user,
  });

  const monitorMut = useMutation({
    mutationFn: ({ on }: { on: boolean }) => toggleMonitor(user!.id, id, on),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ['monitored'] });
      if (user) logActivity(user.id, 'ACCOUNT_MONITORED', { entity_type: 'company', entity_id: id, metadata: { on: vars.on } });
    },
  });

  const revealMut = useMutation({
    mutationFn: ({ contactId, field }: { contactId: string; field: 'email' | 'phone' }) =>
      revealField(user!.id, contactId, field),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ['revealed'] });
      if (user) logActivity(user.id, 'CONTACT_REVEALED', { entity_type: 'contact', entity_id: vars.contactId, metadata: { field: vars.field } });
      toast.success('Contact info revealed');
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : 'Failed'),
  });

  const briefMut = useMutation({
    mutationFn: async (force: boolean) => {
      const { data, error } = await supabase.functions.invoke('generate-brief', {
        body: { companyId: id, force },
      });
      if (error) throw error;
      if (user) await logActivity(user.id, 'BRIEF_GENERATED', { entity_type: 'company', entity_id: id });
      return data;
    },
    onSuccess: (data) => {
      toast.success(data?.cached ? 'Brief loaded' : 'AI brief generated');
      qc.invalidateQueries({ queryKey: ['company', id] });
    },
    onError: (e: any) => {
      const msg = e?.message || 'Brief failed';
      if (/429/.test(msg)) toast.error('Rate limit reached. Try shortly.');
      else if (/402/.test(msg)) toast.error('AI credits exhausted.');
      else toast.error(msg);
    },
  });

  const pushCRM = () => {
    if (!user || !company) return;
    logActivity(user.id, 'CRM_PUSHED', { entity_type: 'company', entity_id: id, metadata: { name: company.name } });
    toast.success(`${company.name} queued for CRM push`);
  };

  const exportContacts = () => {
    if (contacts.length === 0) return toast.info('No contacts to export');
    const csv = toCSV(
      contacts.map((c: any) => ({
        first_name: c.first_name,
        last_name: c.last_name,
        title: c.title ?? '',
        email: c.email ?? '',
        phone: c.phone ?? '',
        linkedin: c.linkedin_url ?? '',
      })),
      [
        { key: 'first_name', header: 'First name' },
        { key: 'last_name', header: 'Last name' },
        { key: 'title', header: 'Title' },
        { key: 'email', header: 'Email' },
        { key: 'phone', header: 'Phone' },
        { key: 'linkedin', header: 'LinkedIn' },
      ]
    );
    downloadCSV(`${company?.name ?? 'account'}-contacts.csv`, csv);
    if (user) logActivity(user.id, 'CSV_EXPORTED', { metadata: { kind: 'contacts', count: contacts.length } });
  };

  // Default to "brief" tab when arriving via "View Account" (hash=#brief), else overview.
  const initialHash = typeof window !== 'undefined' ? window.location.hash.replace('#', '') : '';
  const [tab, setTab] = useState<string>(initialHash === 'brief' ? 'brief' : 'overview');

  // Auto-generate the brief on first arrival to the brief tab if we don't have one yet.
  const brief = (company as any)?.brief as Brief | null;
  const autoGenRef = useRef(false);
  useEffect(() => {
    if (tab === 'brief' && company && !brief && !briefMut.isPending && !autoGenRef.current) {
      autoGenRef.current = true;
      briefMut.mutate(false);
    }
  }, [tab, brief, company, briefMut]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-6 md:px-8">
        <div className="h-32 animate-pulse rounded-xl border border-border bg-card/40" />
      </div>
    );
  }

  if (!company) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-6 md:px-8">
        <div className="rounded-xl border border-border bg-card/40 p-10 text-center">
          <h3 className="font-semibold">Company not found</h3>
          <Button asChild variant="outline" size="sm" className="mt-3">
            <Link to="/accounts">Back to accounts</Link>
          </Button>
        </div>
      </div>
    );
  }

  const isMon = monitored.has(company.id);

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 md:px-8">
      <Link
        to="/accounts"
        className="mb-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to accounts
      </Link>

      {/* Header */}
      <header className="rounded-xl border border-border bg-card/60 p-5">
        <div className="flex flex-wrap items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-muted text-lg font-bold">
            {getInitials(company.name)}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold">{company.name}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <a href={`https://${company.domain}`} target="_blank" rel="noreferrer" className="hover:text-brand">
                {company.domain}
              </a>
              {company.industry && <span>· {company.industry}</span>}
              {company.employee_range && <span>· {company.employee_range} employees</span>}
              {company.funding_stage && <span>· {company.funding_stage}</span>}
              {company.hq_city && (
                <span>
                  · {company.hq_city}
                  {company.hq_state ? `, ${company.hq_state}` : ''}
                </span>
              )}
            </div>
            {company.description && (
              <p className="mt-3 text-sm text-foreground/80">{company.description}</p>
            )}
          </div>
          <div className="flex shrink-0 flex-col items-end gap-2">
            <label className="flex items-center gap-2 text-xs">
              <Switch checked={isMon} onCheckedChange={(on) => monitorMut.mutate({ on })} />
              Monitor account
            </label>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={pushCRM}>
                <Upload className="mr-1.5 h-3.5 w-3.5" /> Push to CRM
              </Button>
              <Button size="sm" variant="outline" onClick={exportContacts}>
                <FileDown className="mr-1.5 h-3.5 w-3.5" /> Export contacts
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab} className="mt-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="brief">
            <Brain className="mr-1.5 h-3.5 w-3.5" /> AI Brief
          </TabsTrigger>
          <TabsTrigger value="signals">Signals ({signals.length})</TabsTrigger>
          <TabsTrigger value="people">People ({contacts.length})</TabsTrigger>
          <TabsTrigger value="tech">Tech Stack</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4 space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <Stat label="Signals (all time)" value={signals.length.toString()} />
            <Stat
              label="Latest signal"
              value={
                signals[0]
                  ? new Date(signals[0].published_at).toLocaleDateString()
                  : '—'
              }
            />
            <Stat label="Monitored" value={isMon ? 'Yes' : 'No'} />
          </div>
          {company.tech_stack.length > 0 && (
            <div className="rounded-xl border border-border bg-card/60 p-4">
              <h3 className="mb-2 text-xs font-mono uppercase text-muted-foreground">Tech stack</h3>
              <div className="flex flex-wrap gap-1.5">
                {company.tech_stack.map((t) => (
                  <span key={t} className="rounded-md border border-border bg-background/40 px-2 py-1 text-xs">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}
          <div className="rounded-xl border border-border bg-card/60 p-4">
            <h3 className="mb-2 text-xs font-mono uppercase text-muted-foreground">Recent signals</h3>
            {signals.slice(0, 3).length === 0 ? (
              <p className="text-sm text-muted-foreground">No signals yet.</p>
            ) : (
              <div className="space-y-3">
                {signals.slice(0, 3).map((s) => (
                  <div key={s.id} className="border-l-2 border-brand/40 pl-3 text-sm">
                    <div className="font-medium">{s.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(s.published_at).toLocaleDateString()} · confidence {s.confidence_score}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="brief" className="mt-4">
          <BriefPanel
            brief={brief}
            loading={briefMut.isPending}
            onGenerate={() => briefMut.mutate(false)}
            onRegenerate={() => briefMut.mutate(true)}
          />
        </TabsContent>

        <TabsContent value="signals" className="mt-4 space-y-3">
          {signals.length === 0 ? (
            <div className="rounded-xl border border-border bg-card/40 p-10 text-center text-sm text-muted-foreground">
              No signals for this account yet.
            </div>
          ) : (
            signals.map((s) => <SignalCard key={s.id} signal={s} />)
          )}
        </TabsContent>

        <TabsContent value="people" className="mt-4">
          {contacts.length === 0 ? (
            <div className="rounded-xl border border-border bg-card/40 p-10 text-center text-sm text-muted-foreground">
              No contacts yet.
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {contacts.map((c: any) => {
                const revs = revealed.get(c.id) ?? new Set();
                return (
                  <div key={c.id} className="rounded-xl border border-border bg-card/60 p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                        {getInitials(`${c.first_name} ${c.last_name}`)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-medium">
                          {c.first_name} {c.last_name}
                        </div>
                        <div className="text-xs text-muted-foreground">{c.title ?? '—'}</div>
                      </div>
                      {c.linkedin_url && (
                        <a
                          href={c.linkedin_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-muted-foreground hover:text-brand"
                          aria-label="LinkedIn"
                        >
                          <Linkedin className="h-4 w-4" />
                        </a>
                      )}
                    </div>

                    <div className="mt-3 space-y-1.5 text-xs">
                      <RevealRow
                        icon={<Mail className="h-3.5 w-3.5" />}
                        revealed={revs.has('email')}
                        revealedValue={c.email}
                        maskedValue={maskEmail(c.email)}
                        onReveal={() => revealMut.mutate({ contactId: c.id, field: 'email' })}
                      />
                      <RevealRow
                        icon={<Phone className="h-3.5 w-3.5" />}
                        revealed={revs.has('phone')}
                        revealedValue={c.phone}
                        maskedValue={maskPhone(c.phone)}
                        onReveal={() => revealMut.mutate({ contactId: c.id, field: 'phone' })}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="tech" className="mt-4">
          <div className="rounded-xl border border-border bg-card/60 p-5">
            {company.tech_stack.length === 0 ? (
              <p className="text-sm text-muted-foreground">No tech stack data yet.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {company.tech_stack.map((t) => (
                  <span key={t} className="rounded-md border border-border bg-background/40 px-3 py-1.5 text-sm">
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function BriefPanel({
  brief,
  loading,
  onGenerate,
  onRegenerate,
}: {
  brief: Brief | null;
  loading: boolean;
  onGenerate: () => void;
  onRegenerate: () => void;
}) {
  if (!brief) {
    return (
      <div className="rounded-xl border border-border bg-card/40 p-10 text-center">
        <Brain className="mx-auto h-10 w-10 text-muted-foreground/30" />
        <h3 className="mt-3 font-semibold">No brief yet</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Get a sales-actionable AI brief: pain points, buying committee, conversation starters, risks.
        </p>
        <Button className="mt-4" onClick={onGenerate} disabled={loading}>
          {loading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
          Generate AI brief
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Generated {brief.generated_at ? new Date(brief.generated_at).toLocaleString() : 'just now'}
        </p>
        <Button size="sm" variant="outline" onClick={onRegenerate} disabled={loading}>
          {loading ? <RefreshCw className="mr-2 h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="mr-2 h-3.5 w-3.5" />}
          Regenerate
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-card/60 p-5">
        <h3 className="text-xs font-mono uppercase text-muted-foreground">Summary</h3>
        <p className="mt-2 text-sm">{brief.summary}</p>
      </div>

      <div className="rounded-xl border border-brand/30 bg-brand/5 p-5">
        <h3 className="text-xs font-mono uppercase text-brand">Why now</h3>
        <p className="mt-2 text-sm">{brief.why_now}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <BriefList title="Pain points" items={brief.pain_points} />
        <BriefList title="Buying committee" items={brief.buying_committee} />
        <BriefList title="Conversation starters" items={brief.conversation_starters} />
        <BriefList title="Competitive risks" items={brief.competitive_risks} accent="text-amber-300" />
      </div>
    </div>
  );
}

function BriefList({ title, items, accent }: { title: string; items: string[]; accent?: string }) {
  return (
    <div className="rounded-xl border border-border bg-card/60 p-4">
      <h3 className={`text-xs font-mono uppercase ${accent ?? 'text-muted-foreground'}`}>{title}</h3>
      <ul className="mt-2 space-y-1.5 text-sm">
        {items.map((it, i) => (
          <li key={i} className="flex gap-2">
            <span className="text-brand">•</span>
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card/60 p-4">
      <div className="text-[10px] font-mono uppercase text-muted-foreground">{label}</div>
      <div className="mt-1 text-xl font-semibold">{value}</div>
    </div>
  );
}

function RevealRow({
  icon,
  revealed,
  revealedValue,
  maskedValue,
  onReveal,
}: {
  icon: React.ReactNode;
  revealed: boolean;
  revealedValue: string | null;
  maskedValue: string;
  onReveal: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-md border border-border bg-background/40 px-2 py-1.5">
      <div className="flex min-w-0 items-center gap-1.5 font-mono">
        <span className="text-muted-foreground">{icon}</span>
        <span className="truncate">{revealed ? revealedValue ?? '—' : maskedValue || '—'}</span>
      </div>
      {!revealed && revealedValue && (
        <Button size="sm" variant="ghost" className="h-6 text-[11px]" onClick={onReveal}>
          <Eye className="mr-1 h-3 w-3" /> Reveal
        </Button>
      )}
    </div>
  );
}
