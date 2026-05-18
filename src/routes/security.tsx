import { createFileRoute, Link } from "@tanstack/react-router";
import { breadcrumbJsonLd } from "@/lib/seo";
import { ArrowRight, Check, FileCheck, Globe, Key, Lock, Server, ShieldCheck } from "lucide-react";
import { BottomCta, MarketingShell } from "@/components/marketing-page";

const CERTS = [
  { name: "SOC 2 Type II", body: "Independently audited annually against trust services criteria." },
  { name: "ISO 27001", body: "Information security management system certified to international standard." },
  { name: "GDPR & UK GDPR", body: "Full data subject rights, DPA available, EU-hosted option." },
  { name: "CCPA", body: "California consumer privacy rights honored globally." },
  { name: "HIPAA", body: "BAA available on Enterprise plans for healthcare workloads." },
  { name: "PCI DSS", body: "All payments processed by Stripe — we never store card data." },
];

const CONTROLS = [
  { icon: Lock, title: "Encryption everywhere", body: "TLS 1.3 in transit. AES-256 at rest. Field-level encryption for sensitive data." },
  { icon: Key, title: "SSO + SCIM", body: "SAML SSO with Okta, Azure AD, Google Workspace. SCIM provisioning included on Enterprise." },
  { icon: Server, title: "Isolated tenancy", body: "Per-tenant data isolation enforced at the database row level and in application code." },
  { icon: Globe, title: "Multi-region hosting", body: "EU and US regions available. Choose where your data lives at workspace creation." },
  { icon: FileCheck, title: "Audit logs", body: "Every admin action, integration call and data export is logged and exportable." },
  { icon: ShieldCheck, title: "Least privilege", body: "Production access is just-in-time, MFA-gated, and reviewed quarterly." },
];

export const Route = createFileRoute("/security")({
  component: SecurityPage,
  head: () => ({
    meta: [
      { title: "Security — Rexxon AI" },
      { name: "description", content: "SOC 2 Type II, ISO 27001, GDPR, encryption in transit and at rest, SSO, SCIM, audit logs, and a responsible disclosure program." },
      { property: "og:title", content: "Security at Rexxon AI" },
      { property: "og:description", content: "Enterprise-grade security. SOC 2 Type II, ISO 27001, GDPR." },
          { property: "og:url", content: "https://rexxon.ai/security" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Security & Compliance — Rexxon AI" },
      { name: "robots", content: "index, follow, max-image-preview:large, max-snippet:-1" },
    ],
    links: [
      { rel: "canonical", href: "https://rexxon.ai/security" },
    ],
    scripts: [breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Security", path: "/security" }])],
  }),
});

function SecurityPage() {
  return (
    <MarketingShell>
      {/* Hero */}
      <header className="mx-auto max-w-6xl px-4 md:px-6 pt-20 pb-12">
        <p className="text-xs font-mono uppercase tracking-widest text-brand">Security & compliance</p>
        <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight md:text-6xl">
          Security is the <span className="text-brand">product</span>.
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
          Built for enterprises that take risk seriously. SOC 2 Type II, ISO 27001 and a
          security team that treats every release like an audit.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href="mailto:security@rexxon.ai?subject=Security%20review%20package"
            className="inline-flex items-center gap-2 rounded-md bg-brand px-5 py-2.5 text-sm font-medium text-brand-foreground transition-opacity hover:opacity-90"
          >
            Request security package <ArrowRight className="h-4 w-4" />
          </a>
          <Link to="/dpa" className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-brand/50">
            Read the DPA
          </Link>
        </div>
      </header>

      {/* Cert grid */}
      <section className="mx-auto max-w-6xl px-4 md:px-6 pb-20">
        <p className="text-xs font-mono uppercase tracking-widest text-brand">Compliance</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">Certified, audited, documented.</h2>
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {CERTS.map((c) => (
            <div key={c.name} className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-400" />
                <h3 className="text-base font-semibold">{c.name}</h3>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{c.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Controls */}
      <section className="mx-auto max-w-6xl px-4 md:px-6 pb-20">
        <p className="text-xs font-mono uppercase tracking-widest text-brand">Controls</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">How your data stays safe.</h2>
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {CONTROLS.map((c) => (
            <div key={c.title} className="rounded-xl border border-border bg-card p-6 transition-colors hover:border-brand/50">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-brand/15 text-brand">
                <c.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-semibold">{c.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{c.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Disclosure */}
      <section className="mx-auto max-w-6xl px-4 md:px-6 pb-20">
        <div className="rounded-2xl border border-border bg-card p-8 md:p-10">
          <p className="text-xs font-mono uppercase tracking-widest text-brand">Responsible disclosure</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight md:text-3xl">Found a vulnerability? Tell us.</h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            We acknowledge every report inside 24 hours, fix verified issues fast, and reward
            qualifying findings through our bug bounty program.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href="mailto:security@rexxon.ai?subject=Vulnerability%20report"
              className="inline-flex items-center gap-2 rounded-md bg-brand px-5 py-2.5 text-sm font-medium text-brand-foreground transition-opacity hover:opacity-90"
            >
              Email security@rexxon.ai <ArrowRight className="h-4 w-4" />
            </a>
            <Link to="/subprocessors" className="inline-flex items-center gap-2 rounded-md border border-border bg-background/40 px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-brand/50">
              View subprocessors
            </Link>
          </div>
        </div>
      </section>

      <BottomCta
        title="Need our full security package?"
        body="SOC 2 report, ISO certificate, pen test summary, architecture diagrams and questionnaire responses — sent on request."
        primary={{ label: "Request package", href: "mailto:security@rexxon.ai?subject=Security%20package" }}
        secondary={{ label: "Talk to sales", href: "/contact" }}
      />
    </MarketingShell>
  );
}
