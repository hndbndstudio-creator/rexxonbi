import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Building2, Globe2, Sparkles, Target, Users, Zap } from "lucide-react";
import { BottomCta, MarketingShell } from "@/components/marketing-page";

const VALUES = [
  { icon: Zap, title: "Signals beat reports", body: "The freshest data wins. Weekly decks lose to live intelligence every time." },
  { icon: Sparkles, title: "AI is the new analyst", body: "Synthesis should be instant, sourced, and verifiable — not a Monday morning slide." },
  { icon: Target, title: "Trust is the product", body: "Every claim cites a source. Provenance and recency are first-class, not footnotes." },
  { icon: Users, title: "Senior, small, remote", body: "We hire operators who've shipped before. Small teams of A players move ten times faster." },
];

const STATS = [
  { value: "38", label: "Teammates" },
  { value: "14", label: "Countries" },
  { value: "2.4B+", label: "Signals processed monthly" },
  { value: "99.98%", label: "Uptime (90d)" },
];

const LOGOS = ["Northstar Capital", "Lumen Health", "Velocity Cyber", "Halo Robotics", "Atlas Devtools", "Forge Data"];

export const Route = createFileRoute("/about")({
  component: AboutPage,
  head: () => ({
    meta: [
      { title: "About — Rexxon AI" },
      { name: "description", content: "Rexxon AI is building the system of record for business market intelligence. Learn about our mission, team and values." },
      { property: "og:title", content: "About Rexxon AI" },
      { property: "og:description", content: "Building the system of record for business market intelligence." },
          { property: "og:url", content: "https://rexxon.ai/about" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "About Rexxon AI — Business Market Intelligence Platform" },
      { name: "robots", content: "index, follow, max-image-preview:large, max-snippet:-1" },
    ],
    links: [
      { rel: "canonical", href: "https://rexxon.ai/about" },
    ],
  }),
});

function AboutPage() {
  return (
    <MarketingShell>
      {/* Hero */}
      <header className="mx-auto max-w-6xl px-4 md:px-6 pt-20 pb-12">
        <p className="text-xs font-mono uppercase tracking-widest text-brand">About Rexxon AI</p>
        <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight md:text-6xl">
          We're building the <span className="text-brand">system of record</span> for market intelligence.
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
          Rexxon AI turns real-time signals across companies, industries and markets into
          decision-ready intelligence for revenue, strategy and operations teams.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/careers" className="inline-flex items-center gap-2 rounded-md bg-brand px-5 py-2.5 text-sm font-medium text-brand-foreground transition-opacity hover:opacity-90">
            See open roles <ArrowRight className="h-4 w-4" />
          </Link>
          <Link to="/contact" className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-brand/50">
            Talk to us
          </Link>
        </div>
      </header>

      {/* Stats */}
      <section className="mx-auto max-w-6xl px-4 md:px-6 pb-16">
        <div className="grid gap-4 rounded-2xl border border-border bg-card p-6 sm:grid-cols-2 md:p-8 lg:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="border-l-2 border-brand/50 pl-4">
              <p className="text-3xl font-semibold tracking-tight md:text-4xl">{s.value}</p>
              <p className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Mission */}
      <section className="mx-auto max-w-6xl px-4 md:px-6 pb-20">
        <div className="grid gap-10 md:grid-cols-2 md:gap-16">
          <div>
            <p className="text-xs font-mono uppercase tracking-widest text-brand">Our mission</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
              Every team deserves a live view of the market they operate in.
            </h2>
          </div>
          <div className="space-y-4 text-muted-foreground">
            <p>
              Most business decisions are still made with stale data — spreadsheets, week-old
              reports, gut feel. We think that's a failure of tooling, not of teams.
            </p>
            <p>
              Rexxon makes the freshest market signal accessible to anyone in the org. From the
              SDR routing a follow-up to the CEO sizing a new market, the same intelligence layer
              powers the work.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="mx-auto max-w-6xl px-4 md:px-6 pb-20">
        <p className="text-xs font-mono uppercase tracking-widest text-brand">What we believe</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">Operating principles.</h2>
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {VALUES.map((v) => (
            <div key={v.title} className="rounded-xl border border-border bg-card p-6 transition-colors hover:border-brand/50">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-brand/15 text-brand">
                <v.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">{v.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{v.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Customers */}
      <section className="mx-auto max-w-6xl px-4 md:px-6 pb-20">
        <p className="text-center text-xs font-mono uppercase tracking-widest text-muted-foreground">
          Trusted by revenue and strategy teams at
        </p>
        <div className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-3 lg:grid-cols-6">
          {LOGOS.map((l) => (
            <div key={l} className="flex h-20 items-center justify-center bg-card px-4 text-center text-sm font-medium text-muted-foreground">
              {l}
            </div>
          ))}
        </div>
      </section>

      {/* Office / remote */}
      <section className="mx-auto max-w-6xl px-4 md:px-6 pb-20">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-6">
            <Globe2 className="h-5 w-5 text-brand" />
            <h3 className="mt-3 text-base font-semibold">Remote-first, async by default</h3>
            <p className="mt-2 text-sm text-muted-foreground">14 countries, 4 overlap windows, zero "back-to-back" days.</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-6">
            <Building2 className="h-5 w-5 text-brand" />
            <h3 className="mt-3 text-base font-semibold">HQ in San Francisco</h3>
            <p className="mt-2 text-sm text-muted-foreground">Optional co-working space for SF-based team members and customer visits.</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-6">
            <Users className="h-5 w-5 text-brand" />
            <h3 className="mt-3 text-base font-semibold">Quarterly offsites</h3>
            <p className="mt-2 text-sm text-muted-foreground">Past offsites: Lisbon, Mexico City, Tokyo. Next: Barcelona.</p>
          </div>
        </div>
      </section>

      <BottomCta
        title="Want to help build it?"
        body="We're hiring across engineering, sales, design and operations."
        primary={{ label: "See open roles", href: "/careers" }}
        secondary={{ label: "Contact us", href: "/contact" }}
      />
    </MarketingShell>
  );
}
