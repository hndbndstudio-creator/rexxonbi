import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, Boxes, Code2, Database, KeyRound, Plug, Search, Shield, Webhook, Workflow, Zap } from "lucide-react";
import { MarketingShell } from "@/components/marketing-page";

type Section = {
  icon: typeof Zap;
  title: string;
  body: string;
  items: string[];
};

const SECTIONS: Section[] = [
  { icon: Zap, title: "Getting started", body: "Set up your workspace and connect your first sources.", items: ["Create your workspace", "Connect your first source", "Invite your team", "Quickstart in 5 minutes"] },
  { icon: Workflow, title: "Signals", body: "Define what matters, route it where it matters.", items: ["Signal types & taxonomy", "Building watchlists", "Routing to Slack & email", "Signal scoring"] },
  { icon: Boxes, title: "Intelligence", body: "Daily briefings, account research and industry pulse.", items: ["Daily briefings", "Account research", "Industry pulse", "Custom reports"] },
  { icon: Plug, title: "Integrations", body: "Two-way sync with your CRM and data stack.", items: ["Salesforce", "HubSpot", "Slack", "Snowflake & BigQuery"] },
  { icon: Shield, title: "Admin", body: "Identity, permissions and audit controls.", items: ["SSO & SCIM", "Roles & permissions", "Audit logs", "Workspace settings"] },
  { icon: Code2, title: "API reference", body: "Build on top of Rexxon's intelligence layer.", items: ["Authentication", "REST endpoints", "Rate limits", "SDKs"] },
];

const QUICKLINKS = [
  { icon: KeyRound, label: "Authentication" },
  { icon: Webhook, label: "Webhooks" },
  { icon: Database, label: "Data export" },
  { icon: Plug, label: "Integrations" },
];

export const Route = createFileRoute("/docs")({
  component: DocsPage,
  head: () => ({
    meta: [
      { title: "Documentation — Rexxon AI" },
      { name: "description", content: "Guides, API reference, integration walkthroughs and best practices for the Rexxon AI platform." },
      { property: "og:title", content: "Rexxon AI Documentation" },
      { property: "og:description", content: "Guides, API reference and best practices." },
    ],
  }),
});

function DocsPage() {
  return (
    <MarketingShell>
      {/* Hero */}
      <header className="mx-auto max-w-6xl px-4 md:px-6 pt-20 pb-12">
        <p className="text-xs font-mono uppercase tracking-widest text-brand">Documentation</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-6xl">
          Build with <span className="text-brand">Rexxon AI</span>.
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
          Guides, references and best practices for getting the most from the platform.
        </p>

        <div className="mt-8 relative max-w-2xl">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search the docs…"
            className="h-14 w-full rounded-xl border border-border bg-card pl-12 pr-24 text-base text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
          />
          <span className="absolute right-3 top-1/2 hidden -translate-y-1/2 rounded border border-border bg-background px-2 py-1 text-xs font-mono text-muted-foreground sm:inline">⌘K</span>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {QUICKLINKS.map((q) => (
            <a key={q.label} href="#" className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-brand/50 hover:text-foreground">
              <q.icon className="h-3.5 w-3.5" /> {q.label}
            </a>
          ))}
        </div>
      </header>

      {/* Sections */}
      <section className="mx-auto max-w-6xl px-4 md:px-6 pb-16">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {SECTIONS.map((s) => (
            <div key={s.title} className="group rounded-xl border border-border bg-card p-6 transition-colors hover:border-brand/50">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-brand/15 text-brand">
                <s.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-semibold">{s.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.body}</p>
              <ul className="mt-4 space-y-2 text-sm">
                {s.items.map((i) => (
                  <li key={i}>
                    <a href="#" className="flex items-center justify-between gap-3 text-muted-foreground transition-colors hover:text-brand">
                      <span>{i}</span>
                      <ArrowRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Code sample */}
      <section className="mx-auto max-w-6xl px-4 md:px-6 pb-20">
        <div className="grid gap-8 rounded-2xl border border-border bg-card p-8 md:grid-cols-2 md:p-10">
          <div>
            <p className="text-xs font-mono uppercase tracking-widest text-brand">Quickstart</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">Fetch your first signal in under a minute.</h2>
            <p className="mt-3 text-muted-foreground">
              A single REST call returns enriched, source-cited intelligence for any company in
              your workspace.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/contact" className="inline-flex items-center gap-2 rounded-md bg-brand px-4 py-2 text-sm font-medium text-brand-foreground transition-opacity hover:opacity-90">
                Get API access <ArrowRight className="h-4 w-4" />
              </Link>
              <a href="#" className="inline-flex items-center gap-2 rounded-md border border-border bg-background/40 px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-brand/50">
                Full API reference
              </a>
            </div>
          </div>
          <pre className="overflow-x-auto rounded-xl border border-border bg-background p-5 font-mono text-xs leading-relaxed text-muted-foreground">
{`curl https://api.rexxon.ai/v1/signals \\
  -H "Authorization: Bearer $REXXON_API_KEY" \\
  -G --data-urlencode "company=acme.com" \\
       --data-urlencode "window=7d"

{
  "company": "Acme, Inc.",
  "signals": [
    { "type": "hiring",  "score": 0.92, "summary": "..." },
    { "type": "funding", "score": 0.81, "summary": "..." }
  ]
}`}
          </pre>
        </div>
      </section>

      {/* Help footer */}
      <section className="mx-auto max-w-6xl px-4 md:px-6 pb-24">
        <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-border bg-card p-6 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <BookOpen className="h-6 w-6 text-brand" />
            <div>
              <h3 className="text-base font-semibold">Can't find what you need?</h3>
              <p className="text-sm text-muted-foreground">Our team replies in under 2 business hours.</p>
            </div>
          </div>
          <Link to="/contact" className="inline-flex items-center gap-2 rounded-md bg-brand px-4 py-2 text-sm font-medium text-brand-foreground transition-opacity hover:opacity-90">
            Contact us <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </MarketingShell>
  );
}
