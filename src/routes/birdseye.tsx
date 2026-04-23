import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useMemo } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { DashboardShell } from '@/components/dashboard-shell';
import { SignalCard } from '@/components/signal-card';
import { fetchSignals, type SignalWithRelations } from '@/lib/queries';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/use-auth';
import { logActivity, fetchActivity, ACTIVITY_LABELS } from '@/lib/activity';
import { SIGNAL_TYPE_LABELS, type SignalType } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Radio,
  ArrowRight,
  Target,
  Mail,
  Trophy,
  TrendingUp,
  Building2,
  Flame,
  Sparkles,
  Sunrise,
  Sun,
  Moon,
  CheckCircle2,
  Zap,
  Activity as ActivityIcon,
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
import { formatDistanceToNow } from 'date-fns';

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

/* --------------------------- Time-of-day helpers -------------------------- */

function useGreeting(name: string) {
  const hour = new Date().getHours();
  if (hour < 5) return { greeting: `Still up, ${name}`, icon: Moon, sub: "Late-night signals are loaded — review when you're ready." };
  if (hour < 12) return { greeting: `Good morning, ${name}`, icon: Sunrise, sub: "Here's what moved overnight. Let's make today count." };
  if (hour < 17) return { greeting: `Good afternoon, ${name}`, icon: Sun, sub: 'Momentum check — keep the streak alive.' };
  if (hour < 21) return { greeting: `Good evening, ${name}`, icon: Sun, sub: 'Wrap up strong. A few more wins to log.' };
  return { greeting: `Evening, ${name}`, icon: Moon, sub: 'Tomorrow starts here — queue up your top plays.' };
}

/* ----------------------------- Progress ring ------------------------------ */

function ProgressRing({
  value,
  goal,
  label,
  size = 120,
}: {
  value: number;
  goal: number;
  label: string;
  size?: number;
}) {
  const pct = Math.min(value / goal, 1);
  const radius = size / 2 - 8;
  const circ = 2 * Math.PI * radius;
  const offset = circ * (1 - pct);
  const isComplete = pct >= 1;

  return (
    <div className="relative inline-flex flex-col items-center">
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id="ring-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--brand)" />
            <stop offset="100%" stopColor="var(--brand-glow)" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="color-mix(in oklab, var(--foreground) 8%, transparent)"
          strokeWidth="6"
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#ring-grad)"
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {isComplete ? (
          <CheckCircle2 className="h-6 w-6 text-emerald-400" />
        ) : (
          <span className="text-2xl font-bold tabular-nums">{value}</span>
        )}
        <span className="mt-0.5 text-[9px] font-mono uppercase tracking-wider text-muted-foreground">
          {isComplete ? 'Done' : `of ${goal}`}
        </span>
      </div>
      <span className="mt-2 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
    </div>
  );
}

/* ---------------------------- Achievement chip ---------------------------- */

function AchievementChip({
  icon: Icon,
  label,
  value,
  unlocked,
}: {
  icon: typeof Trophy;
  label: string;
  value: string;
  unlocked: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-2 rounded-lg border px-2.5 py-1.5 transition-all ${
        unlocked
          ? 'border-amber-500/40 bg-amber-500/10'
          : 'border-border bg-card/40 opacity-60'
      }`}
    >
      <Icon className={`h-3.5 w-3.5 ${unlocked ? 'text-amber-400' : 'text-muted-foreground'}`} />
      <div className="flex flex-col leading-none">
        <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <span className={`text-xs font-bold tabular-nums ${unlocked ? 'text-amber-300' : ''}`}>
          {value}
        </span>
      </div>
    </div>
  );
}

/* ----------------------------- Pipeline stages ---------------------------- */

const STAGES = [
  { key: 'NEW', label: 'New', tone: 'text-brand', dot: 'bg-brand' },
  { key: 'CLAIMED', label: 'Claimed', tone: 'text-violet-300', dot: 'bg-violet-400' },
  { key: 'CONVERTED', label: 'Won', tone: 'text-emerald-300', dot: 'bg-emerald-400' },
  { key: 'DISMISSED', label: 'Passed', tone: 'text-muted-foreground', dot: 'bg-muted-foreground' },
] as const;

function PipelineBoard({ signals }: { signals: SignalWithRelations[] }) {
  return (
    <div className="surface-2 rounded-2xl border border-border p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="flex items-center gap-1.5 text-sm font-semibold">
            <Target className="h-4 w-4 text-brand" />
            Pipeline
          </h3>
          <p className="mt-0.5 text-[11px] text-muted-foreground">Where every deal stands today.</p>
        </div>
        <Link
          to="/accounts"
          className="text-[10px] font-mono uppercase text-muted-foreground transition-colors hover:text-brand"
        >
          Manage →
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {STAGES.map((stage) => {
          const all = signals.filter((s) => s.status === stage.key);
          const items = all.slice(0, 2);
          return (
            <div
              key={stage.key}
              className="flex flex-col rounded-xl border border-border bg-card/40 p-3 transition-colors hover:border-brand/30"
            >
              <div className="mb-2.5 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className={`h-1.5 w-1.5 rounded-full ${stage.dot}`} />
                  <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                    {stage.label}
                  </span>
                </div>
                <span className={`text-base font-bold tabular-nums ${stage.tone}`}>
                  {all.length}
                </span>
              </div>
              {items.length === 0 ? (
                <div className="flex flex-1 items-center justify-center rounded-md border border-dashed border-border/50 px-2 py-4 text-center text-[10px] text-muted-foreground">
                  Nothing here
                </div>
              ) : (
                <ul className="space-y-1.5">
                  {items.map((s) => (
                    <li
                      key={s.id}
                      className="group rounded-md bg-card/60 p-2 transition-all hover:bg-brand/5"
                    >
                      <div className="truncate text-[11px] font-medium leading-tight">
                        {s.title}
                      </div>
                      {s.company && (
                        <div className="mt-0.5 truncate text-[10px] text-muted-foreground">
                          {s.company.name}
                        </div>
                      )}
                    </li>
                  ))}
                  {all.length > items.length && (
                    <li className="text-center text-[10px] text-muted-foreground">
                      + {all.length - items.length} more
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
  const trend = useMemo(() => {
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
  }, [signals]);

  const last7 = trend.slice(-7).reduce((a, b) => a + b.count, 0);
  const prev7 = trend.slice(-14, -7).reduce((a, b) => a + b.count, 0);
  const change = prev7 > 0 ? Math.round(((last7 - prev7) / prev7) * 100) : last7 > 0 ? 100 : 0;
  const claimed = signals.filter((s) => s.status === 'CLAIMED').length;
  const converted = signals.filter((s) => s.status === 'CONVERTED').length;
  const conversionRate = claimed > 0 ? Math.round((converted / claimed) * 100) : 0;

  return (
    <div className="surface-2 rounded-2xl border border-border p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="flex items-center gap-1.5 text-sm font-semibold">
            <TrendingUp className="h-4 w-4 text-brand" />
            Momentum · 14 days
          </h3>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            You're trending {change >= 0 ? 'up' : 'down'} {Math.abs(change)}% vs. last week.
          </p>
        </div>
        <Link
          to="/analytics"
          className="text-[10px] font-mono uppercase text-muted-foreground transition-colors hover:text-brand"
        >
          Full analytics →
        </Link>
      </div>

      <div className="mb-4 grid grid-cols-3 gap-3">
        <div className="rounded-lg bg-card/40 p-3">
          <div className="text-[10px] font-mono uppercase text-muted-foreground">Last 7d</div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl font-bold tabular-nums">{last7}</span>
            <span
              className={`text-[10px] font-medium ${change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}
            >
              {change >= 0 ? '↑' : '↓'} {Math.abs(change)}%
            </span>
          </div>
        </div>
        <div className="rounded-lg bg-card/40 p-3">
          <div className="text-[10px] font-mono uppercase text-muted-foreground">Conversion</div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-xl font-bold tabular-nums">{conversionRate}</span>
            <span className="text-[10px] text-muted-foreground">%</span>
          </div>
        </div>
        <div className="rounded-lg bg-emerald-500/5 p-3 ring-1 ring-emerald-500/20">
          <div className="text-[10px] font-mono uppercase text-emerald-400/80">Won</div>
          <div className="mt-1 text-xl font-bold tabular-nums text-emerald-400">{converted}</div>
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

/* ------------------------------- Hot accounts ----------------------------- */

function HotAccounts({ signals }: { signals: SignalWithRelations[] }) {
  const hotAccounts = useMemo(() => {
    const map = new Map<string, { name: string; domain: string; count: number; maxConf: number }>();
    signals.forEach((s) => {
      if (!s.company) return;
      const cur = map.get(s.company.id) ?? {
        name: s.company.name,
        domain: s.company.domain,
        count: 0,
        maxConf: 0,
      };
      cur.count += 1;
      cur.maxConf = Math.max(cur.maxConf, s.confidence_score);
      map.set(s.company.id, cur);
    });
    return Array.from(map.values())
      .sort((a, b) => b.maxConf - a.maxConf || b.count - a.count)
      .slice(0, 5);
  }, [signals]);

  return (
    <div className="surface-2 rounded-2xl border border-border p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="flex items-center gap-1.5 text-sm font-semibold">
          <Building2 className="h-4 w-4 text-brand" />
          Top accounts to chase
        </h3>
        <Link
          to="/accounts"
          className="text-[10px] font-mono uppercase text-muted-foreground transition-colors hover:text-brand"
        >
          All →
        </Link>
      </div>
      {hotAccounts.length === 0 ? (
        <div className="rounded-md border border-dashed border-border/50 p-6 text-center text-xs text-muted-foreground">
          No accounts yet — generate signals to populate.
        </div>
      ) : (
        <ul className="space-y-1.5">
          {hotAccounts.map((a) => (
            <li
              key={a.domain}
              className="group flex items-center justify-between rounded-lg p-2 transition-colors hover:bg-brand/5"
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-brand/25 to-brand/5 text-[11px] font-bold text-brand">
                  {a.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-xs font-medium">{a.name}</div>
                  <div className="truncate text-[10px] text-muted-foreground">
                    {a.count} signal{a.count > 1 ? 's' : ''} · {a.domain}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="rounded-md bg-amber-500/15 px-1.5 py-0.5 font-mono text-[10px] font-bold text-amber-400">
                  {a.maxConf}
                </span>
                <ArrowRight className="h-3 w-3 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* --------------------------------- Main view ------------------------------ */

function BirdseyeView() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { user } = useAuth();

  const firstName =
    (user?.user_metadata?.first_name as string | undefined) ||
    (user?.user_metadata?.full_name as string | undefined)?.split(' ')[0] ||
    user?.email?.split('@')[0] ||
    'there';

  const { greeting, icon: GreetIcon, sub } = useGreeting(firstName);

  const { data: signals = [], isLoading } = useQuery({
    queryKey: ['birdseye-signals'],
    queryFn: () => fetchSignals({ limit: 200 }),
  });

  const { data: draftsCount = 0 } = useQuery({
    queryKey: ['birdseye-drafts', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { count } = await supabase
        .from('outreach_drafts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user!.id);
      return count ?? 0;
    },
  });

  const { data: monitoredCount = 0 } = useQuery({
    queryKey: ['birdseye-monitored', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { count } = await supabase
        .from('monitored_accounts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user!.id);
      return count ?? 0;
    },
  });

  const { data: activity = [] } = useQuery({
    queryKey: ['birdseye-activity', user?.id],
    enabled: !!user,
    queryFn: () => fetchActivity(user!.id, 6),
    refetchInterval: 30_000,
  });

  /* ---------- Derived stats / achievements ---------- */
  const today = new Date().toISOString().slice(0, 10);
  const todaySignals = signals.filter((s) => s.published_at.slice(0, 10) === today);
  const todayActivity = activity.filter((a) => a.created_at.slice(0, 10) === today);
  const todayClaimed = todayActivity.filter((a) => a.type === 'SIGNAL_CLAIMED').length;
  const todayDrafted = todayActivity.filter((a) => a.type === 'DRAFT_CREATED').length;

  const newCount = signals.filter((s) => s.status === 'NEW').length;
  const claimedCount = signals.filter((s) => s.status === 'CLAIMED').length;
  const convertedCount = signals.filter((s) => s.status === 'CONVERTED').length;
  const hotCount = signals.filter((s) => s.confidence_score >= 85).length;

  // Streak: consecutive days with at least 1 activity (cap 14)
  const streak = useMemo(() => {
    if (activity.length === 0) return 0;
    const days = new Set(activity.map((a) => a.created_at.slice(0, 10)));
    let s = 0;
    for (let i = 0; i < 14; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      if (days.has(d.toISOString().slice(0, 10))) s++;
      else if (i > 0) break;
    }
    return s;
  }, [activity]);

  // Type breakdown for mix bar
  const typeCounts = (Object.keys(SIGNAL_TYPE_LABELS) as SignalType[])
    .map((t) => ({ type: t, count: signals.filter((s) => s.signal_type === t).length }))
    .filter((x) => x.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 4);
  const maxTypeCount = Math.max(...typeCounts.map((t) => t.count), 1);

  // Daily goal (claim 5 signals per day)
  const dailyGoal = 5;

  /* ---------- Mutations ---------- */
  const actionMut = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'CLAIMED' | 'DISMISSED' }) => {
      const { error } = await supabase
        .from('signals')
        .update({ status, is_read: true })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_d, v) => {
      toast.success(v.status === 'CLAIMED' ? '🎯 Lead claimed — nice move' : 'Signal passed');
      qc.invalidateQueries({ queryKey: ['birdseye-signals'] });
      qc.invalidateQueries({ queryKey: ['signals'] });
      qc.invalidateQueries({ queryKey: ['birdseye-activity'] });
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
      toast.success('✉️ Draft ready');
      navigate({ to: '/outreach' });
    },
    onError: (e: any) => toast.error(e?.message || 'Draft failed'),
  });

  const recent = signals.slice(0, 5);

  /* ---------- Render ---------- */
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
      {/* HERO — greeting + daily focus */}
      <section className="surface-2 relative mb-8 overflow-hidden rounded-3xl border border-border p-6 md:p-8 animate-rise">
        {/* Soft aurora background */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            background:
              'radial-gradient(ellipse 60% 70% at 0% 0%, color-mix(in oklab, var(--brand) 18%, transparent), transparent 60%), radial-gradient(ellipse 50% 60% at 100% 100%, color-mix(in oklab, var(--brand-glow) 14%, transparent), transparent 60%)',
          }}
        />

        <div className="relative grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
          {/* Left: greeting + meta */}
          <div className="min-w-0">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-[10px] font-mono uppercase tracking-wider text-muted-foreground backdrop-blur">
              <GreetIcon className="h-3 w-3 text-brand" />
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </div>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              {greeting}.
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground md:text-base">{sub}</p>

            {/* Achievements row */}
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <AchievementChip
                icon={Flame}
                label="Streak"
                value={`${streak} day${streak === 1 ? '' : 's'}`}
                unlocked={streak >= 1}
              />
              <AchievementChip
                icon={Trophy}
                label="Won"
                value={`${convertedCount}`}
                unlocked={convertedCount > 0}
              />
              <AchievementChip
                icon={Zap}
                label="Hot leads"
                value={`${hotCount}`}
                unlocked={hotCount > 0}
              />
              <AchievementChip
                icon={Sparkles}
                label="Drafts"
                value={`${draftsCount}`}
                unlocked={draftsCount > 0}
              />
            </div>

            {/* Primary actions */}
            <div className="mt-5 flex flex-wrap gap-2">
              <Button
                asChild
                size="sm"
                className="btn-press bg-brand text-brand-foreground shadow-inset-glow"
              >
                <Link to="/dashboard">
                  <Radio className="mr-1.5 h-3.5 w-3.5" />
                  Review {newCount} new signals
                </Link>
              </Button>
              <Button asChild size="sm" variant="outline" className="btn-press">
                <Link to="/outreach">
                  <Mail className="mr-1.5 h-3.5 w-3.5" />
                  Continue outreach
                </Link>
              </Button>
            </div>
          </div>

          {/* Right: progress ring */}
          <div className="flex items-center justify-center md:justify-end">
            <div className="rounded-2xl border border-border bg-card/60 p-5 backdrop-blur">
              <ProgressRing
                value={Math.min(todayClaimed, dailyGoal)}
                goal={dailyGoal}
                label="Today's goal"
                size={130}
              />
              <p className="mt-2 max-w-[150px] text-center text-[10px] text-muted-foreground">
                {todayClaimed >= dailyGoal
                  ? '🎉 Goal hit. Anything extra is bonus.'
                  : `Claim ${dailyGoal - todayClaimed} more to hit today's target.`}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* AT-A-GLANCE — calm 4-stat strip */}
      <section className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <SoftStat
          icon={Radio}
          label="Signals today"
          value={todaySignals.length}
          hint={`${signals.length} all-time`}
          tone="brand"
        />
        <SoftStat
          icon={Target}
          label="In play"
          value={claimedCount}
          hint={`${newCount} waiting for you`}
          tone="violet"
        />
        <SoftStat
          icon={Trophy}
          label="Closed won"
          value={convertedCount}
          hint="Career wins"
          tone="emerald"
        />
        <SoftStat
          icon={Building2}
          label="Tracking"
          value={monitoredCount}
          hint="Accounts monitored"
          tone="amber"
        />
      </section>

      {/* MAIN GRID — pipeline + signals + analytics + accounts */}
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="min-w-0 space-y-6">
          <PipelineBoard signals={signals} />
          <MiniAnalytics signals={signals} />

          {/* Signal mix */}
          {typeCounts.length > 0 && (
            <div className="surface-2 rounded-2xl border border-border p-5">
              <h3 className="flex items-center gap-1.5 text-sm font-semibold">
                <ActivityIcon className="h-4 w-4 text-brand" />
                What's driving signals
              </h3>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                Top signal categories this period.
              </p>
              <ul className="mt-4 space-y-3">
                {typeCounts.map(({ type, count }) => (
                  <li key={type}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="text-foreground/85">{SIGNAL_TYPE_LABELS[type]}</span>
                      <span className="font-mono tabular-nums text-muted-foreground">{count}</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-border/60">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-brand to-brand-glow transition-all duration-700"
                        style={{ width: `${(count / maxTypeCount) * 100}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* RIGHT — live feed + accounts + activity */}
        <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
          {/* Live signal feed */}
          <div className="surface-2 rounded-2xl border border-border p-5">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h3 className="flex items-center gap-1.5 text-sm font-semibold">
                  <Radio className="h-4 w-4 text-brand" />
                  Fresh signals
                </h3>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {newCount} need your eyes.
                </p>
              </div>
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

          {/* Hot accounts */}
          <HotAccounts signals={signals} />

          {/* Recent activity */}
          <div className="surface-2 rounded-2xl border border-border p-5">
            <h3 className="flex items-center gap-1.5 text-sm font-semibold">
              <ActivityIcon className="h-4 w-4 text-brand" />
              Your wins today
            </h3>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              {todayClaimed} claimed · {todayDrafted} drafted
            </p>
            {activity.length === 0 ? (
              <div className="mt-4 rounded-md border border-dashed border-border/50 p-4 text-center text-[11px] text-muted-foreground">
                Your activity will show here. Claim a signal to begin.
              </div>
            ) : (
              <ol className="mt-3 space-y-2.5">
                {activity.slice(0, 6).map((a) => (
                  <li
                    key={a.id}
                    className="flex items-start gap-2 border-l-2 border-brand/40 pl-2.5 text-xs transition-colors hover:border-brand"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-medium">{ACTIVITY_LABELS[a.type] ?? a.type}</div>
                      <div className="text-[10px] text-muted-foreground">
                        {formatDistanceToNow(new Date(a.created_at), { addSuffix: true })}
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

/* ----------------------------- Soft stat card ----------------------------- */

function SoftStat({
  icon: Icon,
  label,
  value,
  hint,
  tone,
}: {
  icon: typeof Radio;
  label: string;
  value: number | string;
  hint: string;
  tone: 'brand' | 'violet' | 'emerald' | 'amber';
}) {
  const toneClass =
    tone === 'emerald'
      ? 'text-emerald-400 bg-emerald-500/10'
      : tone === 'amber'
        ? 'text-amber-400 bg-amber-500/10'
        : tone === 'violet'
          ? 'text-violet-300 bg-violet-500/10'
          : 'text-brand bg-brand/10';

  return (
    <div className="surface-2 card-interactive group rounded-2xl border border-border p-4 transition-all">
      <div className="flex items-center gap-2">
        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${toneClass}`}>
          <Icon className="h-4 w-4" />
        </div>
        <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
      </div>
      <div className="mt-3 text-3xl font-bold tracking-tight tabular-nums">{value}</div>
      <div className="mt-0.5 text-[11px] text-muted-foreground">{hint}</div>
    </div>
  );
}
