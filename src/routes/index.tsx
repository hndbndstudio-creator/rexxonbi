import { createFileRoute, Link, useRouter } from '@tanstack/react-router';
import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/lib/use-auth';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui/tabs';
import {
  ArrowRight,
  Bell,
  Building2,
  Check,
  ChevronRight,
  Database,
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
  Workflow,
  Lock,
  Clock,
  Gauge,
  Star,
  ShieldCheck,
  CalendarCheck,
  Play,
  X as CloseIcon,
  Layers,
  BookOpen,
  FileText,
  MessageSquare,
  Filter,
  Upload,
} from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { RexxonLogo } from '@/components/rexxon-logo';
import { BLOG_POSTS, CASE_STUDIES } from '@/lib/blog-content';
import birdseyeDashboard from '@/assets/birdseye-dashboard.png';
import avatar1 from '@/assets/avatar-1.jpg';
import avatar2 from '@/assets/avatar-2.jpg';
import avatar3 from '@/assets/avatar-3.jpg';
import avatar4 from '@/assets/avatar-4.jpg';
import testimonial1 from '@/assets/testimonial-1.jpg';
import testimonial2 from '@/assets/testimonial-2.jpg';
import testimonial3 from '@/assets/testimonial-3.jpg';

const HERO_AVATARS = [avatar1, avatar2, avatar3, avatar4];

export const Route = createFileRoute('/')({
  head: () => ({
    meta: [
      { name: 'robots', content: 'index, follow, max-image-preview:large, max-snippet:-1' },
      { title: 'Rexxon AI — Real-time B2B buying signals' },
      {
        name: 'description',
        content:
          'AI agents monitor 10M+ companies for buying signals — hiring, funding, leadership shifts — and draft outreach to verified contacts. Book 2× more meetings.',
      },
      { property: 'og:title', content: 'Rexxon AI — Real-time B2B buying signals & AI outreach' },
      {
        property: 'og:description',
        content: 'Catch every buying signal across 10M+ companies. AI-drafted outreach to verified contacts. Get started today.',
      },
      { property: 'og:url', content: 'https://rexxon.ai/' },
      { property: 'og:image', content: 'https://rexxon.ai/og-image.jpg' },
      { name: 'twitter:title', content: 'Rexxon AI — Real-time B2B buying signals' },
      {
        name: 'twitter:description',
        content: 'Catch every buying signal across 10M+ companies. AI-drafted outreach to verified contacts.',
      },
      { name: 'twitter:image', content: 'https://rexxon.ai/og-image.jpg' },
    ],
    links: [{ rel: 'canonical', href: 'https://rexxon.ai/' }],
  }),
  component: LandingPage,
});

/* ──────────────────────────────────────────────────────────────── */
/*  Data                                                            */
/* ──────────────────────────────────────────────────────────────── */

const TICKER = [
  'CrowdStrike → VP Product Security hire · SIEM eval imminent',
  'Stripe → CCO appointment · GRC budget activated',
  'Lattice → 3 CSM hires in 30 days · CS tooling under pressure',
  'Vercel → Series E announced · Infra spend window open',
  'Datadog → Director of Cloud Security posted · CNAPP RFP brewing',
  'Snowflake → Earnings beat · $200M security commitment',
  'Linear → CISO joined from Asana · Identity stack review',
  'Notion → 12 enterprise sales hires · Outbound stack expansion',
];

const LIVE_FEED = [
  { company: 'Wiz', type: 'GROWTH', text: '5 Cloud Security Engineer roles posted · CNAPP scaling', tone: 'var(--signal-growth)' },
  { company: 'Rippling', type: 'LEADERSHIP', text: 'New VP Engineering ex-Stripe · Platform consolidation', tone: 'var(--signal-leadership)' },
  { company: 'Gong', type: 'TECH_EXPANSION', text: 'Snowflake → Databricks migration in job specs', tone: 'var(--signal-tech)' },
  { company: 'Figma', type: 'COMPLIANCE', text: 'SOC 2 Type II auditor RFP detected', tone: 'var(--signal-compliance)' },
  { company: 'HashiCorp', type: 'EARNINGS', text: 'Q3 guidance: +$40M security tooling spend', tone: 'var(--signal-earnings)' },
  { company: 'Okta', type: 'FUNDING', text: 'Strategic acquisition closed · Identity expansion', tone: 'var(--signal-funding)' },
  { company: 'PagerDuty', type: 'SALES_OPS', text: '8 SDR roles posted · Outreach platform eval', tone: 'var(--signal-sales)' },
];

const SOCIAL_LOGOS = [
  'Linear', 'Vercel', 'Ramp', 'Notion', 'Datadog', 'Stripe',
  'HashiCorp', 'Figma', 'Snowflake', 'Anthropic', 'Cloudflare', 'Loom',
];

/* ──────────────────────────────────────────────────────────────── */
/*  Hooks                                                            */
/* ──────────────────────────────────────────────────────────────── */

function useReveal() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const els = document.querySelectorAll<HTMLElement>('.reveal');
    if (!('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('is-visible'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-visible');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

function useCountUp(target: number, duration = 1400, suffix = '', decimals = 0) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement | null>(null);
  const started = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !ref.current) return;
    const node = ref.current;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const tick = (now: number) => {
            const t = Math.min(1, (now - start) / duration);
            const eased = 1 - Math.pow(1 - t, 3);
            setVal(target * eased);
            if (t < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      });
    }, { threshold: 0.4 });
    io.observe(node);
    return () => io.disconnect();
  }, [target, duration]);

  const display = decimals > 0 ? val.toFixed(decimals) : Math.round(val).toLocaleString();
  return { ref, display: `${display}${suffix}` };
}

function Counter({ to, suffix = '', decimals = 0, prefix = '' }: { to: number; suffix?: string; decimals?: number; prefix?: string }) {
  const { ref, display } = useCountUp(to, 1500, suffix, decimals);
  return <span ref={ref}>{prefix}{display}</span>;
}

/* ──────────────────────────────────────────────────────────────── */
/*  Page                                                             */
/* ──────────────────────────────────────────────────────────────── */

function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [annual, setAnnual] = useState(true);
  const [feed, setFeed] = useState(LIVE_FEED.slice(0, 4));
  const indexRef = useRef(4);
  const [showStickyCta, setShowStickyCta] = useState(false);
  const [stickyDismissed, setStickyDismissed] = useState(false);
  const [demoOpen, setDemoOpen] = useState(false);
  const demoVideoRef = useRef<HTMLVideoElement>(null);

  // Reset video to start when modal closes; autoplay handled by `autoPlay` when open
  useEffect(() => {
    const v = demoVideoRef.current;
    if (!v) return;
    if (!demoOpen) {
      v.pause();
      v.currentTime = 0;
    }
  }, [demoOpen]);

  useReveal();

  useEffect(() => {
    if (user && !loading) router.navigate({ to: '/birdseye' });
  }, [user, loading, router]);

  useEffect(() => {
    const t = setInterval(() => {
      indexRef.current = (indexRef.current + 1) % LIVE_FEED.length;
      setFeed((prev) => [LIVE_FEED[indexRef.current], ...prev.slice(0, 3)]);
    }, 4000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onScroll = () => setShowStickyCta(window.scrollY > 800);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Announcement */}
      <div className="border-b border-border/40 bg-transparent backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 px-6 py-2 text-xs">
          <span className="rounded-full bg-brand/20 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-brand">
            New
          </span>
          <span className="text-foreground/90">
            Rexxon Agents now run 24/7 — every account researched, every signal drafted.
          </span>
          <a href="#how" className="hidden font-medium text-brand hover:underline sm:inline">
            See it live →
          </a>
        </div>
      </div>

      {/* Nav */}
      <nav className="sticky top-0 z-40 border-b border-border/40 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link to="/" className="flex items-center">
            <RexxonLogo size="sm" />
          </Link>
          <div className="hidden items-center gap-8 md:flex">
            <a href="#how" className="text-sm text-muted-foreground transition-colors hover:text-foreground">How it works</a>
            <a href="#signals" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Signals</a>
            <a href="#features" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Features</a>
            <a href="#pricing" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Pricing</a>
            <a href="#faq" className="text-sm text-muted-foreground transition-colors hover:text-foreground">FAQ</a>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/login">
              <Button variant="ghost" size="sm">Sign in</Button>
            </Link>
            <Link to="/signup">
              <Button size="sm" className="btn-press bg-brand text-brand-foreground shadow-inset-glow">
                Start free
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ============================ HERO ============================ */}
      <section className="relative isolate bg-aurora">
        {/* Floating ambient orbs */}
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="orb-drift absolute -top-32 -left-24 h-[420px] w-[420px] rounded-full bg-brand/25 blur-[120px]" />
          <div className="orb-drift absolute -top-10 right-0 h-[360px] w-[360px] rounded-full bg-brand-glow/20 blur-[120px]" style={{ animationDelay: '-4s' }} />
          <div className="absolute inset-0 bg-grid opacity-[0.08]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 pt-12 pb-16 md:px-6 md:pt-20 md:pb-24">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-12">
            {/* Copy */}
            <div className="animate-fade-up">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground shadow-soft backdrop-blur-sm">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-brand" />
                </span>
                Live signal engine · 12 sources · &lt;5 min latency
              </div>

              <h1 className="mt-6 text-[2.5rem] font-bold leading-[1.02] tracking-tight sm:text-5xl md:text-6xl">
                Know who's <span className="text-gradient-brand">about to buy</span>
                <span className="text-foreground/90"> — before they Google.</span>
              </h1>

              <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
                AI agents watch 10M+ companies, catch the budget moment, and hand you the buyer with a draft ready to send.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-5">
                <Link to="/signup">
                  <Button size="lg" className="btn-press group bg-brand text-brand-foreground shadow-inset-glow h-12 px-6 text-base">
                    Get started — see signals in 60s
                    <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Button>
                </Link>
                <button
                  type="button"
                  onClick={() => setDemoOpen(true)}
                  className="group inline-flex items-center gap-2 text-sm font-medium text-foreground/80 transition-colors hover:text-brand"
                >
                  <span className="relative flex h-7 w-7 items-center justify-center rounded-full bg-brand/15 text-brand transition-colors group-hover:bg-brand group-hover:text-brand-foreground">
                    <Play className="h-3 w-3 fill-current" />
                  </span>
                  Watch 30s demo
                  <ArrowRight className="h-3.5 w-3.5 opacity-60 transition-transform group-hover:translate-x-0.5" />
                </button>
              </div>

              <p className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-brand" /> Live in 10 minutes</span>
                <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-brand" /> Cancel anytime</span>
                <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-brand" /> 30-day money-back</span>
              </p>

              {/* Inline social proof */}
              <div className="mt-8 flex flex-wrap items-center gap-4 border-t border-border pt-6">
                <div className="flex -space-x-2">
                  {HERO_AVATARS.map((src, i) => (
                    <img
                      key={i}
                      src={src}
                      alt=""
                      width={32}
                      height={32}
                      loading="lazy"
                      className="h-8 w-8 rounded-full border-2 border-background object-cover shadow-soft"
                    />
                  ))}
                </div>
                <div className="flex items-center gap-1">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                  <span className="ml-1.5 text-sm font-semibold">4.9/5</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground"><Counter to={1240} suffix="+" /></span> revenue teams shipping pipeline with Rexxon
                </div>
              </div>
            </div>

            {/* Live feed panel */}
            <div className="relative animate-fade-up [animation-delay:120ms]">
              <div className="absolute -inset-6 rounded-[2rem] bg-gradient-to-br from-brand/25 via-brand/10 to-brand-glow/20 blur-3xl" />
              <div className="glow-conic relative overflow-hidden rounded-2xl border border-border bg-card/85 p-1 shadow-elevated backdrop-blur-2xl">
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
                            style={{
                              background: `color-mix(in oklab, ${s.tone} 18%, transparent)`,
                              color: s.tone,
                              boxShadow: `inset 0 0 0 1px color-mix(in oklab, ${s.tone} 30%, transparent)`,
                            }}
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
                {/* Mock action bar */}
                <div className="flex items-center justify-between gap-2 border-t border-border bg-gradient-to-t from-card/60 to-transparent px-3 py-2.5">
                  <span className="font-mono text-[10px] text-muted-foreground">Auto-drafted · 1 click to send</span>
                  <div className="flex items-center gap-1.5">
                    <span className="rounded-md bg-card px-2 py-1 text-[10px] text-foreground/80 ring-1 ring-border">Edit</span>
                    <span className="rounded-md bg-brand px-2 py-1 text-[10px] font-semibold text-brand-foreground shadow-inset-glow">Send</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Ticker */}
        <div className="border-y border-border bg-card/40 py-3 backdrop-blur-sm">
          <div className="marquee-mask">
            <div className="flex w-max animate-ticker gap-12 whitespace-nowrap font-mono text-xs text-muted-foreground">
              {[...TICKER, ...TICKER].map((t, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand shadow-[0_0_8px_var(--brand)]" />
                  {t}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============================ LOGO STRIP ============================ */}
      <section className="border-b border-border/60 bg-background py-6 md:py-10">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <p className="text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Trusted by revenue teams at fast-growing companies
          </p>
          <div className="marquee-mask mt-6">
            <div className="flex w-max animate-marquee items-center gap-14 whitespace-nowrap">
              {[...SOCIAL_LOGOS, ...SOCIAL_LOGOS].map((logo, i) => (
                <span
                  key={`${logo}-${i}`}
                  className="text-xl font-semibold tracking-tight text-muted-foreground/60 transition-colors hover:text-foreground"
                >
                  {logo}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============================ PRODUCT SHOWCASE ============================ */}
      <section className="relative mx-auto max-w-7xl px-4 md:px-6 py-12 md:py-24">
        <div className="reveal mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">Bird's-eye view</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-5xl">
            Your entire pipeline. One calm screen.
          </h2>
          <p className="mt-4 text-base text-muted-foreground md:text-lg">
            Wake up to a personalized command center — fresh signals, your daily goal, deals in motion, and momentum trends. No spreadsheets. No tab juggling. Just clarity.
          </p>
        </div>

        <div className="reveal relative mt-14">
          {/* Glow backdrop */}
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-x-10 -inset-y-10 -z-10 opacity-70 blur-3xl"
            style={{
              background:
                'radial-gradient(60% 50% at 50% 40%, color-mix(in oklab, var(--brand) 30%, transparent), transparent 70%)',
            }}
          />
          <div className="overflow-hidden rounded-2xl border border-border bg-card/60 shadow-elevated backdrop-blur-sm">
            {/* Browser chrome */}
            <div className="flex items-center gap-2 border-b border-border bg-card/80 px-4 py-3">
              <div className="flex gap-1.5">
                <span className="h-3 w-3 rounded-full bg-red-500/70" />
                <span className="h-3 w-3 rounded-full bg-yellow-500/70" />
                <span className="h-3 w-3 rounded-full bg-green-500/70" />
              </div>
              <div className="ml-3 flex-1 truncate rounded-md bg-background/60 px-3 py-1 font-mono text-[11px] text-muted-foreground">
                app.rexxon.ai/birdseye
              </div>
            </div>
            <img
              src={birdseyeDashboard}
              alt="Rexxon Bird's-Eye dashboard showing daily goal progress, pipeline stages, fresh buying signals, and 14-day momentum"
              loading="lazy"
              className="block w-full"
            />
          </div>

          {/* Floating callouts */}
          <div className="pointer-events-none absolute -left-3 top-24 hidden rounded-xl border border-border bg-card/95 px-3 py-2 text-xs shadow-elevated backdrop-blur-sm md:block">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-brand shadow-[0_0_8px_var(--brand)]" />
              <span className="font-semibold">Today's goal</span>
            </div>
            <p className="mt-0.5 text-muted-foreground">Personalized targets daily</p>
          </div>
          <div className="pointer-events-none absolute -right-3 bottom-32 hidden rounded-xl border border-border bg-card/95 px-3 py-2 text-xs shadow-elevated backdrop-blur-sm md:block">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-yellow-400 shadow-[0_0_8px_#facc15]" />
              <span className="font-semibold">17 hot leads</span>
            </div>
            <p className="mt-0.5 text-muted-foreground">High-confidence signals</p>
          </div>
        </div>
      </section>

      {/* ============================ PROBLEM/SOLUTION ============================ */}
      <section className="mx-auto max-w-7xl px-4 md:px-6 py-12 md:py-24">
        <div className="reveal grid gap-10 md:grid-cols-2">
          <div className="surface-2 rounded-2xl border border-border p-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-destructive/15 px-3 py-1 text-xs font-medium text-destructive">
              <CloseIcon className="h-3.5 w-3.5" />
              The old way
            </div>
            <h3 className="mt-4 text-2xl font-bold tracking-tight">Reps drown in research</h3>
            <ul className="mt-5 space-y-3 text-sm text-muted-foreground">
              {[
                'Stale databases refreshed weekly — your competitor already called.',
                '8+ hours/week per rep wasted hand-building lists in 4 tabs.',
                'Generic outreach with 1.2% reply rates. Quota slips quietly.',
                'You pay $40k/year for "intent" that just means anonymous IP visits.',
              ].map((p) => (
                <li key={p} className="flex items-start gap-2.5">
                  <CloseIcon className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="surface-3 glow-conic rounded-2xl border border-border p-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-brand/15 px-3 py-1 text-xs font-medium text-brand">
              <Sparkles className="h-3.5 w-3.5" />
              The Rexxon way
            </div>
            <h3 className="mt-4 text-2xl font-bold tracking-tight">Rexxon does the research</h3>
            <ul className="mt-5 space-y-3 text-sm text-foreground/90">
              {[
                'Real-time signals — funding, hiring, leadership, compliance — within 5 min.',
                'Verified buyer + buying-context email auto-drafted, ready to send.',
                'AI insight on every signal: what changed, why now, what to pitch.',
                'One platform replaces ZoomInfo + Apollo + Clay — at a fraction of the cost.',
              ].map((p) => (
                <li key={p} className="flex items-start gap-2.5">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ============================ STATS BAND ============================ */}
      <section className="border-y border-border bg-card/30">
        <div className="mx-auto max-w-7xl px-4 md:px-6 py-10 md:py-16">
          <div className="reveal grid grid-cols-2 gap-8 md:grid-cols-4">
            <BigStat value={<Counter to={2.1} decimals={1} suffix="×" />} label="Pipeline lift in Q1" sub="avg across paying teams" />
            <BigStat value={<Counter to={3.4} decimals={1} suffix="×" />} label="Higher reply rates" sub="vs. cold outbound baselines" />
            <BigStat value={<Counter to={8} suffix="+ hrs" />} label="Saved per rep / week" sub="no more list-building" />
            <BigStat value={<><span className="text-3xl">&lt;</span><Counter to={5} suffix=" min" /></>} label="Signal-to-inbox" sub="be first when intent fires" />
          </div>
        </div>
      </section>

      {/* ============================ HOW IT WORKS ============================ */}
      <section id="how" className="mx-auto max-w-7xl px-4 md:px-6 py-14 md:py-28">
        <SectionHeader
          eyebrow="How it works"
          title="From buying signal to booked meeting"
          subtitle="Set it up once. Wake up to drafted outreach every morning."
        />
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {[
            { n: '01', icon: <Target className="h-5 w-5" />, t: 'Define your territory', d: 'Industries, sizes, geographies, named accounts. Tell Rexxon what you can close.' },
            { n: '02', icon: <Radio className="h-5 w-5" />, t: 'Signals fire 24/7', d: 'Hiring, funding, leadership moves, compliance, earnings — scored by an LLM that understands context.' },
            { n: '03', icon: <Mail className="h-5 w-5" />, t: 'You hit send', d: 'Drafted email, verified contact, why-now insight. One click to your sequencer or CRM.' },
          ].map((step, i) => (
            <div key={step.n} className="reveal" style={{ transitionDelay: `${i * 80}ms` }}>
              <div className="card-interactive surface-2 group relative h-full rounded-2xl border border-border p-7">
                <div className="flex items-center justify-between">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand/30 to-brand/5 text-brand shadow-inset-glow">
                    {step.icon}
                  </span>
                  <span className="font-mono text-sm font-bold tracking-wider text-brand/60">{step.n}</span>
                </div>
                <h3 className="mt-5 text-lg font-semibold">{step.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============================ SIGNAL TABS ============================ */}
      <section id="signals" className="border-y border-border bg-card/30 py-14 md:py-28">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <SectionHeader
            eyebrow="Signal taxonomy"
            title="Every buying trigger your team should be calling on"
            subtitle="12 categories, mapped to the exact spend that just activated. Click through to see what each looks like."
          />

          <div className="reveal mt-12">
            <Tabs defaultValue="growth" className="w-full">
              <TabsList className="mx-auto flex h-auto w-full max-w-3xl flex-wrap justify-center gap-1 bg-card/50 p-1.5">
                {SIGNAL_TABS.map((tab) => (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="data-[state=active]:bg-brand data-[state=active]:text-brand-foreground data-[state=active]:shadow-inset-glow"
                  >
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              {SIGNAL_TABS.map((tab) => (
                <TabsContent key={tab.id} value={tab.id} className="mt-8">
                  <div className="grid gap-6 md:grid-cols-2 md:items-center">
                    <div className="surface-3 rounded-2xl border border-border p-7">
                      <div className="flex items-center gap-3">
                        <span
                          className="inline-flex h-10 w-10 items-center justify-center rounded-lg"
                          style={{
                            background: `color-mix(in oklab, ${tab.color} 18%, transparent)`,
                            color: tab.color,
                            boxShadow: `inset 0 0 0 1px color-mix(in oklab, ${tab.color} 35%, transparent)`,
                          }}
                        >
                          {tab.icon}
                        </span>
                        <div>
                          <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Signal type</div>
                          <h3 className="text-lg font-semibold">{tab.label}</h3>
                        </div>
                      </div>
                      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{tab.desc}</p>
                      <div className="mt-5 flex flex-wrap gap-2">
                        {tab.spend.map((s) => (
                          <span key={s} className="rounded-full bg-card/80 px-3 py-1 text-xs font-medium text-foreground/80 ring-1 ring-border">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      {tab.examples.map((ex, i) => (
                        <div
                          key={i}
                          className="hover-lift rounded-xl border border-border bg-card/60 p-4 shadow-soft"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold">{ex.co}</span>
                            <span className="font-mono text-[10px] text-muted-foreground">just now</span>
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground">{ex.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </div>
      </section>

      {/* ============================ FEATURES (3 BIG) ============================ */}
      <section id="features" className="mx-auto max-w-7xl px-4 md:px-6 py-14 md:py-28">
        <SectionHeader
          eyebrow="The platform"
          title="One workflow. Three superpowers."
          subtitle="Rexxon collapses prospecting, research, and outreach into a single agentic loop."
        />
        <div className="mt-14 space-y-6">
          {FEATURE_BLOCKS.map((f, idx) => (
            <div
              key={f.title}
              className="reveal grid gap-8 md:grid-cols-[1fr_1.1fr] md:items-center"
            >
              <div className={idx % 2 === 1 ? 'md:order-2' : ''}>
                <span className="inline-flex items-center gap-2 rounded-full bg-brand/15 px-3 py-1 text-xs font-semibold text-brand">
                  {f.icon} {f.eyebrow}
                </span>
                <h3 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">{f.title}</h3>
                <p className="mt-3 text-base leading-relaxed text-muted-foreground">{f.body}</p>
                <ul className="mt-5 space-y-2.5">
                  {f.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2.5 text-sm">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                      <span className="text-foreground/90">{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className={idx % 2 === 1 ? 'md:order-1' : ''}>
                <div className="surface-3 glow-conic rounded-2xl border border-border p-5">
                  {f.visual}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============================ TESTIMONIALS ============================ */}
      <section className="border-y border-border bg-card/30 py-14 md:py-28">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <SectionHeader
            eyebrow="Proof"
            title="Reps don't prospect cold anymore"
            subtitle="From scrappy startups to scaling RevOps teams — Rexxon is the unfair advantage in the stack."
          />
          <div className="reveal mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              { q: 'We replaced a $40k/year intent vendor with Rexxon and now book 3× the meetings. The ROI conversation took 30 seconds.', n: 'Maya Patel', r: 'VP Sales', c: 'Helio Cloud', res: '+212% meetings', img: testimonial1 },
              { q: 'The AI insight on every signal is the unlock. My SDRs stopped guessing what to say — and our reply rate jumped to 38%.', n: 'Jordan Lee', r: 'Head of SDRs', c: 'Forge Security', res: '38% reply rate', img: testimonial2 },
              { q: 'A new VP of Eng hire in our ICP used to take a week to surface. Now it lands in Slack in 4 minutes with a draft email attached.', n: 'Sam Chen', r: 'AE Manager', c: 'Quant Labs', res: '4-min latency', img: testimonial3 },
            ].map((t) => (
              <div key={t.n} className="card-interactive surface-2 rounded-2xl border border-border p-7">
                <div className="flex items-center gap-3">
                  <img
                    src={t.img}
                    alt={t.n}
                    width={44}
                    height={44}
                    loading="lazy"
                    className="h-11 w-11 rounded-full border-2 border-background object-cover shadow-soft ring-1 ring-brand/30"
                  />
                  <div className="flex gap-1">
                    {[0,1,2,3,4].map((i) => <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />)}
                  </div>
                </div>
                <p className="mt-4 text-base leading-relaxed text-foreground/90">"{t.q}"</p>
                <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
                  <div>
                    <div className="text-sm font-semibold">{t.n}</div>
                    <div className="text-xs text-muted-foreground">{t.r} · {t.c}</div>
                  </div>
                  <div className="rounded-md bg-brand/15 px-2 py-1 font-mono text-xs font-semibold text-brand shadow-inset-glow">
                    {t.res}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================ PRICING ============================ */}
      <section id="pricing" className="mx-auto max-w-7xl px-4 md:px-6 py-14 md:py-28">
        <SectionHeader
          eyebrow="Pricing"
          title="Simple. Transparent. Built to pay for itself."
          subtitle="If Rexxon doesn't book you 2× more meetings in 30 days, we'll refund every dollar."
        />

        <div className="mt-8 flex justify-center">
          <div className="inline-flex items-center rounded-full border border-border bg-card p-1 text-sm">
            <button
              onClick={() => setAnnual(false)}
              className={`btn-press rounded-full px-4 py-1.5 transition-colors ${!annual ? 'bg-brand text-brand-foreground shadow-inset-glow' : 'text-muted-foreground'}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`btn-press rounded-full px-4 py-1.5 transition-colors ${annual ? 'bg-brand text-brand-foreground shadow-inset-glow' : 'text-muted-foreground'}`}
            >
              Annual <span className="ml-1 text-xs opacity-80">−10%</span>
            </button>
          </div>
        </div>

        <div className="reveal mt-10 grid gap-6 md:grid-cols-3">
          {[
            {
              id: 'starter' as const,
              name: 'Starter',
              price: 99,
              accounts: '75 accounts',
              users: '1 user',
              highlight: false,
              groups: [
                { label: 'Core', items: ['75 monitored accounts', '1 user seat', 'Real-time signal feed', 'Verified contacts', 'Email digest + Slack alerts', '1 campaign'] },
                { label: 'AI & content', items: ['AI outreach drafts', 'Proposal generator · 3 / month'] },
                { label: 'Knowledge base', items: ['Not included — upgrade to Pro to unlock'] },
                { label: 'Integrations', items: ['Slack', 'Calendar sync (.ics)'] },
              ],
            },
            {
              id: 'pro' as const,
              name: 'Pro',
              price: 279,
              accounts: '250 accounts',
              users: '3 users',
              highlight: true,
              groups: [
                { label: 'Core', items: ['250 monitored accounts', '3 user seats', 'Custom signal weighting', 'Unlimited campaigns + per-sector filters', 'Everything in Starter'] },
                { label: 'AI & content', items: ['AI-assisted proposals · unlimited', 'Meeting briefs with citations'] },
                { label: 'Knowledge base ★', items: ['Included — up to 500 docs', 'Cited answers with source linking', 'Dedicated /knowledge workspace', 'Workspace-wide search'] },
                { label: 'Integrations', items: ['CRM push (Salesforce, HubSpot)', 'Outreach.io / Salesloft sync'] },
                { label: 'Support', items: ['Priority support'] },
              ],
            },
            {
              id: 'team' as const,
              name: 'Team',
              price: 879,
              accounts: '750 accounts',
              users: '10 users',
              highlight: false,
              groups: [
                { label: 'Core', items: ['750 monitored accounts', '10 user seats', 'Territory routing', 'Win/loss feedback loop', 'Shared campaigns across teams', 'Everything in Pro'] },
                { label: 'AI & content', items: ['Proposal collaboration + version history'] },
                { label: 'Knowledge base ★', items: ['Included — unlimited docs', 'Workspace library + shared collections', 'Per-team permissions'] },
                { label: 'Integrations', items: ['SAML SSO', 'Audit logs'] },
                { label: 'Support', items: ['Dedicated CSM', 'White-glove onboarding'] },
              ],
            },
          ].map((plan) => {
            // Tiered annual discount: Starter 0%, Pro 10%, Team 10% (auto on annual)
            const discountPct = annual ? (plan.id === 'starter' ? 0 : 10) : 0;
            const price = Math.round(plan.price * (1 - discountPct / 100));
            return (
              <div
                key={plan.name}
                className={`card-interactive relative rounded-2xl border p-7 ${plan.highlight ? 'border-hairline-brand surface-3 glow-conic' : 'surface-2 border-border'}`}
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
                <Link
                  to="/checkout"
                  search={{ plan: plan.id, billing: annual ? 'annual' : 'monthly' }}
                >
                  <Button className={`btn-press mt-6 w-full ${plan.highlight ? 'bg-brand text-brand-foreground shadow-inset-glow' : ''}`} variant={plan.highlight ? 'default' : 'outline'}>
                    Get started
                  </Button>
                </Link>
                <div className="mt-6 space-y-5 border-t border-border pt-5">
                  {plan.groups.map((g) => (
                    <div key={g.label}>
                      <div className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/80">
                        {g.label}
                      </div>
                      <ul className="space-y-2">
                        {g.items.map((f) => (
                          <li key={f} className="flex items-start gap-2 text-sm">
                            <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                            <span className="text-foreground/85">{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Guarantee row */}
        <div className="reveal mt-10 grid gap-3 md:grid-cols-3">
          {[
            { icon: <ShieldCheck className="h-5 w-5" />, t: '30-day ROI guarantee', d: '2× meetings in 30 days or full refund.' },
            { icon: <Lock className="h-5 w-5" />, t: 'SOC 2 Type II + EU residency', d: 'Enterprise-grade security on every plan.' },
            { icon: <Zap className="h-5 w-5" />, t: 'Live in under 10 minutes', d: 'No onboarding fees. No professional services.' },
          ].map((g) => (
            <div key={g.t} className="flex items-start gap-3 rounded-xl border border-border bg-card/40 p-4">
              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand/15 text-brand">
                {g.icon}
              </span>
              <div>
                <div className="text-sm font-semibold">{g.t}</div>
                <p className="mt-0.5 text-xs text-muted-foreground">{g.d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============================ FAQ ============================ */}
      <section id="faq" className="border-y border-border bg-card/30 py-14 md:py-28">
        <div className="mx-auto max-w-3xl px-4 md:px-6">
          <SectionHeader eyebrow="FAQ" title="Common questions" />
          <div className="reveal mt-12">
            <Accordion type="single" collapsible className="w-full">
              {FAQS.map((f, i) => (
                <AccordionItem key={i} value={`item-${i}`} className="border-border">
                  <AccordionTrigger className="text-left text-base font-semibold hover:no-underline">
                    {f.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                    {f.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* ============================ CASE STUDIES ============================ */}
      <section className="mx-auto max-w-7xl px-4 md:px-6 py-12 md:py-24">
        <div className="reveal flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">Customer wins</p>
            <h2 className="mt-3 max-w-2xl text-3xl font-bold tracking-tight md:text-4xl">
              Real teams. Real pipeline. Real numbers.
            </h2>
          </div>
          <Link
            to="/case-studies"
            className="text-sm font-medium text-brand hover:underline"
          >
            All case studies →
          </Link>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {CASE_STUDIES.slice(0, 3).map((c) => (
            <Link
              key={c.slug}
              to="/case-studies/$slug"
              params={{ slug: c.slug }}
              className="reveal group flex flex-col rounded-2xl border border-border bg-card p-6 transition-all hover-lift"
            >
              <span className="text-xs font-mono uppercase tracking-widest text-brand">{c.industry}</span>
              <h3 className="mt-2 text-lg font-semibold leading-snug group-hover:text-brand">
                {c.title}
              </h3>
              <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{c.description}</p>

              <div className="mt-5 grid grid-cols-2 gap-3 border-t border-border pt-4">
                {c.metrics.slice(0, 2).map((m) => (
                  <div key={m.label}>
                    <p className="text-base font-semibold text-foreground">{m.value}</p>
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{m.label}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5 inline-flex items-center gap-1.5 text-sm text-brand">
                Read the story
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ============================ FROM THE BLOG ============================ */}
      <section className="mx-auto max-w-7xl px-4 md:px-6 pb-12 md:pb-24">
        <div className="reveal flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">From the playbook</p>
            <h2 className="mt-3 max-w-2xl text-3xl font-bold tracking-tight md:text-4xl">
              Field notes on signal-led outbound.
            </h2>
          </div>
          <Link to="/blog" className="text-sm font-medium text-brand hover:underline">
            All articles →
          </Link>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {BLOG_POSTS.slice(0, 3).map((p) => (
            <Link
              key={p.slug}
              to="/blog/$slug"
              params={{ slug: p.slug }}
              className="reveal group flex flex-col rounded-2xl border border-border bg-card p-6 transition-all hover-lift"
            >
              <span className="text-xs font-mono uppercase tracking-widest text-brand">{p.category}</span>
              <h3 className="mt-2 text-lg font-semibold leading-snug group-hover:text-brand">
                {p.title}
              </h3>
              <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{p.description}</p>
              <div className="mt-auto flex items-center justify-between pt-5 text-xs text-muted-foreground">
                <span>{p.readMinutes} min read</span>
                <span className="inline-flex items-center gap-1 text-brand">
                  Read <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ============================ FINAL CTA ============================ */}
      <section className="mx-auto max-w-7xl px-4 md:px-6 py-12 md:py-24">
        <div className="reveal relative overflow-hidden rounded-[2rem] border border-border bg-card p-14 text-center shadow-elevated bg-aurora">
          <div className="absolute inset-0 bg-grid opacity-[0.12]" />
          <div className="orb-drift absolute -top-20 left-1/4 h-72 w-72 rounded-full bg-brand/30 blur-[100px]" />
          <div className="orb-drift absolute -bottom-20 right-1/4 h-72 w-72 rounded-full bg-brand-glow/25 blur-[100px]" style={{ animationDelay: '-5s' }} />
          <div className="relative">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-6xl">
              Your competitors are{' '}
              <span className="text-gradient-brand">already calling.</span>
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground md:text-lg">
              Live in under 10 minutes. The first signal usually fires within the hour. 30-day money-back guarantee.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-5">
              <Link to="/signup">
                <Button size="lg" className="btn-press group bg-brand text-brand-foreground shadow-inset-glow h-12 px-6 text-base">
                  Get started
                  <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Button>
              </Link>
              <Link to="/schedule-demo" className="group inline-flex items-center gap-1.5 text-sm font-medium text-foreground/80 transition-colors hover:text-brand">
                <CalendarCheck className="h-4 w-4" />
                Book a 15-min demo
                <ArrowRight className="h-3.5 w-3.5 opacity-60 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
            <p className="mt-5 text-xs text-muted-foreground">
              Trusted by 1,240+ revenue teams · 4.9/5 average rating
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
          <div className="flex items-center">
            <RexxonLogo size="sm" />
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
            <a href="#how" className="hover:text-foreground">How it works</a>
            <a href="#pricing" className="hover:text-foreground">Pricing</a>
            <Link to="/blog" className="hover:text-foreground">Blog</Link>
            <Link to="/case-studies" className="hover:text-foreground">Case studies</Link>
            <Link to="/affiliates" className="hover:text-foreground">Affiliate program</Link>
            <a href="https://docs.rexxon.ai" className="hover:text-foreground">Docs</a>
            <a href="mailto:hello@rexxon.ai" className="hover:text-foreground">Contact</a>
          </div>
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} Rexxon AI</p>
        </div>
      </footer>

      {/* ============================ STICKY MOBILE CTA ============================ */}
      {showStickyCta && !stickyDismissed && (
        <div className="animate-cta-up fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 px-4 py-3 backdrop-blur-xl shadow-elevated md:hidden">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setStickyDismissed(true)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-card"
              aria-label="Dismiss"
            >
              <CloseIcon className="h-4 w-4" />
            </button>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold">Get started in 10 minutes</div>
              <div className="truncate text-xs text-muted-foreground">30-day money-back guarantee</div>
            </div>
            <Link to="/signup" className="shrink-0">
              <Button size="sm" className="btn-press bg-brand text-brand-foreground shadow-inset-glow">
                Get started
                <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* ============================ DEMO VIDEO MODAL ============================ */}
      <Dialog open={demoOpen} onOpenChange={setDemoOpen}>
        <DialogContent
          className="overflow-hidden border-border bg-background p-0 sm:max-w-4xl"
          style={{ width: 'calc(100% - 2rem)' }}
        >
          <DialogTitle className="sr-only">30-second product demo</DialogTitle>
          <DialogDescription className="sr-only">
            A 30-second tour of Rexxon's Bird's-eye dashboard, live signal feed, and AI-drafted outreach.
          </DialogDescription>

          {/* Header strip */}
          <div className="flex items-center justify-between border-b border-border bg-card/60 px-5 py-3 backdrop-blur">
            <div className="flex items-center gap-3">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-60" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-brand" />
              </span>
              <div>
                <div className="text-sm font-semibold leading-tight">30-second product tour</div>
                <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  Bird's-eye → Signal feed → Outreach
                </div>
              </div>
            </div>
          </div>

          {/* Video */}
          <div className="relative aspect-video bg-black">
            <video
              ref={demoVideoRef}
              src="/rexxon-demo.mp4"
              className="h-full w-full"
              controls
              playsInline
              autoPlay={demoOpen}
              preload="metadata"
            />
          </div>

          {/* Footer chapters + CTA */}
          <div className="grid gap-3 border-t border-border bg-card/40 px-5 py-4 sm:grid-cols-[1fr_auto] sm:items-center">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand/15 font-mono text-[10px] font-semibold text-brand">1</span>
                Bird's-eye
              </span>
              <ChevronRight className="h-3 w-3 text-muted-foreground/50" />
              <span className="flex items-center gap-1.5">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand/15 font-mono text-[10px] font-semibold text-brand">2</span>
                Signal feed
              </span>
              <ChevronRight className="h-3 w-3 text-muted-foreground/50" />
              <span className="flex items-center gap-1.5">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand/15 font-mono text-[10px] font-semibold text-brand">3</span>
                Outreach
              </span>
            </div>
            <Link to="/signup" onClick={() => setDemoOpen(false)}>
              <Button size="sm" className="btn-press w-full bg-brand text-brand-foreground shadow-inset-glow sm:w-auto">
                Get started
                <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────── */
/*  Sub-components                                                   */
/* ──────────────────────────────────────────────────────────────── */

function SectionHeader({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle?: string }) {
  return (
    <div className="reveal text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">{eyebrow}</p>
      <h2 className="mx-auto mt-3 max-w-3xl text-3xl font-bold tracking-tight md:text-5xl">{title}</h2>
      {subtitle && <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground md:text-lg">{subtitle}</p>}
    </div>
  );
}

function BigStat({ value, label, sub }: { value: React.ReactNode; label: string; sub?: string }) {
  return (
    <div className="text-center">
      <div className="text-4xl font-bold tracking-tight md:text-5xl text-gradient-brand">{value}</div>
      <div className="mt-2 text-sm font-medium">{label}</div>
      {sub && <div className="mt-0.5 text-xs text-muted-foreground">{sub}</div>}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────── */
/*  Static content                                                   */
/* ──────────────────────────────────────────────────────────────── */

const SIGNAL_TABS = [
  {
    id: 'growth',
    label: 'Growth & Hiring',
    icon: <TrendingUp className="h-5 w-5" />,
    color: 'oklch(0.78 0.18 145)',
    desc: 'Hiring sprees, role expansions and team scale-ups indicate budget activation across security, engineering and revenue functions.',
    spend: ['Security stack', 'DevOps tooling', 'Sales engagement', 'CS platforms'],
    examples: [
      { co: 'Wiz', text: '5 Cloud Security Engineer roles posted · CNAPP scaling' },
      { co: 'Notion', text: '12 enterprise sales hires · Outbound stack expansion' },
      { co: 'Lattice', text: '3 CSM hires in 30 days · CS tooling under pressure' },
    ],
  },
  {
    id: 'leadership',
    label: 'Leadership',
    icon: <Users className="h-5 w-5" />,
    color: 'oklch(0.78 0.18 320)',
    desc: 'New CISOs, VPs and Directors almost always re-evaluate the existing stack within 90 days. Be on their shortlist on day one.',
    spend: ['Identity', 'GRC', 'Observability', 'Data warehousing'],
    examples: [
      { co: 'Stripe', text: 'CCO appointment · GRC budget activated' },
      { co: 'Linear', text: 'CISO joined from Asana · Identity stack review' },
      { co: 'Rippling', text: 'New VP Engineering ex-Stripe · Platform consolidation' },
    ],
  },
  {
    id: 'funding',
    label: 'Funding',
    icon: <Sparkles className="h-5 w-5" />,
    color: 'oklch(0.78 0.18 100)',
    desc: 'New rounds open spend windows. Rexxon flags deal size, lead investor and the categories typically expanded post-raise.',
    spend: ['Infra', 'GTM tooling', 'HR / Finance ops', 'Security'],
    examples: [
      { co: 'Vercel', text: 'Series E announced · Infra spend window open' },
      { co: 'Okta', text: 'Strategic acquisition closed · Identity expansion' },
      { co: 'Anthropic', text: 'Late-stage round · Enterprise hiring imminent' },
    ],
  },
  {
    id: 'compliance',
    label: 'Compliance',
    icon: <Shield className="h-5 w-5" />,
    color: 'oklch(0.74 0.18 200)',
    desc: 'SOC 2, ISO, HIPAA and FedRAMP triggers fire when an audit kicks off — with a procurement window of weeks, not months.',
    spend: ['GRC platforms', 'Pen-test', 'SIEM', 'Vendor risk'],
    examples: [
      { co: 'Figma', text: 'SOC 2 Type II auditor RFP detected' },
      { co: 'Loom', text: 'HIPAA scoping · Healthcare segment push' },
      { co: 'Ramp', text: 'PCI DSS 4.0 readiness · GRC expansion' },
    ],
  },
  {
    id: 'tech',
    label: 'Tech expansion',
    icon: <Database className="h-5 w-5" />,
    color: 'oklch(0.74 0.20 290)',
    desc: 'Stack changes hidden in job descriptions reveal where engineering is investing — before the migration is publicly announced.',
    spend: ['Data warehouses', 'Observability', 'Feature flags', 'CNAPP'],
    examples: [
      { co: 'Gong', text: 'Snowflake → Databricks migration in job specs' },
      { co: 'Datadog', text: 'Director of Cloud Security posted · CNAPP RFP brewing' },
      { co: 'Cloudflare', text: 'Kubernetes platform team expansion' },
    ],
  },
  {
    id: 'earnings',
    label: 'Earnings',
    icon: <Newspaper className="h-5 w-5" />,
    color: 'oklch(0.74 0.18 235)',
    desc: 'Public-company guidance and earnings calls disclose budget commitments months before procurement begins. Pre-empt the RFP.',
    spend: ['Strategic SaaS', 'Cloud spend', 'Security tooling'],
    examples: [
      { co: 'Snowflake', text: 'Earnings beat · $200M security commitment' },
      { co: 'HashiCorp', text: 'Q3 guidance: +$40M security tooling spend' },
      { co: 'Cloudflare', text: 'Edge AI capex disclosed · Inference partners sought' },
    ],
  },
];

const FEATURE_BLOCKS = [
  {
    eyebrow: 'Detect',
    icon: <Radio className="h-3.5 w-3.5" />,
    title: 'Real-time signals from 12+ live sources',
    body: 'No more weekly database refreshes. Rexxon polls every four minutes across hiring, funding, leadership, earnings, compliance and tech-stack signals — and ranks each by an LLM that understands your ICP.',
    bullets: ['Sub-5-minute latency', 'Confidence-scored & deduplicated', '12+ data sources, one inbox'],
    visual: <SignalsVisual />,
  },
  {
    eyebrow: 'Understand',
    icon: <Brain className="h-3.5 w-3.5" />,
    title: 'AI account briefs in seconds',
    body: 'Every signal ships with a senior-AE-level brief: pain points, buying committee, why-now, risks, and the exact vendor categories now in motion. Your reps stop guessing what to say.',
    bullets: ['Auto-generated on demand', 'Cached per company', 'Copy-ready for any sequencer'],
    visual: <BriefVisual />,
  },
  {
    eyebrow: 'Act',
    icon: <Workflow className="h-3.5 w-3.5" />,
    title: 'Outreach drafts that actually get replies',
    body: 'Each alert lands with a verified email and phone, a buying-context draft tuned to persona and tone, and one-click push to Salesforce, HubSpot, Outreach or Salesloft.',
    bullets: ['Persona + tone presets', 'Multi-step sequences', 'CRM + sequencer sync'],
    visual: <OutreachVisual />,
  },
  {
    eyebrow: 'Organize',
    icon: <Layers className="h-3.5 w-3.5" />,
    title: 'Campaigns for every sales sector',
    body: 'Spin up named campaigns — one per region, vertical or product line — each with its own signal filters, team assignees and goals. Reps switch context in one click; leadership sees pipeline rolled up by motion.',
    bullets: ['Filter by signal type, geo, industry, role + confidence', 'Creator-owned · team read-only', 'Goals for claims and meetings booked'],
    visual: <CampaignsVisual />,
  },
  {
    eyebrow: 'Recall',
    icon: <BookOpen className="h-3.5 w-3.5" />,
    title: 'Mini RAG agent on your company knowledge',
    body: 'Upload capabilities decks, battle cards, pricing sheets and past proposals. Reps ask questions in plain English and get instant, cited answers — so they never stall on objections again.',
    bullets: ['Upload PDFs, DOCX, notes or URLs', 'Cited answers with source links', 'Available from any page in the app'],
    visual: <KnowledgeVisual />,
  },
  {
    eyebrow: 'Respond',
    icon: <FileText className="h-3.5 w-3.5" />,
    title: 'AI-assisted proposal generator',
    body: 'Drop in your prospect brief and your company docs — Rexxon extracts every requirement, auto-drafts grounded sections, and outputs a polished proposal you can ship. Or fill the wizard manually for total control.',
    bullets: ['Auto-extract requirements from any prospect brief', 'Auto-draft sections from your uploaded docs', 'Ephemeral parsing — files never stored'],
    visual: <RfpVisual />,
  },
];

const FAQS = [
  {
    q: 'How is this different from ZoomInfo or Apollo?',
    a: 'Static databases give you a snapshot — Rexxon gives you the moment. We don\'t sell records by the credit; we surface the exact buying triggers (hiring, funding, leadership moves, compliance, earnings) inside your ICP and ship them with verified contacts and a draft email. Most teams replace 2–4 tools when they switch.',
  },
  {
    q: 'How fast can I be live?',
    a: 'Under 10 minutes. Sign up, define your territory (industries, sizes, geos, named accounts), connect Slack or your CRM, and the first signals usually fire within the hour.',
  },
  {
    q: 'What\'s included when I sign up?',
    a: 'Full access to real-time signals, AI briefs, verified contact reveals, AI outreach drafts, Slack alerts and CRM push from day one. Cancel anytime, plus a 30-day money-back guarantee.',
  },
  {
    q: 'Do you have an ROI guarantee?',
    a: 'Yes. If Rexxon doesn\'t book you 2× more meetings in your first 30 days versus your prior 30, we refund every dollar — no questions asked.',
  },
  {
    q: 'How do you handle data privacy and security?',
    a: 'SOC 2 Type II certified, EU data residency available on every plan, SAML SSO on Team, full audit logs, and zero training on customer data. Enterprise security is the floor, not the ceiling.',
  },
  {
    q: 'Can I integrate with my existing CRM and sequencer?',
    a: 'Yes — one-click push to Salesforce, HubSpot, Outreach.io, Salesloft and Slack on day one. Zapier and webhook support for everything else. Bi-directional sync on Pro and above.',
  },
];

/* ──────────────────────────────────────────────────────────────── */
/*  Feature visuals                                                   */
/* ──────────────────────────────────────────────────────────────── */

function SignalsVisual() {
  return (
    <div className="rounded-xl border border-border bg-background/60 p-3 backdrop-blur">
      <div className="flex items-center justify-between border-b border-border pb-2.5">
        <div className="flex items-center gap-1.5">
          <Radio className="h-3.5 w-3.5 text-brand" />
          <span className="text-xs font-semibold">Signal feed</span>
        </div>
        <span className="font-mono text-[10px] text-muted-foreground">live</span>
      </div>
      <div className="mt-3 space-y-2">
        {LIVE_FEED.slice(0, 4).map((s) => (
          <div key={s.company} className="rounded-lg border border-border/60 bg-card/60 p-2.5">
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full" style={{ background: s.tone, boxShadow: `0 0 8px ${s.tone}` }} />
              <span className="text-xs font-semibold">{s.company}</span>
              <span
                className="rounded px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider"
                style={{ background: `color-mix(in oklab, ${s.tone} 18%, transparent)`, color: s.tone }}
              >
                {s.type}
              </span>
            </div>
            <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{s.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function BriefVisual() {
  return (
    <div className="rounded-xl border border-border bg-background/60 p-4 backdrop-blur">
      <div className="flex items-center justify-between border-b border-border pb-2.5">
        <div className="flex items-center gap-1.5">
          <Brain className="h-3.5 w-3.5 text-brand" />
          <span className="text-xs font-semibold">Account brief — Wiz</span>
        </div>
        <span className="font-mono text-[10px] text-muted-foreground">2.1s · gpt-4o</span>
      </div>
      <div className="mt-3 space-y-2.5 text-[11px] leading-relaxed">
        <div>
          <div className="font-mono text-[9px] uppercase tracking-wider text-brand">Why now</div>
          <p className="mt-0.5 text-muted-foreground">5 Cloud Security Engineer roles posted in 14 days. CNAPP team scaling 3×.</p>
        </div>
        <div>
          <div className="font-mono text-[9px] uppercase tracking-wider text-brand">Buying committee</div>
          <p className="mt-0.5 text-muted-foreground">Raaz Herzberg (CMO), Shir Tamari (Head of Research), 2 new engineering managers.</p>
        </div>
        <div>
          <div className="font-mono text-[9px] uppercase tracking-wider text-brand">Likely spend</div>
          <div className="mt-1.5 flex flex-wrap gap-1">
            {['CNAPP', 'Runtime sec', 'Container scan', 'IaC'].map((t) => (
              <span key={t} className="rounded bg-brand/15 px-1.5 py-0.5 font-mono text-[9px] text-brand">{t}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function OutreachVisual() {
  return (
    <div className="rounded-xl border border-border bg-background/60 p-4 backdrop-blur">
      <div className="flex items-center justify-between border-b border-border pb-2.5">
        <div className="flex items-center gap-1.5">
          <Mail className="h-3.5 w-3.5 text-brand" />
          <span className="text-xs font-semibold">Drafted email · Maya P.</span>
        </div>
        <span className="rounded-full bg-green-500/15 px-1.5 py-0.5 font-mono text-[9px] text-green-300">ready</span>
      </div>
      <div className="mt-3 space-y-2 text-[11px]">
        <div className="text-muted-foreground"><span className="text-foreground/80">To:</span>{' '}raaz@wiz.io</div>
        <div className="text-muted-foreground"><span className="text-foreground/80">Subject:</span>{' '}5 Cloud Security hires in 14 days — quick thought</div>
        <div className="rounded-lg border border-border/60 bg-card/60 p-3 leading-relaxed text-foreground/85">
          Hi Raaz,<br/><br/>
          Saw the 5 new Cloud Security Engineer roles — looks like a serious CNAPP push. We help teams in your scale-up phase consolidate runtime + IaC scanning under one roof, usually saving 30%+ vs. point tools.<br/><br/>
          Worth a 15 min next week?
        </div>
        <div className="flex items-center justify-between pt-1.5">
          <span className="font-mono text-[9px] text-muted-foreground">Tone: direct · Persona: CMO</span>
          <div className="flex items-center gap-1">
            <span className="rounded bg-card px-1.5 py-1 text-[9px] ring-1 ring-border">Edit</span>
            <span className="rounded bg-brand px-1.5 py-1 text-[9px] font-semibold text-brand-foreground shadow-inset-glow">Send</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function CampaignsVisual() {
  const campaigns = [
    { name: 'EMEA · FinServ', color: 'var(--signal-compliance)', signals: 42, meetings: 8, goal: 12 },
    { name: 'NA · DevTools', color: 'var(--signal-tech)', signals: 67, meetings: 14, goal: 15 },
    { name: 'APAC · Security', color: 'var(--signal-growth)', signals: 28, meetings: 5, goal: 10 },
  ];
  return (
    <div className="rounded-xl border border-border bg-background/60 p-4 backdrop-blur">
      <div className="flex items-center justify-between border-b border-border pb-2.5">
        <div className="flex items-center gap-1.5">
          <Layers className="h-3.5 w-3.5 text-brand" />
          <span className="text-xs font-semibold">Campaigns</span>
        </div>
        <span className="flex items-center gap-1 font-mono text-[10px] text-muted-foreground">
          <Filter className="h-3 w-3" /> per-sector filters
        </span>
      </div>
      <div className="mt-3 space-y-2">
        {campaigns.map((c) => (
          <div key={c.name} className="rounded-lg border border-border/60 bg-card/60 p-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full" style={{ background: c.color, boxShadow: `0 0 6px ${c.color}` }} />
                <span className="text-xs font-semibold">{c.name}</span>
              </div>
              <span className="font-mono text-[9px] text-muted-foreground">{c.signals} signals</span>
            </div>
            <div className="mt-1.5 flex items-center gap-2">
              <div className="h-1 flex-1 overflow-hidden rounded-full bg-muted/40">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${(c.meetings / c.goal) * 100}%`, background: c.color }}
                />
              </div>
              <span className="font-mono text-[9px] text-muted-foreground">{c.meetings}/{c.goal} mtgs</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function KnowledgeVisual() {
  return (
    <div className="rounded-xl border border-border bg-background/60 p-4 backdrop-blur">
      <div className="flex items-center justify-between border-b border-border pb-2.5">
        <div className="flex items-center gap-1.5">
          <BookOpen className="h-3.5 w-3.5 text-brand" />
          <span className="text-xs font-semibold">Ask your knowledge base</span>
        </div>
        <span className="font-mono text-[10px] text-muted-foreground">14 docs · 3.2k chunks</span>
      </div>
      <div className="mt-3 space-y-2.5 text-[11px] leading-relaxed">
        <div className="flex items-start gap-2">
          <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted/40 font-mono text-[9px]">You</div>
          <div className="rounded-lg border border-border/60 bg-card/60 p-2 text-foreground/90">
            What's our SOC 2 commitment for mid-market deals?
          </div>
        </div>
        <div className="flex items-start gap-2">
          <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand/20 text-brand">
            <MessageSquare className="h-3 w-3" />
          </div>
          <div className="rounded-lg border border-border/60 bg-card/60 p-2">
            <p className="text-foreground/85">SOC 2 Type II is included on Pro and above. Audit reports are NDA-shareable in &lt;48h.</p>
            <div className="mt-1.5 flex flex-wrap gap-1">
              <span className="rounded bg-brand/15 px-1.5 py-0.5 font-mono text-[9px] text-brand">security-overview.pdf · p.4</span>
              <span className="rounded bg-brand/15 px-1.5 py-0.5 font-mono text-[9px] text-brand">midmarket-playbook.docx · §2</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RfpVisual() {
  return (
    <div className="rounded-xl border border-border bg-background/60 p-4 backdrop-blur">
      <div className="flex items-center justify-between border-b border-border pb-2.5">
        <div className="flex items-center gap-1.5">
          <FileText className="h-3.5 w-3.5 text-brand" />
          <span className="text-xs font-semibold">Proposal wizard · auto-draft</span>
        </div>
        <span className="rounded-full bg-green-500/15 px-1.5 py-0.5 font-mono text-[9px] text-green-300">auto-drafted</span>
      </div>
      <div className="mt-3 space-y-2 text-[11px]">
        <div className="flex items-center gap-2 rounded-lg border border-dashed border-border bg-card/40 p-2">
          <Upload className="h-3.5 w-3.5 text-brand" />
          <span className="text-muted-foreground">Acme-brief-2025.pdf · capabilities-deck.pdf</span>
        </div>
        <div className="rounded-lg border border-border/60 bg-card/60 p-2.5">
          <div className="font-mono text-[9px] uppercase tracking-wider text-brand">Extracted questions · 24</div>
          <ul className="mt-1.5 space-y-1 text-foreground/85">
            <li>· Describe your data residency options for EU buyers</li>
            <li>· Provide pricing for 250 seats over 3 years</li>
            <li>· List integrations with our existing CRM stack</li>
          </ul>
        </div>
        <div className="flex items-center justify-between pt-1">
          <span className="font-mono text-[9px] text-muted-foreground">Grounded in 3 uploaded docs</span>
          <span className="rounded bg-brand px-1.5 py-1 text-[9px] font-semibold text-brand-foreground shadow-inset-glow">
            Generate proposal
          </span>
        </div>
      </div>
    </div>
  );
}
