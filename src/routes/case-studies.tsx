import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, TrendingUp } from "lucide-react";
import { CASE_STUDIES } from "@/lib/blog-content";
import { BlogNav, BlogFooter, formatDate } from "./blog";

export const Route = createFileRoute("/case-studies")({
  component: CaseStudiesIndex,
  head: () => ({
    meta: [
      { title: "Customer Case Studies — Real Pipeline Built With Rexxon AI" },
      {
        name: "description",
        content:
          "Read how cybersecurity, devtools, GRC, MLOps and HR tech teams 3-5x'd outbound pipeline using Rexxon AI's real-time B2B buying signals.",
      },
      { property: "og:title", content: "Rexxon AI customer case studies" },
      {
        property: "og:description",
        content:
          "Real customer outcomes — pipeline lift, reply rates and closed-won deals from teams using real-time buying signals.",
      },
      { name: "twitter:title", content: "Rexxon AI case studies" },
      {
        name: "twitter:description",
        content: "Pipeline lift, reply rates and closed-won deals from real-time signal-led outbound.",
      },
      { rel: "canonical", href: "https://rexxon.ai/case-studies" } as never,
    ],
  }),
});

function CaseStudiesIndex() {
  const sorted = [...CASE_STUDIES].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Rexxon AI customer case studies",
    itemListElement: sorted.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `https://rexxon.ai/case-studies/${c.slug}`,
      name: c.title,
    })),
  };

  return (
    <div className="min-h-screen bg-background bg-grid">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <BlogNav />

      <header className="mx-auto max-w-6xl px-6 pt-16 pb-10">
        <p className="text-xs font-mono uppercase tracking-widest text-brand">Customer outcomes</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">Case studies</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          How real B2B sales teams across cybersecurity, fintech, devtools, MLOps and HR tech use
          Rexxon AI's real-time buying signals to triple pipeline and shorten sales cycles.
        </p>
      </header>

      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid gap-6 md:grid-cols-2">
          {sorted.map((c) => (
            <Link
              key={c.slug}
              to="/case-studies/$slug"
              params={{ slug: c.slug }}
              className="group flex flex-col rounded-2xl border border-border bg-card p-7 transition-colors hover:border-brand/50"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-widest text-brand">{c.industry}</span>
                <span className="text-xs text-muted-foreground">{formatDate(c.publishedAt)}</span>
              </div>
              <h2 className="mt-3 text-xl font-semibold leading-snug group-hover:text-brand">{c.title}</h2>
              <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{c.description}</p>

              <div className="mt-5 grid grid-cols-2 gap-3 border-t border-border pt-4 sm:grid-cols-4">
                {c.metrics.map((m) => (
                  <div key={m.label}>
                    <p className="text-base font-semibold text-foreground">{m.value}</p>
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{m.label}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5 inline-flex items-center gap-1.5 text-sm text-brand">
                Read the case study <ArrowRight className="h-4 w-4" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      <BlogFooter />
    </div>
  );
}
