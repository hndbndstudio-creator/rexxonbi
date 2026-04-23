import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { DashboardShell } from '@/components/dashboard-shell';
import { supabase } from '@/integrations/supabase/client';
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell, Legend,
  AreaChart, Area, CartesianGrid,
} from 'recharts';
import { TrendingUp, Radio, Send, Trophy, Clock, Zap } from 'lucide-react';
import { SIGNAL_TYPE_LABELS, type SignalType } from '@/lib/types';

export const Route = createFileRoute('/analytics')({
  component: AnalyticsPage,
});

const COLORS = [
  'oklch(0.66 0.22 295)', 'oklch(0.74 0.18 200)', 'oklch(0.78 0.18 145)',
  'oklch(0.80 0.17 75)', 'oklch(0.70 0.20 25)', 'oklch(0.78 0.18 320)',
  'oklch(0.74 0.18 235)',
];

function AnalyticsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['analytics-summary'],
    queryFn: async () => {
      const since = new Date();
      since.setDate(since.getDate() - 30);
      const sinceIso = since.toISOString();

      const [signalsRes, draftsRes, signalsAllRes] = await Promise.all([
        supabase.from('signals').select('id,signal_type,source,company_id,confidence_score,published_at,status').gte('published_at', sinceIso),
        supabase.from('outreach_drafts').select('id,status,created_at').gte('created_at', sinceIso),
        supabase.from('signals').select('id,company_id'),
      ]);
      if (signalsRes.error) throw signalsRes.error;
      if (draftsRes.error) throw draftsRes.error;
      if (signalsAllRes.error) throw signalsAllRes.error;

      const signals = signalsRes.data ?? [];
      const drafts = draftsRes.data ?? [];
      const allSignals = signalsAllRes.data ?? [];

      // by type
      const byType: Record<string, number> = {};
      signals.forEach((s) => { byType[s.signal_type] = (byType[s.signal_type] ?? 0) + 1; });

      // by source
      const bySource: Record<string, number> = {};
      signals.forEach((s) => { bySource[s.source] = (bySource[s.source] ?? 0) + 1; });

      // top accounts
      const byCompany: Record<string, number> = {};
      allSignals.forEach((s) => { byCompany[s.company_id] = (byCompany[s.company_id] ?? 0) + 1; });
      const topCompanyIds = Object.entries(byCompany).sort((a, b) => b[1] - a[1]).slice(0, 10);
      const { data: companies } = await supabase.from('companies').select('id,name').in('id', topCompanyIds.map(([id]) => id));
      const topAccounts = topCompanyIds.map(([id, count]) => ({
        name: companies?.find((c) => c.id === id)?.name ?? '—',
        count,
      }));

      // confidence histogram
      const buckets = [0, 0, 0, 0]; // 60-70, 70-80, 80-90, 90-100
      signals.forEach((s) => {
        const c = s.confidence_score;
        if (c < 70) buckets[0]++;
        else if (c < 80) buckets[1]++;
        else if (c < 90) buckets[2]++;
        else buckets[3]++;
      });

      // signals over time (last 30 days, daily buckets)
      const dayMap = new Map<string, number>();
      for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toISOString().slice(0, 10);
        dayMap.set(key, 0);
      }
      signals.forEach((s) => {
        const key = s.published_at.slice(0, 10);
        if (dayMap.has(key)) dayMap.set(key, (dayMap.get(key) ?? 0) + 1);
      });
      const trend = Array.from(dayMap.entries()).map(([date, count]) => ({
        date: date.slice(5),
        count,
      }));

      const totalSignals = signals.length;
      const actedOn = signals.filter((s) => s.status !== 'NEW' && s.status !== 'DISMISSED').length;
      const outreachSent = drafts.filter((d) => d.status === 'SENT').length;
      const converted = signals.filter((s) => s.status === 'CONVERTED').length;
      const actionRate = totalSignals ? Math.round((actedOn / totalSignals) * 100) : 0;
      const conversionRate = outreachSent ? Math.round((converted / outreachSent) * 100) : 0;
      const hoursSaved = Math.round(totalSignals * 0.4); // ~24 min of research per signal

      return {
        totalSignals,
        actedOn,
        outreachSent,
        converted,
        actionRate,
        conversionRate,
        hoursSaved,
        byType: Object.entries(byType).map(([k, v]) => ({
          name: SIGNAL_TYPE_LABELS[k as SignalType] ?? k,
          count: v,
        })),
        bySource: Object.entries(bySource).map(([k, v]) => ({ name: k, value: v })),
        topAccounts,
        trend,
        confidence: [
          { range: '60-69', count: buckets[0] },
          { range: '70-79', count: buckets[1] },
          { range: '80-89', count: buckets[2] },
          { range: '90+', count: buckets[3] },
        ],
      };
    },
  });

  if (isLoading || !data) {
    return (
      <DashboardShell>
        <div className="p-6 text-sm text-muted-foreground">Loading analytics…</div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <div className="mx-auto max-w-7xl px-6 py-8 space-y-8">
        <header>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-brand" />
            Analytics
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Pipeline impact from your Signal & Outreach Agents · last 30 days.</p>
        </header>

        {/* Hero stat triplet — Salesmotion-style headline impact */}
        <div className="rounded-2xl border border-border bg-gradient-to-br from-card/80 to-card/30 p-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <HeroStat
              icon={Zap}
              value={`${data.actionRate}%`}
              label="signals acted on"
              sub={`${data.actedOn} of ${data.totalSignals} surfaced`}
            />
            <HeroStat
              icon={Trophy}
              value={`${data.conversionRate}%`}
              label="reply → meeting rate"
              sub={`${data.converted} converted from ${data.outreachSent} sent`}
            />
            <HeroStat
              icon={Clock}
              value={`${data.hoursSaved}h`}
              label="research time saved"
              sub="vs. manual prospecting"
            />
          </div>
        </div>

        {/* Metric cards */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Metric icon={Radio} label="Total signals" value={data.totalSignals} />
          <Metric icon={Trophy} label="Acted on" value={data.actedOn} />
          <Metric icon={Send} label="Outreach sent" value={data.outreachSent} />
          <Metric icon={TrendingUp} label="Converted" value={data.converted} />
        </div>

        {/* Trend */}
        <Card title="Signal volume — last 30 days">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data.trend}>
              <defs>
                <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--brand)" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="var(--brand)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={10} interval={4} />
              <YAxis stroke="var(--muted-foreground)" fontSize={10} />
              <Tooltip contentStyle={{ background: 'var(--popover)', border: '1px solid var(--border)', borderRadius: 8 }} />
              <Area type="monotone" dataKey="count" stroke="var(--brand)" strokeWidth={2} fill="url(#trendFill)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Charts */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card title="Signals by type">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={data.byType}>
                <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} />
                <Tooltip contentStyle={{ background: 'var(--popover)', border: '1px solid var(--border)', borderRadius: 8 }} />
                <Bar dataKey="count" fill="var(--brand)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card title="Source breakdown">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={data.bySource} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90}>
                  {data.bySource.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: 'var(--popover)', border: '1px solid var(--border)', borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          <Card title="Top 10 accounts by signal count">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.topAccounts} layout="vertical" margin={{ left: 80 }}>
                <XAxis type="number" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis type="category" dataKey="name" stroke="var(--muted-foreground)" fontSize={11} width={80} />
                <Tooltip contentStyle={{ background: 'var(--popover)', border: '1px solid var(--border)', borderRadius: 8 }} />
                <Bar dataKey="count" fill="oklch(0.74 0.18 200)" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card title="Confidence distribution">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={data.confidence}>
                <XAxis dataKey="range" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} />
                <Tooltip contentStyle={{ background: 'var(--popover)', border: '1px solid var(--border)', borderRadius: 8 }} />
                <Bar dataKey="count" fill="oklch(0.78 0.18 145)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}

function HeroStat({ icon: Icon, value, label, sub }: { icon: typeof Radio; value: string; label: string; sub: string }) {
  return (
    <div className="text-center md:text-left">
      <Icon className="mx-auto md:mx-0 h-5 w-5 text-brand mb-3" />
      <div className="text-5xl font-bold tracking-tight bg-gradient-to-r from-brand via-brand-glow to-brand bg-clip-text text-transparent tabular-nums">
        {value}
      </div>
      <div className="mt-2 text-sm font-medium">{label}</div>
      <div className="mt-1 text-xs text-muted-foreground">{sub}</div>
    </div>
  );
}

function Metric({ icon: Icon, label, value }: { icon: typeof Radio; label: string; value: number }) {
  return (
    <div className="surface-2 card-interactive rounded-xl p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{label}</span>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="mt-2 text-2xl font-bold tabular-nums">{value}</div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="surface-2 rounded-xl p-4">
      <h3 className="text-sm font-semibold mb-3">{title}</h3>
      {children}
    </div>
  );
}
