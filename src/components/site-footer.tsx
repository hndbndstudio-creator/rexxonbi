import { Link } from "@tanstack/react-router";
import { RexxonLogo } from "@/components/rexxon-logo";
import { Github, Linkedin, Twitter } from "lucide-react";

type FooterLink = { label: string; to?: string; href?: string; badge?: string };
type FooterColumn = { title: string; links: FooterLink[] };

const COLUMNS: FooterColumn[] = [
  {
    title: "Product",
    links: [
      { label: "Platform overview", href: "/#how" },
      { label: "Birdseye intelligence", href: "/#features" },
      { label: "Signal engine", href: "/#features" },
      { label: "Account research", href: "/#features" },
      { label: "Integrations", href: "/#integrations" },
      { label: "Pricing", href: "/#pricing" },
      { label: "Changelog", href: "https://docs.rexxon.ai/changelog" },
    ],
  },
  {
    title: "Solutions",
    links: [
      { label: "Revenue teams", href: "/#use-cases" },
      { label: "Strategy & corp dev", href: "/#use-cases" },
      { label: "RevOps & analytics", href: "/#use-cases" },
      { label: "Founders & CEOs", href: "/#use-cases" },
      { label: "Investors", href: "/#use-cases" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Blog", to: "/blog" },
      { label: "Case studies", to: "/case-studies" },
      { label: "Documentation", href: "https://docs.rexxon.ai" },
      { label: "API reference", href: "https://docs.rexxon.ai/api" },
      { label: "Help center", href: "https://help.rexxon.ai" },
      { label: "Status", href: "https://status.rexxon.ai" },
      { label: "Security", to: "/security" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", to: "/about" },
      { label: "Careers", to: "/careers", badge: "We're hiring" },
      { label: "Customers", to: "/case-studies" },
      { label: "Press kit", to: "/press" },
      { label: "Affiliate program", to: "/affiliates" },
      { label: "Contact", href: "mailto:hello@rexxon.ai" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy policy", to: "/privacy" },
      { label: "Terms of service", to: "/terms" },
      { label: "DPA", to: "/dpa" },
      { label: "Subprocessors", to: "/subprocessors" },
      { label: "Cookie policy", to: "/cookies" },
      { label: "Responsible disclosure", to: "/security" },
    ],
  },
];

function FooterLinkItem({ link }: { link: FooterLink }) {
  const content = (
    <span className="inline-flex items-center gap-2">
      {link.label}
      {link.badge && (
        <span className="rounded-full bg-brand/15 px-1.5 py-0.5 text-[10px] font-medium text-brand">
          {link.badge}
        </span>
      )}
    </span>
  );
  if (link.to) {
    return (
      <Link to={link.to} className="text-muted-foreground transition-colors hover:text-foreground">
        {content}
      </Link>
    );
  }
  return (
    <a href={link.href} className="text-muted-foreground transition-colors hover:text-foreground">
      {content}
    </a>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 lg:grid-cols-12">
          {/* Brand column */}
          <div className="lg:col-span-4">
            <RexxonLogo size="sm" />
            <p className="mt-4 max-w-sm text-sm text-muted-foreground">
              Business market intelligence SaaS. Real-time signals across companies, industries
              and markets — synthesized by AI for revenue, strategy and operations teams.
            </p>

            <div className="mt-6 flex items-center gap-3">
              <a
                href="https://twitter.com/rexxonai"
                aria-label="Rexxon AI on X"
                className="flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-brand/50 hover:text-foreground"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a
                href="https://www.linkedin.com/company/rexxon-ai"
                aria-label="Rexxon AI on LinkedIn"
                className="flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-brand/50 hover:text-foreground"
              >
                <Linkedin className="h-4 w-4" />
              </a>
              <a
                href="https://github.com/rexxon-ai"
                aria-label="Rexxon AI on GitHub"
                className="flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-brand/50 hover:text-foreground"
              >
                <Github className="h-4 w-4" />
              </a>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
              <span className="rounded-md border border-border px-2 py-1">SOC 2 Type II</span>
              <span className="rounded-md border border-border px-2 py-1">GDPR</span>
              <span className="rounded-md border border-border px-2 py-1">CCPA</span>
              <span className="rounded-md border border-border px-2 py-1">ISO 27001</span>
            </div>
          </div>

          {/* Link columns */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-8 lg:grid-cols-5">
            {COLUMNS.map((col) => (
              <div key={col.title}>
                <h3 className="text-xs font-semibold uppercase tracking-widest text-foreground">
                  {col.title}
                </h3>
                <ul className="mt-4 space-y-3 text-sm">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <FooterLinkItem link={link} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} Rexxon AI, Inc. All rights reserved.</p>
          <p className="font-mono uppercase tracking-widest">
            Made with signal · San Francisco · Remote-first
          </p>
        </div>
      </div>
    </footer>
  );
}
