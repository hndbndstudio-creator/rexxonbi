import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { DashboardShell } from '@/components/dashboard-shell';
import { DashboardWidgets } from '@/components/dashboard-widgets';
import { SignalCard } from '@/components/signal-card';
import { fetchSignals, type SignalWithRelations } from '@/lib/queries';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/use-auth';
import { logActivity } from '@/lib/activity';
import { Button } from '@/components/ui/button';
import {
  Eye,
  Radio,
  ArrowRight,
  Target,
  Mail,
  Trophy,
  TrendingUp,
  Building2,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export const Route = createFileRoute('/birdseye')({
  head: () => ({
    meta: [
      { title: "Bird's-Eye — Rexxon AI" },
      { name: 'robots', content: 'noindex, nofollow, noarchive, noimageindex' },
    ],
  }),
  component: BirdseyePage,
});

function BirdseyePage() {
  return (
    <DashboardShell>
      <BirdseyeView />
    </DashboardShell>
  );
}

/* ----------------------------- Pipeline stages ---------------------------- */

const STAGES = [
  { key: 'NEW', label: 'New', tone: 'text-brand', dot: 'bg-brand' },
  { key: 'CLAIMED', label: 'Claimed', tone: 'text-violet-300', dot: 'bg-violet-400' },
  { key: 'CONVERTED', label: 'Converted', tone: 'text-emerald-300', dot: 'bg-emerald-400' },
  { key: 'DISMISSED', label: 'Dismissed', tone: 'text-muted-foreground', dot: 'bg-muted-foreground' },
] as const;

function PipelineBoard({ signals }: { signals: SignalWithRelations[] }) {
  return (
    <div className="surface-2 rounded-xl border border-border p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="flex items-center gap-1.5 text-sm font-semibold">
          <Target className="h-3.5 w-3.5 text-brand" />
          Deals in pipeline
        </h3>
        <Link
          to="/accounts"
          className="text-[10px] font-mono uppercase text-muted-foreground transition-colors hover:text-brand"
        >
          Manage →
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {STAGES.map((stage) => {
          const items = signals.filter((s) => s.status === stage.key).slice(0, 3);
          const total = signals.filter((s) => s.status === stage.key).length;
          return (
            <div
              key={stage.key}
              className="flex flex-col rounded-lg border border-border bg-card/40 p-2.5"
            >
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className={`h-1.5 w-1.5 rounded-full ${stage.dot}`} />
                  <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                    {stage.label}
                  </span>
                </div>
                <span className={`text-xs font-bold tabular-nums ${stage.tone}`}>{total}</span>
              </div>
              {items.length === 0 ? (
                <div className="flex flex-1 items-center justify-center rounded border border-dashed border-border/60 px-2 py-3 text-center text-[10px] text-muted-foreground">
                  Empty
                </div>
              ) : (
                <ul className="space-y-1.5">
                  {items.map((s) => (
                    <li
                      key={s.id}
                      className="group rounded-md border border-transparent bg-card/60 p-2 transition-all hover:border-brand/30 hover:bg-brand/5"
                    >
                      <div className="flex items-start justify-between gap-1.5">
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-[11px] font-medium leading-tight">
                            {s.title}
                          </div>
                          {s.company && (
                            <div className="mt-0.5 flex items-center gap-1 text-[10px] text-muted-foreground">
                              <Building2 className="h-2.5 w-2.5" />
                              <span className="truncate">{s.company.name}</span>
                            </div>
                          )}
                        </div>
                        <span className="rounded-sm bg-brand/15 px-1 py-0.5 font-mono text-[9px] font-bold text-brand">
                          {s.confidence_score}
                        </span>
                      </div>
                    </li>
                  ))}
                  {total > items.length && (
                    <li className="text-center text-[10px] text-muted-foreground">
                      + {total - items.length} more
                    </li>
                  )}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ----------------------------- Mini analytics ----------------------------- */

function MiniAnalytics({ signals }: { signals: SignalWithRelations[] }) {
  // 14-day trend
  const trend = (() => {
    const buckets = new Map<string, number>();
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      buckets.set(d.toISOString().slice(0, 10), 0);
    }
    signals.forEach((s) => {
      const key = s.published_at.slice(0, 10);
      if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + 1);
    });
    return Array.from(buckets.entries()).map(([date, count]) => ({
      date: date.slice(5),
      count,
    }));
  })();

  const last7 = trend.slice(-7).reduce((a, b) => a + b.count, 0);
  const prev7 = trend.slice(-14, -7).reduce((a, b) => a + b.count, 0);
  const change = prev7 > 0 ? Math.round(((last7 - prev7) / prev7) * 100) : last7 > 0 ? 100 : 0;
  const claimed = signals.filter((s) => s.status === 'CLAIMED').length;
  const converted = signals.filter((s) => s.status === 'CONVERTED').length;
  const conversionRate = claimed > 0 ? Math.round((converted / claimed) * 100) : 0;

  return (
    <div className="surface-2 rounded-xl border border-border p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="flex items-center gap-1.5 text-sm font-semibold">
          <TrendingUp className="h-3.5 w-3.5 text-brand" />
          Performance · 14 days
        </h3>
        <Link
          to="/analytics"
          className="text-[10px] font-mono uppercase text-muted-foreground transition-colors hover:text-brand"
        >
          Full analytics →
        </Link>
      </div>

      <div className="mb-3 grid grid-cols-3 gap-3 border-b border-border pb-3">
        <div>
          <div className="text-[10px] font-mono uppercase text-muted-foreground">Last 7d</div>
          <div className="mt-0.5 flex items-baseline gap-1.5">
            <span className="text-xl font-bold tabular-nums">{last7}</span>
            <span
              className={`text-[10px] font-medium ${change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}
            >
              {change >= 0 ? '+' : ''}
              {change}%
            </span>
          </div>
        </div>
        <div>
          <div className="text-[10px] font-mono uppercase text-muted-foreground">Conversion</div>
          <div className="mt-0.5 flex items-baseline gap-1">
            <span className="text-xl font-bold tabular-nums">{conversionRate}</span>
            <span className="text-[10px] text-muted-foreground">%</span>
          </div>
        </div>
        <div>
          <div className="text-[10px] font-mono uppercase text-muted-foreground">Won</div>
          <div className="mt-0.5 text-xl font-bold tabular-nums text-emerald-400">{converted}</div>
        </div>
      </div>

      <div className="h-[140px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={trend} margin={{ top: 4, right: 4, bottom: 0, left: -28 }}>
            <defs>
              <linearGradient id="be-trend" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--brand)" stopOpacity={0.45} />
                <stop offset="100%" stopColor="var(--brand)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={9} interval={2} />
            <YAxis stroke="var(--muted-foreground)" fontSize={9} width={28} />
            <Tooltip
              contentStyle={{
                background: 'var(--popover)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                fontSize: 11,
              }}
            />
            <Area
              type="monotone"
              dataKey="count"
              stroke="var(--brand)"
              strokeWidth={2}
              fill="url(#be-trend)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* --------------------------------- Main view ------------------------------ */

function BirdseyeView() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: signals = [], isLoading } = useQuery({
    queryKey: ['birdseye-signals'],
    queryFn: () => fetchSignals({ limit: 100 }),
  });

  const recent = signals.slice(0, 6);

  const actionMut = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'CLAIMED' | 'DISMISSED' }) => {
      const { error } = await supabase
        .from('signals')
        .update({ status, is_read: true })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_d, v) => {
      toast.success(v.status === 'CLAIMED' ? 'Lead claimed' : 'Signal dismissed');
      qc.invalidateQueries({ queryKey: ['birdseye-signals'] });
      qc.invalidateQueries({ queryKey: ['signals'] });
      qc.invalidateQueries({ queryKey: ['widgets-signals'] });
      if (user) {
        logActivity(user.id, v.status === 'CLAIMED' ? 'SIGNAL_CLAIMED' : 'SIGNAL_DISMISSED', {
          entity_type: 'signal',
          entity_id: v.id,
        });
      }
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : 'Action failed'),
  });

  const draftMut = useMutation({
    mutationFn: async (signal: SignalWithRelations) => {
      const { data, error } = await supabase.functions.invoke('generate-outreach', {
        body: {
          signalId: signal.id,
          contactId: signal.hiring_manager_contact_id,
          tone: 'PROFESSIONAL',
          persona: 'AE',
        },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Outreach draft created');
      navigate({ to: '/outreach' });
    },
    onError: (e: any) => toast.error(e?.message || 'Draft failed'),
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-8">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 animate-rise">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <Eye className="h-5 w-5 text-brand" />
            Bird's-Eye
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Master view — every signal, deal and metric across your workspace.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild size="sm" variant="outline" className="btn-press">
            <Link to="/dashboard">
              <Radio className="mr-1.5 h-3.5 w-3.5" />
              Open Signal Feed
            </Link>
          </Button>
          <Button asChild size="sm" className="btn-press bg-brand text-brand-foreground shadow-inset-glow">
            <Link to="/outreach">
              <Mail className="mr-1.5 h-3.5 w-3.5" />
              Outreach
            </Link>
          </Button>
        </div>
      </div>

      {/* Two-column layout: main (widgets + pipeline + analytics) | right (signal feed) */}
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="min-w-0 space-y-6">
          {/* KPI widgets */}
          <DashboardWidgets />

          {/* Pipeline */}
          <PipelineBoard signals={signals} />

          {/* Analytics summary */}
          <MiniAnalytics signals={signals} />
        </div>

        {/* Right column — Signal feed */}
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <div className="surface-2 rounded-xl border border-border p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="flex items-center gap-1.5 text-sm font-semibold">
                <Radio className="h-3.5 w-3.5 text-brand" />
                Live signal feed
              </h3>
              <Link
                to="/dashboard"
                className="flex items-center gap-0.5 text-[10px] font-mono uppercase text-muted-foreground transition-colors hover:text-brand"
              >
                All <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {isLoading && (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="skeleton-shimmer h-32 rounded-lg border border-border" />
                ))}
              </div>
            )}

            {!isLoading && recent.length === 0 && (
              <div className="rounded-md border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
                No signals yet. Generate one from the Signal Feed.
              </div>
            )}

            <div className="space-y-2.5">
              {recent.map((s) => (
                <SignalCard
                  key={s.id}
                  signal={s}
                  isPending={actionMut.isPending && actionMut.variables?.id === s.id}
                  isDrafting={draftMut.isPending && draftMut.variables?.id === s.id}
                  onClaim={(id) => actionMut.mutate({ id, status: 'CLAIMED' })}
                  onDismiss={(id) => actionMut.mutate({ id, status: 'DISMISSED' })}
                  onDraft={(sig) => user && draftMut.mutate(sig)}
                />
              ))}
            </div>
          </div>

          {/* CTA */}
          <Link
            to="/outreach"
            className="card-interactive mt-4 block rounded-xl border border-brand/30 bg-gradient-to-br from-brand/15 to-brand/5 p-4 transition-all hover:border-brand/50"
          >
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-brand" />
              <span className="text-sm font-semibold">Pending drafts</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Review AI-generated outreach and push to your CRM.
            </p>
          </Link>
        </aside>
      </div>
    </div>
  );
}
