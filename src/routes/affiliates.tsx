import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CheckCircle2,
  DollarSign,
  Gift,
  LineChart,
  Megaphone,
  Percent,
  Sparkles,
  Trophy,
  Users,
  Wallet,
} from "lucide-react";
import { BlogNav, BlogFooter } from "./blog";

export const Route = createFileRoute("/affiliates")({
  component: AffiliatesPage,
  head: () => ({
    meta: [
      { name: "robots", content: "index, follow, max-image-preview:large, max-snippet:-1" },
      { title: "Rexxon AI Affiliate Program — Earn 30% Recurring Commission" },
      {
        name: "description",
        content:
          "Join the Rexxon AI affiliate program. Earn 30% recurring commission for 12 months on every paying customer you refer — sales creators, agencies and consultants welcome.",
      },
      { property: "og:title", content: "Rexxon AI Affiliate Program" },
      {
        property: "og:description",
        content:
          "Earn 30% recurring commission for 12 months promoting Rexxon AI — the real-time B2B buying signals platform.",
      },
      { name: "twitter:title", content: "Rexxon AI Affiliate Program" },
      {
        name: "twitter:description",
        content: "30% recurring commission for 12 months. Join the Rexxon AI affiliate program.",
      },
      { rel: "canonical", href: "https://rexxon.ai/affiliates" } as never,
    ],
  }),
});

const TIERS = [
  {
    name: "Starter",
    requirement: "0–5 paying referrals",
    commission: "20%",
    duration: "12 months recurring",
    perks: ["Dashboard + tracking links", "Co-branded landing pages", "Monthly payouts via Stripe"],
  },
  {
    name: "Growth",
    requirement: "6–20 paying referrals",
    commission: "30%",
    duration: "12 months recurring",
    perks: ["Dedicated partner manager", "Early access to new features", "Quarterly bonus rewards"],
    highlight: true,
  },
  {
    name: "Elite",
    requirement: "21+ paying referrals",
    commission: "40%",
    duration: "Lifetime recurring",
    perks: ["Custom co-marketing campaigns", "Revenue-share on enterprise deals", "Annual partner summit invite"],
  },
];

const FAQ = [
  {
    q: "Who can join the Rexxon AI affiliate program?",
    a: "Sales influencers, RevOps consultants, marketing agencies, sales coaches, and anyone with an audience of B2B revenue leaders. We approve applications within 48 hours.",
  },
  {
    q: "How and when do I get paid?",
    a: "Commissions are paid monthly via Stripe Connect, on the 15th of every month, for any referral that paid in the previous month and is still active.",
  },
  {
    q: "How long do cookies last?",
    a: "60 days. If a prospect clicks your link and converts to a paid plan within 60 days, the referral is attributed to you.",
  },
  {
    q: "Is there a minimum payout threshold?",
    a: "Yes — $50. Earnings under that threshold roll over to the next month until you cross it.",
  },
  {
    q: "Can I promote Rexxon AI on paid ads?",
    a: "Yes, with two restrictions: no bidding on Rexxon brand keywords, and no impersonating the brand. Otherwise, paid social, paid search, newsletters and YouTube are all welcome.",
  },
];

function AffiliatesPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <div className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BlogNav />

      {/* Hero */}
      <section className="bg-grid">
        <div className="mx-auto max-w-5xl px-4 md:px-6 pt-20 pb-16 text-center">
          <p className="inline-flex items-center gap-1.5 rounded-full border border-brand/40 bg-brand/10 px-3 py-1 text-xs font-mono uppercase tracking-widest text-brand">
            <Sparkles className="h-3 w-3" /> Affiliate program
          </p>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight md:text-6xl">
            Earn <span className="text-brand">30% recurring</span> for promoting Rexxon AI
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
            Real product. Real commissions. Get paid every month for 12 months on every paying customer
            you refer to the leading real-time B2B buying signals platform.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a
              href="mailto:partners@rexxon.ai?subject=Affiliate%20application"
              className="inline-flex items-center gap-2 rounded-md bg-brand px-6 py-3 text-sm font-medium text-brand-foreground hover:opacity-90"
            >
              Apply to join <ArrowRight className="h-4 w-4" />
            </a>
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-6 py-3 text-sm font-medium hover:border-brand/50"
            >
              See the product
            </Link>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">48-hour approval · Free to join · No minimum traffic</p>
        </div>
      </section>

      {/* Stats strip */}
      <section className="mx-auto max-w-5xl px-4 md:px-6 pb-16">
        <div className="grid gap-4 rounded-2xl border border-border bg-card p-6 sm:grid-cols-4">
          {[
            { v: "30%", l: "Recurring commission" },
            { v: "12 mo", l: "Payout window" },
            { v: "60 days", l: "Cookie duration" },
            { v: "$50", l: "Min payout" },
          ].map((s) => (
            <div key={s.l} className="text-center">
              <p className="text-3xl font-semibold text-foreground">{s.v}</p>
              <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why partner */}
      <section className="mx-auto max-w-6xl px-4 md:px-6 pb-20">
        <div className="text-center">
          <p className="text-xs font-mono uppercase tracking-widest text-brand">Why Rexxon</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight">A program built for partners who actually sell</h2>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {[
            {
              icon: DollarSign,
              t: "High recurring payouts",
              d: "Up to 40% recurring for 12 months — among the highest in B2B sales SaaS.",
            },
            {
              icon: LineChart,
              t: "Product that sells itself",
              d: "Rexxon converts at 4.2% on landing pages — your referrals will too.",
            },
            {
              icon: Wallet,
              t: "Reliable monthly payouts",
              d: "Paid via Stripe Connect on the 15th of every month, in 130+ countries.",
            },
            {
              icon: Megaphone,
              t: "Done-for-you marketing kit",
              d: "Banners, email templates, demo scripts, video walkthroughs and case studies ready to share.",
            },
            {
              icon: Users,
              t: "Dedicated partner manager",
              d: "Growth-tier+ partners get a real human to help you launch campaigns and answer questions.",
            },
            {
              icon: Trophy,
              t: "Quarterly bonus rewards",
              d: "Top 10 partners every quarter earn cash bonuses, free credits and Rexxon swag.",
            },
          ].map(({ icon: Icon, t, d }) => (
            <div key={t} className="rounded-2xl border border-border bg-card p-6 hover:border-brand/40">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-brand/10 text-brand">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-semibold">{t}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tiers */}
      <section className="mx-auto max-w-6xl px-4 md:px-6 pb-20">
        <div className="text-center">
          <p className="text-xs font-mono uppercase tracking-widest text-brand">Commission tiers</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight">Earn more as you grow</h2>
          <p className="mt-2 text-muted-foreground">Tiers automatically upgrade based on active paying referrals.</p>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {TIERS.map((t) => (
            <div
              key={t.name}
              className={`relative flex flex-col rounded-2xl border p-7 ${
                t.highlight
                  ? "border-brand bg-brand/5 shadow-elevated"
                  : "border-border bg-card"
              }`}
            >
              {t.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand px-3 py-1 text-xs font-medium text-brand-foreground">
                  Most popular
                </span>
              )}
              <h3 className="text-lg font-semibold">{t.name}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{t.requirement}</p>
              <div className="mt-5 flex items-baseline gap-1">
                <span className="text-5xl font-semibold tracking-tight">{t.commission}</span>
                <span className="text-sm text-muted-foreground">recurring</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{t.duration}</p>
              <ul className="mt-6 space-y-2.5 text-sm">
                {t.perks.map((p) => (
                  <li key={p} className="flex gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-5xl px-4 md:px-6 pb-20">
        <div className="text-center">
          <p className="text-xs font-mono uppercase tracking-widest text-brand">How it works</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight">Three steps to first commission</h2>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {[
            { n: "01", t: "Apply in 2 minutes", d: "Tell us about your audience. We approve within 48 hours." },
            { n: "02", t: "Share your unique link", d: "Drop it in your newsletter, social posts, YouTube videos or sales calls." },
            { n: "03", t: "Get paid every month", d: "Earn recurring commission for 12 months on every paying customer." },
          ].map((s) => (
            <div key={s.n} className="rounded-2xl border border-border bg-card p-6">
              <p className="text-xs font-mono text-brand">{s.n}</p>
              <h3 className="mt-2 text-lg font-semibold">{s.t}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Earnings calculator */}
      <section className="mx-auto max-w-5xl px-4 md:px-6 pb-20">
        <div className="rounded-2xl border border-border bg-card p-8">
          <div className="flex items-center gap-2">
            <Percent className="h-5 w-5 text-brand" />
            <h2 className="text-xl font-semibold">Realistic earnings example</h2>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Based on Rexxon's average paying customer at $149/month and the Growth tier (30% recurring for 12 months).
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              { refs: "10 referrals", monthly: "$447 / mo", year: "$5,364 / year" },
              { refs: "25 referrals", monthly: "$1,117 / mo", year: "$13,410 / year" },
              { refs: "50 referrals", monthly: "$2,235 / mo", year: "$26,820 / year" },
            ].map((e) => (
              <div key={e.refs} className="rounded-xl border border-border bg-background p-5">
                <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">{e.refs}</p>
                <p className="mt-2 text-2xl font-semibold text-brand">{e.monthly}</p>
                <p className="mt-1 text-xs text-muted-foreground">{e.year}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 md:px-6 pb-20">
        <div className="text-center">
          <p className="text-xs font-mono uppercase tracking-widest text-brand">FAQ</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight">Common questions</h2>
        </div>
        <dl className="mt-8 space-y-5">
          {FAQ.map((f) => (
            <div key={f.q} className="rounded-xl border border-border bg-card p-5">
              <dt className="font-medium">{f.q}</dt>
              <dd className="mt-2 text-sm text-muted-foreground">{f.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-4xl px-4 md:px-6 pb-24">
        <div className="rounded-2xl border border-brand/40 bg-brand/5 p-10 text-center">
          <Gift className="mx-auto h-8 w-8 text-brand" />
          <h2 className="mt-3 text-3xl font-semibold tracking-tight">Ready to start earning?</h2>
          <p className="mx-auto mt-2 max-w-xl text-muted-foreground">
            Join hundreds of sales creators, RevOps consultants and agencies already earning monthly with Rexxon AI.
          </p>
          <a
            href="mailto:partners@rexxon.ai?subject=Affiliate%20application"
            className="mt-6 inline-flex items-center gap-2 rounded-md bg-brand px-6 py-3 text-sm font-medium text-brand-foreground hover:opacity-90"
          >
            Apply now <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </section>

      <BlogFooter />
    </div>
  );
}
