import { createFileRoute } from "@tanstack/react-router";
import { MarketingPage } from "@/components/marketing-page";

const ENTRIES = [
  { date: "May 12, 2026", title: "AI Briefings 2.0", body: "Daily morning briefings now cite every source inline and support custom watchlists per team." },
  { date: "Apr 28, 2026", title: "Salesforce & HubSpot Sync", body: "Two-way CRM sync for accounts, contacts and signal-driven tasks." },
  { date: "Apr 14, 2026", title: "Industry Pulse", body: "Real-time benchmarks for 180+ industries powered by our signal graph." },
  { date: "Mar 30, 2026", title: "SAML SSO + SCIM", body: "Enterprise SSO with Okta, Azure AD and Google Workspace. SCIM provisioning included." },
  { date: "Mar 16, 2026", title: "Slack Notifications", body: "Route any signal, brief or alert into Slack channels with full filtering." },
];

export const Route = createFileRoute("/changelog")({
  component: ChangelogPage,
  head: () => ({
    meta: [
      { title: "Changelog — Rexxon AI" },
      { name: "description", content: "What's new and improved in Rexxon AI." },
      { property: "og:title", content: "Rexxon AI Changelog" },
      { property: "og:description", content: "Product updates, new features and improvements." },
    ],
  }),
});

function ChangelogPage() {
  return (
    <MarketingPage eyebrow="Changelog" title="What's new in Rexxon AI." intro="Shipped features, improvements and notable fixes.">
      <div className="not-prose space-y-8">
        {ENTRIES.map((e) => (
          <div key={e.title} className="rounded-xl border border-border bg-card p-6">
            <p className="text-xs font-mono uppercase tracking-widest text-brand">{e.date}</p>
            <h3 className="mt-2 text-lg font-semibold">{e.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{e.body}</p>
          </div>
        ))}
      </div>
    </MarketingPage>
  );
}
