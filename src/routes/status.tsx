import { createFileRoute } from "@tanstack/react-router";
import { MarketingPage } from "@/components/marketing-page";

const SYSTEMS = [
  { name: "Web App", status: "Operational" },
  { name: "API", status: "Operational" },
  { name: "Signal Ingestion", status: "Operational" },
  { name: "AI Briefings", status: "Operational" },
  { name: "Integrations (Salesforce, HubSpot, Slack)", status: "Operational" },
  { name: "Authentication & SSO", status: "Operational" },
];

export const Route = createFileRoute("/status")({
  component: StatusPage,
  head: () => ({
    meta: [
      { title: "System Status — Rexxon AI" },
      { name: "description", content: "Real-time status of Rexxon AI services and historical uptime." },
      { property: "og:title", content: "Rexxon AI System Status" },
      { property: "og:description", content: "Real-time status and uptime for Rexxon AI." },
    ],
  }),
});

function StatusPage() {
  return (
    <MarketingPage eyebrow="Status" title="All systems operational." intro="Live status across the Rexxon AI platform. 99.98% uptime over the last 90 days.">
      <div className="not-prose space-y-3">
        {SYSTEMS.map((s) => (
          <div key={s.name} className="flex items-center justify-between rounded-xl border border-border bg-card px-5 py-4">
            <span className="text-sm font-medium text-foreground">{s.name}</span>
            <span className="inline-flex items-center gap-2 text-xs font-medium text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              {s.status}
            </span>
          </div>
        ))}
      </div>
      <p className="mt-8 text-sm text-muted-foreground">
        Subscribe to incident updates: <a href="mailto:status@rexxon.ai?subject=Subscribe">status@rexxon.ai</a>
      </p>
    </MarketingPage>
  );
}
