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
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2">
            <Logo />
            <span className="text-lg font-semibold tracking-tight">Rexxon AI</span>
          </Link>
          <div className="hidden items-center gap-8 md:flex">
            <a href="#product" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Product</a>
            <a href="#signals" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Signals</a>
            <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
            <a href="https://docs.rexxon.ai" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Docs</a>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/login">
              <Button variant="ghost" size="sm">Sign in</Button>
            </Link>
            <Link to="/signup">
              <Button size="sm" className="bg-brand text-brand-foreground hover:opacity-90">Start free</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative bg-radial-brand">
        <div className="mx-auto max-w-7xl px-6 pt-20 pb-24">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-brand" />
                </span>
                Live signal engine · 12 sources monitored
              </div>
              <h1 className="mt-6 text-5xl font-bold tracking-tight md:text-6xl">
                Catch buying signals
                <br />
                <span className="bg-gradient-to-r from-brand via-brand-glow to-brand bg-clip-text text-transparent">
                  before your competitors do.
                </span>
              </h1>
              <p className="mt-6 text-lg text-muted-foreground">
                Rexxon AI monitors 12 data sources for hiring spikes, leadership changes, funding events, and compliance moves — then delivers real-time alerts with AI-drafted outreach and verified contact data.
              </p>
              <ul className="mt-6 space-y-2">
                {[
                  'Real-time alerts within minutes of a signal firing',
                  'AI-drafted outreach with persona and tone tuning',
                  'Verified email + phone for the hiring manager',
                ].map((bullet) => (
                  <li key={bullet} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                    <span className="text-foreground/90">{bullet}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link to="/signup">
                  <Button size="lg" className="bg-brand text-brand-foreground hover:opacity-90">
                    Start 14-day free trial
                    <ArrowRight className="ml-1.5 h-4 w-4" />
                  </Button>
                </Link>
                <Button size="lg" variant="outline">Watch 2-min demo</Button>
              </div>
              <div className="mt-12 grid grid-cols-3 gap-6 border-t border-border pt-6">
                <Stat value="12" label="Signal sources" />
                <Stat value="<5min" label="Alert latency" />
                <Stat value="89%" label="Email accuracy" />
              </div>
            </div>

            {/* Live feed panel */}
            <div className="relative">
              <div className="absolute -inset-4 rounded-3xl bg-brand/10 blur-3xl" />
              <div className="relative rounded-2xl border border-border bg-card/80 p-1 shadow-2xl backdrop-blur-xl glow-brand">
                <div className="flex items-center justify-between border-b border-border px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Radio className="h-4 w-4 text-brand" />
                    <span className="text-sm font-medium">Live signal feed</span>
                  </div>
                  <span className="font-mono text-xs text-muted-foreground">v1.42 · streaming</span>
                </div>
                <div className="space-y-2 p-3">
                  {feed.map((s, i) => (
                    <div
                      key={`${s.company}-${i}`}
                      className="animate-signal-in rounded-lg border border-border bg-background/40 p-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ background: s.tone, boxShadow: `0 0 8px ${s.tone}` }}
                          />
                          <span className="text-sm font-semibold">{s.company}</span>
                          <span
                            className="rounded-md px-1.5 py-0.5 font-mono text-[10px] uppercase"
                            style={{ background: `color-mix(in oklab, ${s.tone} 18%, transparent)`, color: s.tone }}
                          >
                            {s.type}
                          </span>
                        </div>
                        <span className="font-mono text-[10px] text-muted-foreground">just now</span>
                      </div>
                      <p className="mt-1.5 text-sm text-muted-foreground">{s.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Ticker */}
        <div className="border-y border-border bg-card/40 py-3">
          <div className="flex w-max animate-ticker gap-12 whitespace-nowrap font-mono text-xs text-muted-foreground">
            {[...SAMPLE_TICKER, ...SAMPLE_TICKER].map((t, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-brand" />
                {t}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What is Rexxon */}
      <section id="product" className="mx-auto max-w-7xl px-6 py-24">
        <SectionHeader
          eyebrow="What is Rexxon"
          title="A signal engine, not another database"
          subtitle="Static data is a snapshot. Rexxon watches for moments of change — when budgets activate, stacks evolve, and decision-makers move."
        />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          <ExplainCard
            icon={<Bell className="h-5 w-5" />}
            title="Real-time, not weekly"
            body="Most platforms refresh weekly. Rexxon polls every 4 minutes and pushes alerts within five minutes of a signal firing."
          />
          <ExplainCard
            icon={<Sparkles className="h-5 w-5" />}
            title="Insight, not just data"
            body="Every signal is interpreted by AI: what it means, what budget it activates, and which vendors should be in motion."
          />
          <ExplainCard
            icon={<Zap className="h-5 w-5" />}
            title="From trigger to outreach"
            body="Each alert ships with a verified contact, a buying-context email draft, and a one-click push to your CRM or sequencer."
          />
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-border bg-card/30 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <SectionHeader eyebrow="How it works" title="Trigger → Insight → Action" />
          <div className="mt-12 grid gap-6 md:grid-cols-4">
            {[
              { n: '01', t: 'Define territory', d: 'Pick industries, employee bands, funding stages, and named accounts you want to monitor.' },
              { n: '02', t: 'Signals fire', d: 'Job posts, news, filings, and leadership moves are scored against your buying-trigger taxonomy.' },
              { n: '03', t: 'AI interprets', d: 'Each signal is enriched with insight, vendor categories, and the right hiring manager.' },
              { n: '04', t: 'You act', d: 'Drafted outreach lands in your inbox or Slack. One click pushes it to your sequence.' },
            ].map((step) => (
              <div key={step.n} className="rounded-xl border border-border bg-background/40 p-5">
                <div className="font-mono text-xs text-brand">{step.n}</div>
                <h3 className="mt-2 font-semibold">{step.t}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{step.d}</p>
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
            <div key={c.cat} className="flex items-center justify-between rounded-lg border border-border bg-card/40 px-4 py-3">
              <div>
                <div className="text-sm font-medium">{c.cat}</div>
                <div className="text-xs text-muted-foreground">{c.spend}</div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
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
              <div key={s.n} className="flex items-center gap-2 rounded-lg border border-border bg-background/40 px-3 py-2.5 text-sm">
                <span className="text-brand">{s.i}</span>
                {s.n}
              </div>
            ))}
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
                className={`relative rounded-2xl border p-6 ${plan.highlight ? 'border-brand bg-card glow-brand' : 'border-border bg-card/60'}`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-6 rounded-full bg-brand px-3 py-0.5 text-xs font-medium text-brand-foreground">
                    Most popular
                  </div>
                )}
                <h3 className="text-lg font-semibold">{plan.name}</h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-4xl font-bold">${price}</span>
                  <span className="text-sm text-muted-foreground">/mo</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{plan.accounts} · {plan.users}</p>
                <Link to="/signup">
                  <Button className={`mt-5 w-full ${plan.highlight ? 'bg-brand text-brand-foreground hover:opacity-90' : ''}`} variant={plan.highlight ? 'default' : 'outline'}>
                    Start free trial
                  </Button>
                </Link>
                <ul className="mt-6 space-y-2 border-t border-border pt-5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                      <span className="text-muted-foreground">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      {/* Testimonials */}
      <section className="border-y border-border bg-card/30 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <SectionHeader eyebrow="Loved by sales teams" title="Reps don't prospect cold anymore" />
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              { q: 'We replaced a $40k/year intent vendor with Rexxon and now book 3× the meetings.', n: 'Maya Patel', r: 'VP Sales', c: 'Helio Cloud', res: '+212% meetings' },
              { q: 'The AI insight on every signal is the unlock. My SDRs stopped guessing what to say.', n: 'Jordan Lee', r: 'Head of SDRs', c: 'Forge Security', res: '38% reply rate' },
              { q: 'A new VP of Eng hire in our ICP used to take a week to surface. Now it lands in Slack in 4 minutes.', n: 'Sam Chen', r: 'AE Manager', c: 'Quant Labs', res: '4-min latency' },
              { q: 'Outreach drafts are the best I\'ve seen. We send them with one edit, not five.', n: 'Alex Rivers', r: 'Founder', c: 'Vector Agency', res: '6× pipeline' },
            ].map((t) => (
              <div key={t.n} className="rounded-xl border border-border bg-background/40 p-5">
                <p className="text-sm leading-relaxed text-foreground/90">"{t.q}"</p>
                <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
                  <div>
                    <div className="text-sm font-medium">{t.n}</div>
                    <div className="text-xs text-muted-foreground">{t.r} · {t.c}</div>
                  </div>
                  <div className="rounded-md bg-brand/15 px-2 py-1 font-mono text-xs text-brand">{t.res}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <p className="text-center text-sm font-medium uppercase tracking-widest text-muted-foreground">
          Plays nicely with your stack
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-10 gap-y-6 opacity-80">
          {['Slack', 'Salesforce', 'HubSpot', 'Outreach', 'Salesloft', 'Zapier'].map((logo) => (
            <div key={logo} className="font-semibold text-lg text-muted-foreground">
              {logo}
            </div>
          ))}
        </div>
      </section>

      {/* Footer CTA */}
      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="rounded-3xl border border-border bg-card bg-radial-brand p-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Stop guessing. Start signaling.
          </h2>
          <p className="mt-3 text-muted-foreground">
            14 days free. No credit card. Setup in 10 minutes.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link to="/signup">
              <Button size="lg" className="bg-brand text-brand-foreground hover:opacity-90">
                Start free trial <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </Link>
            <Button size="lg" variant="outline">Talk to sales</Button>
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

function Logo() {
  return (
    <div className="relative flex h-7 w-7 items-center justify-center rounded-md bg-brand text-brand-foreground">
      <Activity className="h-4 w-4" />
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
      <p className="text-sm font-medium text-brand">{eyebrow}</p>
      <h2 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">{title}</h2>
      {subtitle && <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">{subtitle}</p>}
    </div>
  );
}

function ExplainCard({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="rounded-xl border border-border bg-card/60 p-6">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand/15 text-brand">{icon}</div>
      <h3 className="mt-4 font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{body}</p>
    </div>
  );
}
