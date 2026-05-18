import type { ReactNode } from "react";
import { BlogNav } from "@/routes/blog";
import { SiteFooter } from "@/components/site-footer";

/**
 * Thin wrapper: nav + footer only. Each page owns its own hero and layout
 * so we can build CRO-focused designs instead of plain prose docs.
 */
export function MarketingShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background bg-grid">
      <BlogNav />
      {children}
      <SiteFooter />
    </div>
  );
}

/**
 * Compact legal-page layout for Privacy, Terms, DPA, Cookies, etc.
 */
export function LegalPage({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  children: ReactNode;
}) {
  return (
    <MarketingShell>
      <header className="mx-auto max-w-3xl px-4 md:px-6 pt-20 pb-8">
        <p className="text-xs font-mono uppercase tracking-widest text-brand">{eyebrow}</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">{title}</h1>
        {intro && <p className="mt-4 text-base text-muted-foreground">{intro}</p>}
      </header>
      <section className="mx-auto max-w-3xl px-4 md:px-6 pb-24">
        <div className="prose prose-invert max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-h2:mt-10 prose-h2:text-2xl prose-h3:text-lg prose-p:text-muted-foreground prose-a:text-brand prose-strong:text-foreground prose-li:text-muted-foreground prose-table:text-sm">
          {children}
        </div>
      </section>
    </MarketingShell>
  );
}

/**
 * Reusable bottom CTA strip — appears on most marketing pages.
 */
export function BottomCta({
  title,
  body,
  primary,
  secondary,
}: {
  title: string;
  body?: string;
  primary: { label: string; href: string };
  secondary?: { label: string; href: string };
}) {
  return (
    <section className="mx-auto max-w-6xl px-4 md:px-6 pb-24">
      <div className="overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-card via-card to-brand/10 p-8 md:p-12">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">{title}</h2>
          {body && <p className="mt-3 text-muted-foreground">{body}</p>}
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <a
              href={primary.href}
              className="inline-flex items-center gap-2 rounded-md bg-brand px-5 py-2.5 text-sm font-medium text-brand-foreground transition-opacity hover:opacity-90"
            >
              {primary.label}
            </a>
            {secondary && (
              <a
                href={secondary.href}
                className="inline-flex items-center gap-2 rounded-md border border-border bg-background/40 px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-card"
              >
                {secondary.label}
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
