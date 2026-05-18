import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, ChevronRight, CreditCard, MessageCircle, Plug, Search, Settings, ShieldCheck, Zap } from "lucide-react";
import { MarketingShell } from "@/components/marketing-page";

const TOPICS = [
  { icon: Zap, title: "Getting started", count: 12, body: "Create a workspace, connect sources, invite teammates." },
  { icon: CreditCard, title: "Account & billing", count: 18, body: "Subscriptions, seats, invoices and payment methods." },
  { icon: Settings, title: "Workspace setup", count: 9, body: "Roles, permissions, branding and admin controls." },
  { icon: Plug, title: "Integrations", count: 24, body: "Salesforce, HubSpot, Slack, webhooks and warehouses." },
  { icon: ShieldCheck, title: "Security & compliance", count: 15, body: "SSO, SCIM, audit logs and our SOC 2 / GDPR posture." },
  { icon: Search, title: "Troubleshooting", count: 21, body: "Common issues, status and how to reach support fast." },
];

const POPULAR = [
  "How do I connect Salesforce to Rexxon?",
  "What's the difference between signals and briefings?",
  "How do I add SSO for my workspace?",
  "Can I export my data to BigQuery or Snowflake?",
  "How is pricing calculated for seats and workspaces?",
  "What's included on the Enterprise plan?",
];

export const Route = createFileRoute("/help")({
  component: HelpPage,
  head: () => ({
    meta: [
      { title: "Help Center — Rexxon AI" },
      { name: "description", content: "Search guides, walkthroughs and answers for Rexxon AI. Real human support when you need it." },
      { property: "og:title", content: "Rexxon AI Help Center" },
      { property: "og:description", content: "Answers, guides and support for Rexxon AI." },
    ],
  }),
});

function HelpPage() {
  return (
    <MarketingShell>
      {/* Hero with search */}
      <header className="mx-auto max-w-5xl px-4 md:px-6 pt-20 pb-12">
        <p className="text-xs font-mono uppercase tracking-widest text-brand">Help center</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-6xl">How can we help?</h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
          Search 99+ guides or skip ahead to talk to a human.
        </p>
        <div className="mt-8 relative max-w-2xl">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search for 'SSO setup', 'CRM sync', 'pricing'…"
            className="h-14 w-full rounded-xl border border-border bg-card pl-12 pr-4 text-base text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
          />
        </div>
      </header>

      {/* Topic grid */}
      <section className="mx-auto max-w-6xl px-4 md:px-6 pb-16">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {TOPICS.map((t) => (
            <a
              key={t.title}
              href="#"
              className="group rounded-xl border border-border bg-card p-6 transition-colors hover:border-brand/50"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-brand/15 text-brand">
                <t.icon className="h-5 w-5" />
              </div>
              <div className="mt-4 flex items-center justify-between">
                <h3 className="text-base font-semibold group-hover:text-brand">{t.title}</h3>
                <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">{t.count} articles</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{t.body}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm text-brand">
                Browse <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </a>
          ))}
        </div>
      </section>

      {/* Popular questions */}
      <section className="mx-auto max-w-5xl px-4 md:px-6 pb-16">
        <p className="text-xs font-mono uppercase tracking-widest text-brand">Most asked</p>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight md:text-3xl">Popular questions.</h2>
        <ul className="mt-8 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
          {POPULAR.map((q) => (
            <li key={q}>
              <a href="#" className="group flex items-center justify-between gap-4 px-6 py-4 transition-colors hover:bg-background/40">
                <span className="text-sm font-medium text-foreground group-hover:text-brand">{q}</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-brand" />
              </a>
            </li>
          ))}
        </ul>
      </section>

      {/* Contact options */}
      <section className="mx-auto max-w-6xl px-4 md:px-6 pb-24">
        <div className="grid gap-4 md:grid-cols-3">
          <a href="mailto:support@rexxon.ai" className="group rounded-xl border border-border bg-card p-6 transition-colors hover:border-brand/50">
            <MessageCircle className="h-5 w-5 text-brand" />
            <h3 className="mt-3 text-base font-semibold group-hover:text-brand">Email support</h3>
            <p className="mt-1 text-sm text-muted-foreground">Replies inside 2 business hours.</p>
            <span className="mt-3 inline-flex items-center gap-1 text-sm text-brand">support@rexxon.ai <ArrowRight className="h-4 w-4" /></span>
          </a>
          <Link to="/docs" className="group rounded-xl border border-border bg-card p-6 transition-colors hover:border-brand/50">
            <BookOpen className="h-5 w-5 text-brand" />
            <h3 className="mt-3 text-base font-semibold group-hover:text-brand">Read the docs</h3>
            <p className="mt-1 text-sm text-muted-foreground">API, integrations, admin guides.</p>
            <span className="mt-3 inline-flex items-center gap-1 text-sm text-brand">Open documentation <ArrowRight className="h-4 w-4" /></span>
          </Link>
          <Link to="/status" className="group rounded-xl border border-border bg-card p-6 transition-colors hover:border-brand/50">
            <ShieldCheck className="h-5 w-5 text-brand" />
            <h3 className="mt-3 text-base font-semibold group-hover:text-brand">Check system status</h3>
            <p className="mt-1 text-sm text-muted-foreground">Live uptime and incident history.</p>
            <span className="mt-3 inline-flex items-center gap-1 text-sm text-brand">View status <ArrowRight className="h-4 w-4" /></span>
          </Link>
        </div>
      </section>
    </MarketingShell>
  );
}
