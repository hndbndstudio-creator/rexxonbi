import { createFileRoute, Link } from "@tanstack/react-router";
import { MarketingPage } from "@/components/marketing-page";

const SECTIONS = [
  { title: "Getting Started", items: ["Create your workspace", "Connect your first source", "Invite your team"] },
  { title: "Signals", items: ["Signal types & taxonomy", "Building watchlists", "Routing to Slack & email"] },
  { title: "Intelligence", items: ["Daily briefings", "Account research", "Industry pulse"] },
  { title: "Integrations", items: ["Salesforce", "HubSpot", "Slack", "Webhooks & API"] },
  { title: "Admin", items: ["SSO & SCIM", "Roles & permissions", "Audit logs"] },
  { title: "API Reference", items: ["Authentication", "REST endpoints", "Rate limits"] },
];

export const Route = createFileRoute("/docs")({
  component: DocsPage,
  head: () => ({
    meta: [
      { title: "Documentation — Rexxon AI" },
      { name: "description", content: "Guides, API reference and best practices for the Rexxon AI platform." },
      { property: "og:title", content: "Rexxon AI Documentation" },
      { property: "og:description", content: "Guides, API reference and best practices." },
    ],
  }),
});

function DocsPage() {
  return (
    <MarketingPage eyebrow="Documentation" title="Build with Rexxon AI." intro="Guides, references and best practices for getting the most from the platform.">
      <div className="not-prose grid gap-4 md:grid-cols-2">
        {SECTIONS.map((s) => (
          <div key={s.title} className="rounded-xl border border-border bg-card p-6">
            <h3 className="text-base font-semibold">{s.title}</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {s.items.map((i) => (
                <li key={i}>· {i}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="mt-8 text-sm text-muted-foreground">
        Need something not covered? <Link to="/contact">Get in touch</Link>.
      </p>
    </MarketingPage>
  );
}
