import { createFileRoute, Link, useParams } from '@tanstack/react-router';
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
import { ArrowLeft, Building2, Eye, Linkedin, Mail, Phone } from 'lucide-react';
import { getInitials, maskEmail, maskPhone } from '@/lib/types';
import { toast } from 'sonner';

export const Route = createFileRoute('/accounts/$id')({
  component: AccountDetailPage,
});

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
    onSuccess: () => qc.invalidateQueries({ queryKey: ['monitored'] }),
  });

  const revealMut = useMutation({
    mutationFn: ({ contactId, field }: { contactId: string; field: 'email' | 'phone' }) =>
      revealField(user!.id, contactId, field),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['revealed'] });
      toast.success('Contact info revealed');
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : 'Failed'),
  });

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
          <label className="flex shrink-0 items-center gap-2 text-xs">
            <Switch
              checked={isMon}
              onCheckedChange={(on) => monitorMut.mutate({ on })}
            />
            Monitor account
          </label>
        </div>
      </header>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="mt-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
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
