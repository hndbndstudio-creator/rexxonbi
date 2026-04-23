import { createFileRoute, Link, useRouter } from '@tanstack/react-router';
import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/lib/use-auth';
import { Button } from '@/components/ui/button';
import {
  Activity,
  ArrowRight,
  Bell,
  Briefcase,
  Building2,
  Check,
  ChevronRight,
  Database,
  Filter,
  Newspaper,
  Radio,
  Shield,
  Sparkles,
  TrendingUp,
  Users,
  Zap,
  Brain,
  Target,
  Mail,
  PhoneCall,
  Workflow,
  RefreshCw,
  Lock,
  Clock,
  BarChart3,
  Gauge,
  FileDown,
  MapPinned,
} from 'lucide-react';

export const Route = createFileRoute('/')({
  component: LandingPage,
});

const SAMPLE_TICKER = [
  'CrowdStrike → VP Product Security hire · SIEM evaluation imminent',
  'Stripe → CCO appointment · GRC budget activated',
  'Lattice → 3 CSM hires in 30 days · CS tooling under pressure',
  'Vercel → Series E announced · Infra spend window open',
  'Datadog → Director of Cloud Security posted · CNAPP RFP brewing',
  'Snowflake → Earnings beat, $200M security commitment',
  'Linear → CISO joined from Asana · Identity stack review',
  'Notion → 12 enterprise sales hires · Outbound stack expansion',
];

const LIVE_FEED_SAMPLES = [
  { company: 'Wiz', type: 'GROWTH', text: '5 Cloud Security Engineer roles posted · CNAPP scaling', tone: 'var(--signal-growth)' },
  { company: 'Rippling', type: 'LEADERSHIP', text: 'New VP Engineering ex-Stripe · Platform consolidation', tone: 'var(--signal-leadership)' },
  { company: 'Gong', type: 'TECH_EXPANSION', text: 'Snowflake → Databricks migration in job specs', tone: 'var(--signal-tech)' },
  { company: 'Figma', type: 'COMPLIANCE', text: 'SOC 2 Type II auditor RFP detected', tone: 'var(--signal-compliance)' },
  { company: 'HashiCorp', type: 'EARNINGS', text: 'Q3 guidance: +$40M security tooling spend', tone: 'var(--signal-earnings)' },
  { company: 'Okta', type: 'FUNDING', text: 'Strategic acquisition closed · Identity expansion', tone: 'var(--signal-funding)' },
  { company: 'PagerDuty', type: 'SALES_OPS', text: '8 SDR roles posted · Outreach platform eval', tone: 'var(--signal-sales)' },
];

function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [annual, setAnnual] = useState(false);
  const [feed, setFeed] = useState(LIVE_FEED_SAMPLES.slice(0, 4));
  const indexRef = useRef(4);

  useEffect(() => {
    if (user && !loading) {
      router.navigate({ to: '/dashboard' });
    }
  }, [user, loading, router]);

  useEffect(() => {
    const t = setInterval(() => {
      indexRef.current = (indexRef.current + 1) % LIVE_FEED_SAMPLES.length;
      setFeed((prev) => [LIVE_FEED_SAMPLES[indexRef.current], ...prev.slice(0, 3)]);
    }, 4000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Announcement bar */}
      <div className="border-b border-border/60 bg-gradient-to-r from-brand/20 via-brand/10 to-brand-glow/20 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 px-6 py-2 text-xs">
          <span className="rounded-full bg-brand/20 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-brand">
            New
          </span>
          <span className="text-foreground/90">
            Rexxon Agents now run 24/7 — every account researched, every signal drafted.
          </span>
          <a href="#product" className="hidden font-medium text-brand hover:underline sm:inline">
            See it live →
          </a>
        </div>
      </div>

      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur-2xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <Logo />
            <span className="text-base font-semibold tracking-tight">Rexxon AI</span>
          </Link>
          <div className="hidden items-center gap-8 md:flex">
            <a href="#product" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Product</a>
            <a href="#signals" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Signals</a>
            <a href="#pricing" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Pricing</a>
            <a href="https://docs.rexxon.ai" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Docs</a>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/login">
              <Button variant="ghost" size="sm">Sign in</Button>
            </Link>
            <Link to="/signup">
              <Button size="sm" className="bg-brand text-brand-foreground shadow-inset-glow transition-transform hover:-translate-y-0.5 hover:opacity-95">
                Start free
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative bg-aurora">
        <div className="mx-auto max-w-7xl px-6 pt-20 pb-24">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div className="animate-fade-up">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground shadow-soft backdrop-blur-sm">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-brand" />
                </span>
                Live signal engine · 12 sources · &lt;5 min latency
              </div>
              <h1 className="mt-6 text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl">
                Pipeline on
                <br />
                <span className="bg-gradient-to-r from-brand via-brand-glow to-brand bg-clip-text text-transparent">
                  autopilot.
                </span>
                <br />
                <span className="text-foreground/90">No excuses.</span>
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground md:text-xl">
                Every rep wakes up to fresh buying signals, verified contacts, and drafted emails — no research required. Rexxon's AI agents run deep account intel 24/7 and surface the moment a budget activates. The only thing left is to hit send.
              </p>
              <ul className="mt-7 space-y-2.5">
                {[
                  'Real-time alerts within 5 min of a signal firing',
                  'AI outreach drafts tuned to persona, tone, and trigger',
                  'Verified email + phone for the buying committee',
                ].map((bullet) => (
                  <li key={bullet} className="flex items-start gap-2.5 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                    <span className="text-foreground/90">{bullet}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-9 flex flex-wrap items-center gap-3">
                <Link to="/signup">
                  <Button size="lg" className="bg-brand text-brand-foreground shadow-inset-glow transition-transform hover:-translate-y-0.5 hover:opacity-95">
                    Start 14-day free trial
                    <ArrowRight className="ml-1.5 h-4 w-4" />
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="hover-lift backdrop-blur-sm">
                  Watch 2-min demo
                </Button>
              </div>
              <div className="mt-12 grid grid-cols-3 gap-6 border-t border-border pt-6">
                <Stat value="2×" label="More meetings" />
                <Stat value="40%" label="More pipeline" />
                <Stat value="6h" label="Saved per rep / week" />
              </div>
            </div>

            {/* Live feed panel */}
            <div className="relative animate-fade-up [animation-delay:120ms]">
              <div className="absolute -inset-6 rounded-[2rem] bg-gradient-to-br from-brand/25 via-brand/10 to-brand-glow/20 blur-3xl" />
              <div className="relative overflow-hidden rounded-2xl border border-border bg-card/85 p-1 shadow-elevated backdrop-blur-2xl glow-brand">
                <div className="flex items-center justify-between border-b border-border bg-gradient-to-b from-card/50 to-transparent px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="relative flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-brand to-brand-glow text-brand-foreground shadow-inset-glow">
                      <Radio className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold leading-tight">Signal Agent</div>
                      <div className="font-mono text-[10px] text-muted-foreground">streaming · v1.42</div>
                    </div>
                  </div>
                  <span className="rounded-full bg-green-500/15 px-2 py-0.5 font-mono text-[10px] font-medium text-green-300">
                    ● live
                  </span>
                </div>
                <div className="space-y-2 p-3">
                  {feed.map((s, i) => (
                    <div
                      key={`${s.company}-${i}`}
                      className="animate-signal-in rounded-xl border border-border bg-background/60 p-3 shadow-soft backdrop-blur-sm"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ background: s.tone, boxShadow: `0 0 10px ${s.tone}, 0 0 2px ${s.tone}` }}
                          />
                          <span className="text-sm font-semibold">{s.company}</span>
                          <span
                            className="rounded-md px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider"
                            style={{ background: `color-mix(in oklab, ${s.tone} 18%, transparent)`, color: s.tone, boxShadow: `inset 0 0 0 1px color-mix(in oklab, ${s.tone} 30%, transparent)` }}
                          >
                            {s.type}
                          </span>
                        </div>
                        <span className="font-mono text-[10px] text-muted-foreground">just now</span>
                      </div>
                      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{s.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Ticker */}
        <div className="border-y border-border bg-card/40 py-3 backdrop-blur-sm">
          <div className="flex w-max animate-ticker gap-12 whitespace-nowrap font-mono text-xs text-muted-foreground">
            {[...SAMPLE_TICKER, ...SAMPLE_TICKER].map((t, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-brand shadow-[0_0_8px_var(--brand)]" />
                {t}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What is Rexxon */}
      <section id="product" className="mx-auto max-w-7xl px-6 py-28">
        <SectionHeader
          eyebrow="The signal engine"
          title="A research analyst that never sleeps"
          subtitle="Static databases give you a snapshot. Rexxon watches for the moment that matters — when budgets activate, stacks evolve, and decision-makers move."
        />
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          <ExplainCard
            icon={<Bell className="h-5 w-5" />}
            title="Real-time, not weekly"
            body="While other tools refresh on a Monday, Rexxon polls every 4 minutes and alerts you within five of a signal firing. You move first, every time."
          />
          <ExplainCard
            icon={<Sparkles className="h-5 w-5" />}
            title="Insight, not just data"
            body="Every signal ships with AI interpretation: what it means, which budget just activated, and the exact vendor categories now in motion."
          />
          <ExplainCard
            icon={<Zap className="h-5 w-5" />}
            title="From trigger to send"
            body="Each alert lands with a verified contact, a buying-context email draft, and one-click push to your CRM or sequencer. Hit send and book the meeting."
          />
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-border bg-card/30 py-28">
        <div className="mx-auto max-w-7xl px-6">
          <SectionHeader
            eyebrow="How it works"
            title="Trigger → Insight → Action"
            subtitle="Four steps from signal detection to a meeting on your calendar. Set it up once. Let it run."
          />
          <div className="mt-14 grid gap-6 md:grid-cols-4">
            {[
              { n: '01', t: 'Define your territory', d: 'Pick industries, employee bands, funding stages, and named accounts you want to monitor.' },
              { n: '02', t: 'Signals fire', d: 'Job posts, news, filings, and leadership moves are scored against your buying-trigger taxonomy.' },
              { n: '03', t: 'AI interprets', d: 'Each signal is enriched with insight, vendor categories, and the right hiring manager.' },
              { n: '04', t: 'You hit send', d: 'Drafted outreach lands in your inbox or Slack. One click pushes it to your sequence.' },
            ].map((step, idx) => (
              <div key={step.n} className="hover-lift relative rounded-2xl border border-border bg-background/50 p-6 shadow-soft backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div className="font-mono text-xs font-semibold tracking-wider text-brand">{step.n}</div>
                  {idx < 3 && <ArrowRight className="hidden h-4 w-4 text-muted-foreground/40 md:block" />}
                </div>
                <h3 className="mt-3 text-base font-semibold">{step.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Signal taxonomy */}
      <section id="signals" className="mx-auto max-w-7xl px-6 py-24">
        <SectionHeader
          eyebrow="Signal taxonomy"
          title="12 IT job categories, mapped to spend"
          subtitle="Every signal is tagged with a spend category so your reps know exactly which conversation to open."
        />
        <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { cat: 'Security', spend: 'SIEM, EDR, XDR, vulnerability mgmt' },
            { cat: 'DevOps / Cloud', spend: 'CNAPP, IaC, Kubernetes mgmt' },
            { cat: 'Data / Analytics', spend: 'Warehouses, ETL, BI tools' },
            { cat: 'Sales / Revenue', spend: 'CRM, sales engagement, RevOps' },
            { cat: 'Marketing', spend: 'MAP, ABM, CDP, attribution' },
            { cat: 'HR / People', spend: 'HRIS, perf mgmt, learning' },
            { cat: 'Finance / GRC', spend: 'Audit, GRC, billing, FP&A' },
            { cat: 'Legal', spend: 'CLM, e-billing, e-discovery' },
            { cat: 'Customer Success', spend: 'CS platforms, support tools' },
            { cat: 'Product / Eng', spend: 'Observability, feature flags' },
            { cat: 'Compliance', spend: 'SOC 2, ISO, GDPR, HIPAA tools' },
            { cat: 'Executive', spend: 'Strategy, board reporting' },
          ].map((c) => (
            <div key={c.cat} className="hover-lift flex items-center justify-between rounded-xl border border-border bg-card/50 px-4 py-3.5 shadow-soft backdrop-blur-sm">
              <div>
                <div className="text-sm font-medium">{c.cat}</div>
                <div className="mt-0.5 text-xs text-muted-foreground">{c.spend}</div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
            </div>
          ))}
        </div>
      </section>

      {/* Sources */}
      <section className="border-y border-border bg-card/30 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <SectionHeader eyebrow="Sources" title="12 monitored data sources" />
          <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4">
            {[
              { i: <Briefcase className="h-4 w-4" />, n: 'LinkedIn' },
              { i: <Briefcase className="h-4 w-4" />, n: 'Indeed' },
              { i: <Database className="h-4 w-4" />, n: 'Crunchbase' },
              { i: <Building2 className="h-4 w-4" />, n: 'SEC EDGAR' },
              { i: <Newspaper className="h-4 w-4" />, n: 'Business Wire' },
              { i: <Newspaper className="h-4 w-4" />, n: 'Google News' },
              { i: <TrendingUp className="h-4 w-4" />, n: 'Seeking Alpha' },
              { i: <Users className="h-4 w-4" />, n: 'Glassdoor' },
              { i: <Briefcase className="h-4 w-4" />, n: 'Stack Overflow Jobs' },
              { i: <Briefcase className="h-4 w-4" />, n: 'Dice' },
              { i: <Shield className="h-4 w-4" />, n: 'ISACA' },
              { i: <Shield className="h-4 w-4" />, n: 'CyberSeek' },
            ].map((s) => (
              <div key={s.n} className="hover-lift flex items-center gap-2.5 rounded-xl border border-border bg-background/50 px-3.5 py-3 text-sm shadow-soft backdrop-blur-sm">
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-brand/15 text-brand shadow-inset-glow">{s.i}</span>
                <span className="font-medium">{s.n}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Everything you get — features, benefits, differentiators */}
      <section id="features" className="border-y border-border/60 bg-card/30">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <SectionHeader
            eyebrow="Everything included"
            title="One platform. The entire signal-to-meeting workflow."
            subtitle="From intent detection to outreach reply — Rexxon handles every step so your reps spend their day in conversations, not in research tabs."
          />

          {/* Capability pillars */}
          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: <Radio className="h-5 w-5" />,
                title: 'Real-time signal feed',
                desc: 'Funding, hiring, leadership, tech, compliance and earnings signals stream into one ranked inbox.',
                bullets: ['12+ live data sources', 'Confidence scoring', 'Sub-5-minute latency'],
              },
              {
                icon: <Brain className="h-5 w-5" />,
                title: 'AI account briefs',
                desc: 'A senior-AE-level brief on any account in seconds — pain points, buying committee, why-now, risks.',
                bullets: ['Auto-generated on demand', 'Cached per company', 'Copy-ready format'],
              },
              {
                icon: <Building2 className="h-5 w-5" />,
                title: 'Account monitoring',
                desc: 'Pin target companies and Rexxon watches them 24/7 — you only hear about them when something changes.',
                bullets: ['Unlimited watchlists', 'Daily / weekly digests', 'Per-account alerting'],
              },
              {
                icon: <Users className="h-5 w-5" />,
                title: 'Decision-maker contacts',
                desc: 'Verified emails and direct dials for the people tied to each signal — no manual prospecting.',
                bullets: ['Email + phone reveal', 'LinkedIn + title context', 'Tied to the triggering signal'],
              },
              {
                icon: <Mail className="h-5 w-5" />,
                title: 'AI outreach drafts',
                desc: 'One-click personalised emails grounded in the signal that triggered them. Edit, approve, send.',
                bullets: ['Persona + tone presets', 'Multi-step sequences', 'Reply-rate optimised'],
              },
              {
                icon: <MapPinned className="h-5 w-5" />,
                title: 'Territory & ICP rules',
                desc: 'Tell the agent your industries, sizes, geos and signal types. The feed only shows what you can close.',
                bullets: ['Industry + geo filters', 'Confidence thresholds', 'Per-rep territories'],
              },
              {
                icon: <Workflow className="h-5 w-5" />,
                title: 'CRM + sequencer sync',
                desc: 'Push enriched accounts and contacts straight into Salesforce, HubSpot, Outreach or Salesloft.',
                bullets: ['One-click CRM push', 'Bi-directional sync', 'CSV export anywhere'],
              },
              {
                icon: <Bell className="h-5 w-5" />,
                title: 'Slack & email alerts',
                desc: 'High-confidence signals show up where you already work — no extra tab to babysit.',
                bullets: ['Per-channel routing', 'Daily digest email', 'Custom signal weighting'],
              },
              {
                icon: <BarChart3 className="h-5 w-5" />,
                title: 'Analytics & attribution',
                desc: 'See which signals drove meetings, which sequences convert, and where pipeline actually came from.',
                bullets: ['Signal-to-meeting attribution', 'Rep performance dashboards', 'Win/loss feedback loop'],
              },
            ].map((f) => (
              <div
                key={f.title}
                className="card-interactive surface-2 group rounded-xl border border-border p-5"
              >
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-brand/12 text-brand ring-1 ring-brand/20">
                    {f.icon}
                  </span>
                  <h3 className="text-base font-semibold">{f.title}</h3>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
                <ul className="mt-4 space-y-1.5 border-t border-border/60 pt-3">
                  {f.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2 text-xs text-foreground/85">
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Outcome / benefit row */}
          <div className="mt-14">
            <div className="mb-6 text-center">
              <p className="text-[11px] font-mono uppercase tracking-wider text-brand">Why teams switch</p>
              <h3 className="mt-2 text-2xl font-bold tracking-tight md:text-3xl">
                The outcomes you actually care about
              </h3>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { icon: <Clock className="h-4 w-4" />, stat: '8+ hrs', label: 'Saved per rep, per week', sub: 'No more manual list-building' },
                { icon: <Target className="h-4 w-4" />, stat: '3.4×', label: 'Higher reply rates', sub: 'Outreach grounded in real signals' },
                { icon: <Gauge className="h-4 w-4" />, stat: '< 5 min', label: 'Signal-to-inbox latency', sub: 'Be first when intent appears' },
                { icon: <TrendingUp className="h-4 w-4" />, stat: '2.1×', label: 'Pipeline lift in Q1', sub: 'Average across paying teams' },
              ].map((b) => (
                <div key={b.label} className="surface-2 rounded-xl border border-border p-5 text-center">
                  <span className="mx-auto inline-flex h-9 w-9 items-center justify-center rounded-full bg-brand/12 text-brand">
                    {b.icon}
                  </span>
                  <div className="mt-3 text-3xl font-bold tracking-tight">{b.stat}</div>
                  <div className="mt-1 text-sm font-medium">{b.label}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{b.sub}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Differentiators */}
          <div className="mt-14 rounded-2xl border border-border bg-background/40 p-8">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-[11px] font-mono uppercase tracking-wider text-brand">What sets Rexxon apart</p>
                <h3 className="mt-2 text-2xl font-bold tracking-tight">Why we win against the legacy stack</h3>
              </div>
              <p className="max-w-md text-sm text-muted-foreground">
                Most "intent" tools sell you noise. Rexxon ranks, contextualises and routes — so every signal
                you see is one a rep can actually act on today.
              </p>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {[
                { icon: <Sparkles className="h-4 w-4" />, title: 'AI-ranked, not keyword-matched', desc: 'Signals are scored by an LLM that understands context, not regex on job titles.' },
                { icon: <Zap className="h-4 w-4" />, title: 'Action-first, not data-dump', desc: 'Every signal ships with a why-now, the right contact, and a draft email — not a spreadsheet.' },
                { icon: <Database className="h-4 w-4" />, title: 'No data per-record fees', desc: 'Unlimited contact reveals on every plan. No surprise overages, no per-credit pricing.' },
                { icon: <RefreshCw className="h-4 w-4" />, title: 'Replaces 4+ tools', desc: 'ZoomInfo + Apollo + Clay + Common Room — at a fraction of the seat cost.' },
                { icon: <Lock className="h-4 w-4" />, title: 'SOC 2 Type II + EU residency', desc: 'Enterprise-ready security with regional data hosting and SAML SSO on Team plans.' },
                { icon: <FileDown className="h-4 w-4" />, title: 'Your data stays portable', desc: 'CSV export, CRM push, and full account history — never locked behind a paywall.' },
              ].map((d) => (
                <div key={d.title} className="flex items-start gap-3 rounded-xl border border-border/60 bg-card/50 p-4">
                  <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand/12 text-brand">
                    {d.icon}
                  </span>
                  <div>
                    <div className="text-sm font-semibold">{d.title}</div>
                    <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{d.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Built-in scroll list */}
          <div className="mt-14 grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-1">
              <p className="text-[11px] font-mono uppercase tracking-wider text-brand">Also included</p>
              <h3 className="mt-2 text-2xl font-bold tracking-tight">Every plan ships with the essentials</h3>
              <p className="mt-3 text-sm text-muted-foreground">
                Not a single feature on the right is gated to enterprise. The only thing that scales with
                your plan is monitored accounts and seats.
              </p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2 lg:col-span-2">
              {[
                'Real-time signal stream',
                'Verified email + phone reveal',
                'AI research briefs per account',
                'AI outreach drafting',
                'Multi-step sequence builder',
                'Slack alerts & email digests',
                'Custom signal weighting',
                'Industry & geography filters',
                'Confidence threshold rules',
                'CSV export everywhere',
                'CRM push (Salesforce / HubSpot)',
                'Outreach.io & Salesloft sync',
                'Per-rep territories',
                'Activity & audit timeline',
                'Win/loss feedback loop',
                'SAML SSO (Team plan)',
                'SOC 2 Type II',
                'EU data residency',
              ].map((item) => (
                <div key={item} className="flex items-center gap-2 rounded-lg border border-border/60 bg-card/40 px-3 py-2 text-sm">
                  <Check className="h-3.5 w-3.5 shrink-0 text-brand" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="mx-auto max-w-7xl px-6 py-24">
        <SectionHeader
          eyebrow="Pricing"
          title="Built for revenue teams of every size"
          subtitle="All plans include verified contacts, AI outreach, and Slack alerts."
        />
        <div className="mt-8 flex justify-center">
          <div className="inline-flex items-center rounded-full border border-border bg-card p-1 text-sm">
            <button
              onClick={() => setAnnual(false)}
              className={`rounded-full px-4 py-1.5 transition-colors ${!annual ? 'bg-brand text-brand-foreground' : 'text-muted-foreground'}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`rounded-full px-4 py-1.5 transition-colors ${annual ? 'bg-brand text-brand-foreground' : 'text-muted-foreground'}`}
            >
              Annual <span className="ml-1 text-xs opacity-80">−20%</span>
            </button>
          </div>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            { name: 'Starter', price: 79, accounts: '75 accounts', users: '1 user', highlight: false, features: ['75 monitored accounts', '1 user seat', 'Real-time signal feed', 'AI outreach drafts', 'Verified contacts', 'Slack alerts', 'Email digest'] },
            { name: 'Pro', price: 199, accounts: '250 accounts', users: '3 users', highlight: true, features: ['250 monitored accounts', '3 user seats', 'Everything in Starter', 'CRM push (Salesforce, HubSpot)', 'Outreach.io / Salesloft sync', 'Custom signal weighting', 'Priority support'] },
            { name: 'Team', price: 349, accounts: '750 accounts', users: '10 users', highlight: false, features: ['750 monitored accounts', '10 user seats', 'Everything in Pro', 'Territory routing', 'Win/loss feedback loop', 'Dedicated CSM', 'SAML SSO'] },
          ].map((plan) => {
            const price = annual ? Math.round(plan.price * 0.8) : plan.price;
            return (
              <div
                key={plan.name}
                className={`hover-lift relative rounded-2xl border p-7 backdrop-blur-sm ${plan.highlight ? 'border-brand bg-card shadow-elevated glow-brand' : 'border-border bg-card/60 shadow-soft'}`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-7 rounded-full bg-gradient-to-r from-brand to-brand-glow px-3 py-0.5 text-[11px] font-semibold text-brand-foreground shadow-inset-glow">
                    Most popular
                  </div>
                )}
                <h3 className="text-lg font-semibold">{plan.name}</h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-5xl font-bold tracking-tight">${price}</span>
                  <span className="text-sm text-muted-foreground">/mo</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{plan.accounts} · {plan.users}</p>
                <Link to="/signup">
                  <Button className={`mt-6 w-full ${plan.highlight ? 'bg-brand text-brand-foreground shadow-inset-glow hover:opacity-95' : ''}`} variant={plan.highlight ? 'default' : 'outline'}>
                    Start free trial
                  </Button>
                </Link>
                <ul className="mt-6 space-y-2.5 border-t border-border pt-5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                      <span className="text-foreground/85">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      {/* Testimonials */}
      <section className="border-y border-border bg-card/30 py-28">
        <div className="mx-auto max-w-7xl px-6">
          <SectionHeader
            eyebrow="Loved by revenue teams"
            title="Reps don't prospect cold anymore"
            subtitle="From scrappy startups to scaling RevOps teams — Rexxon is the unfair advantage in their stack."
          />
          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              { q: 'We replaced a $40k/year intent vendor with Rexxon and now book 3× the meetings.', n: 'Maya Patel', r: 'VP Sales', c: 'Helio Cloud', res: '+212% meetings' },
              { q: 'The AI insight on every signal is the unlock. My SDRs stopped guessing what to say.', n: 'Jordan Lee', r: 'Head of SDRs', c: 'Forge Security', res: '38% reply rate' },
              { q: 'A new VP of Eng hire in our ICP used to take a week to surface. Now it lands in Slack in 4 minutes.', n: 'Sam Chen', r: 'AE Manager', c: 'Quant Labs', res: '4-min latency' },
              { q: 'Outreach drafts are the best I\'ve seen. We send them with one edit, not five.', n: 'Alex Rivers', r: 'Founder', c: 'Vector Agency', res: '6× pipeline' },
            ].map((t) => (
              <div key={t.n} className="hover-lift rounded-2xl border border-border bg-background/50 p-6 shadow-soft backdrop-blur-sm">
                <div className="font-serif text-3xl leading-none text-brand/40">"</div>
                <p className="mt-2 text-sm leading-relaxed text-foreground/90">{t.q}</p>
                <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
                  <div>
                    <div className="text-sm font-semibold">{t.n}</div>
                    <div className="text-xs text-muted-foreground">{t.r} · {t.c}</div>
                  </div>
                  <div className="rounded-md bg-brand/15 px-2 py-1 font-mono text-xs font-semibold text-brand shadow-inset-glow">{t.res}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Plays nicely with your stack
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
          {['Slack', 'Salesforce', 'HubSpot', 'Outreach', 'Salesloft', 'Zapier'].map((logo) => (
            <div key={logo} className="text-lg font-semibold tracking-tight text-muted-foreground/70 transition-colors hover:text-foreground">
              {logo}
            </div>
          ))}
        </div>
      </section>

      {/* Footer CTA */}
      <section className="mx-auto max-w-7xl px-6 pb-28">
        <div className="relative overflow-hidden rounded-[2rem] border border-border bg-card p-14 text-center shadow-elevated bg-aurora">
          <div className="absolute inset-0 bg-grid opacity-[0.15]" />
          <div className="relative">
            <h2 className="text-4xl font-bold tracking-tight md:text-5xl">
              Stop guessing.{' '}
              <span className="bg-gradient-to-r from-brand via-brand-glow to-brand bg-clip-text text-transparent">
                Start signaling.
              </span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground md:text-lg">
              14 days free. No credit card. Live in under 10 minutes.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link to="/signup">
                <Button size="lg" className="bg-brand text-brand-foreground shadow-inset-glow transition-transform hover:-translate-y-0.5 hover:opacity-95">
                  Start free trial <ArrowRight className="ml-1.5 h-4 w-4" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="hover-lift backdrop-blur-sm">
                Talk to sales
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
          <div className="flex items-center gap-2">
            <Logo />
            <span className="text-sm font-medium">Rexxon AI</span>
          </div>
          <div className="flex gap-6 text-xs text-muted-foreground">
            <a href="#product" className="hover:text-foreground">Product</a>
            <a href="#pricing" className="hover:text-foreground">Pricing</a>
            <a href="https://docs.rexxon.ai" className="hover:text-foreground">Docs</a>
            <a href="mailto:hello@rexxon.ai" className="hover:text-foreground">Contact</a>
          </div>
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} Rexxon AI</p>
        </div>
      </footer>
    </div>
  );
}

function Logo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const dims = size === 'lg' ? 'h-9 w-9 rounded-lg' : size === 'sm' ? 'h-6 w-6 rounded-md' : 'h-8 w-8 rounded-md';
  const icon = size === 'lg' ? 'h-5 w-5' : size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4';
  return (
    <div className={`logo-badge relative flex items-center justify-center text-brand-foreground ${dims}`}>
      <Activity className={`relative z-10 ${icon} drop-shadow-[0_1px_1px_rgba(0,0,0,0.4)]`} strokeWidth={2.5} />
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="text-2xl font-bold tracking-tight">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function SectionHeader({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle?: string }) {
  return (
    <div className="text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-5xl">{title}</h2>
      {subtitle && <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground md:text-lg">{subtitle}</p>}
    </div>
  );
}

function ExplainCard({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="hover-lift rounded-2xl border border-border bg-card/60 p-6 shadow-soft backdrop-blur-sm">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand/25 to-brand/5 text-brand shadow-inset-glow">
        {icon}
      </div>
      <h3 className="mt-5 text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
    </div>
  );
}
