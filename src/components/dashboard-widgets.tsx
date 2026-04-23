import { Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/use-auth';
import { fetchSignals } from '@/lib/queries';
import { fetchActivity, ACTIVITY_LABELS } from '@/lib/activity';
import { supabase } from '@/integrations/supabase/client';
import { SIGNAL_TYPE_LABELS, type SignalType } from '@/lib/types';
import {
  Radio,
  Target,
  TrendingUp,
  Mail,
  Activity as ActivityIcon,
  Building2,
  Flame,
  ArrowRight,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

/* --------------------------------- Helpers --------------------------------- */

function Sparkline({ data, color = 'hsl(var(--brand))' }: { data: number[]; color?: string }) {
  if (data.length === 0) return null;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const w = 100;
  const h = 32;
  const step = w / Math.max(data.length - 1, 1);
  const points = data.map((v, i) => `${i * step},${h - ((v - min) / range) * h}`).join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-8 w-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="spark-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline points={`0,${h} ${points} ${w},${h}`} fill="url(#spark-fill)" stroke="none" />
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  delta,
  trend,
  href,
  accent = 'brand',
}: {
  icon: typeof Radio;
  label: string;
  value: string | number;
  delta?: string;
  trend?: number[];
  href?: '/dashboard' | '/accounts' | '/contacts' | '/outreach' | '/territory' | '/analytics';
  accent?: 'brand' | 'green' | 'amber' | 'violet';
}) {
  const accentColor =
    accent === 'green'
      ? 'text-emerald-400'
      : accent === 'amber'
        ? 'text-amber-400'
        : accent === 'violet'
          ? 'text-violet-400'
          : 'text-brand';

  const inner = (
    <div className="surface-2 card-interactive group relative overflow-hidden rounded-xl border border-border p-4 transition-all hover:border-brand/40">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className={`flex h-8 w-8 items-center justify-center rounded-md bg-brand/10 ${accentColor}`}>
            <Icon className="h-4 w-4" />
          </div>
          <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">{label}</span>
        </div>
        {href && (
          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
        )}
      </div>
      <div className="mt-2 flex items-end justify-between gap-3">
        <div>
          <div className="text-2xl font-bold tracking-tight tabular-nums">{value}</div>
          {delta && <div className={`mt-0.5 text-[11px] ${accentColor}`}>{delta}</div>}
        </div>
        {trend && trend.length > 1 && (
          <div className="w-20 opacity-80">
            <Sparkline data={trend} />
          </div>
        )}
      </div>
    </div>
  );

  return href ? <Link to={href}>{inner}</Link> : inner;
}

/* ------------------------------ Main component ----------------------------- */

export function DashboardWidgets() {
  const { user } = useAuth();

  // All signals (lighter limit for stats)
  const { data: signals = [] } = useQuery({
    queryKey: ['widgets-signals'],
    queryFn: () => fetchSignals({ limit: 200 }),
  });

  // Drafts count
  const { data: draftsCount = 0 } = useQuery({
    queryKey: ['widgets-drafts', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { count } = await supabase
        .from('outreach_drafts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user!.id);
      return count ?? 0;
    },
  });

  // Monitored accounts
  const { data: monitoredCount = 0 } = useQuery({
    queryKey: ['widgets-monitored', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { count } = await supabase
        .from('monitored_accounts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user!.id);
      return count ?? 0;
    },
  });

  // Activity
  const { data: activity = [] } = useQuery({
    queryKey: ['widgets-activity', user?.id],
    enabled: !!user,
    queryFn: () => fetchActivity(user!.id, 5),
    refetchInterval: 30_000,
  });

  /* --- Derived stats --- */
  const newCount = signals.filter((s) => s.status === 'NEW').length;
  const claimedCount = signals.filter((s) => s.status === 'CLAIMED').length;
  const convertedCount = signals.filter((s) => s.status === 'CONVERTED').length;
  const conversionRate = claimedCount > 0 ? Math.round((convertedCount / claimedCount) * 100) : 0;
  const hotCount = signals.filter((s) => s.confidence_score >= 85).length;
  const avgConfidence =
    signals.length > 0 ? Math.round(signals.reduce((a, s) => a + s.confidence_score, 0) / signals.length) : 0;

  // 7-day signal trend
  const trend = (() => {
    const buckets = Array.from({ length: 7 }, () => 0);
    const now = Date.now();
    signals.forEach((s) => {
      const days = Math.floor((now - new Date(s.published_at).getTime()) / 86_400_000);
      if (days >= 0 && days < 7) buckets[6 - days] += 1;
    });
    return buckets;
  })();

  // Type breakdown
  const typeCounts = (Object.keys(SIGNAL_TYPE_LABELS) as SignalType[])
    .map((t) => ({ type: t, count: signals.filter((s) => s.signal_type === t).length }))
    .filter((x) => x.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  const maxTypeCount = Math.max(...typeCounts.map((t) => t.count), 1);

  // Hot accounts
  const accountMap = new Map<string, { name: string; domain: string; count: number; maxConf: number }>();
  signals.forEach((s) => {
    if (!s.company) return;
    const cur = accountMap.get(s.company.id) ?? {
      name: s.company.name,
      domain: s.company.domain,
      count: 0,
      maxConf: 0,
    };
    cur.count += 1;
    cur.maxConf = Math.max(cur.maxConf, s.confidence_score);
    accountMap.set(s.company.id, cur);
  });
  const hotAccounts = Array.from(accountMap.values())
    .sort((a, b) => b.maxConf - a.maxConf || b.count - a.count)
    .slice(0, 4);

  return (
    <section className="mb-6 animate-rise" aria-label="Dashboard overview">
      {/* Header */}
      <div className="mb-4 flex items-end justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Command center</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Bird's-eye view of every signal, account, and action across your workspace.
          </p>
        </div>
        <div className="hidden items-center gap-1.5 rounded-full border border-border bg-card/60 px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider text-muted-foreground sm:inline-flex">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
          Live
        </div>
      </div>

      {/* KPI grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Radio}
          label="New signals"
          value={newCount}
          delta={`${signals.length} total · 7d trend`}
          trend={trend}
          href="/dashboard"
        />
        <StatCard
          icon={Flame}
          label="Hot leads"
          value={hotCount}
          delta={`Confidence ≥ 85`}
          accent="amber"
          href="/dashboard"
        />
        <StatCard
          icon={Target}
          label="Claimed"
          value={claimedCount}
          delta={`${conversionRate}% conversion`}
          accent="green"
          href="/accounts"
        />
        <StatCard
          icon={Mail}
          label="Outreach drafts"
          value={draftsCount}
          delta={`${monitoredCount} accounts monitored`}
          accent="violet"
          href="/outreach"
        />
      </div>

      {/* Insight panels */}
      <div className="mt-3 grid gap-3 lg:grid-cols-3">
        {/* Type breakdown */}
        <div className="surface-2 rounded-xl border border-border p-4 lg:col-span-1">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-1.5 text-sm font-semibold">
              <TrendingUp className="h-3.5 w-3.5 text-brand" />
              Signal mix
            </h3>
            <span className="text-[10px] font-mono uppercase text-muted-foreground">
              avg conf {avgConfidence}
            </span>
          </div>
          {typeCounts.length === 0 ? (
            <div className="mt-4 text-center text-xs text-muted-foreground">No signals yet.</div>
          ) : (
            <ul className="mt-3 space-y-2">
              {typeCounts.map(({ type, count }) => (
                <li key={type}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="text-foreground/85">{SIGNAL_TYPE_LABELS[type]}</span>
                    <span className="font-mono tabular-nums text-muted-foreground">{count}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-border/60">
                    <div
                      className="h-full rounded-full bg-brand transition-all"
                      style={{ width: `${(count / maxTypeCount) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Hot accounts */}
        <div className="surface-2 rounded-xl border border-border p-4 lg:col-span-1">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-1.5 text-sm font-semibold">
              <Building2 className="h-3.5 w-3.5 text-brand" />
              Hot accounts
            </h3>
            <Link
              to="/accounts"
              className="text-[10px] font-mono uppercase text-muted-foreground transition-colors hover:text-brand"
            >
              View all →
            </Link>
          </div>
          {hotAccounts.length === 0 ? (
            <div className="mt-4 text-center text-xs text-muted-foreground">No accounts yet.</div>
          ) : (
            <ul className="mt-3 space-y-2">
              {hotAccounts.map((a) => (
                <li
                  key={a.domain}
                  className="flex items-center justify-between rounded-md border border-transparent p-1.5 text-xs transition-colors hover:border-brand/30 hover:bg-brand/5"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-brand/15 text-[10px] font-bold text-brand">
                      {a.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate font-medium">{a.name}</div>
                      <div className="truncate text-[10px] text-muted-foreground">{a.domain}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-[10px] text-muted-foreground">{a.count} sig</span>
                    <span className="rounded-sm bg-amber-500/15 px-1.5 py-0.5 font-mono text-[10px] font-bold text-amber-400">
                      {a.maxConf}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Activity */}
        <div className="surface-2 rounded-xl border border-border p-4 lg:col-span-1">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-1.5 text-sm font-semibold">
              <ActivityIcon className="h-3.5 w-3.5 text-brand" />
              Recent activity
            </h3>
            <span className="text-[10px] font-mono uppercase text-muted-foreground">last 5</span>
          </div>
          {activity.length === 0 ? (
            <div className="mt-4 text-center text-xs text-muted-foreground">
              No activity yet. Claim a signal to start the feed.
            </div>
          ) : (
            <ol className="mt-3 space-y-2">
              {activity.map((a) => (
                <li key={a.id} className="flex items-start gap-2 border-l-2 border-brand/40 pl-2 text-xs">
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium">{ACTIVITY_LABELS[a.type] ?? a.type}</div>
                    <div className="text-[10px] text-muted-foreground">
                      {formatDistanceToNow(new Date(a.created_at), { addSuffix: true })}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </section>
  );
}
