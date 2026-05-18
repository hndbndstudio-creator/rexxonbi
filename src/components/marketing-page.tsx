import type { ReactNode } from "react";
import { BlogNav } from "@/routes/blog";
import { SiteFooter } from "@/components/site-footer";

export function MarketingPage({
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
    <div className="min-h-screen bg-background bg-grid">
      <BlogNav />
      <header className="mx-auto max-w-4xl px-4 md:px-6 pt-20 pb-10">
        <p className="text-xs font-mono uppercase tracking-widest text-brand">{eyebrow}</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">{title}</h1>
        {intro && <p className="mt-4 max-w-2xl text-lg text-muted-foreground">{intro}</p>}
      </header>
      <section className="mx-auto max-w-4xl px-4 md:px-6 pb-24">
        <div className="prose prose-invert max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-h2:mt-12 prose-h2:text-2xl prose-h3:text-lg prose-p:text-muted-foreground prose-a:text-brand prose-strong:text-foreground prose-li:text-muted-foreground">
          {children}
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
