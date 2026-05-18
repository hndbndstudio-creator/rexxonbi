import { createFileRoute, Link } from "@tanstack/react-router";
import { MarketingPage } from "@/components/marketing-page";

const TOPICS = [
  { title: "Account & Billing", body: "Manage your subscription, seats, invoices and payment methods." },
  { title: "Workspace Setup", body: "Invite teammates, configure roles and set up your first workspace." },
  { title: "Signals & Alerts", body: "Build watchlists, route alerts and tune signal quality." },
  { title: "Integrations", body: "Connect Salesforce, HubSpot, Slack and your data warehouse." },
  { title: "Security & Compliance", body: "SSO, SCIM, audit logs and our SOC 2 / GDPR posture." },
  { title: "Troubleshooting", body: "Common issues, status, and how to reach support fast." },
];

export const Route = createFileRoute("/help")({
  component: HelpPage,
  head: () => ({
    meta: [
      { title: "Help Center — Rexxon AI" },
      { name: "description", content: "Answers, guides and live support for Rexxon AI customers." },
      { property: "og:title", content: "Rexxon AI Help Center" },
      { property: "og:description", content: "Answers, guides and support for Rexxon AI." },
    ],
  }),
});

function HelpPage() {
  return (
    <MarketingPage eyebrow="Help" title="How can we help?" intro="Search-friendly guides and a real human at the other end when you need it.">
      <div className="not-prose grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {TOPICS.map((t) => (
          <div key={t.title} className="rounded-xl border border-border bg-card p-6">
            <h3 className="text-base font-semibold">{t.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{t.body}</p>
          </div>
        ))}
      </div>
      <p className="mt-8 text-sm text-muted-foreground">
        Still stuck? Email <a href="mailto:support@rexxon.ai">support@rexxon.ai</a> or{" "}
        <Link to="/contact">contact us</Link>.
      </p>
    </MarketingPage>
  );
}
