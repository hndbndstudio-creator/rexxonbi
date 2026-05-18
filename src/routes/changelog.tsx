import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles } from "lucide-react";
import { MarketingShell } from "@/components/marketing-page";

type Entry = {
  date: string;
  title: string;
  tag: "New" | "Improved" | "Fixed";
  body: string;
  highlights?: string[];
};

const ENTRIES: Entry[] = [
  {
    date: "May 12, 2026",
    title: "AI Briefings 2.0",
    tag: "New",
    body: "Daily morning briefings now cite every source inline and support custom watchlists per team.",
    highlights: ["Inline source citations", "Per-team watchlists", "Slack and email delivery"],
  },
  {
    date: "Apr 28, 2026",
    title: "Salesforce & HubSpot Sync",
    tag: "New",
    body: "Two-way CRM sync for accounts, contacts and signal-driven tasks. Live in 5 minutes, no admin help required.",
    highlights: ["Two-way sync", "Signal-driven tasks", "Field mapping UI"],
  },
  {
    date: "Apr 14, 2026",
    title: "Industry Pulse",
    tag: "New",
    body: "Real-time benchmarks for 180+ industries powered by our signal graph.",
  },
  {
    date: "Mar 30, 2026",
    title: "SAML SSO + SCIM",
    tag: "Improved",
    body: "Enterprise SSO with Okta, Azure AD and Google Workspace. SCIM provisioning included on Enterprise plans.",
  },
  {
    date: "Mar 16, 2026",
    title: "Slack Notifications",
    tag: "New",
    body: "Route any signal, brief or alert into Slack channels with full filtering.",
  },
  {
    date: "Mar 02, 2026",
    title: "Faster signal ingestion",
    tag: "Improved",
    body: "P95 ingestion latency cut from 38s to 9s. Same signals, four times fresher.",
  },
  {
    date: "Feb 18, 2026",
    title: "CSV import quirks on Safari",
    tag: "Fixed",
    body: "Resolved an edge case where some Safari uploads stalled after redirect.",
  },
];

const TAG_STYLES: Record<Entry["tag"], string> = {
  New: "bg-brand/15 text-brand",
  Improved: "bg-sky-500/15 text-sky-400",
  Fixed: "bg-amber-500/15 text-amber-400",
};

export const Route = createFileRoute("/changelog")({
  component: ChangelogPage,
  head: () => ({
    meta: [
      { title: "Changelog — Rexxon AI" },
      { name: "description", content: "What's new and improved in Rexxon AI. Product updates, new features and notable fixes." },
      { property: "og:title", content: "Rexxon AI Changelog" },
      { property: "og:description", content: "Product updates, new features and improvements." },
    ],
  }),
});

function ChangelogPage() {
  return (
    <MarketingShell>
      <header className="mx-auto max-w-4xl px-4 md:px-6 pt-20 pb-10">
        <p className="text-xs font-mono uppercase tracking-widest text-brand">Changelog</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">What's new in Rexxon AI.</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Every shipped feature, improvement and notable fix. Subscribe to get updates in your
          inbox or RSS reader.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href="mailto:hello@rexxon.ai?subject=Changelog%20updates"
            className="inline-flex items-center gap-2 rounded-md bg-brand px-4 py-2 text-sm font-medium text-brand-foreground transition-opacity hover:opacity-90"
          >
            Subscribe by email <ArrowRight className="h-4 w-4" />
          </a>
          <a
            href="/changelog.rss"
            className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-brand/50"
          >
            RSS feed
          </a>
        </div>
      </header>

      {/* Timeline */}
      <section className="mx-auto max-w-4xl px-4 md:px-6 pb-24">
        <ol className="relative space-y-10 border-l border-border pl-8">
          {ENTRIES.map((e) => (
            <li key={e.title} className="relative">
              <span className="absolute -left-[34px] top-2 flex h-4 w-4 items-center justify-center rounded-full border border-border bg-background">
                <span className="h-1.5 w-1.5 rounded-full bg-brand" />
              </span>
              <div className="rounded-xl border border-border bg-card p-6">
                <div className="flex flex-wrap items-center gap-3 text-xs">
                  <span className="font-mono uppercase tracking-widest text-muted-foreground">{e.date}</span>
                  <span className={`rounded-full px-2 py-0.5 font-medium ${TAG_STYLES[e.tag]}`}>{e.tag}</span>
                </div>
                <h2 className="mt-3 text-xl font-semibold tracking-tight">{e.title}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{e.body}</p>
                {e.highlights && (
                  <ul className="mt-4 space-y-1.5 text-sm text-muted-foreground">
                    {e.highlights.map((h) => (
                      <li key={h} className="flex items-start gap-2">
                        <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-16 rounded-2xl border border-border bg-card p-8 text-center">
          <h3 className="text-xl font-semibold">Have an idea or feature request?</h3>
          <p className="mt-2 text-sm text-muted-foreground">We read every one. Our roadmap is shaped by customers.</p>
          <Link to="/contact" className="mt-5 inline-flex items-center gap-2 rounded-md bg-brand px-5 py-2.5 text-sm font-medium text-brand-foreground transition-opacity hover:opacity-90">
            Send us feedback <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </MarketingShell>
  );
}
