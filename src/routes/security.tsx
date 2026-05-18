import { createFileRoute } from "@tanstack/react-router";
import { MarketingPage } from "@/components/marketing-page";

export const Route = createFileRoute("/security")({
  component: SecurityPage,
  head: () => ({
    meta: [
      { title: "Security — Rexxon AI" },
      { name: "description", content: "How Rexxon AI protects your data: SOC 2 Type II, ISO 27001, GDPR, encryption in transit and at rest, and a responsible disclosure program." },
      { property: "og:title", content: "Security at Rexxon AI" },
      { property: "og:description", content: "Enterprise-grade security: SOC 2 Type II, ISO 27001, GDPR, and more." },
    ],
  }),
});

function SecurityPage() {
  return (
    <MarketingPage
      eyebrow="Security"
      title="Security is the product."
      intro="We treat customer data with the rigor it deserves. Here's how."
    >
      <h2>Compliance</h2>
      <ul>
        <li><strong>SOC 2 Type II</strong> — audited annually.</li>
        <li><strong>ISO 27001</strong> — information security management system certified.</li>
        <li><strong>GDPR & CCPA</strong> — data subject rights honored globally.</li>
        <li><strong>DPA available</strong> — sign before signup. <a href="/dpa">Read the DPA</a>.</li>
      </ul>
      <h2>Infrastructure</h2>
      <ul>
        <li>Encryption in transit (TLS 1.3) and at rest (AES-256).</li>
        <li>Multi-region backups with point-in-time recovery.</li>
        <li>Least-privilege access controls and audit logging.</li>
        <li>SSO (SAML) and SCIM provisioning available on enterprise plans.</li>
      </ul>
      <h2>Responsible Disclosure</h2>
      <p>
        Found a vulnerability? Email <a href="mailto:security@rexxon.ai">security@rexxon.ai</a>.
        We acknowledge reports within 24 hours and run a bug bounty for verified findings.
      </p>
    </MarketingPage>
  );
}
