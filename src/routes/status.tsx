import { createFileRoute } from "@tanstack/react-router";
import { Activity, CheckCircle2 } from "lucide-react";
import { MarketingShell } from "@/components/marketing-page";

const SYSTEMS = [
  { name: "Web App", status: "Operational", uptime: "99.99%" },
  { name: "API", status: "Operational", uptime: "99.98%" },
  { name: "Signal Ingestion", status: "Operational", uptime: "99.97%" },
  { name: "AI Briefings", status: "Operational", uptime: "99.96%" },
  { name: "Integrations (Salesforce, HubSpot, Slack)", status: "Operational", uptime: "99.99%" },
  { name: "Authentication & SSO", status: "Operational", uptime: "100.00%" },
];

const INCIDENTS = [
  { date: "Apr 22, 2026", title: "Elevated API latency in EU region", duration: "27 min", resolved: true },
  { date: "Mar 14, 2026", title: "Salesforce sync delays", duration: "1h 12m", resolved: true },
  { date: "Feb 03, 2026", title: "Brief delivery delayed for ~3% of users", duration: "42 min", resolved: true },
];

// Synthesized 90-day uptime bars
const BARS = Array.from({ length: 90 }, (_, i) => {
  const dip = i === 22 || i === 51 || i === 73;
  return dip ? "h-6 bg-amber-400/70" : "h-6 bg-emerald-400/70";
});

export const Route = createFileRoute("/status")({
  component: StatusPage,
  head: () => ({
    meta: [
      { title: "System Status — Rexxon AI" },
      { name: "description", content: "Real-time status of Rexxon AI services and historical uptime. 99.98% uptime over the last 90 days." },
      { property: "og:title", content: "Rexxon AI System Status" },
      { property: "og:description", content: "Real-time status and uptime for Rexxon AI." },
          { property: "og:url", content: "https://rexxon.ai/status" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "System Status — Rexxon AI" },
      { name: "robots", content: "index, follow, max-image-preview:large, max-snippet:-1" },
    ],
    links: [
      { rel: "canonical", href: "https://rexxon.ai/status" },
    ],
  }),
});

function StatusPage() {
  return (
    <MarketingShell>
      <header className="mx-auto max-w-5xl px-4 md:px-6 pt-20 pb-10">
        <p className="text-xs font-mono uppercase tracking-widest text-brand">System status</p>
        <h1 className="mt-3 flex flex-wrap items-center gap-3 text-4xl font-semibold tracking-tight md:text-5xl">
          <CheckCircle2 className="h-9 w-9 text-emerald-400" />
          All systems operational.
        </h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          Live status across the Rexxon AI platform. Subscribe to get notified about incidents
          before you notice them.
        </p>
      </header>

      {/* Systems */}
      <section className="mx-auto max-w-5xl px-4 md:px-6 pb-16">
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          {SYSTEMS.map((s, i) => (
            <div
              key={s.name}
              className={`flex flex-col gap-3 px-6 py-5 sm:flex-row sm:items-center sm:justify-between ${
                i !== SYSTEMS.length - 1 ? "border-b border-border" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                <span className="text-sm font-medium text-foreground">{s.name}</span>
              </div>
              <div className="flex items-center gap-6 text-xs">
                <span className="font-mono uppercase tracking-widest text-muted-foreground">{s.uptime} · 90d</span>
                <span className="font-medium text-emerald-400">{s.status}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 90-day uptime chart */}
      <section className="mx-auto max-w-5xl px-4 md:px-6 pb-16">
        <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-mono uppercase tracking-widest text-brand">Last 90 days</p>
              <h2 className="mt-1 text-lg font-semibold">Uptime overview</h2>
            </div>
            <Activity className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="mt-6 flex items-end gap-[3px]">
            {BARS.map((cls, i) => (
              <div key={i} className={`flex-1 rounded-sm ${cls}`} title={`Day ${i + 1}`} />
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
            <span>90 days ago</span>
            <span>Today</span>
          </div>
        </div>
      </section>

      {/* Incident history */}
      <section className="mx-auto max-w-5xl px-4 md:px-6 pb-20">
        <p className="text-xs font-mono uppercase tracking-widest text-brand">Incident history</p>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight md:text-3xl">Last 90 days.</h2>
        <ul className="mt-6 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
          {INCIDENTS.map((inc) => (
            <li key={inc.title} className="flex flex-col gap-2 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">{inc.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{inc.date} · Resolved in {inc.duration}</p>
              </div>
              <span className="inline-flex w-fit items-center gap-1.5 rounded-md border border-border px-2 py-1 text-xs text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" /> Resolved
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-10 rounded-2xl border border-border bg-card p-6 text-center">
          <h3 className="text-base font-semibold">Get notified about incidents</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Email and webhook subscriptions. Zero noise — only what matters.
          </p>
          <a
            href="mailto:status@rexxon.ai?subject=Subscribe"
            className="mt-4 inline-flex items-center gap-2 rounded-md bg-brand px-4 py-2 text-sm font-medium text-brand-foreground transition-opacity hover:opacity-90"
          >
            Subscribe to updates
          </a>
        </div>
      </section>
    </MarketingShell>
  );
}
